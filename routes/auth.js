const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth');

function createAuthRouter(db) {
  const router = express.Router();

  // Register
  router.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    if (username.length < 2 || username.length > 20) {
      return res.status(400).json({ error: '用户名长度2-20个字符' });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: '密码至少4个字符' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      return res.status(400).json({ error: '用户名已被注册' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hash);
    const userId = result.lastInsertRowid;

    // Create player profile
    const playerResult = db.prepare('INSERT INTO players (user_id, money) VALUES (?, 2000)').run(userId);
    const playerId = playerResult.lastInsertRowid;

    // Give initial wardrobe items and equip them
    db.prepare('INSERT INTO player_items (player_id, item_id, quantity) VALUES (?, ?, ?)').run(playerId, 'hat_novice', 1);
    db.prepare('INSERT INTO player_items (player_id, item_id, quantity) VALUES (?, ?, ?)').run(playerId, 'body_novice', 1);
    db.prepare('INSERT INTO player_equips (player_id, part, item_id) VALUES (?, ?, ?)').run(playerId, 'head', 'hat_novice');
    db.prepare('INSERT INTO player_equips (player_id, part, item_id) VALUES (?, ?, ?)').run(playerId, 'body', 'body_novice');

    const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, userId, username });
  });

  // Login
  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(400).json({ error: '用户名或密码错误' });
    }

    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(400).json({ error: '用户名或密码错误' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, userId: user.id, username: user.username });
  });

  // Get current user
  router.get('/me', authMiddleware, (req, res) => {
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    res.json({ userId: req.userId, username: req.username, player });
  });

  return router;
}

module.exports = createAuthRouter;
