const petsData = require('../data/pets.json');
const skillsData = require('../data/skills.json');

/**
 * Calculate stats for a pet at a given level
 */
function calculateStats(petId, level) {
  const petDef = petsData.pets.find(p => p.id === petId);
  if (!petDef) return null;

  const stats = {};
  for (const stat of ['hp', 'attack', 'defense', 'speed', 'spAttack', 'spDefense']) {
    stats[stat] = Math.floor(petDef.baseStats[stat] + petDef.growthRate[stat] * level);
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
  const stats = calculateStats(petId, level);
  if (!stats) return null;

  const skills = getSkillsAtLevel(petId, level);
  const petDef = petsData.pets.find(p => p.id === petId);

  const result = db.prepare(`
    INSERT INTO player_pets (player_id, pet_id, nickname, level, exp, current_hp, max_hp,
      attack, defense, speed, sp_attack, sp_defense, skills, in_team, team_order)
    VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    playerId, petId, petDef.name, level, stats.hp, stats.hp,
    stats.attack, stats.defense, stats.speed, stats.spAttack, stats.spDefense,
    JSON.stringify(skills), inTeam ? 1 : 0, teamOrder
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

  const results = { levelUps: [], evolved: false, newPetId: null };

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

  // Recalculate stats
  const newStats = calculateStats(pet_id, level);
  const newSkills = getSkillsAtLevel(pet_id, level);
  const petDef = petsData.pets.find(p => p.id === pet_id);

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
    pet_id, petDef.name, level, exp,
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

module.exports = { calculateStats, getSkillsAtLevel, createPetInstance, addExp, healPet };
