const express = require('express');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '19980826';

function adminAuth(req, res, next) {
  const pw = req.headers['x-admin-password'] || req.body?.adminPassword || req.query?.adminPassword;
  if (pw !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: '管理密码错误' });
  }
  next();
}

function createAdminRouter(db, pvpManager) {
  const router = express.Router();

  // Admin login verification
  router.post('/login', (req, res) => {
    const { password } = req.body;
    if (password !== ADMIN_PASSWORD) {
      return res.status(403).json({ error: '密码错误' });
    }
    res.json({ success: true, message: '登录成功' });
  });

  // Get all users (with pagination + search)
  router.get('/users', adminAuth, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let countQuery = 'SELECT COUNT(*) as total FROM users';
    let dataQuery = `
      SELECT u.id, u.username, u.created_at,
             p.id as player_id, p.money, p.starter_pet_id,
             (SELECT COUNT(*) FROM player_pets WHERE player_id = p.id) as pet_count,
             (SELECT COUNT(*) FROM player_pets WHERE player_id = p.id AND in_team = 1) as team_count
      FROM users u
      LEFT JOIN players p ON p.user_id = u.id
    `;

    const params = [];
    if (search) {
      const where = ' WHERE u.username LIKE ?';
      countQuery += where;
      dataQuery += where;
      params.push(`%${search}%`);
    }

    dataQuery += ' ORDER BY u.id DESC LIMIT ? OFFSET ?';

    const total = db.prepare(countQuery).get(...params).total;
    const users = db.prepare(dataQuery).all(...params, limit, offset);

    res.json({ users, total, page, limit, totalPages: Math.ceil(total / limit) });
  });

  // Get user detail
  router.get('/user/:id', adminAuth, (req, res) => {
    const userId = parseInt(req.params.id);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(userId);
    if (!player) return res.json({ user, player: null, pets: [], items: [], essences: [] });

    const pets = db.prepare('SELECT * FROM player_pets WHERE player_id = ? ORDER BY in_team DESC, level DESC').all(player.id);
    const items = db.prepare('SELECT * FROM player_items WHERE player_id = ?').all(player.id);
    const essences = db.prepare('SELECT * FROM player_essences WHERE player_id = ?').all(player.id);

    // Remove password from response
    delete user.password_hash;
    
    res.json({ user, player, pets, items, essences });
  });

  // Set user money
  router.post('/user/:id/set-money', adminAuth, (req, res) => {
    const userId = parseInt(req.params.id);
    const { money } = req.body;
    if (money === undefined || money < 0) return res.status(400).json({ error: '请输入有效金币数量' });

    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    db.prepare('UPDATE players SET money = ? WHERE user_id = ?').run(money, userId);
    res.json({ success: true, message: `金币已设置为 ${money}`, money });
  });

  // Set pet level
  router.post('/user/:id/set-pet-level', adminAuth, (req, res) => {
    const userId = parseInt(req.params.id);
    const { petInstanceId, level } = req.body;
    if (!petInstanceId || !level || level < 1 || level > 100) {
      return res.status(400).json({ error: '请输入有效的精灵ID和等级(1-100)' });
    }

    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const pet = db.prepare('SELECT * FROM player_pets WHERE id = ? AND player_id = ?').get(petInstanceId, player.id);
    if (!pet) return res.status(404).json({ error: '精灵不存在' });

    if (level > pet.level) {
      const { addExp } = require('../game/pet-manager');
      const petsData = require('../data/pets.json');
      let neededExp = 0;
      for (let l = pet.level + 1; l <= level; l++) {
        if (petsData.expTable[l]) neededExp += petsData.expTable[l];
      }
      addExp(db, petInstanceId, neededExp - pet.exp);
    } else if (level < pet.level) {
      const { calculateStats } = require('../game/pet-manager');
      const ivs = pet.ivs ? JSON.parse(pet.ivs) : {};
      const evs = pet.evs ? JSON.parse(pet.evs) : {};
      const newStats = calculateStats(pet.pet_id, level, ivs, evs);
      db.prepare(`
        UPDATE player_pets SET level = ?, exp = 0, current_hp = ?, max_hp = ?, 
        attack = ?, defense = ?, speed = ?, sp_attack = ?, sp_defense = ?
        WHERE id = ?
      `).run(level, newStats.hp, newStats.hp, newStats.attack, newStats.defense, newStats.speed, newStats.spAttack, newStats.spDefense, petInstanceId);
    }
    
    res.json({ success: true, message: `精灵等级已设置为 ${level}` });
  });

  // Grant all users infinite coins
  router.post('/grant-all-coins', adminAuth, (req, res) => {
    const money = req.body.money || 999999999;
    const result = db.prepare('UPDATE players SET money = ?').run(money);
    res.json({ success: true, message: `已为 ${result.changes} 位玩家设置 ${money} 金币` });
  });

  // Delete a pet from a player
  router.post('/user/:id/delete-pet', adminAuth, (req, res) => {
    const userId = parseInt(req.params.id);
    const { petInstanceId } = req.body;

    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    db.prepare('DELETE FROM player_pets WHERE id = ? AND player_id = ?').run(petInstanceId, player.id);
    res.json({ success: true, message: '精灵已删除' });
  });

  // Give item to user
  router.post('/user/:id/give-item', adminAuth, (req, res) => {
    const userId = parseInt(req.params.id);
    const { itemId, quantity } = req.body;
    if (!itemId || !quantity || quantity < 1) return res.status(400).json({ error: '请输入有效的道具ID和数量' });

    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const existing = db.prepare('SELECT * FROM player_items WHERE player_id = ? AND item_id = ?').get(player.id, itemId);
    if (existing) {
      db.prepare('UPDATE player_items SET quantity = quantity + ? WHERE player_id = ? AND item_id = ?').run(quantity, player.id, itemId);
    } else {
      db.prepare('INSERT INTO player_items (player_id, item_id, quantity) VALUES (?, ?, ?)').run(player.id, itemId, quantity);
    }
    res.json({ success: true, message: `已给予 ${itemId} x${quantity}` });
  });

  // Remove item from user
  router.post('/user/:id/remove-item', adminAuth, (req, res) => {
    const userId = parseInt(req.params.id);
    const { itemId } = req.body;

    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    db.prepare('DELETE FROM player_items WHERE player_id = ? AND item_id = ?').run(player.id, itemId);
    res.json({ success: true, message: `已移除道具 ${itemId}` });
  });

  // Set item quantity
  router.post('/user/:id/set-item', adminAuth, (req, res) => {
    const userId = parseInt(req.params.id);
    const { itemId, quantity } = req.body;

    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    if (quantity <= 0) {
      db.prepare('DELETE FROM player_items WHERE player_id = ? AND item_id = ?').run(player.id, itemId);
    } else {
      const existing = db.prepare('SELECT * FROM player_items WHERE player_id = ? AND item_id = ?').get(player.id, itemId);
      if (existing) {
        db.prepare('UPDATE player_items SET quantity = ? WHERE player_id = ? AND item_id = ?').run(quantity, player.id, itemId);
      } else {
        db.prepare('INSERT INTO player_items (player_id, item_id, quantity) VALUES (?, ?, ?)').run(player.id, itemId, quantity);
      }
    }
    res.json({ success: true, message: `道具 ${itemId} 已设置为 ${quantity}` });
  });

  // Give a pet to user
  router.post('/user/:id/give-pet', adminAuth, (req, res) => {
    const { createPetInstance } = require('../game/pet-manager');
    const userId = parseInt(req.params.id);
    const { petId, level } = req.body;
    if (!petId || !level || level < 1 || level > 100) return res.status(400).json({ error: '请输入有效的精灵ID和等级' });

    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const teamCount = db.prepare('SELECT COUNT(*) as c FROM player_pets WHERE player_id = ? AND in_team = 1').get(player.id).c;
    const inTeam = teamCount < 6;
    const instanceId = createPetInstance(db, player.id, petId, level, inTeam, inTeam ? teamCount : -1);
    res.json({ success: true, message: `已赠予精灵 #${petId} Lv.${level}${inTeam ? '(队伍)' : '(仓库)'}`, instanceId });
  });

  // Set pet HP
  router.post('/user/:id/set-pet-hp', adminAuth, (req, res) => {
    const userId = parseInt(req.params.id);
    const { petInstanceId, hp } = req.body;

    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const pet = db.prepare('SELECT * FROM player_pets WHERE id = ? AND player_id = ?').get(petInstanceId, player.id);
    if (!pet) return res.status(404).json({ error: '精灵不存在' });

    const newHp = Math.max(0, Math.min(pet.max_hp, hp));
    db.prepare('UPDATE player_pets SET current_hp = ? WHERE id = ?').run(newHp, petInstanceId);
    res.json({ success: true, message: `HP已设置为 ${newHp}/${pet.max_hp}` });
  });

  // Delete user account and all associated data
  router.delete('/user/:id', adminAuth, (req, res) => {
    const userId = parseInt(req.params.id);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(userId);

    if (player) {
      db.prepare('DELETE FROM player_pets WHERE player_id = ?').run(player.id);
      db.prepare('DELETE FROM player_items WHERE player_id = ?').run(player.id);
      db.prepare('DELETE FROM player_essences WHERE player_id = ?').run(player.id);
      db.prepare('DELETE FROM players WHERE user_id = ?').run(userId);
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    // Kick user if online
    if (pvpManager) {
      pvpManager.kickUser(userId);
    }

    res.json({ success: true, message: `用户 ${user.username} 及其所有数据已删除` });
  });

  // Get server stats
  router.get('/stats', adminAuth, (req, res) => {
    const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
    const totalPlayers = db.prepare('SELECT COUNT(*) as c FROM players').get().c;
    const totalPets = db.prepare('SELECT COUNT(*) as c FROM player_pets').get().c;
    const totalMoney = db.prepare('SELECT SUM(money) as s FROM players').get().s || 0;
    let recentUsers = 0;
    try {
      recentUsers = db.prepare("SELECT COUNT(*) as c FROM users WHERE created_at > datetime('now', '-1 day')").get().c;
    } catch(e) { recentUsers = 0; }
    
    res.json({ totalUsers, totalPlayers, totalPets, totalMoney, recentUsers });
  });

  return router;
}

module.exports = createAdminRouter;
