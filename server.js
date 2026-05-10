const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');

const { initDB } = require('./db/init');
const createAuthRouter = require('./routes/auth');
const createPlayerRouter = require('./routes/player');
const createBattleRouter = require('./routes/battle');
const createShopRouter = require('./routes/shop');
const createAdminRouter = require('./routes/admin');
const PvpManager = require('./game/pvp-manager');
const SceneManager = require('./game/scene-manager');

const PORT = process.env.PORT || 3000;

// Initialize database
const db = initDB();
console.log('✅ 数据库初始化完成');

// Initialize scene manager
const sceneManager = new SceneManager();
console.log('✅ 场景管理器初始化完成');

// Initialize PVP manager (needed by admin router)
const pvpManager = new PvpManager(db);
console.log('✅ PVP管理器初始化完成');

// Create Express app
const app = express();
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth', createAuthRouter(db));
app.use('/api/player', createPlayerRouter(db));
app.use('/api/battle', createBattleRouter(db, sceneManager));
app.use('/api/shop', createShopRouter(db));
app.use('/api/admin', createAdminRouter(db, pvpManager));

// Admin page route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create HTTP server
const server = http.createServer(app);

// WebSocket server for PVP
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  pvpManager.handleConnection(ws, req);
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 赛尔号服务器已启动: http://localhost:${PORT}`);
  console.log(`🌐 WebSocket 服务: ws://localhost:${PORT}/ws`);
});
