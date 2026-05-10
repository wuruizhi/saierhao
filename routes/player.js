const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { createPetInstance, healPet, addExp } = require('../game/pet-manager');
const petsData = require('../data/pets.json');
const skillsData = require('../data/skills.json');
const itemsData = require('../data/items.json');

function createPlayerRouter(db) {
  const router = express.Router();

  // Get player profile with all pets
  router.get('/profile', authMiddleware, (req, res) => {
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const pets = db.prepare('SELECT * FROM player_pets WHERE player_id = ? ORDER BY team_order ASC').all(player.id);
    const teamPets = pets.filter(p => p.in_team).map(p => ({
      ...p,
      skills: JSON.parse(p.skills),
      petDef: petsData.pets.find(pd => pd.id === p.pet_id)
    }));
    const storagePets = pets.filter(p => !p.in_team).map(p => ({
      ...p,
      skills: JSON.parse(p.skills),
      petDef: petsData.pets.find(pd => pd.id === p.pet_id)
    }));

    res.json({ player, teamPets, storagePets });
  });

  // Choose starter pet
  router.post('/choose-starter', authMiddleware, (req, res) => {
    const { petId } = req.body;
    if (![1, 4, 7].includes(petId)) {
      return res.status(400).json({ error: '只能选择小火猴(1)、水灵蛙(4)或叶小芽(7)' });
    }

    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });
    if (player.starter_pet_id !== 0) {
      return res.status(400).json({ error: '已经选择过初始精灵了' });
    }

    const instanceId = createPetInstance(db, player.id, petId, 5, true, 0);
    db.prepare('UPDATE players SET starter_pet_id = ?, team = ? WHERE id = ?')
      .run(petId, JSON.stringify([instanceId]), player.id);

    // Give starter capsules
    db.prepare('INSERT OR REPLACE INTO player_items (player_id, item_id, quantity) VALUES (?, ?, ?)').run(player.id, 'capsule_normal', 10);
    db.prepare('INSERT OR REPLACE INTO player_items (player_id, item_id, quantity) VALUES (?, ?, ?)').run(player.id, 'capsule_great', 3);

    const pet = db.prepare('SELECT * FROM player_pets WHERE id = ?').get(instanceId);
    const petDef = petsData.pets.find(p => p.id === petId);
    res.json({ pet: { ...pet, skills: JSON.parse(pet.skills), petDef } });
  });

  // Get team
  router.get('/team', authMiddleware, (req, res) => {
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const team = db.prepare(
      'SELECT * FROM player_pets WHERE player_id = ? AND in_team = 1 ORDER BY team_order ASC'
    ).all(player.id);

    res.json({
      team: team.map(p => ({
        ...p,
        skills: JSON.parse(p.skills),
        petDef: petsData.pets.find(pd => pd.id === p.pet_id)
      }))
    });
  });

  // Swap pet between team and storage
  router.post('/swap-pet', authMiddleware, (req, res) => {
    const { petInstanceId, toTeam } = req.body;
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const pet = db.prepare('SELECT * FROM player_pets WHERE id = ? AND player_id = ?').get(petInstanceId, player.id);
    if (!pet) return res.status(404).json({ error: '精灵不存在' });

    if (toTeam) {
      const teamCount = db.prepare('SELECT COUNT(*) as c FROM player_pets WHERE player_id = ? AND in_team = 1').get(player.id).c;
      if (teamCount >= 6) return res.status(400).json({ error: '队伍已满（最多6只）' });
      db.prepare('UPDATE player_pets SET in_team = 1, team_order = ? WHERE id = ?').run(teamCount, petInstanceId);
    } else {
      const teamCount = db.prepare('SELECT COUNT(*) as c FROM player_pets WHERE player_id = ? AND in_team = 1').get(player.id).c;
      if (teamCount <= 1) return res.status(400).json({ error: '队伍至少需要1只精灵' });
      db.prepare('UPDATE player_pets SET in_team = 0, team_order = -1 WHERE id = ?').run(petInstanceId);
    }

    res.json({ success: true });
  });

  // Heal all team pets
  router.post('/heal', authMiddleware, (req, res) => {
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    db.prepare('UPDATE player_pets SET current_hp = max_hp WHERE player_id = ? AND in_team = 1').run(player.id);
    res.json({ success: true, message: '所有精灵已恢复满血！' });
  });

  // Get all pets data (for pokedex)
  router.get('/pokedex', authMiddleware, (req, res) => {
    res.json({ pets: petsData.pets, skills: skillsData.skills });
  });

  // Get skills data
  router.get('/skills', authMiddleware, (req, res) => {
    res.json({ skills: skillsData.skills });
  });

  // Use stat booster on a pet
  router.post('/use-booster', authMiddleware, (req, res) => {
    const { petInstanceId, boosterId } = req.body;
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const pet = db.prepare('SELECT * FROM player_pets WHERE id = ? AND player_id = ?').get(petInstanceId, player.id);
    if (!pet) return res.status(404).json({ error: '精灵不存在' });

    const booster = (itemsData.boosters || []).find(b => b.id === boosterId);
    if (!booster) return res.status(400).json({ error: '强化剂不存在' });

    const item = db.prepare('SELECT * FROM player_items WHERE player_id = ? AND item_id = ?').get(player.id, boosterId);
    if (!item || item.quantity < 1) {
      return res.status(400).json({ error: '强化剂数量不足' });
    }

    db.prepare('UPDATE player_items SET quantity = quantity - 1 WHERE id = ?').run(item.id);

    // Apply stat boost
    if (booster.stat === 'all') {
      db.prepare(`UPDATE player_pets SET
        max_hp = CAST(max_hp * ? AS INTEGER),
        current_hp = CAST(current_hp * ? AS INTEGER),
        attack = CAST(attack * ? AS INTEGER),
        defense = CAST(defense * ? AS INTEGER),
        speed = CAST(speed * ? AS INTEGER),
        sp_attack = CAST(sp_attack * ? AS INTEGER),
        sp_defense = CAST(sp_defense * ? AS INTEGER)
        WHERE id = ?`).run(booster.multiplier, booster.multiplier, booster.multiplier, booster.multiplier, booster.multiplier, booster.multiplier, booster.multiplier, petInstanceId);
    } else if (booster.stat === 'hp') {
      db.prepare(`UPDATE player_pets SET max_hp = CAST(max_hp * ? AS INTEGER), current_hp = CAST(current_hp * ? AS INTEGER) WHERE id = ?`)
        .run(booster.multiplier, booster.multiplier, petInstanceId);
    } else {
      const dbStat = booster.stat === 'spAttack' ? 'sp_attack' : booster.stat === 'spDefense' ? 'sp_defense' : booster.stat;
      db.prepare(`UPDATE player_pets SET ${dbStat} = CAST(${dbStat} * ? AS INTEGER) WHERE id = ?`)
        .run(booster.multiplier, petInstanceId);
    }

    const updatedPet = db.prepare('SELECT * FROM player_pets WHERE id = ?').get(petInstanceId);
    res.json({
      success: true,
      message: `对${updatedPet.nickname}使用了${booster.name}，属性已提升！`,
      pet: { ...updatedPet, skills: JSON.parse(updatedPet.skills), petDef: petsData.pets.find(p => p.id === updatedPet.pet_id) }
    });
  });

  // Use special item (level boost, evolve stone, reset stats)
  router.post('/use-special-item', authMiddleware, (req, res) => {
    const { petInstanceId, itemId } = req.body;
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const pet = db.prepare('SELECT * FROM player_pets WHERE id = ? AND player_id = ?').get(petInstanceId, player.id);
    if (!pet) return res.status(404).json({ error: '精灵不存在' });

    const specialItem = itemsData.others.find(o => o.id === itemId);
    if (!specialItem) return res.status(400).json({ error: '道具不存在' });

    const item = db.prepare('SELECT * FROM player_items WHERE player_id = ? AND item_id = ?').get(player.id, itemId);
    if (!item || item.quantity < 1) {
      return res.status(400).json({ error: '道具数量不足' });
    }

    db.prepare('UPDATE player_items SET quantity = quantity - 1 WHERE id = ?').run(item.id);

    let message = '';
    let levelResult = null;

    if (itemId === 'level_boost') {
      const newLevel = Math.min(100, parseInt(pet.level) + 10);
      const neededExp = petsData.expTable.slice(parseInt(pet.level) + 1, newLevel + 1).reduce((a, b) => a + b, 0);
      levelResult = addExp(db, petInstanceId, neededExp);
      message = `${pet.nickname}直升了10级！`;
    } else if (itemId === 'evolve_stone') {
      const petDef = petsData.pets.find(p => p.id === pet.pet_id);
      if (!petDef || !petDef.evolution) {
        return res.status(400).json({ error: '该精灵已无法进化' });
      }
      const neededExp = petsData.expTable[petDef.evolution.level] - petsData.expTable[parseInt(pet.level)];
      if (neededExp > 0) {
        levelResult = addExp(db, petInstanceId, Math.max(neededExp, 1));
      }
      message = `${pet.nickname}进化了！`;
    } else if (itemId === 'reset_stats') {
      const petDef = petsData.pets.find(p => p.id === pet.pet_id);
      if (petDef) {
        const { calculateStats } = require('../game/pet-manager');
        const baseStats = calculateStats(pet.pet_id, parseInt(pet.level));
        db.prepare(`UPDATE player_pets SET
          max_hp = ?, current_hp = ?, attack = ?, defense = ?, speed = ?, sp_attack = ?, sp_defense = ?
          WHERE id = ?`).run(
          baseStats.hp, Math.min(pet.current_hp, baseStats.hp),
          baseStats.attack, baseStats.defense, baseStats.speed,
          baseStats.spAttack, baseStats.spDefense,
          petInstanceId
        );
      }
      message = `${pet.nickname}的属性已重置为基础值！`;
    }

    res.json({ success: true, message, levelResult });
  });

  // Use experience candy on a pet
  router.post('/use-candy', authMiddleware, (req, res) => {
    const { petInstanceId, candyId, quantity = 1 } = req.body;
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const pet = db.prepare('SELECT * FROM player_pets WHERE id = ? AND player_id = ?').get(petInstanceId, player.id);
    if (!pet) return res.status(404).json({ error: '精灵不存在' });

    const candy = itemsData.candies.find(c => c.id === candyId);
    if (!candy) return res.status(400).json({ error: '糖果不存在' });

    const item = db.prepare('SELECT * FROM player_items WHERE player_id = ? AND item_id = ?').get(player.id, candyId);
    if (!item || item.quantity < quantity) {
      return res.status(400).json({ error: '糖果数量不足' });
    }

    // Consume candy
    db.prepare('UPDATE player_items SET quantity = quantity - ? WHERE id = ?').run(quantity, item.id);

    // Add exp
    const totalExp = candy.exp * quantity;
    const levelResult = addExp(db, petInstanceId, totalExp);

    res.json({
      success: true,
      message: `使用了${quantity}个${candy.name}，获得${totalExp}经验！`,
      levelResult
    });
  });

  // Get essences
  router.get('/essences', authMiddleware, (req, res) => {
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const essences = db.prepare('SELECT * FROM player_essences WHERE player_id = ?').all(player.id);
    const enriched = essences.map(e => {
      const def = itemsData.essences[e.essence_id];
      let ready = false;
      if (e.hatching && e.hatch_start) {
        const elapsed = (Date.now() - new Date(e.hatch_start).getTime()) / 1000;
        ready = elapsed >= e.hatch_duration;
      }
      return { ...e, def, ready };
    });

    res.json({ essences: enriched });
  });

  // Start hatching an essence
  router.post('/hatch-start', authMiddleware, (req, res) => {
    const { essenceDbId } = req.body;
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const essence = db.prepare('SELECT * FROM player_essences WHERE id = ? AND player_id = ?').get(essenceDbId, player.id);
    if (!essence) return res.status(404).json({ error: '精元不存在' });
    if (essence.hatching) return res.status(400).json({ error: '已在孵化中' });

    const def = itemsData.essences[essence.essence_id];
    if (!def) return res.status(400).json({ error: '精元类型无效' });

    db.prepare('UPDATE player_essences SET hatching = 1, hatch_start = CURRENT_TIMESTAMP, hatch_duration = ? WHERE id = ?')
      .run(def.hatchTime, essenceDbId);

    res.json({ success: true, message: `${def.name}开始孵化，需要${Math.floor(def.hatchTime / 60)}分钟` });
  });

  // Complete hatching (or speed up with money)
  router.post('/hatch-complete', authMiddleware, (req, res) => {
    const { essenceDbId, speedUp = false } = req.body;
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const essence = db.prepare('SELECT * FROM player_essences WHERE id = ? AND player_id = ?').get(essenceDbId, player.id);
    if (!essence) return res.status(404).json({ error: '精元不存在' });

    const def = itemsData.essences[essence.essence_id];
    if (!def) return res.status(400).json({ error: '精元类型无效' });

    if (speedUp) {
      // Check for hatch_speed item first
      const speedItem = db.prepare('SELECT * FROM player_items WHERE player_id = ? AND item_id = ?').get(player.id, 'hatch_speed');
      if (speedItem && speedItem.quantity > 0) {
        db.prepare('UPDATE player_items SET quantity = quantity - 1 WHERE id = ?').run(speedItem.id);
      } else if (player.money >= def.skipCost) {
        db.prepare('UPDATE players SET money = money - ? WHERE id = ?').run(def.skipCost, player.id);
      } else {
        return res.status(400).json({ error: `金币不足！需要 ${def.skipCost}💰` });
      }
    } else {
      // Check if hatching is complete
      if (!essence.hatching) return res.status(400).json({ error: '还未开始孵化' });
      const elapsed = (Date.now() - new Date(essence.hatch_start).getTime()) / 1000;
      if (elapsed < essence.hatch_duration) {
        const remaining = Math.ceil(essence.hatch_duration - elapsed);
        return res.status(400).json({ error: `还需要${remaining}秒才能孵化完成`, remaining });
      }
    }

    // Create pet (幼体, level 1)
    const teamCount = db.prepare('SELECT COUNT(*) as c FROM player_pets WHERE player_id = ? AND in_team = 1').get(player.id).c;
    const inTeam = teamCount < 6;
    const instanceId = createPetInstance(db, player.id, def.hatchPetId, 1, inTeam, inTeam ? teamCount : -1);

    // Remove essence
    db.prepare('DELETE FROM player_essences WHERE id = ?').run(essenceDbId);

    const petDef = petsData.pets.find(p => p.id === def.hatchPetId);
    res.json({
      success: true,
      message: `${def.name}孵化成功！获得了 ${petDef.name}！`,
      pet: { id: instanceId, petDef },
      inTeam
    });
  });

  return router;
}

module.exports = createPlayerRouter;
