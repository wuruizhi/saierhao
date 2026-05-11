const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'saierhao.db');

function initDB() {
  const db = new Database(DB_PATH);

  // Enable WAL mode for better concurrent performance
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      starter_pet_id INTEGER DEFAULT 0,
      team TEXT DEFAULT '[]',
      money INTEGER DEFAULT 999999999,
      current_map INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS player_pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      pet_id INTEGER NOT NULL,
      nickname TEXT DEFAULT '',
      level INTEGER DEFAULT 5,
      exp INTEGER DEFAULT 0,
      current_hp INTEGER NOT NULL,
      max_hp INTEGER NOT NULL,
      attack INTEGER NOT NULL,
      defense INTEGER NOT NULL,
      speed INTEGER NOT NULL,
      sp_attack INTEGER NOT NULL,
      sp_defense INTEGER NOT NULL,
      skills TEXT DEFAULT '[]',
      in_team INTEGER DEFAULT 0,
      team_order INTEGER DEFAULT -1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players(id)
    );

    CREATE TABLE IF NOT EXISTS battle_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player1_id INTEGER NOT NULL,
      player2_id INTEGER,
      battle_type TEXT DEFAULT 'pve',
      winner_id INTEGER,
      log TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS player_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      item_id TEXT NOT NULL,
      quantity INTEGER DEFAULT 0,
      UNIQUE(player_id, item_id),
      FOREIGN KEY (player_id) REFERENCES players(id)
    );

    CREATE TABLE IF NOT EXISTS player_essences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      essence_id TEXT NOT NULL,
      hatching INTEGER DEFAULT 0,
      hatch_start DATETIME,
      hatch_duration INTEGER DEFAULT 300,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players(id)
    );

    CREATE TABLE IF NOT EXISTS player_equips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      part TEXT NOT NULL, -- e.g. 'head', 'body', 'back', 'accessory'
      item_id TEXT NOT NULL,
      UNIQUE(player_id, part),
      FOREIGN KEY (player_id) REFERENCES players(id)
    );

    CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending', -- 'pending', 'accepted'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, friend_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (friend_id) REFERENCES users(id)
    );
  `);

  // New tables for achievements + daily quests
  db.exec(`
    CREATE TABLE IF NOT EXISTS player_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      achievement_id TEXT NOT NULL,
      unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(player_id, achievement_id),
      FOREIGN KEY (player_id) REFERENCES players(id)
    );

    CREATE TABLE IF NOT EXISTS daily_quests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      quest_id TEXT NOT NULL,
      quest_type TEXT NOT NULL,
      target INTEGER NOT NULL,
      progress INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      reward_claimed INTEGER DEFAULT 0,
      reward_money INTEGER DEFAULT 0,
      quest_date TEXT NOT NULL,
      UNIQUE(player_id, quest_id, quest_date),
      FOREIGN KEY (player_id) REFERENCES players(id)
    );

    CREATE TABLE IF NOT EXISTS player_story_quests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      planet_id INTEGER NOT NULL,
      quest_step INTEGER DEFAULT 0,
      progress INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active', -- 'active', 'completed'
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(player_id, planet_id),
      FOREIGN KEY (player_id) REFERENCES players(id)
    );

    CREATE TABLE IF NOT EXISTS redemption_codes (
      code TEXT PRIMARY KEY,
      reward_money INTEGER DEFAULT 0,
      reward_items TEXT DEFAULT '{}',
      max_uses INTEGER DEFAULT 1,
      uses INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS player_redemptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      code TEXT NOT NULL,
      redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(player_id, code),
      FOREIGN KEY (player_id) REFERENCES players(id)
    );

    CREATE TABLE IF NOT EXISTS player_expeditions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      pet_id INTEGER NOT NULL,
      planet_id INTEGER NOT NULL,
      duration INTEGER NOT NULL, -- duration in seconds
      start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed INTEGER DEFAULT 0,
      reward_claimed INTEGER DEFAULT 0,
      rewards TEXT DEFAULT '{}',
      FOREIGN KEY (player_id) REFERENCES players(id),
      FOREIGN KEY (pet_id) REFERENCES player_pets(id)
    );

    CREATE TABLE IF NOT EXISTS guilds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      creator_id INTEGER NOT NULL,
      level INTEGER DEFAULT 1,
      exp INTEGER DEFAULT 0,
      notice TEXT DEFAULT '欢迎来到本战队！',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS guild_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id INTEGER NOT NULL,
      user_id INTEGER UNIQUE NOT NULL,
      role TEXT DEFAULT 'member', -- 'leader', 'vice_leader', 'member'
      contribution INTEGER DEFAULT 0,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (guild_id) REFERENCES guilds(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS player_base_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      item_id TEXT NOT NULL,
      x INTEGER DEFAULT 0,
      y INTEGER DEFAULT 0,
      rotation INTEGER DEFAULT 0,
      placed INTEGER DEFAULT 0,
      FOREIGN KEY (player_id) REFERENCES players(id)
    );
  `);

  // Insert some default test codes if not exist
  try {
    db.exec(`
      INSERT OR IGNORE INTO redemption_codes (code, reward_money, reward_items, max_uses) VALUES 
      ('SAIERHAO2026', 10000, '{"capsule_legend":1, "candy_xl":5}', 99999),
      ('VIP666', 5000, '{"capsule_master":3}', 99999),
      ('VIP888', 8888, '{"hatch_speed":5}', 99999)
    `);
  } catch(e) {}

  // Add columns if they don't exist (safe migration)
  try { db.exec('ALTER TABLE players ADD COLUMN pve_wins INTEGER DEFAULT 0'); } catch(e) {}
  try { db.exec('ALTER TABLE players ADD COLUMN pvp_wins INTEGER DEFAULT 0'); } catch(e) {}
  try { db.exec('ALTER TABLE players ADD COLUMN pvp_losses INTEGER DEFAULT 0'); } catch(e) {}
  try { db.exec('ALTER TABLE players ADD COLUMN total_captures INTEGER DEFAULT 0'); } catch(e) {}
  try { db.exec('ALTER TABLE players ADD COLUMN total_battles INTEGER DEFAULT 0'); } catch(e) {}
  try { db.exec('ALTER TABLE players ADD COLUMN total_shop_buys INTEGER DEFAULT 0'); } catch(e) {}
  try { db.exec('ALTER TABLE players ADD COLUMN gacha_pity INTEGER DEFAULT 0'); } catch(e) {}
  try { db.exec('ALTER TABLE players ADD COLUMN elo_rating INTEGER DEFAULT 1000'); } catch(e) {}
  try { db.exec('ALTER TABLE players ADD COLUMN ranked_wins INTEGER DEFAULT 0'); } catch(e) {}

  try { db.exec('ALTER TABLE player_pets ADD COLUMN ivs TEXT DEFAULT "{}"'); } catch(e) {}
  try { db.exec('ALTER TABLE player_pets ADD COLUMN evs TEXT DEFAULT "{}"'); } catch(e) {}
  try { db.exec('ALTER TABLE player_pets ADD COLUMN in_base INTEGER DEFAULT 0'); } catch(e) {}

  return db;
}

module.exports = { initDB, DB_PATH };
