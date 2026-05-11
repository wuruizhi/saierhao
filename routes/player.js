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

    const equipsList = db.prepare('SELECT part, item_id FROM player_equips WHERE player_id = ?').all(player.id);
    const equips = {};
    equipsList.forEach(e => { equips[e.part] = e.item_id; });

    res.json({ player: { ...player, equips }, teamPets, storagePets });
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
    
    incrementQuestProgress(db, player.id, 'heal', 1);

    res.json({ success: true, message: '所有精灵已恢复健康！' });
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
        const ivs = pet.ivs ? JSON.parse(pet.ivs) : {};
        const baseStats = calculateStats(pet.pet_id, parseInt(pet.level), ivs, {});
        db.prepare(`UPDATE player_pets SET
          max_hp = ?, current_hp = ?, attack = ?, defense = ?, speed = ?, sp_attack = ?, sp_defense = ?, evs = ?
          WHERE id = ?`).run(
          baseStats.hp, Math.min(pet.current_hp, baseStats.hp),
          baseStats.attack, baseStats.defense, baseStats.speed,
          baseStats.spAttack, baseStats.spDefense, '{}',
          petInstanceId
        );
      }
      message = `${pet.nickname}的属性已重置为基础值（含学习力重置）！`;
    } else if (itemId === 'gene_resequencer') {
      const { calculateStats } = require('../game/pet-manager');
      const ivs = {
        hp: Math.floor(Math.random() * 32),
        attack: Math.floor(Math.random() * 32),
        defense: Math.floor(Math.random() * 32),
        speed: Math.floor(Math.random() * 32),
        spAttack: Math.floor(Math.random() * 32),
        spDefense: Math.floor(Math.random() * 32)
      };
      const evs = pet.evs ? JSON.parse(pet.evs) : {};
      const baseStats = calculateStats(pet.pet_id, parseInt(pet.level), ivs, evs);
      db.prepare(`UPDATE player_pets SET
        max_hp = ?, current_hp = ?, attack = ?, defense = ?, speed = ?, sp_attack = ?, sp_defense = ?, ivs = ?
        WHERE id = ?`).run(
        baseStats.hp, Math.min(pet.current_hp, baseStats.hp),
        baseStats.attack, baseStats.defense, baseStats.speed,
        baseStats.spAttack, baseStats.spDefense, JSON.stringify(ivs),
        petInstanceId
      );
      message = `${pet.nickname}的基因重组成功，个体值已重新洗牌！`;
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

  // Equip wardrobe item
  router.post('/equip', authMiddleware, (req, res) => {
    const { itemId, part } = req.body;
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    if (!itemId) {
      // Unequip
      db.prepare('DELETE FROM player_equips WHERE player_id = ? AND part = ?').run(player.id, part);
      return res.json({ success: true, message: '脱下装备' });
    }

    // Verify ownership
    const inventory = db.prepare('SELECT * FROM player_items WHERE player_id = ? AND item_id = ? AND quantity > 0').get(player.id, itemId);
    if (!inventory) {
      return res.status(400).json({ error: '你没有这件物品' });
    }

    db.prepare('INSERT OR REPLACE INTO player_equips (player_id, part, item_id) VALUES (?, ?, ?)')
      .run(player.id, part, itemId);

    res.json({ success: true, message: '装备成功' });
  });

  // Leaderboard
  router.get('/leaderboard', authMiddleware, (req, res) => {
    const type = req.query.type || 'money'; // 'money', 'level', 'pets', 'pvp'
    let query = '';
    
    if (type === 'money') {
      query = `SELECT u.username, p.money as score FROM players p JOIN users u ON p.user_id = u.id ORDER BY p.money DESC LIMIT 50`;
    } else if (type === 'level') {
      query = `SELECT u.username, MAX(pp.level) as score FROM player_pets pp JOIN players p ON pp.player_id = p.id JOIN users u ON p.user_id = u.id GROUP BY p.id ORDER BY score DESC LIMIT 50`;
    } else if (type === 'pets') {
      query = `SELECT u.username, COUNT(pp.id) as score FROM player_pets pp JOIN players p ON pp.player_id = p.id JOIN users u ON p.user_id = u.id GROUP BY p.id ORDER BY score DESC LIMIT 50`;
    } else if (type === 'pvp') {
      query = `SELECT u.username, p.pvp_wins as score FROM players p JOIN users u ON p.user_id = u.id ORDER BY p.pvp_wins DESC LIMIT 50`;
    }

    try {
      const topPlayers = db.prepare(query).all();
      res.json({ topPlayers });
    } catch (e) {
      res.status(500).json({ error: '获取排行榜失败' });
    }
  });

  // Get friends list
  router.get('/friends', authMiddleware, (req, res) => {
    const friends = db.prepare(`
      SELECT f.id as friendship_id, u.id as friend_user_id, u.username, f.status, f.created_at, f.user_id as sender_id
      FROM friends f
      JOIN users u ON (f.friend_id = u.id AND f.user_id = ?) OR (f.user_id = u.id AND f.friend_id = ?)
    `).all(req.userId, req.userId);
    res.json({ friends });
  });

  // Add friend
  router.post('/friends/add', authMiddleware, (req, res) => {
    const { username } = req.body;
    const targetUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    
    if (!targetUser) return res.status(404).json({ error: '未找到该玩家' });
    if (targetUser.id === req.userId) return res.status(400).json({ error: '不能添加自己为好友' });

    const existing = db.prepare('SELECT * FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)')
                       .get(req.userId, targetUser.id, targetUser.id, req.userId);
    
    if (existing) {
      if (existing.status === 'accepted') return res.status(400).json({ error: '你们已经是好友了' });
      return res.status(400).json({ error: '已经发送过好友请求' });
    }

    db.prepare('INSERT INTO friends (user_id, friend_id) VALUES (?, ?)').run(req.userId, targetUser.id);
    res.json({ success: true, message: '好友请求已发送' });
  });

  // Accept friend request
  router.post('/friends/accept', authMiddleware, (req, res) => {
    try {
      const { friendshipId } = req.body;
      if (!friendshipId) return res.status(400).json({ error: '缺少好友请求ID' });
      
      const friendship = db.prepare('SELECT * FROM friends WHERE id = ?').get(friendshipId);
      
      if (!friendship) return res.status(404).json({ error: '请求不存在' });
      if (friendship.friend_id !== req.userId) return res.status(403).json({ error: '无权操作' });

      db.prepare("UPDATE friends SET status = 'accepted' WHERE id = ?").run(friendshipId);
      res.json({ success: true, message: '已接受好友请求' });
    } catch (e) {
      console.error('/friends/accept error:', e);
      res.status(500).json({ error: '服务器内部错误: ' + e.message });
    }
  });

  // Remove friend / reject request
  router.post('/friends/remove', authMiddleware, (req, res) => {
    try {
      const { friendshipId } = req.body;
      if (!friendshipId) return res.status(400).json({ error: '缺少好友请求ID' });
      
      db.prepare('DELETE FROM friends WHERE id = ? AND (user_id = ? OR friend_id = ?)').run(friendshipId, req.userId, req.userId);
      res.json({ success: true, message: '已删除好友/拒绝请求' });
    } catch (e) {
      console.error('/friends/remove error:', e);
      res.status(500).json({ error: '服务器内部错误: ' + e.message });
    }
  });

  // Release pet
  router.post('/release-pet', authMiddleware, (req, res) => {
    const { petInstanceId } = req.body;
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const pet = db.prepare('SELECT * FROM player_pets WHERE id = ? AND player_id = ?').get(petInstanceId, player.id);
    if (!pet) return res.status(404).json({ error: '精灵不存在' });
    if (pet.in_team) return res.status(400).json({ error: '不能放生队伍中的精灵' });

    db.prepare('DELETE FROM player_pets WHERE id = ?').run(petInstanceId);
    
    // Give some money as compensation
    const reward = Math.max(10, pet.level * 5);
    db.prepare('UPDATE players SET money = money + ? WHERE id = ?').run(reward, player.id);

    res.json({ success: true, message: `成功放生 ${pet.nickname || '精灵'}，获得 ${reward} 💰` });
  });

  // ===== ACHIEVEMENTS SYSTEM =====
  const ACHIEVEMENTS = [
    { id: 'first_win', name: '初次胜利', desc: '赢得你的第一场战斗', icon: '⚔️', condition: p => p.pve_wins >= 1 },
    { id: 'win_10', name: '战斗新手', desc: '累计赢得10场战斗', icon: '🥉', condition: p => p.pve_wins >= 10 },
    { id: 'win_50', name: '百战勇士', desc: '累计赢得50场战斗', icon: '🥈', condition: p => p.pve_wins >= 50 },
    { id: 'win_100', name: '传奇战神', desc: '累计赢得100场战斗', icon: '🥇', condition: p => p.pve_wins >= 100 },
    { id: 'collect_5', name: '收集入门', desc: '收集5只不同精灵', icon: '🐾', check: (db, pid) => { const c = db.prepare('SELECT COUNT(DISTINCT pet_id) as c FROM player_pets WHERE player_id = ?').get(pid); return c.c >= 5; }},
    { id: 'collect_10', name: '精灵猎人', desc: '收集10只不同精灵', icon: '🎯', check: (db, pid) => { const c = db.prepare('SELECT COUNT(DISTINCT pet_id) as c FROM player_pets WHERE player_id = ?').get(pid); return c.c >= 10; }},
    { id: 'collect_20', name: '精灵大师', desc: '收集20只不同精灵', icon: '🏆', check: (db, pid) => { const c = db.prepare('SELECT COUNT(DISTINCT pet_id) as c FROM player_pets WHERE player_id = ?').get(pid); return c.c >= 20; }},
    { id: 'rich_10k', name: '小康之路', desc: '拥有10000金币', icon: '💰', condition: p => p.money >= 10000 },
    { id: 'rich_100k', name: '赛尔富翁', desc: '拥有100000金币', icon: '💎', condition: p => p.money >= 100000 },
    { id: 'rich_1m', name: '亿万富翁', desc: '拥有1000000金币', icon: '🤑', condition: p => p.money >= 1000000 },
    { id: 'pvp_first', name: 'PVP初体验', desc: '赢得第一场PVP对战', icon: '🤺', condition: p => p.pvp_wins >= 1 },
    { id: 'pvp_10', name: 'PVP高手', desc: '赢得10场PVP对战', icon: '👊', condition: p => p.pvp_wins >= 10 },
    { id: 'capture_10', name: '捕捉新手', desc: '累计捕捉10只精灵', icon: '🔮', condition: p => p.total_captures >= 10 },
    { id: 'capture_50', name: '捕捉达人', desc: '累计捕捉50只精灵', icon: '🌟', condition: p => p.total_captures >= 50 },
    { id: 'max_level', name: '封顶之巅', desc: '拥有一只100级精灵', icon: '👑', check: (db, pid) => { const c = db.prepare('SELECT COUNT(*) as c FROM player_pets WHERE player_id = ? AND level >= 100').get(pid); return c.c > 0; }},
    { id: 'boss_slayer', name: 'Boss猎人', desc: '拥有一只Boss系列精灵', icon: '🐉', check: (db, pid) => { const c = db.prepare('SELECT COUNT(*) as c FROM player_pets WHERE player_id = ? AND pet_id >= 19').get(pid); return c.c > 0; }},
  ];

  router.get('/achievements', authMiddleware, (req, res) => {
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const unlocked = db.prepare('SELECT achievement_id, unlocked_at FROM player_achievements WHERE player_id = ?').all(player.id);
    const unlockedMap = {};
    unlocked.forEach(a => { unlockedMap[a.achievement_id] = a.unlocked_at; });

    const list = ACHIEVEMENTS.map(a => ({
      id: a.id, name: a.name, desc: a.desc, icon: a.icon,
      unlocked: !!unlockedMap[a.id],
      unlockedAt: unlockedMap[a.id] || null
    }));

    res.json({ achievements: list, unlockedCount: unlocked.length, total: ACHIEVEMENTS.length });
  });

  router.post('/check-achievements', authMiddleware, (req, res) => {
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const unlocked = db.prepare('SELECT achievement_id FROM player_achievements WHERE player_id = ?').all(player.id);
    const unlockedSet = new Set(unlocked.map(a => a.achievement_id));

    const newUnlocks = [];
    ACHIEVEMENTS.forEach(a => {
      if (unlockedSet.has(a.id)) return;
      let met = false;
      if (a.condition) met = a.condition(player);
      else if (a.check) met = a.check(db, player.id);
      if (met) {
        try {
          db.prepare('INSERT INTO player_achievements (player_id, achievement_id) VALUES (?, ?)').run(player.id, a.id);
          newUnlocks.push({ id: a.id, name: a.name, desc: a.desc, icon: a.icon });
        } catch(e) {} // ignore duplicate
      }
    });

    res.json({ newUnlocks });
  });

  // ===== DAILY QUESTS SYSTEM =====
  const QUEST_TEMPLATES = [
    { type: 'battle', name: '战斗训练', desc: '完成{target}场战斗', targets: [3, 5, 8], rewards: [200, 400, 800], icon: '⚔️' },
    { type: 'capture', name: '精灵猎手', desc: '捕捉{target}只精灵', targets: [1, 2, 3], rewards: [300, 500, 1000], icon: '🔮' },
    { type: 'shop', name: '购物达人', desc: '在商店购买{target}次', targets: [1, 3, 5], rewards: [100, 300, 600], icon: '🛒' },
    { type: 'heal', name: '精灵保健', desc: '治疗精灵{target}次', targets: [1, 2, 3], rewards: [100, 200, 400], icon: '💊' },
    { type: 'explore', name: '星际探索', desc: '探索{target}个场景', targets: [2, 4, 6], rewards: [300, 500, 800], icon: '🪐' },
  ];

  function getToday() { return new Date().toISOString().slice(0, 10); }

  function generateDailyQuests(playerId) {
    const today = getToday();
    const existing = db.prepare('SELECT * FROM daily_quests WHERE player_id = ? AND quest_date = ?').all(playerId, today);
    if (existing.length > 0) return existing;

    // Pick 3 random quest types
    const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, 3);
    const quests = [];
    shuffled.forEach((qt, idx) => {
      const difficulty = Math.floor(Math.random() * qt.targets.length);
      const target = qt.targets[difficulty];
      const reward = qt.rewards[difficulty];
      const questId = `${qt.type}_${idx}`;
      const info = db.prepare('INSERT INTO daily_quests (player_id, quest_id, quest_type, target, reward_money, quest_date) VALUES (?, ?, ?, ?, ?, ?)')
        .run(playerId, questId, qt.type, target, reward, today);
      quests.push({ id: info.lastInsertRowid, quest_id: questId, quest_type: qt.type, target, progress: 0, completed: 0, reward_claimed: 0, reward_money: reward, quest_date: today });
    });
    return quests;
  }

  router.get('/daily-quests', authMiddleware, (req, res) => {
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const quests = generateDailyQuests(player.id);
    const enriched = quests.map(q => {
      const template = QUEST_TEMPLATES.find(t => t.type === q.quest_type);
      return {
        ...q,
        name: template ? template.name : q.quest_type,
        desc: template ? template.desc.replace('{target}', q.target) : '',
        icon: template ? template.icon : '❓',
        completed: q.progress >= q.target ? 1 : q.completed
      };
    });

    res.json({ quests: enriched, today: getToday() });
  });

  router.post('/quest-progress', authMiddleware, (req, res) => {
    const { questType } = req.body;
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.json({ success: false });

    const today = getToday();
    const quests = db.prepare('SELECT * FROM daily_quests WHERE player_id = ? AND quest_date = ? AND quest_type = ? AND reward_claimed = 0')
      .all(player.id, today, questType);

    quests.forEach(q => {
      if (q.progress < q.target) {
        db.prepare('UPDATE daily_quests SET progress = progress + 1 WHERE id = ?').run(q.id);
        const updated = db.prepare('SELECT * FROM daily_quests WHERE id = ?').get(q.id);
        if (updated.progress >= updated.target) {
          db.prepare('UPDATE daily_quests SET completed = 1 WHERE id = ?').run(q.id);
        }
      }
    });

    res.json({ success: true });
  });

  router.post('/claim-quest-reward', authMiddleware, (req, res) => {
    const { questDbId } = req.body;
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const quest = db.prepare('SELECT * FROM daily_quests WHERE id = ? AND player_id = ?').get(questDbId, player.id);
    if (!quest) return res.status(404).json({ error: '任务不存在' });
    if (quest.progress < quest.target) return res.status(400).json({ error: '任务未完成' });
    if (quest.reward_claimed) return res.status(400).json({ error: '奖励已领取' });

    db.prepare('UPDATE daily_quests SET reward_claimed = 1 WHERE id = ?').run(quest.id);
    db.prepare('UPDATE players SET money = money + ? WHERE id = ?').run(quest.reward_money, player.id);

    res.json({ success: true, message: `领取成功！获得 ${quest.reward_money} 💰`, reward: quest.reward_money });
  });

  // Redeem code
  router.post('/redeem', authMiddleware, (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: '请输入兑换码' });

    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const upperCode = code.toUpperCase().trim();
    
    // Begin transaction for redemption
    try {
      let result;
      db.transaction(() => {
        const redemptionInfo = db.prepare('SELECT * FROM redemption_codes WHERE code = ?').get(upperCode);
        if (!redemptionInfo) throw new Error('兑换码无效或已过期');

        if (redemptionInfo.uses >= redemptionInfo.max_uses) {
          throw new Error('兑换码已被使用完毕');
        }

        const alreadyRedeemed = db.prepare('SELECT * FROM player_redemptions WHERE player_id = ? AND code = ?').get(player.id, upperCode);
        if (alreadyRedeemed) {
          throw new Error('您已经使用过此兑换码');
        }

        // Apply rewards
        if (redemptionInfo.reward_money > 0) {
          db.prepare('UPDATE players SET money = money + ? WHERE id = ?').run(redemptionInfo.reward_money, player.id);
        }

        let itemsMsg = [];
        const rewardItems = JSON.parse(redemptionInfo.reward_items || '{}');
        for (const [itemId, qty] of Object.entries(rewardItems)) {
          const existing = db.prepare('SELECT * FROM player_items WHERE player_id = ? AND item_id = ?').get(player.id, itemId);
          if (existing) {
            db.prepare('UPDATE player_items SET quantity = quantity + ? WHERE id = ?').run(qty, existing.id);
          } else {
            db.prepare('INSERT INTO player_items (player_id, item_id, quantity) VALUES (?, ?, ?)').run(player.id, itemId, qty);
          }
          const itemDef = itemsData.capsules.find(i=>i.id===itemId) || itemsData.candies.find(i=>i.id===itemId) || (itemsData.boosters||[]).find(i=>i.id===itemId) || itemsData.others.find(i=>i.id===itemId) || {name: itemId};
          itemsMsg.push(`${itemDef.name}x${qty}`);
        }

        db.prepare('UPDATE redemption_codes SET uses = uses + 1 WHERE code = ?').run(upperCode);
        db.prepare('INSERT INTO player_redemptions (player_id, code) VALUES (?, ?)').run(player.id, upperCode);

        let msg = '兑换成功！';
        if (redemptionInfo.reward_money > 0) msg += `获得 ${redemptionInfo.reward_money}💰 `;
        if (itemsMsg.length > 0) msg += `获得 ${itemsMsg.join('、')}`;
        
        result = msg;
      })();
      res.json({ success: true, message: result });
    } catch(err) {
      res.status(400).json({ error: err.message });
    }
  });

  // ===== GACHA / LOTTERY SYSTEM =====
  const GACHA_POOLS = {
    normal: {
      name: '普通扭蛋',
      price: 500,
      icon: '🎰',
      items: [
        { type: 'item', id: 'candy_s', name: '经验糖果 S', icon: '🍬', weight: 30 },
        { type: 'item', id: 'candy_m', name: '经验糖果 M', icon: '🍭', weight: 20 },
        { type: 'item', id: 'capsule_normal', name: '普通胶囊', icon: '🔵', weight: 25 },
        { type: 'item', id: 'capsule_great', name: '高级胶囊', icon: '🟢', weight: 15 },
        { type: 'money', amount: 1000, name: '1000金币', icon: '💰', weight: 10 },
      ]
    },
    premium: {
      name: '高级扭蛋',
      price: 3000,
      icon: '🌟',
      items: [
        { type: 'item', id: 'candy_l', name: '经验糖果 L', icon: '🧁', weight: 20 },
        { type: 'item', id: 'candy_xl', name: '经验糖果 XL', icon: '🎂', weight: 12 },
        { type: 'item', id: 'capsule_ultra', name: '超级胶囊', icon: '🟡', weight: 15 },
        { type: 'item', id: 'booster_all', name: '全能强化剂', icon: '🏆', weight: 8 },
        { type: 'money', amount: 5000, name: '5000金币', icon: '💰', weight: 15 },
        { type: 'item', id: 'evolve_stone', name: '进化石', icon: '✨', weight: 5 },
        { type: 'pet', petId: 10, name: '雷光兽(电系幼体)', icon: '⚡', weight: 3, rarity: 'rare' },
        { type: 'pet', petId: 13, name: '荧光灵(光系幼体)', icon: '✨', weight: 3, rarity: 'rare' },
        { type: 'pet', petId: 16, name: '影魂猫(暗系幼体)', icon: '🌑', weight: 3, rarity: 'rare' },
      ]
    },
    legend: {
      name: '传说扭蛋',
      price: 10000,
      icon: '👑',
      items: [
        { type: 'item', id: 'candy_xxl', name: '经验糖果 XXL', icon: '💎', weight: 15 },
        { type: 'item', id: 'capsule_master', name: '大师胶囊', icon: '🟣', weight: 10 },
        { type: 'item', id: 'booster_mega', name: '究极强化剂', icon: '💥', weight: 8 },
        { type: 'item', id: 'level_boost', name: '等级直升卡', icon: '📈', weight: 8 },
        { type: 'money', amount: 20000, name: '20000金币', icon: '💰', weight: 12 },
        { type: 'item', id: 'candy_ultimate', name: '终极经验糖', icon: '🌟', weight: 5 },
        { type: 'pet', petId: 10, name: '雷光兽', icon: '⚡', weight: 6, rarity: 'rare' },
        { type: 'pet', petId: 13, name: '荧光灵', icon: '✨', weight: 6, rarity: 'rare' },
        { type: 'pet', petId: 16, name: '影魂猫', icon: '🌑', weight: 6, rarity: 'rare' },
        { type: 'pet', petId: 19, name: '焱龙幼崽', icon: '🔥', weight: 2, rarity: 'legendary' },
        { type: 'pet', petId: 22, name: '渊鲲幼崽', icon: '💧', weight: 2, rarity: 'legendary' },
      ]
    }
  };

  function weightedRandom(items) {
    const totalWeight = items.reduce((s, i) => s + i.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const item of items) {
      rand -= item.weight;
      if (rand <= 0) return item;
    }
    return items[items.length - 1];
  }

  // ===== EXPEDITIONS =====
  router.get('/expeditions', authMiddleware, (req, res) => {
    const player = db.prepare('SELECT id FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    // Check completion
    db.prepare(`
      UPDATE player_expeditions 
      SET completed = 1 
      WHERE player_id = ? AND completed = 0 AND strftime('%s', 'now') - strftime('%s', start_time) >= duration
    `).run(player.id);

    const expeditions = db.prepare(`
      SELECT e.*, p.nickname as pet_name, p.level as pet_level, p.pet_id as pet_sprite_id
      FROM player_expeditions e
      JOIN player_pets p ON e.pet_id = p.id
      WHERE e.player_id = ? AND e.reward_claimed = 0
    `).all(player.id);

    // Calculate remaining time for each
    const list = expeditions.map(e => {
      const start = new Date(e.start_time + 'Z'); // UTC
      const elapsed = Math.floor((Date.now() - start.getTime()) / 1000);
      const remaining = Math.max(0, e.duration - elapsed);
      return {
        id: e.id,
        petId: e.pet_id,
        petName: e.pet_name,
        petSpriteId: e.pet_sprite_id,
        planetId: e.planet_id,
        duration: e.duration,
        remainingTime: remaining,
        completed: remaining === 0 || e.completed === 1
      };
    });

    res.json({ expeditions: list });
  });

  router.post('/expedition/start', authMiddleware, (req, res) => {
    const { petId, planetId, durationHours } = req.body;
    const player = db.prepare('SELECT id FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    // Validate pet
    const pet = db.prepare('SELECT id, in_team FROM player_pets WHERE id = ? AND player_id = ?').get(petId, player.id);
    if (!pet) return res.status(400).json({ error: 'Pet not found' });
    if (pet.in_team === 1) return res.status(400).json({ error: '不能派遣在队伍中的精灵！' });

    // Check if pet is already on expedition
    const existing = db.prepare('SELECT id FROM player_expeditions WHERE pet_id = ? AND reward_claimed = 0').get(pet.id);
    if (existing) return res.status(400).json({ error: '这只精灵已经在派遣中了！' });

    const durationSeconds = (durationHours || 2) * 3600;
    
    // Define rewards based on duration
    const rewards = {
      money: durationHours * 1000,
      exp: durationHours * 500,
      items: []
    };
    if (durationHours >= 8) {
      rewards.items.push({ id: 'candy_l', quantity: 1 });
      rewards.items.push({ id: 'capsule_advanced', quantity: 1 });
    } else {
      rewards.items.push({ id: 'candy_m', quantity: 1 });
    }

    db.prepare('INSERT INTO player_expeditions (player_id, pet_id, planet_id, duration, rewards) VALUES (?, ?, ?, ?, ?)')
      .run(player.id, pet.id, planetId || 1, durationSeconds, JSON.stringify(rewards));

    res.json({ success: true, message: '派遣成功！' });
  });

  router.post('/expedition/claim', authMiddleware, (req, res) => {
    const { expeditionId } = req.body;
    const player = db.prepare('SELECT id FROM players WHERE user_id = ?').get(req.userId);
    
    const expedition = db.prepare('SELECT * FROM player_expeditions WHERE id = ? AND player_id = ?').get(expeditionId, player.id);
    if (!expedition) return res.status(404).json({ error: 'Expedition not found' });
    if (expedition.reward_claimed === 1) return res.status(400).json({ error: '奖励已领取' });

    // Check completion again
    const start = new Date(expedition.start_time + 'Z');
    const elapsed = Math.floor((Date.now() - start.getTime()) / 1000);
    if (elapsed < expedition.duration && expedition.completed === 0) {
      return res.status(400).json({ error: '派遣尚未完成！' });
    }

    const rewards = JSON.parse(expedition.rewards || '{}');
    
    // Give rewards
    db.prepare('UPDATE players SET money = money + ? WHERE id = ?').run(rewards.money || 0, player.id);
    
    const pm = require('../game/pet-manager');
    pm.addExp(db, expedition.pet_id, rewards.exp || 0);

    if (rewards.items) {
      const stmt = db.prepare('INSERT INTO player_items (player_id, item_id, quantity) VALUES (?, ?, ?) ON CONFLICT(player_id, item_id) DO UPDATE SET quantity = quantity + ?');
      for (const item of rewards.items) {
        stmt.run(player.id, item.id, item.quantity, item.quantity);
      }
    }

    db.prepare('UPDATE player_expeditions SET reward_claimed = 1, completed = 1 WHERE id = ?').run(expedition.id);

    res.json({ success: true, message: '领取成功！', rewards });
  });

  // ===== GUILDS =====
  router.get('/guilds', authMiddleware, (req, res) => {
    const guilds = db.prepare(`
      SELECT g.*, u.username as creator_name, 
        (SELECT COUNT(*) FROM guild_members WHERE guild_id = g.id) as member_count
      FROM guilds g
      JOIN users u ON g.creator_id = u.id
      ORDER BY g.level DESC, g.exp DESC
      LIMIT 50
    `).all();
    
    // Check if player is in a guild
    const myMembership = db.prepare('SELECT guild_id FROM guild_members WHERE user_id = ?').get(req.userId);
    
    res.json({ guilds, myGuildId: myMembership ? myMembership.guild_id : null });
  });

  router.post('/guild/create', authMiddleware, (req, res) => {
    const { name } = req.body;
    if (!name || name.trim().length < 2 || name.trim().length > 12) {
      return res.status(400).json({ error: '战队名称长度必须在2-12个字符之间' });
    }
    
    const player = db.prepare('SELECT id, money FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });
    if (player.money < 50000) return res.status(400).json({ error: '创建战队需要 50000 💰' });

    const existingMembership = db.prepare('SELECT id FROM guild_members WHERE user_id = ?').get(req.userId);
    if (existingMembership) return res.status(400).json({ error: '你已经在一个战队中了！' });

    try {
      db.transaction(() => {
        db.prepare('UPDATE players SET money = money - 50000 WHERE id = ?').run(player.id);
        const result = db.prepare('INSERT INTO guilds (name, creator_id) VALUES (?, ?)').run(name.trim(), req.userId);
        const guildId = result.lastInsertRowid;
        db.prepare('INSERT INTO guild_members (guild_id, user_id, role) VALUES (?, ?, ?)')
          .run(guildId, req.userId, 'leader');
      })();
      res.json({ success: true, message: '战队创建成功！' });
    } catch (e) {
      if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: '该战队名称已被使用' });
      } else {
        res.status(500).json({ error: '创建失败: ' + e.message });
      }
    }
  });

  router.post('/guild/join', authMiddleware, (req, res) => {
    const { guildId } = req.body;
    
    const existingMembership = db.prepare('SELECT id FROM guild_members WHERE user_id = ?').get(req.userId);
    if (existingMembership) return res.status(400).json({ error: '你已经在一个战队中了！' });

    const guild = db.prepare('SELECT id FROM guilds WHERE id = ?').get(guildId);
    if (!guild) return res.status(404).json({ error: '战队不存在' });

    const memberCount = db.prepare('SELECT COUNT(*) as c FROM guild_members WHERE guild_id = ?').get(guildId).c;
    if (memberCount >= 50) return res.status(400).json({ error: '战队人数已满' });

    db.prepare('INSERT INTO guild_members (guild_id, user_id) VALUES (?, ?)').run(guildId, req.userId);
    res.json({ success: true, message: '加入战队成功！' });
  });

  router.get('/guild/my', authMiddleware, (req, res) => {
    const membership = db.prepare('SELECT * FROM guild_members WHERE user_id = ?').get(req.userId);
    if (!membership) return res.status(404).json({ error: '你还没有加入战队' });

    const guild = db.prepare('SELECT * FROM guilds WHERE id = ?').get(membership.guild_id);
    const members = db.prepare(`
      SELECT gm.*, u.username, p.money,
        (SELECT COUNT(*) FROM player_pets WHERE player_id = p.id) as pet_count
      FROM guild_members gm
      JOIN users u ON gm.user_id = u.id
      JOIN players p ON p.user_id = u.id
      WHERE gm.guild_id = ?
      ORDER BY gm.contribution DESC
    `).all(guild.id);

    res.json({ guild, members, myMembership: membership });
  });

  router.post('/guild/leave', authMiddleware, (req, res) => {
    const membership = db.prepare('SELECT * FROM guild_members WHERE user_id = ?').get(req.userId);
    if (!membership) return res.status(400).json({ error: '你还没有加入战队' });

    if (membership.role === 'leader') {
      const memberCount = db.prepare('SELECT COUNT(*) as c FROM guild_members WHERE guild_id = ?').get(membership.guild_id).c;
      if (memberCount > 1) {
        return res.status(400).json({ error: '队长不能直接退出，请先转让队长或解散战队' });
      } else {
        // Last member, dissolve guild
        db.transaction(() => {
          db.prepare('DELETE FROM guild_members WHERE guild_id = ?').run(membership.guild_id);
          db.prepare('DELETE FROM guilds WHERE id = ?').run(membership.guild_id);
        })();
        return res.json({ success: true, message: '战队已解散' });
      }
    }

    db.prepare('DELETE FROM guild_members WHERE id = ?').run(membership.id);
    res.json({ success: true, message: '已退出战队' });
  });

  router.post('/guild/donate', authMiddleware, (req, res) => {
    const { amount } = req.body;
    const player = db.prepare('SELECT id, money FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    if (player.money < amount) return res.status(400).json({ error: '金币不足' });

    const membership = db.prepare('SELECT * FROM guild_members WHERE user_id = ?').get(req.userId);
    if (!membership) return res.status(400).json({ error: '你还没有加入战队' });

    db.transaction(() => {
      db.prepare('UPDATE players SET money = money - ? WHERE id = ?').run(amount, player.id);
      db.prepare('UPDATE guild_members SET contribution = contribution + ? WHERE id = ?').run(amount, membership.id);
      
      const guild = db.prepare('SELECT * FROM guilds WHERE id = ?').get(membership.guild_id);
      let newExp = guild.exp + amount;
      let newLevel = guild.level;
      while (newExp >= newLevel * 10000) {
        newExp -= newLevel * 10000;
        newLevel++;
      }
      db.prepare('UPDATE guilds SET exp = ?, level = ? WHERE id = ?').run(newExp, newLevel, guild.id);
    })();

    res.json({ success: true, message: '捐献成功！' });
  });

  // ===== BASE SYSTEM =====
  router.get('/base', authMiddleware, (req, res) => {
    const player = db.prepare('SELECT id FROM players WHERE user_id = ?').get(req.userId);
    const items = db.prepare('SELECT * FROM player_base_items WHERE player_id = ?').all(player.id);
    res.json({ items });
  });

  router.post('/base/save', authMiddleware, (req, res) => {
    const { items } = req.body;
    const player = db.prepare('SELECT id FROM players WHERE user_id = ?').get(req.userId);
    
    db.transaction(() => {
      db.prepare('DELETE FROM player_base_items WHERE player_id = ?').run(player.id);
      const stmt = db.prepare('INSERT INTO player_base_items (player_id, item_id, x, y, rotation, placed) VALUES (?, ?, ?, ?, ?, ?)');
      for (const item of items) {
        stmt.run(player.id, item.itemId, item.x || 0, item.y || 0, item.rotation || 0, item.placed ? 1 : 0);
      }
    })();
    res.json({ success: true, message: '基地保存成功！' });
  });

  router.get('/base/pets', authMiddleware, (req, res) => {
    const player = db.prepare('SELECT id FROM players WHERE user_id = ?').get(req.userId);
    const pets = db.prepare('SELECT * FROM player_pets WHERE player_id = ?').all(player.id);
    res.json({ pets });
  });

  router.post('/base/pets/toggle', authMiddleware, (req, res) => {
    const { petId, inBase } = req.body;
    const player = db.prepare('SELECT id FROM players WHERE user_id = ?').get(req.userId);
    const pet = db.prepare('SELECT id FROM player_pets WHERE id = ? AND player_id = ?').get(petId, player.id);
    if (!pet) return res.status(404).json({ error: '宠物不存在' });
    
    db.prepare('UPDATE player_pets SET in_base = ? WHERE id = ?').run(inBase ? 1 : 0, pet.id);
    res.json({ success: true, message: inBase ? '放入基地成功' : '收回精灵成功' });
  });

  router.get('/gacha-pools', authMiddleware, (req, res) => {
    const pools = Object.entries(GACHA_POOLS).map(([key, pool]) => ({
      key, name: pool.name, price: pool.price, icon: pool.icon,
      itemCount: pool.items.length,
      hasRare: pool.items.some(i => i.rarity === 'rare'),
      hasLegendary: pool.items.some(i => i.rarity === 'legendary'),
    }));
    res.json({ pools });
  });

  router.post('/gacha', authMiddleware, (req, res) => {
    const { poolKey } = req.body;
    const pool = GACHA_POOLS[poolKey];
    if (!pool) return res.status(400).json({ error: '扭蛋池不存在' });

    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });
    if (player.money < pool.price) return res.status(400).json({ error: `金币不足！需要 ${pool.price} 💰` });

    db.prepare('UPDATE players SET money = money - ? WHERE id = ?').run(pool.price, player.id);

    // Pity system: after 10 pulls guarantee at least rare
    let pity = player.gacha_pity || 0;
    pity++;
    let result;
    if (pity >= 10) {
      // Force rare+ result
      const rareItems = pool.items.filter(i => i.rarity === 'rare' || i.rarity === 'legendary');
      result = rareItems.length > 0 ? weightedRandom(rareItems) : weightedRandom(pool.items);
      pity = 0;
    } else {
      result = weightedRandom(pool.items);
      if (result.rarity === 'rare' || result.rarity === 'legendary') pity = 0;
    }
    db.prepare('UPDATE players SET gacha_pity = ? WHERE id = ?').run(pity, player.id);

    // Give reward
    let message = '';
    if (result.type === 'item') {
      db.prepare('INSERT INTO player_items (player_id, item_id, quantity) VALUES (?, ?, 1) ON CONFLICT(player_id, item_id) DO UPDATE SET quantity = quantity + 1')
        .run(player.id, result.id);
      message = `获得了 ${result.icon} ${result.name}！`;
    } else if (result.type === 'money') {
      db.prepare('UPDATE players SET money = money + ? WHERE id = ?').run(result.amount, player.id);
      message = `获得了 ${result.amount} 💰！`;
    } else if (result.type === 'pet') {
      const teamCount = db.prepare('SELECT COUNT(*) as c FROM player_pets WHERE player_id = ? AND in_team = 1').get(player.id).c;
      const inTeam = teamCount < 6;
      createPetInstance(db, player.id, result.petId, 5, inTeam, inTeam ? teamCount : -1);
      message = `获得了稀有精灵 ${result.icon} ${result.name}！`;
    }

    const updatedPlayer = db.prepare('SELECT money FROM players WHERE id = ?').get(player.id);
    res.json({
      success: true,
      result: { ...result },
      message,
      playerMoney: updatedPlayer.money,
      pity: pity
    });
  });

  return router;
}

module.exports = createPlayerRouter;

