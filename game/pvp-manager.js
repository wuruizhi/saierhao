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
    this.pvpRooms = new Map(); // roomId -> { player1, player2, state }
    this.invitations = new Map(); // `${from}_${to}` -> invitation data
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
    this.onlinePlayers.set(userId, { ws, username });

    // Send online players list
    this.broadcastOnlinePlayers();

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        this.handleMessage(userId, msg);
      } catch (e) {
        console.error('WebSocket message error:', e);
      }
    });

    ws.on('close', () => {
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
      this.pvpRooms.delete(roomId);
    }
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
}

module.exports = PvpManager;
