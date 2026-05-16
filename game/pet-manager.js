const petsData = require('../data/pets.json');
const skillsData = require('../data/skills.json');

// ===== NATURE SYSTEM =====
// Each nature boosts one stat by 10% and reduces another by 10%
const NATURES = [
  { name: '勇敢', up: 'attack',    down: 'defense',   desc: '攻击↑ 防御↓' },
  { name: '固执', up: 'defense',   down: 'speed',     desc: '防御↑ 速度↓' },
  { name: '调皮', up: 'speed',     down: 'spAttack',  desc: '速度↑ 特攻↓' },
  { name: '淡定', up: 'spDefense', down: 'attack',    desc: '特防↑ 攻击↓' },
  { name: '孤僻', up: 'spAttack',  down: 'spDefense', desc: '特攻↑ 特防↓' },
  { name: '急躁', up: 'speed',     down: 'defense',   desc: '速度↑ 防御↓' },
  { name: '慰性', up: 'defense',   down: 'spAttack',  desc: '防御↑ 特攻↓' },
  { name: '谨慎', up: 'spDefense', down: 'speed',     desc: '特防↑ 速度↓' },
  { name: '大胆', up: 'attack',    down: 'spDefense', desc: '攻击↑ 特防↓' },
  { name: '冒失', up: 'spAttack',  down: 'defense',   desc: '特攻↑ 防御↓' },
  { name: '怒性', up: 'attack',    down: 'speed',     desc: '攻击↑ 速度↓' },
  { name: '温顺', up: 'spDefense', down: 'spAttack',  desc: '特防↑ 特攻↓' },
  { name: '认真', up: null,        down: null,         desc: '均衡' },
  { name: '天真', up: null,        down: null,         desc: '均衡' },
  { name: '稳重', up: null,        down: null,         desc: '均衡' }
];

function getRandomNature() {
  return NATURES[Math.floor(Math.random() * NATURES.length)].name;
}

function getNatureDef(natureName) {
  return NATURES.find(n => n.name === natureName) || null;
}

/**
 * Calculate stats for a pet at a given level
 */
function calculateStats(petId, level, ivs = {}, evs = {}, natureName = null) {
  const petDef = petsData.pets.find(p => p.id === petId);
  if (!petDef) return null;

  const natureDef = natureName ? getNatureDef(natureName) : null;
  const stats = {};
  for (const stat of ['hp', 'attack', 'defense', 'speed', 'spAttack', 'spDefense']) {
    const baseVal = petDef.baseStats[stat] || 50;
    const growth = petDef.growthRate[stat] || 2;
    const iv = ivs[stat] !== undefined ? ivs[stat] : 15;
    const ev = evs[stat] || 0;
    const ivBonus = Math.floor((iv / 31) * (level / 2));
    const evBonus = Math.floor((ev / 255) * (level / 2));
    let value = Math.floor(baseVal + growth * level) + ivBonus + evBonus;
    // Apply nature modifier (HP is not affected)
    if (stat !== 'hp' && natureDef) {
      if (natureDef.up === stat) value = Math.floor(value * 1.1);
      if (natureDef.down === stat) value = Math.floor(value * 0.9);
    }
    stats[stat] = value;
  }
  return stats;
}

/**
 * Get skills a pet should know at a given level
 */
function getSkillsAtLevel(petId, level) {
  const petDef = petsData.pets.find(p => p.id === petId);
  if (!petDef) return [];

  const learned = petDef.learnset
    .filter(s => s.level <= level)
    .map(s => s.skillId);

  // Keep last 4 skills (most recent)
  return learned.slice(-4);
}

/**
 * Create a new pet instance for a player
 */
