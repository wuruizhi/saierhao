const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const { executeAttack, chooseEnemySkill } = require('./battle-engine');
const { addExp } = require('./pet-manager');
const petsData = require('../data/pets.json');
const skillsData = require('../data/skills.json');

class PvpManager {
  constructor(db) {
    this.db = db;
    this.onlinePlayers = new Map(); // userId -> { ws, username }
    this.scenePlayers = new Map(); // sceneId -> Map<userId, { username, x, y, targetX, targetY }>
    this.pvpRooms = new Map(); // roomId -> { player1, player2, state, isRanked }
    this.invitations = new Map(); // `${from}_${to}` -> invitation data
    this.rankedQueue = []; // array of { userId, elo, joinedAt }
    this.chatHistory = []; // last N chat messages
    this.MAX_CHAT_HISTORY = 50;
  }

  handleConnection(ws, req) {
    // Parse token from URL
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');
    if (!token) {
      ws.close(4001, '未提供认证令牌');
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      ws.close(4001, '令牌无效');
      return;
    }

    const { userId, username } = decoded;
    
    // Kick existing connection if the same user logs in again (e.g. from another tab)
    const existing = this.onlinePlayers.get(userId);
    if (existing && existing.ws && existing.ws.readyState === 1) {
      try { existing.ws.close(4001, '已在其他设备或窗口登录'); } catch(e){}
      this.handleLeaveScene(userId);
    }

    this.onlinePlayers.set(userId, { ws, username });

    // Send online players list
    this.broadcastOnlinePlayers();

    // Send chat history to newly connected user
    if (this.chatHistory.length > 0) {
      this.sendTo(userId, { type: 'chat_history', messages: this.chatHistory });
    }

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        this.handleMessage(userId, msg);
      } catch (e) {
        console.error('WebSocket message error:', e);
      }
    });

    ws.on('close', () => {
      this.handleLeaveScene(userId);
      this.onlinePlayers.delete(userId);
      // Clean up any active PVP rooms
      for (const [roomId, room] of this.pvpRooms) {
        if (room.player1.userId === userId || room.player2.userId === userId) {
          const otherId = room.player1.userId === userId ? room.player2.userId : room.player1.userId;
          this.sendTo(otherId, { type: 'pvp_opponent_disconnected' });
          this.pvpRooms.delete(roomId);
        }
      }
      this.broadcastOnlinePlayers();
    });

    this.sendTo(userId, { type: 'connected', userId, username });
  }

  handleMessage(userId, msg) {
    switch (msg.type) {
      case 'pvp_invite':
        this.handleInvite(userId, msg.targetUserId);
        break;
      case 'pvp_accept':
        this.handleAccept(userId, msg.fromUserId);
        break;
      case 'pvp_reject':
        this.handleReject(userId, msg.fromUserId);
        break;
      case 'pvp_action':
        this.handlePvpAction(userId, msg.roomId, msg.skillId);
        break;
      case 'pvp_switch':
        this.handlePvpSwitch(userId, msg.roomId, msg.petIndex);
        break;
      case 'join_scene':
        this.handleJoinScene(userId, msg.mapId, msg.sceneIndex, msg.x, msg.y);
        break;
      case 'leave_scene':
        this.handleLeaveScene(userId);
        break;
      case 'scene_move':
        this.handleSceneMove(userId, msg.targetX, msg.targetY);
        break;
      case 'chat_message':
        this.handleChatMessage(userId, msg.text);
        break;
      case 'pvp_queue_join':
        this.handleJoinQueue(userId);
        break;
      case 'pvp_queue_leave':
        this.handleLeaveQueue(userId);
        break;
    }
  }

  handleInvite(fromId, toId) {
    const fromPlayer = this.onlinePlayers.get(fromId);
    const toPlayer = this.onlinePlayers.get(toId);
    if (!toPlayer) {
      this.sendTo(fromId, { type: 'pvp_error', message: '对方不在线' });
      return;
    }

    const inviteKey = `${fromId}_${toId}`;
    this.invitations.set(inviteKey, { fromId, toId, fromUsername: fromPlayer.username, timestamp: Date.now() });

    this.sendTo(toId, {
      type: 'pvp_invitation',
      fromUserId: fromId,
      fromUsername: fromPlayer.username
    });
    this.sendTo(fromId, { type: 'pvp_invite_sent', toUsername: toPlayer.username });
  }

  handleAccept(accepterId, fromId) {
    const inviteKey = `${fromId}_${accepterId}`;
    const invite = this.invitations.get(inviteKey);
    if (!invite) {
      this.sendTo(accepterId, { type: 'pvp_error', message: '邀请已过期' });
      return;
    }
    this.invitations.delete(inviteKey);

    // Create PVP room
    const roomId = `pvp_${fromId}_${accepterId}_${Date.now()}`;

    // Get both players' teams
    const p1Player = this.db.prepare('SELECT * FROM players WHERE user_id = ?').get(fromId);
    const p2Player = this.db.prepare('SELECT * FROM players WHERE user_id = ?').get(accepterId);

    const p1Team = this.db.prepare(
      'SELECT * FROM player_pets WHERE player_id = ? AND in_team = 1 AND current_hp > 0 ORDER BY team_order'
    ).all(p1Player.id);

    const p2Team = this.db.prepare(
      'SELECT * FROM player_pets WHERE player_id = ? AND in_team = 1 AND current_hp > 0 ORDER BY team_order'
    ).all(p2Player.id);

    if (p1Team.length === 0 || p2Team.length === 0) {
      this.sendTo(fromId, { type: 'pvp_error', message: '队伍中没有可战斗的精灵' });
      this.sendTo(accepterId, { type: 'pvp_error', message: '队伍中没有可战斗的精灵' });
      return;
    }

    const enrichPet = (p) => ({
      ...p,
      skills: JSON.parse(p.skills),
      petDef: petsData.pets.find(pd => pd.id === p.pet_id)
    });

    const room = {
      player1: {
        userId: fromId,
        username: this.onlinePlayers.get(fromId)?.username,
        team: p1Team.map(enrichPet),
        activeIndex: 0,
        action: null
      },
      player2: {
        userId: accepterId,
        username: this.onlinePlayers.get(accepterId)?.username,
        team: p2Team.map(enrichPet),
        activeIndex: 0,
        action: null
      },
      turn: 1
    };

    this.pvpRooms.set(roomId, room);

    const battleData = {
      type: 'pvp_start',
      roomId,
      turn: 1
    };

    this.sendTo(fromId, {
      ...battleData,
      yourPet: room.player1.team[0],
      opponentPet: this.sanitizePet(room.player2.team[0]),
      opponentName: room.player2.username
    });

    this.sendTo(accepterId, {
      ...battleData,
      yourPet: room.player2.team[0],
      opponentPet: this.sanitizePet(room.player1.team[0]),
      opponentName: room.player1.username
    });
  }

  handleReject(rejecterId, fromId) {
    const inviteKey = `${fromId}_${rejecterId}`;
    this.invitations.delete(inviteKey);
    const rejecterName = this.onlinePlayers.get(rejecterId)?.username || '未知';
    this.sendTo(fromId, { type: 'pvp_rejected', byUsername: rejecterName });
  }

  handleJoinQueue(userId) {
    const player = this.db.prepare('SELECT elo_rating FROM players WHERE user_id = ?').get(userId);
    if (!player) return;
    const elo = player.elo_rating || 1000;
    
    // Check if already in queue or room
    if (this.rankedQueue.some(q => q.userId === userId)) return;
    for (const [roomId, room] of this.pvpRooms) {
      if (room.player1.userId === userId || room.player2.userId === userId) {
        this.sendTo(userId, { type: 'pvp_error', message: '你已经在对战中了' });
        return;
      }
    }
    
    // Find match
    const matchIndex = this.rankedQueue.findIndex(q => Math.abs(q.elo - elo) < 400); // 400 diff tolerance
    if (matchIndex !== -1) {
      const opponent = this.rankedQueue.splice(matchIndex, 1)[0];
      this.startRankedMatch(userId, opponent.userId);
    } else {
      this.rankedQueue.push({ userId, elo, joinedAt: Date.now() });
      this.sendTo(userId, { type: 'pvp_queue_joined' });
    }
  }

  handleLeaveQueue(userId) {
    this.rankedQueue = this.rankedQueue.filter(q => q.userId !== userId);
    this.sendTo(userId, { type: 'pvp_queue_left' });
  }

  startRankedMatch(p1Id, p2Id) {
    const roomId = `ranked_${p1Id}_${p2Id}_${Date.now()}`;
    const p1Player = this.db.prepare('SELECT * FROM players WHERE user_id = ?').get(p1Id);
    const p2Player = this.db.prepare('SELECT * FROM players WHERE user_id = ?').get(p2Id);

    const p1Team = this.db.prepare('SELECT * FROM player_pets WHERE player_id = ? AND in_team = 1 AND current_hp > 0 ORDER BY team_order').all(p1Player.id);
    const p2Team = this.db.prepare('SELECT * FROM player_pets WHERE player_id = ? AND in_team = 1 AND current_hp > 0 ORDER BY team_order').all(p2Player.id);

    if (p1Team.length === 0 || p2Team.length === 0) {
      this.sendTo(p1Id, { type: 'pvp_error', message: '匹配失败，队伍中没有可战斗的精灵' });
      this.sendTo(p2Id, { type: 'pvp_error', message: '匹配失败，队伍中没有可战斗的精灵' });
      return;
    }

    const enrichPet = (p) => ({ ...p, skills: JSON.parse(p.skills), petDef: petsData.pets.find(pd => pd.id === p.pet_id) });

    const room = {
      isRanked: true,
      player1: { userId: p1Id, username: this.onlinePlayers.get(p1Id)?.username, team: p1Team.map(enrichPet), activeIndex: 0, action: null },
      player2: { userId: p2Id, username: this.onlinePlayers.get(p2Id)?.username, team: p2Team.map(enrichPet), activeIndex: 0, action: null },
      turn: 1
    };
    this.pvpRooms.set(roomId, room);

    const battleData = { type: 'pvp_start', isRanked: true, roomId, turn: 1 };
    this.sendTo(p1Id, { ...battleData, yourPet: room.player1.team[0], opponentPet: this.sanitizePet(room.player2.team[0]), opponentName: room.player2.username });
    this.sendTo(p2Id, { ...battleData, yourPet: room.player2.team[0], opponentPet: this.sanitizePet(room.player1.team[0]), opponentName: room.player1.username });
  }

  handlePvpAction(userId, roomId, skillId) {
    const room = this.pvpRooms.get(roomId);
    if (!room) return;

    const isP1 = room.player1.userId === userId;
    const player = isP1 ? room.player1 : room.player2;
    player.action = { type: 'attack', skillId };

    // Check if both players have acted
    if (room.player1.action && room.player2.action) {
      this.resolvePvpTurn(roomId, room);
    } else {
      const otherId = isP1 ? room.player2.userId : room.player1.userId;
      this.sendTo(otherId, { type: 'pvp_opponent_acting', message: '对方已选择行动，等待你的选择...' });
      this.sendTo(userId, { type: 'pvp_waiting', message: '等待对方选择行动...' });
    }
  }

  resolvePvpTurn(roomId, room) {
    const p1Pet = room.player1.team[room.player1.activeIndex];
    const p2Pet = room.player2.team[room.player2.activeIndex];

    const skill1 = skillsData.skills.find(s => s.id === room.player1.action.skillId);
    const skill2 = skillsData.skills.find(s => s.id === room.player2.action.skillId);

    if (!skill1 || !skill2) return;

    // Determine who goes first (higher speed)
    const p1First = p1Pet.speed >= p2Pet.speed;
    const first = p1First ? { pet: p1Pet, skill: skill1, player: room.player1 }
                          : { pet: p2Pet, skill: skill2, player: room.player2 };
    const second = p1First ? { pet: p2Pet, skill: skill2, player: room.player2 }
                           : { pet: p1Pet, skill: skill1, player: room.player1 };

    const results = [];

    // First attack
    const r1 = executeAttack(first.pet, second.pet, first.skill, true);
    results.push({ ...r1, attackerName: first.pet.nickname, defenderName: second.pet.nickname });

    let battleEnd = false;
    let winnerId = null;

    if (second.pet.current_hp <= 0) {
      battleEnd = true;
      winnerId = first.player.userId;
    } else {
      // Second attack
      const r2 = executeAttack(second.pet, first.pet, second.skill, true);
      results.push({ ...r2, attackerName: second.pet.nickname, defenderName: first.pet.nickname });

      if (first.pet.current_hp <= 0) {
        battleEnd = true;
        winnerId = second.player.userId;
      }
    }

    room.turn++;
    room.player1.action = null;
    room.player2.action = null;

    const turnData = {
      type: 'pvp_turn_result',
      results,
      turn: room.turn,
      battleEnd,
      winnerId
    };

    this.sendTo(room.player1.userId, {
      ...turnData,
      yourPet: room.player1.team[room.player1.activeIndex],
      opponentPet: this.sanitizePet(room.player2.team[room.player2.activeIndex])
    });

    this.sendTo(room.player2.userId, {
      ...turnData,
      yourPet: room.player2.team[room.player2.activeIndex],
      opponentPet: this.sanitizePet(room.player1.team[room.player1.activeIndex])
    });

    if (battleEnd) {
      if (room.isRanked) {
        this.updateElo(room.player1.userId, room.player2.userId, winnerId);
      } else {
        // Casual PVP achievements
        const winnerP = this.db.prepare('SELECT * FROM players WHERE user_id = ?').get(winnerId);
        if (winnerP) {
          this.db.prepare('UPDATE players SET pvp_wins = pvp_wins + 1 WHERE id = ?').run(winnerP.id);
          const { incrementQuestProgress } = require('./quest-manager');
          incrementQuestProgress(this.db, winnerP.id, 'pvp', 1);
        }
      }
      this.pvpRooms.delete(roomId);
    }
  }

  updateElo(p1UserId, p2UserId, winnerId) {
    const p1Player = this.db.prepare('SELECT id, elo_rating, ranked_wins FROM players WHERE user_id = ?').get(p1UserId);
    const p2Player = this.db.prepare('SELECT id, elo_rating, ranked_wins FROM players WHERE user_id = ?').get(p2UserId);
    if (!p1Player || !p2Player) return;

    const r1 = p1Player.elo_rating || 1000;
    const r2 = p2Player.elo_rating || 1000;

    const k = 32;
    const e1 = 1 / (1 + Math.pow(10, (r2 - r1) / 400));
    const e2 = 1 / (1 + Math.pow(10, (r1 - r2) / 400));

    const s1 = winnerId === p1UserId ? 1 : 0;
    const s2 = winnerId === p2UserId ? 1 : 0;

    const newR1 = Math.round(r1 + k * (s1 - e1));
    const newR2 = Math.round(r2 + k * (s2 - e2));

    this.db.prepare('UPDATE players SET elo_rating = ?, ranked_wins = ranked_wins + ? WHERE id = ?').run(newR1, s1, p1Player.id);
    this.db.prepare('UPDATE players SET elo_rating = ?, ranked_wins = ranked_wins + ? WHERE id = ?').run(newR2, s2, p2Player.id);

    this.sendTo(p1UserId, { type: 'pvp_ranked_result', oldElo: r1, newElo: newR1, result: s1 === 1 ? 'win' : 'lose' });
    this.sendTo(p2UserId, { type: 'pvp_ranked_result', oldElo: r2, newElo: newR2, result: s2 === 1 ? 'win' : 'lose' });
    
    // Daily quest update
    const { incrementQuestProgress } = require('./quest-manager');
    if (s1 === 1) incrementQuestProgress(this.db, p1Player.id, 'pvp', 1);
    if (s2 === 1) incrementQuestProgress(this.db, p2Player.id, 'pvp', 1);
  }

  sanitizePet(pet) {
    // Don't reveal exact skills to opponent
    return {
      nickname: pet.nickname,
      pet_id: pet.pet_id,
      level: pet.level,
      current_hp: pet.current_hp,
      max_hp: pet.max_hp,
      petDef: pet.petDef
    };
  }

  sendTo(userId, data) {
    const player = this.onlinePlayers.get(userId);
    if (player && player.ws.readyState === 1) {
      player.ws.send(JSON.stringify(data));
    }
  }

  // Force disconnect a user (called when admin deletes account)
  kickUser(userId) {
    const player = this.onlinePlayers.get(userId);
    if (player) {
      try { player.ws.close(4001, '账户已被管理员删除'); } catch (e) {}
      this.handleLeaveScene(userId);
      this.handleLeaveQueue(userId);
      this.onlinePlayers.delete(userId);
      // Clean up any active PVP rooms
      for (const [roomId, room] of this.pvpRooms) {
        if (room.player1.userId === userId || room.player2.userId === userId) {
          const otherId = room.player1.userId === userId ? room.player2.userId : room.player1.userId;
          this.sendTo(otherId, { type: 'pvp_opponent_disconnected' });
          this.pvpRooms.delete(roomId);
        }
      }
    }
  }

  broadcastOnlinePlayers() {
    const list = [];
    for (const [userId, { username }] of this.onlinePlayers) {
      // Verify user still exists in database
      const user = this.db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
      if (!user) {
        this.onlinePlayers.delete(userId);
        continue;
      }
      list.push({ userId, username });
    }
    for (const [, { ws }] of this.onlinePlayers) {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'online_players', players: list }));
      }
    }
  }

  // --- MMO SCENE SYNCHRONIZATION ---
  handleJoinScene(userId, mapId, sceneIndex, x, y) {
    this.handleLeaveScene(userId); // Leave any previous scene just in case
    const sceneId = `${mapId}_${sceneIndex}`;
    const player = this.onlinePlayers.get(userId);
    if (!player) return;

    if (!this.scenePlayers.has(sceneId)) {
      this.scenePlayers.set(sceneId, new Map());
    }
    const sceneMap = this.scenePlayers.get(sceneId);
    
    // Fetch equips
    const dbPlayer = this.db.prepare('SELECT id FROM players WHERE user_id = ?').get(userId);
    const equipsList = dbPlayer ? this.db.prepare('SELECT part, item_id FROM player_equips WHERE player_id = ?').all(dbPlayer.id) : [];
    const equips = {};
    equipsList.forEach(e => { equips[e.part] = e.item_id; });

    sceneMap.set(userId, { sceneId, username: player.username, x, y, targetX: x, targetY: y, equips });

    // Send current players in this scene to the joining user
    const currentPlayers = Array.from(sceneMap.entries())
      .filter(([id]) => id !== userId)
      .map(([id, data]) => ({ userId: id, ...data }));
    this.sendTo(userId, { type: 'scene_players', players: currentPlayers });

    // Broadcast to others in the scene that this user joined
    this.broadcastToScene(sceneId, { type: 'scene_player_joined', userId, username: player.username, x, y, equips }, userId);
  }

  handleLeaveScene(userId) {
    for (const [sceneId, sceneMap] of this.scenePlayers.entries()) {
      if (sceneMap.has(userId)) {
        sceneMap.delete(userId);
        this.broadcastToScene(sceneId, { type: 'scene_player_left', userId }, userId);
        if (sceneMap.size === 0) {
          this.scenePlayers.delete(sceneId);
        }
        break;
      }
    }
  }

  handleSceneMove(userId, targetX, targetY) {
    for (const [sceneId, sceneMap] of this.scenePlayers.entries()) {
      if (sceneMap.has(userId)) {
        const data = sceneMap.get(userId);
        data.targetX = targetX;
        data.targetY = targetY;
        this.broadcastToScene(sceneId, { type: 'scene_player_moved', userId, targetX, targetY }, userId);
        break;
      }
    }
  }

  broadcastToScene(sceneId, msg, excludeUserId = null) {
    const sceneMap = this.scenePlayers.get(sceneId);
    if (!sceneMap) return;
    for (const [userId] of sceneMap.entries()) {
      if (userId !== excludeUserId) {
        this.sendTo(userId, msg);
      }
    }
  }

  // --- PUBLIC CHAT ---
  handleChatMessage(userId, text) {
    if (!text || typeof text !== 'string') return;
    const clean = text.trim().slice(0, 200); // limit 200 chars
    if (clean.length === 0) return;

    const player = this.onlinePlayers.get(userId);
    if (!player) return;

    const chatMsg = {
      userId,
      username: player.username,
      text: clean,
      time: Date.now()
    };

    // Store in history
    this.chatHistory.push(chatMsg);
    if (this.chatHistory.length > this.MAX_CHAT_HISTORY) {
      this.chatHistory.shift();
    }

    // Broadcast to everyone
    this.broadcastAll({ type: 'chat_new', message: chatMsg });
  }

  broadcastAll(msg) {
    const payload = JSON.stringify(msg);
    for (const [, { ws }] of this.onlinePlayers) {
      if (ws.readyState === 1) {
        ws.send(payload);
      }
    }
  }
}

module.exports = PvpManager;
