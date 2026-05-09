const petsData = require('../data/pets.json');
const skillsData = require('../data/skills.json');

const typeChart = petsData.typeChart;

/**
 * Calculate type effectiveness multiplier
 */
function getTypeMultiplier(attackType, defenseType) {
  if (attackType === 'normal') return 1.0;
  const chart = typeChart[attackType];
  if (!chart) return 1.0;
  if (chart.strong.includes(defenseType)) return 1.5;
  if (chart.weak && chart.weak.includes(defenseType)) return 0.67;
  return 1.0;
}

/**
 * Calculate damage for an attack
 */
function calculateDamage(attacker, defender, skill) {
  if (skill.category === 'status') return 0;

  const isPhysical = skill.category === 'physical';
  const atkStat = isPhysical ? attacker.attack : attacker.sp_attack;
  const defStat = isPhysical ? defender.defense : defender.sp_defense;

  // Base damage formula (similar to Pokemon)
  const levelFactor = (2 * attacker.level / 5 + 2);
  let damage = Math.floor((levelFactor * skill.power * atkStat / defStat) / 50 + 2);

  // STAB (Same Type Attack Bonus)
  const attackerDef = petsData.pets.find(p => p.id === attacker.pet_id);
  if (attackerDef && attackerDef.type === skill.type) {
    damage = Math.floor(damage * 1.5);
  }

  // Type effectiveness
  const defenderDef = petsData.pets.find(p => p.id === defender.pet_id);
  const typeMultiplier = defenderDef ? getTypeMultiplier(skill.type, defenderDef.type) : 1.0;
  damage = Math.floor(damage * typeMultiplier);

  // Random variance (85-100%)
  const randomFactor = (85 + Math.floor(Math.random() * 16)) / 100;
  damage = Math.floor(damage * randomFactor);

  // Critical hit (6.25% chance, 1.5x)
  let critical = false;
  if (Math.random() < 0.0625) {
    damage = Math.floor(damage * 1.5);
    critical = true;
  }

  return { damage: Math.max(1, damage), critical, typeMultiplier };
}

/**
 * Execute a PVE battle turn
 */
function executePveTurn(playerPet, enemyPet, playerSkillId) {
  const skill = skillsData.skills.find(s => s.id === playerSkillId);
  if (!skill) return { error: '技能不存在' };

  const results = [];

  // Determine turn order
  const playerFirst = playerPet.speed >= enemyPet.speed;

  const attacker1 = playerFirst ? playerPet : enemyPet;
  const defender1 = playerFirst ? enemyPet : playerPet;
  const skill1 = playerFirst ? skill : chooseEnemySkill(enemyPet);
  const isPlayer1 = playerFirst;

  // First attack
  const result1 = executeAttack(attacker1, defender1, skill1, isPlayer1);
  results.push(result1);

  // Check if defender fainted
  if (defender1.current_hp <= 0) {
    return { results, playerPet, enemyPet, battleEnd: true, playerWin: isPlayer1 };
  }

  // Second attack
  const attacker2 = playerFirst ? enemyPet : playerPet;
  const defender2 = playerFirst ? playerPet : enemyPet;
  const skill2 = playerFirst ? chooseEnemySkill(enemyPet) : skill;
  const isPlayer2 = !playerFirst;

  const result2 = executeAttack(attacker2, defender2, skill2, isPlayer2);
  results.push(result2);

  const battleEnd = playerPet.current_hp <= 0 || enemyPet.current_hp <= 0;
  const playerWin = battleEnd ? enemyPet.current_hp <= 0 : null;

  return { results, playerPet, enemyPet, battleEnd, playerWin };
}

/**
 * Execute a single attack
 */
function executeAttack(attacker, defender, skill, isPlayerAttacking) {
  // Accuracy check
  if (Math.random() * 100 > skill.accuracy) {
    return {
      isPlayerAttacking,
      skillName: skill.name,
      missed: true,
      message: `${isPlayerAttacking ? '我方' : '对方'}的${attacker.nickname}使用了${skill.name}，但是没有命中！`
    };
  }

  // Status skills (heal, buff)
  if (skill.category === 'status') {
    if (skill.heal) {
      const healAmount = Math.floor(attacker.max_hp * skill.heal);
      attacker.current_hp = Math.min(attacker.max_hp, attacker.current_hp + healAmount);
      return {
        isPlayerAttacking,
        skillName: skill.name,
        heal: healAmount,
        message: `${isPlayerAttacking ? '我方' : '对方'}的${attacker.nickname}使用了${skill.name}，恢复了${healAmount}点HP！`
      };
    }
    if (skill.buff) {
      for (const [stat, multiplier] of Object.entries(skill.buff)) {
        attacker[stat] = Math.floor(attacker[stat] * multiplier);
      }
      return {
        isPlayerAttacking,
        skillName: skill.name,
        buff: true,
        message: `${isPlayerAttacking ? '我方' : '对方'}的${attacker.nickname}使用了${skill.name}，能力提升了！`
      };
    }
  }

  // Damage attack
  const { damage, critical, typeMultiplier } = calculateDamage(attacker, defender, skill);
  defender.current_hp = Math.max(0, defender.current_hp - damage);

  let message = `${isPlayerAttacking ? '我方' : '对方'}的${attacker.nickname}使用了${skill.name}，造成${damage}点伤害！`;
  if (critical) message += ' 暴击！';
  if (typeMultiplier > 1) message += ' 效果拔群！';
  if (typeMultiplier < 1) message += ' 效果不佳...';
  if (defender.current_hp <= 0) message += ` ${!isPlayerAttacking ? '我方' : '对方'}的${defender.nickname}倒下了！`;

  return {
    isPlayerAttacking,
    skillName: skill.name,
    damage,
    critical,
    typeMultiplier,
    message
  };
}

/**
 * AI: Choose a skill for the enemy
 */
function chooseEnemySkill(enemyPet) {
  const petSkills = JSON.parse(typeof enemyPet.skills === 'string' ? enemyPet.skills : JSON.stringify(enemyPet.skills));
  const available = petSkills.map(id => skillsData.skills.find(s => s.id === id)).filter(Boolean);
  if (available.length === 0) {
    return skillsData.skills.find(s => s.id === 7); // Default: tackle
  }
  // Simple AI: choose randomly, but prefer super-effective moves
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Create a wild pet encounter
 */
function createWildPet(petId, level) {
  const petDef = petsData.pets.find(p => p.id === petId);
  if (!petDef) return null;

  const { calculateStats, getSkillsAtLevel } = require('./pet-manager');
  const stats = calculateStats(petId, level);
  const skills = getSkillsAtLevel(petId, level);

  return {
    pet_id: petId,
    nickname: petDef.name,
    level,
    current_hp: stats.hp,
    max_hp: stats.hp,
    attack: stats.attack,
    defense: stats.defense,
    speed: stats.speed,
    sp_attack: stats.spAttack,
    sp_defense: stats.spDefense,
    skills: JSON.stringify(skills)
  };
}

module.exports = {
  getTypeMultiplier,
  calculateDamage,
  executePveTurn,
  createWildPet,
  chooseEnemySkill,
  executeAttack
};