function createPetInstance(db, playerId, petId, level = 5, inTeam = false, teamOrder = -1) {
  const ivs = {
    hp: Math.floor(Math.random() * 32),
    attack: Math.floor(Math.random() * 32),
    defense: Math.floor(Math.random() * 32),
    speed: Math.floor(Math.random() * 32),
    spAttack: Math.floor(Math.random() * 32),
    spDefense: Math.floor(Math.random() * 32)
  };
  const evs = { hp: 0, attack: 0, defense: 0, speed: 0, spAttack: 0, spDefense: 0 };
  
  const nature = getRandomNature();
  const stats = calculateStats(petId, level, ivs, evs, nature);
  if (!stats) return null;

  const skills = getSkillsAtLevel(petId, level);
  const petDef = petsData.pets.find(p => p.id === petId);

  const result = db.prepare(`
    INSERT INTO player_pets (player_id, pet_id, nickname, level, exp, current_hp, max_hp,
      attack, defense, speed, sp_attack, sp_defense, skills, in_team, team_order, ivs, evs, nature)
    VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    playerId, petId, petDef.name, level, stats.hp, stats.hp,
    stats.attack, stats.defense, stats.speed, stats.spAttack, stats.spDefense,
    JSON.stringify(skills), inTeam ? 1 : 0, teamOrder, JSON.stringify(ivs), JSON.stringify(evs), nature
  );

  return result.lastInsertRowid;
}

/**
 * Add exp and handle level up + evolution
 */
function addExp(db, playerPetId, expGain) {
  const pet = db.prepare('SELECT * FROM player_pets WHERE id = ?').get(playerPetId);
  if (!pet) return null;

  let { level, exp, pet_id } = pet;
  exp += expGain;

  const results = { levelUps: [], evolved: false, newPetId: null, oldPetId: pet.pet_id };

  // Level up loop
  while (level < 100) {
    const needed = petsData.expTable[level + 1];
    if (needed === undefined || exp < needed) break;
    exp -= needed;
    level++;
    results.levelUps.push(level);

    // Check evolution
    const petDef = petsData.pets.find(p => p.id === pet_id);
    if (petDef && petDef.evolution && level >= petDef.evolution.level) {
      pet_id = petDef.evolution.to;
      results.evolved = true;
      results.newPetId = pet_id;
    }
  }

  if (level >= 100) {
    level = 100;
    exp = 0;
  }

  // Recalculate stats
  const ivs = pet.ivs ? JSON.parse(pet.ivs) : {};
  const evs = pet.evs ? JSON.parse(pet.evs) : {};
  const newStats = calculateStats(pet_id, level, ivs, evs, pet.nature || null);
  
  let newSkills = JSON.parse(pet.skills || '[]');
  if (results.levelUps.length > 0 || results.evolved) {
    const petDefObj = petsData.pets.find(p => p.id === pet_id);
    if (petDefObj && petDefObj.learnset) {
      const allUnlocked = petDefObj.learnset
        .filter(s => s.level <= level)
        .map(s => s.skillId);
        
      for (const skillId of allUnlocked) {
        if (newSkills.length < 4 && !newSkills.includes(skillId)) {
          newSkills.push(skillId);
        }
      }
    }
  }
  const petDef = petsData.pets.find(p => p.id === pet_id);

  // Preserve custom nickname
  const oldPetDef = petsData.pets.find(p => p.id === pet.pet_id);
  const finalNickname = (pet.nickname === oldPetDef.name) ? petDef.name : pet.nickname;

  // Preserve HP ratio
  const hpRatio = pet.current_hp / pet.max_hp;
  const newMaxHp = newStats.hp;
  const newCurrentHp = Math.max(1, Math.floor(newMaxHp * hpRatio));

  db.prepare(`
    UPDATE player_pets SET pet_id = ?, nickname = ?, level = ?, exp = ?,
      current_hp = ?, max_hp = ?, attack = ?, defense = ?, speed = ?,
      sp_attack = ?, sp_defense = ?, skills = ?
    WHERE id = ?
  `).run(
    pet_id, finalNickname, level, exp,
    newCurrentHp, newMaxHp, newStats.attack, newStats.defense, newStats.speed,
    newStats.spAttack, newStats.spDefense, JSON.stringify(newSkills),
    playerPetId
  );

  results.pet = db.prepare('SELECT * FROM player_pets WHERE id = ?').get(playerPetId);
  return results;
}

/**
 * Heal a pet to full HP and restore skill PP
 */
function healPet(db, playerPetId) {
  db.prepare('UPDATE player_pets SET current_hp = max_hp WHERE id = ?').run(playerPetId);
}

module.exports = { calculateStats, getSkillsAtLevel, createPetInstance, addExp, healPet, NATURES, getNatureDef, getRandomNature };
