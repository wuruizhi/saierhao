const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { executePveTurn, createWildPet } = require('../game/battle-engine');
const { createPetInstance, addExp, healPet } = require('../game/pet-manager');
const mapsData = require('../data/maps.json');
const petsData = require('../data/pets.json');

// Store active battles in memory (per-session, cleared on server restart)
const activeBattles = new Map();

function createBattleRouter(db) {
  const router = express.Router();

  // Start exploring a map - encounter a wild pet
  router.post('/explore', authMiddleware, (req, res) => {
    const { mapId } = req.body;
    const map = mapsData.maps.find(m => m.id === mapId);
    if (!map) return res.status(400).json({ error: '地图不存在' });

    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    // Get player's highest level team pet
    const teamPets = db.prepare(
      'SELECT * FROM player_pets WHERE player_id = ? AND in_team = 1 ORDER BY team_order ASC'
    ).all(player.id);

    if (teamPets.length === 0) {
      return res.status(400).json({ error: '队伍中没有精灵' });
    }

    const maxLevel = Math.max(...teamPets.map(p => p.level));
    if (maxLevel < map.requiredLevel) {
      return res.status(400).json({ error: `需要精灵达到${map.requiredLevel}级才能探索此星球` });
    }

    // Random encounter based on rates
    const roll = Math.random() * 100;
    let cumulative = 0;
    let wildPetDef = null;
    for (const wp of map.wildPets) {
      cumulative += wp.rate;
      if (roll < cumulative) {
        wildPetDef = wp;
        break;
      }
    }
    if (!wildPetDef) wildPetDef = map.wildPets[0];

    const level = wildPetDef.minLevel + Math.floor(Math.random() * (wildPetDef.maxLevel - wildPetDef.minLevel + 1));
    const wildPet = createWildPet(wildPetDef.petId, level);

    // Store active battle
    const battleId = `pve_${req.userId}_${Date.now()}`;
    const firstTeamPet = teamPets[0];
    activeBattles.set(battleId, {
      type: 'pve',
      playerId: player.id,
      userId: req.userId,
      mapId,
      playerTeam: teamPets,
      activeTeamIndex: 0,
      activePet: { ...firstTeamPet, skills: JSON.parse(firstTeamPet.skills) },
      wildPet,
      wildPetOriginal: { ...wildPet }
    });

    const petDef = petsData.pets.find(p => p.id === wildPet.pet_id);
    res.json({
      battleId,
      wildPet: { ...wildPet, petDef },
      playerPet: {
        ...firstTeamPet,
        skills: JSON.parse(firstTeamPet.skills),
        petDef: petsData.pets.find(p => p.id === firstTeamPet.pet_id)
      }
    });
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
        // Grant exp
        const expGain = Math.floor(battle.wildPet.level * 15 + 20);
        const levelResult = addExp(db, battle.activePet.id, expGain);

        // Update HP in DB
        db.prepare('UPDATE player_pets SET current_hp = ? WHERE id = ?')
          .run(Math.max(0, battle.activePet.current_hp), battle.activePet.id);

        activeBattles.delete(battleId);
        return res.json({
          ...result,
          battleEnd: true,
          playerWin: true,
          expGain,
          levelResult,
          wildPetDef: petsData.pets.find(p => p.id === battle.wildPet.pet_id)
        });
      } else {
        // Player's active pet fainted - check for more team members
        db.prepare('UPDATE player_pets SET current_hp = 0 WHERE id = ?')
          .run(battle.activePet.id);

        // Try next team pet
        battle.activeTeamIndex++;
        if (battle.activeTeamIndex < battle.playerTeam.length) {
          const nextPet = battle.playerTeam[battle.activeTeamIndex];
          if (nextPet.current_hp > 0) {
            battle.activePet = { ...nextPet, skills: JSON.parse(nextPet.skills) };
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
        return res.json({ ...result, battleEnd: true, playerWin: false });
      }
    }

    // Update HP in memory
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

  // Attempt capture
  router.post('/capture', authMiddleware, (req, res) => {
    const { battleId } = req.body;
    const battle = activeBattles.get(battleId);
    if (!battle || battle.userId !== req.userId) {
      return res.status(400).json({ error: '战斗不存在' });
    }

    const wp = battle.wildPet;
    const hpRatio = wp.current_hp / wp.max_hp;
    // Capture rate: lower HP = higher chance
    const captureRate = Math.min(90, Math.floor((1 - hpRatio) * 80) + 10 + (wp.level < 10 ? 15 : 0));
    const roll = Math.random() * 100;
    const captured = roll < captureRate;

    if (captured) {
      const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
      const teamCount = db.prepare('SELECT COUNT(*) as c FROM player_pets WHERE player_id = ? AND in_team = 1').get(player.id).c;
      const inTeam = teamCount < 6;

      const instanceId = createPetInstance(
        db, player.id, wp.pet_id, wp.level, inTeam, inTeam ? teamCount : -1
      );

      // Update player pet HP
      db.prepare('UPDATE player_pets SET current_hp = ? WHERE id = ?')
        .run(Math.max(0, battle.activePet.current_hp), battle.activePet.id);

      activeBattles.delete(battleId);
      const petDef = petsData.pets.find(p => p.id === wp.pet_id);
      res.json({
        captured: true,
        captureRate,
        pet: { id: instanceId, ...wp, petDef },
        inTeam,
        message: `成功捕获了${petDef.name}！${inTeam ? '已加入队伍' : '已存入仓库'}`
      });
    } else {
      // Wild pet attacks back
      const { chooseEnemySkill, executeAttack } = require('../game/battle-engine');
      const enemySkill = chooseEnemySkill(wp);
      const attackResult = executeAttack(wp, battle.activePet, enemySkill, false);

      res.json({
        captured: false,
        captureRate,
        message: `捕获失败！${wp.nickname}挣脱了！`,
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

    // Update HP
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
