const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { executePveTurn, createWildPet } = require('../game/battle-engine');
const { createPetInstance, addExp, healPet } = require('../game/pet-manager');
const mapsData = require('../data/maps.json');
const petsData = require('../data/pets.json');
const itemsData = require('../data/items.json');
const storyQuestsData = require('../data/story_quests.json');
const { incrementQuestProgress } = require('../game/quest-manager');

// Store active battles in memory (per-session, cleared on server restart)
const activeBattles = new Map();

// Experience multipliers by scene depth
const SCENE_EXP_MULTIPLIERS = [1.0, 1.3, 1.6];
const BOSS_EXP_MULTIPLIER = 3.0;
const BOSS_MONEY_REWARD = 500;

function createBattleRouter(db, sceneManager) {
  const router = express.Router();

  // Get scene spawns
  router.get('/scene/:mapId/:sceneIndex', authMiddleware, (req, res) => {
    const mapId = parseInt(req.params.mapId);
    const sceneIndex = parseInt(req.params.sceneIndex);

    let map = null;
    for (const g of (mapsData.galaxies || [])) {
      map = g.planets.find(m => m.id === mapId);
      if (map) break;
    }
    if (!map) return res.status(400).json({ error: '地图不存在' });
    if (!map.scenes || !map.scenes[sceneIndex]) {
      return res.status(400).json({ error: '场景不存在' });
    }

    const scene = map.scenes[sceneIndex];
    const spawns = sceneManager.getSceneSpawns(mapId, sceneIndex);

    // Enrich spawn data with pet definitions
    const enrichedSpawns = spawns.map(s => {
      const petDef = petsData.pets.find(p => p.id === s.petId);
      return { ...s, petDef };
    });

    res.json({
      scene,
      spawns: enrichedSpawns,
      mapName: map.name,
      mapTheme: map.theme
    });
  });

  // Start battle with a specific spawn in a scene
  router.post('/explore', authMiddleware, (req, res) => {
    const { mapId, sceneIndex = 0, spawnId } = req.body;
    let map = null;
    for (const g of (mapsData.galaxies || [])) {
      map = g.planets.find(m => m.id === mapId);
      if (map) break;
    }
    if (!map) return res.status(400).json({ error: '地图不存在' });

    const scene = map.scenes && map.scenes[sceneIndex];
    if (!scene) return res.status(400).json({ error: '场景不存在' });

    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    // Get player's team
    const teamPets = db.prepare(
      'SELECT * FROM player_pets WHERE player_id = ? AND in_team = 1 ORDER BY team_order ASC'
    ).all(player.id);

    if (teamPets.length === 0) {
      return res.status(400).json({ error: '队伍中没有精灵' });
    }

    const maxLevel = Math.max(...teamPets.map(p => p.level));
    if (maxLevel < scene.requiredLevel) {
      return res.status(400).json({ error: `需要精灵达到${scene.requiredLevel}级才能探索此场景` });
    }

    // Get the specific spawn or create a random one
    let wildPetData;
    let isBoss = false;
    let essenceId = null;

    if (spawnId && sceneManager) {
      const spawn = sceneManager.getSpawn(mapId, sceneIndex, spawnId);
      if (!spawn) return res.status(400).json({ error: '该精灵已消失' });
      sceneManager.removePet(mapId, sceneIndex, spawnId);
      wildPetData = spawn;
      isBoss = spawn.isBoss;
      essenceId = spawn.essenceId;
    } else {
      // Fallback: random encounter
      const roll = Math.random() * 100;
      let cumulative = 0;
      let wildPetDef = null;
      for (const wp of scene.wildPets) {
        cumulative += wp.rate;
        if (roll < cumulative) { wildPetDef = wp; break; }
      }
      if (!wildPetDef) wildPetDef = scene.wildPets[0];
      const level = wildPetDef.minLevel + Math.floor(Math.random() * (wildPetDef.maxLevel - wildPetDef.minLevel + 1));
      wildPetData = { petId: wildPetDef.petId, level, isBoss: false };
    }

    const wildPet = createWildPet(wildPetData.petId, wildPetData.level);

    // Store active battle
    const battleId = `pve_${req.userId}_${Date.now()}`;
    const firstTeamPet = teamPets[0];
    activeBattles.set(battleId, {
      type: 'pve',
      playerId: player.id,
      userId: req.userId,
      mapId,
      sceneIndex,
      playerTeam: teamPets,
      activeTeamIndex: 0,
      activePet: { ...firstTeamPet, skills: JSON.parse(firstTeamPet.skills), statusEffects: [], _critRateMult: 1.0, _critUpTurns: 0, _shieldHp: 0, _origStats: null },
      wildPet,
      wildPetOriginal: { ...wildPet },
      isBoss,
      essenceId,
      bossName: wildPetData.bossName || null
    });

    const petDef = petsData.pets.find(p => p.id === wildPet.pet_id);
    res.json({
      battleId,
      wildPet: {
        ...wildPet,
        petDef,
        isBoss,
        bossName: wildPetData.bossName || null
      },
      playerPet: {
        ...firstTeamPet,
        skills: JSON.parse(firstTeamPet.skills),
        petDef: petsData.pets.find(p => p.id === firstTeamPet.pet_id)
      }
    });
    
    incrementQuestProgress(db, player.id, 'explore', 1);
  });

  // Execute a battle action
  router.post('/action', authMiddleware, (req, res) => {
    const { battleId, skillId } = req.body;
    const battle = activeBattles.get(battleId);
    if (!battle || battle.userId !== req.userId) {
      return res.status(400).json({ error: '战斗不存在' });
    }

    const result = executePveTurn(battle.activePet, battle.wildPet, skillId);

    if (result.battleEnd) {
      if (result.playerWin) {
        // Calculate exp with scene bonuses
        const sceneMultiplier = SCENE_EXP_MULTIPLIERS[battle.sceneIndex] || 1.0;
        const bossMultiplier = battle.isBoss ? BOSS_EXP_MULTIPLIER : 1.0;
        const baseExp = Math.floor(battle.wildPet.level * 15 + 20);
        const expGain = Math.floor(baseExp * sceneMultiplier * bossMultiplier);

        const levelResult = addExp(db, battle.activePet.id, expGain);

        // Update HP in DB
        db.prepare('UPDATE player_pets SET current_hp = ? WHERE id = ?')
          .run(Math.max(0, battle.activePet.current_hp), battle.activePet.id);

        // Boss rewards
        let bossReward = null;
        if (battle.isBoss && battle.essenceId) {
          // Grant money
          db.prepare('UPDATE players SET money = money + ? WHERE id = ?')
            .run(BOSS_MONEY_REWARD, battle.playerId);

          // Grant essence
          db.prepare('INSERT INTO player_essences (player_id, essence_id) VALUES (?, ?)')
            .run(battle.playerId, battle.essenceId);

          const essenceDef = itemsData.essences[battle.essenceId];
          bossReward = {
            money: BOSS_MONEY_REWARD,
            essenceId: battle.essenceId,
            essenceName: essenceDef ? essenceDef.name : battle.essenceId
          };
        }

        // Grant battle money
        const moneyGain = Math.floor(battle.wildPet.level * 5 + 10);
        db.prepare('UPDATE players SET money = money + ?, pve_wins = pve_wins + 1, total_battles = total_battles + 1 WHERE id = ?')
          .run(moneyGain, battle.playerId);

        activeBattles.delete(battleId);
        incrementQuestProgress(db, battle.playerId, 'battle', 1);
        
        // Story Quest Hook
        try {
          const stmt = db.prepare("SELECT * FROM player_story_quests WHERE player_id = ? AND status = 'active'");
          const activeQuests = stmt.all(battle.playerId);
          
          activeQuests.forEach(quest => {
            const planetData = storyQuestsData.planets[quest.planet_id];
            if (!planetData) return;
            const stepData = planetData.steps.find(s => s.step === quest.quest_step);
            if (!stepData) return;
            
            if (quest.planet_id == battle.mapId && (stepData.type === 'battle' || stepData.type === 'boss_battle' || stepData.type === 'npc_battle')) {
              let validTarget = false;
              if (Array.isArray(stepData.targetId)) {
                validTarget = stepData.targetId.includes(battle.wildPetOriginal.pet_id);
              } else if (stepData.targetId) {
                validTarget = (battle.wildPetOriginal.pet_id === stepData.targetId);
              } else {
                validTarget = true;
              }
              
              if (stepData.type === 'boss_battle' && !battle.isBoss) validTarget = false;
              
              if (validTarget) {
                const newProgress = quest.progress + 1;
                if (newProgress >= stepData.targetCount) {
                  // Step completed
                  const nextStepData = planetData.steps.find(s => s.step === quest.quest_step + 1);
                  if (nextStepData) {
                    db.prepare('UPDATE player_story_quests SET quest_step = ?, progress = 0 WHERE id = ?').run(quest.quest_step + 1, quest.id);
                  } else {
                    db.prepare('UPDATE player_story_quests SET status = "completed" WHERE id = ?').run(quest.id);
                  }
                  
                  // Grant rewards
                  if (stepData.rewards) {
                    if (stepData.rewards.money) {
                      db.prepare('UPDATE players SET money = money + ? WHERE id = ?').run(stepData.rewards.money, battle.playerId);
                    }
                    if (stepData.rewards.exp) {
                      addExp(db, battle.activePet.id, stepData.rewards.exp);
                    }
                    if (stepData.rewards.items) {
                      for (const [itemId, quantity] of Object.entries(stepData.rewards.items)) {
                        const itemCheck = db.prepare('SELECT id FROM player_items WHERE player_id = ? AND item_id = ?').get(battle.playerId, itemId);
                        if (itemCheck) {
                          db.prepare('UPDATE player_items SET quantity = quantity + ? WHERE id = ?').run(quantity, itemCheck.id);
                        } else {
                          db.prepare('INSERT INTO player_items (player_id, item_id, quantity) VALUES (?, ?, ?)').run(battle.playerId, itemId, quantity);
                        }
                      }
                    }
                  }
                } else {
                  db.prepare('UPDATE player_story_quests SET progress = ? WHERE id = ?').run(newProgress, quest.id);
                }
              }
            }
          });
        } catch(e) { console.error('Story quest error:', e); }

        return res.json({
          ...result,
          battleEnd: true,
          playerWin: true,
          expGain,
          moneyGain,
          levelResult,
          bossReward,
          wildPetDef: petsData.pets.find(p => p.id === battle.wildPet.pet_id)
        });
      } else {
        // Player's active pet fainted
        db.prepare('UPDATE player_pets SET current_hp = 0 WHERE id = ?')
          .run(battle.activePet.id);

        // Try next team pet
        battle.activeTeamIndex++;
        if (battle.activeTeamIndex < battle.playerTeam.length) {
          const nextPet = battle.playerTeam[battle.activeTeamIndex];
          if (nextPet.current_hp > 0) {
            battle.activePet = { ...nextPet, skills: JSON.parse(nextPet.skills), statusEffects: [], _critRateMult: 1.0, _critUpTurns: 0, _shieldHp: 0, _origStats: null };
            return res.json({
              ...result,
              battleEnd: false,
              petFainted: true,
              nextPet: {
                ...nextPet,
                skills: JSON.parse(nextPet.skills),
                petDef: petsData.pets.find(p => p.id === nextPet.pet_id)
              }
            });
          }
        }

        activeBattles.delete(battleId);
        db.prepare('UPDATE players SET total_battles = total_battles + 1 WHERE id = ?').run(battle.playerId);
        return res.json({ ...result, battleEnd: true, playerWin: false });
      }
    }

    res.json({
      ...result,
      playerPet: {
        ...battle.activePet,
        petDef: petsData.pets.find(p => p.id === battle.activePet.pet_id)
      },
      wildPet: {
        ...battle.wildPet,
        petDef: petsData.pets.find(p => p.id === battle.wildPet.pet_id)
      }
    });
  });

  // Attempt capture with capsule
  router.post('/capture', authMiddleware, (req, res) => {
    const { battleId, capsuleId } = req.body;
    const battle = activeBattles.get(battleId);
    if (!battle || battle.userId !== req.userId) {
      return res.status(400).json({ error: '战斗不存在' });
    }

    // Check capsule
    if (!capsuleId) {
      return res.status(400).json({ error: '请选择胶囊' });
    }

    const capsuleDef = itemsData.capsules.find(c => c.id === capsuleId);
    if (!capsuleDef) {
      return res.status(400).json({ error: '胶囊类型不存在' });
    }

    // Check player has capsule
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    const capsuleItem = db.prepare('SELECT * FROM player_items WHERE player_id = ? AND item_id = ?')
      .get(player.id, capsuleId);

    if (!capsuleItem || capsuleItem.quantity <= 0) {
      return res.status(400).json({ error: `没有${capsuleDef.name}了！去商店购买吧` });
    }

    // Consume capsule
    db.prepare('UPDATE player_items SET quantity = quantity - 1 WHERE id = ?').run(capsuleItem.id);

    const wp = battle.wildPet;
    const hpRatio = wp.current_hp / wp.max_hp;

    // Capture formula: lower HP = higher chance + capsule bonus
    let captureRate;
    if (capsuleDef.captureBonus >= 100) {
      captureRate = 100; // Master capsule = guaranteed
    } else {
      captureRate = Math.min(95, Math.floor((1 - hpRatio) * 50) + capsuleDef.captureBonus + (wp.level < 10 ? 10 : 0));
    }

    const roll = Math.random() * 100;
    const captured = roll < captureRate;

    if (captured) {
      const teamCount = db.prepare('SELECT COUNT(*) as c FROM player_pets WHERE player_id = ? AND in_team = 1').get(player.id).c;
      const inTeam = teamCount < 6;

      const instanceId = createPetInstance(
        db, player.id, wp.pet_id, wp.level, inTeam, inTeam ? teamCount : -1
      );

      // Legend capsule: boost to level 30
      if (capsuleId === 'capsule_legend') {
        const targetLevel = 30;
        const currentLevel = wp.level;
        if (targetLevel > currentLevel) {
          const neededExp = petsData.expTable.slice(currentLevel + 1, targetLevel + 1).reduce((a, b) => a + b, 0);
          addExp(db, instanceId, neededExp);
        }
      }

      db.prepare('UPDATE player_pets SET current_hp = ? WHERE id = ?')
        .run(Math.max(0, battle.activePet.current_hp), battle.activePet.id);

      activeBattles.delete(battleId);
      db.prepare('UPDATE players SET total_captures = total_captures + 1, total_battles = total_battles + 1 WHERE id = ?').run(player.id);
      incrementQuestProgress(db, player.id, 'capture', 1);
      
      const petDef = petsData.pets.find(p => p.id === wp.pet_id);
      const capturedPet = db.prepare('SELECT * FROM player_pets WHERE id = ?').get(instanceId);
      res.json({
        captured: true,
        captureRate,
        capsuleUsed: capsuleDef.name,
        pet: capturedPet ? { ...capturedPet, skills: JSON.parse(capturedPet.skills), petDef } : { id: instanceId, ...wp, petDef },
        inTeam,
        message: `使用${capsuleDef.name}成功捕获了${petDef.name}！${inTeam ? '已加入队伍' : '已存入仓库'}${capsuleId==='capsule_legend'?' 已直升30级！':''}`
      });
    } else {
      // Wild pet attacks back
      const { chooseEnemySkill, executeAttack } = require('../game/battle-engine');
      const enemySkill = chooseEnemySkill(wp);
      const attackResult = executeAttack(wp, battle.activePet, enemySkill, false);

      res.json({
        captured: false,
        captureRate,
        capsuleUsed: capsuleDef.name,
        message: `${capsuleDef.name}没能抓住${wp.nickname}！它挣脱了！`,
        counterAttack: attackResult,
        playerPet: {
          ...battle.activePet,
          petDef: petsData.pets.find(p => p.id === battle.activePet.pet_id)
        }
      });
    }
  });

  // Run from battle
  router.post('/run', authMiddleware, (req, res) => {
    const { battleId } = req.body;
    const battle = activeBattles.get(battleId);
    if (!battle || battle.userId !== req.userId) {
      return res.status(400).json({ error: '战斗不存在' });
    }

    db.prepare('UPDATE player_pets SET current_hp = ? WHERE id = ?')
      .run(Math.max(0, battle.activePet.current_hp), battle.activePet.id);

    activeBattles.delete(battleId);
    res.json({ success: true, message: '成功逃跑！' });
  });

  // Get maps data
  router.get('/maps', authMiddleware, (req, res) => {
    res.json(mapsData);
  });

  return router;
}

module.exports = createBattleRouter;
