const petsData = require('../data/pets.json');
const skillsData = require('../data/skills.json');

const typeChart = petsData.typeChart;

function getTypeMultiplier(attackType, defenseType) {
  if (attackType === 'normal') return 1.0;
  const chart = typeChart[attackType];
  if (!chart) return 1.0;
  if (chart.strong.includes(defenseType)) return 1.5;
  if (chart.weak && chart.weak.includes(defenseType)) return 0.67;
  return 1.0;
}

function calculateDamage(attacker, defender, skill) {
  if (skill.category === 'status') return 0;

  const isPhysical = skill.category === 'physical';
  const atkStat = isPhysical ? (attacker.attack || 0) : (attacker.sp_attack || 0);
  const defStat = isPhysical ? (defender.defense || 0) : (defender.sp_defense || 0);

  const levelFactor = (2 * attacker.level / 5 + 2);
  let damage = Math.floor((levelFactor * skill.power * atkStat / Math.max(1, defStat)) / 50 + 2);

  const attackerDef = petsData.pets.find(p => p.id === attacker.pet_id);
  if (attackerDef && attackerDef.type === skill.type) {
    damage = Math.floor(damage * 1.5);
  }

  const defenderDef = petsData.pets.find(p => p.id === defender.pet_id);
  const typeMultiplier = defenderDef ? getTypeMultiplier(skill.type, defenderDef.type) : 1.0;
  damage = Math.floor(damage * typeMultiplier);

  // Execute: bonus damage when defender HP is below threshold
  if (skill.execute && defender.current_hp / defender.max_hp < skill.execute.hpThreshold) {
    damage = Math.floor(damage * skill.execute.damageMult);
  }

  const randomFactor = (85 + Math.floor(Math.random() * 16)) / 100;
  damage = Math.floor(damage * randomFactor);

  // Critical hit (base 6.25%, modified by critUp)
  let critRate = 0.0625;
  if (attacker._critRateMult) critRate *= attacker._critRateMult;
  let critical = false;
  if (Math.random() < critRate) {
    damage = Math.floor(damage * 1.5);
    critical = true;
  }

  return { damage: Math.max(1, damage), critical, typeMultiplier };
}

// Process status effects at turn start (burn, poison damage, drain)
function processTurnStartStatus(pet, otherPet = null) {
  const messages = [];
  if (!pet.statusEffects) return messages;

  for (const effect of pet.statusEffects) {
    if (effect.type === 'burn') {
      const dmg = effect.damage || 10;
      pet.current_hp = Math.max(0, pet.current_hp - dmg);
      messages.push(`${pet.nickname}被灼烧了，受到${dmg}点伤害！`);
    }
    if (effect.type === 'poison') {
      const dmg = Math.floor(pet.max_hp * (effect.hpPercent || 0.08));
      pet.current_hp = Math.max(0, pet.current_hp - dmg);
      messages.push(`${pet.nickname}中毒了，受到${dmg}点伤害！`);
    }
    if (effect.type === 'drain') {
      const dmg = Math.floor(pet.max_hp * (effect.hpPercent || 0.125));
      pet.current_hp = Math.max(0, pet.current_hp - dmg);
      messages.push(`${pet.nickname}被寄生了，流失了${dmg}点HP！`);
      if (otherPet && otherPet.current_hp > 0) {
        otherPet.current_hp = Math.min(otherPet.max_hp, otherPet.current_hp + dmg);
        messages.push(`${otherPet.nickname}吸取了${dmg}点HP！`);
      }
    }
  }
  return messages;
}

// Check if pet can act this turn (freeze/stun)
function canAct(pet) {
  if (!pet.statusEffects) return { canAct: true };

  for (const effect of pet.statusEffects) {
    if (effect.type === 'stun') {
      return { canAct: false, reason: `${pet.nickname}被眩晕了，无法行动！` };
    }
    if (effect.type === 'freeze') {
      if (Math.random() < (effect.chance ?? 0.5)) {
        return { canAct: false, reason: `${pet.nickname}被冰冻了，无法行动！` };
      }
    }
  }
  return { canAct: true };
}

// Decrement status effect turns and remove expired ones
function tickStatusEffects(pet) {
  if (!pet.statusEffects) return [];
  const messages = [];
  const toRemove = [];

  pet.statusEffects.forEach((effect, i) => {
    effect.turns--;
    if (effect.turns <= 0) {
      toRemove.push(i);
      // Restore stats for expired debuffs
      if (effect.type === 'debuff' && pet._origStats) {
        pet[effect.stat] = getOriginalStat(pet, effect.stat);
        messages.push(`${pet.nickname}的${statLabel(effect.stat)}恢复了！`);
      }
      if (effect.type === 'paralyze' && pet._origStats) {
        pet.speed = getOriginalStat(pet, 'speed');
        messages.push(`${pet.nickname}的麻痹效果解除了！`);
      }
      messages.push(`${pet.nickname}的${statusLabel(effect.type)}效果消失了。`);
    }
  });

  pet.statusEffects = pet.statusEffects.filter((_, i) => !toRemove.includes(i));

  // Tick critUp separately
  if (pet._critUpTurns > 0) {
    pet._critUpTurns--;
    if (pet._critUpTurns <= 0) {
      pet._critRateMult = 1.0;
      messages.push(`${pet.nickname}的会心效果消失了。`);
    }
  }

  return messages;
}

function statLabel(stat) {
  const map = { attack: '物攻', defense: '物防', sp_attack: '法攻', sp_defense: '法防', spAttack: '法攻', spDefense: '法防', speed: '速度' };
  return map[stat] || stat;
}

function statusLabel(type) {
  const map = { burn: '灼烧', poison: '中毒', freeze: '冰冻', paralyze: '麻痹', stun: '眩晕', debuff: '减益' };
  return map[type] || type;
}

// Save original stats for debuff/paralyze restoration
function ensureOrigStats(pet) {
  if (!pet._origStats) {
    pet._origStats = {
      attack: pet.attack,
      defense: pet.defense,
      sp_attack: pet.sp_attack,
      sp_defense: pet.sp_defense,
      speed: pet.speed
    };
  }
}

function getOriginalStat(pet, stat) {
  const legacyKey = stat === 'sp_attack' ? 'spAttack' : stat === 'sp_defense' ? 'spDefense' : stat;
  return pet._origStats[stat] !== undefined ? pet._origStats[stat] : pet._origStats[legacyKey];
}

function executePveTurn(playerPet, enemyPet, playerSkillId) {
  // Validate that pet knows the skill
  const knownSkills = Array.isArray(playerPet.skills) ? playerPet.skills : JSON.parse(playerPet.skills || '[]');
  if (!knownSkills.includes(playerSkillId)) {
    return { battleEnd: false, error: '非法操作：精灵未学会该技能！' };
  }

  const skill = skillsData.skills.find(s => s.id === playerSkillId);
  if (!skill) return { battleEnd: false, error: '技能不存在' };

  const results = [];

  // Initialize status tracking
  if (!playerPet.statusEffects) playerPet.statusEffects = [];
  if (!enemyPet.statusEffects) enemyPet.statusEffects = [];
  if (!playerPet._critRateMult) playerPet._critRateMult = 1.0;
  if (!enemyPet._critRateMult) enemyPet._critRateMult = 1.0;
  if (!playerPet._critUpTurns) playerPet._critUpTurns = 0;
  if (!enemyPet._critUpTurns) enemyPet._critUpTurns = 0;
  ensureOrigStats(playerPet);
  ensureOrigStats(enemyPet);

  // ---- TURN START: Process status effects ----
  const playerStartMsgs = processTurnStartStatus(playerPet, enemyPet);
  const enemyStartMsgs = processTurnStartStatus(enemyPet, playerPet);
  [...playerStartMsgs, ...enemyStartMsgs].forEach(msg => {
    results.push({ isPlayerAttacking: null, skillName: null, message: msg, statusEffect: true });
  });

  // Check if anyone fainted from status
  if (playerPet.current_hp <= 0) {
    return { results, playerPet, enemyPet, battleEnd: true, playerWin: false };
  }
  if (enemyPet.current_hp <= 0) {
    return { results, playerPet, enemyPet, battleEnd: true, playerWin: true };
  }

  // Determine turn order (respect priority flag)
  let playerFirst;
  const playerSkill = skill;
  const enemySkill = chooseEnemySkill(enemyPet);

  if (playerSkill.priority && !enemySkill.priority) {
    playerFirst = true;
  } else if (enemySkill.priority && !playerSkill.priority) {
    playerFirst = false;
  } else {
    playerFirst = playerPet.speed >= enemyPet.speed;
  }

  const attacker1 = playerFirst ? playerPet : enemyPet;
  const defender1 = playerFirst ? enemyPet : playerPet;
  const skill1 = playerFirst ? playerSkill : enemySkill;
  const isPlayer1 = playerFirst;

  // Check if attacker1 can act
  const act1 = canAct(attacker1);
  if (!act1.canAct) {
    results.push({ isPlayerAttacking: isPlayer1, skillName: null, message: act1.reason, skipped: true });
  } else {
    const result1 = executeAttack(attacker1, defender1, skill1, isPlayer1);
    results.push(result1);
  }

  let battleEndEarly = playerPet.current_hp <= 0 || enemyPet.current_hp <= 0;
  if (battleEndEarly) {
    return { results, playerPet, enemyPet, battleEnd: true, playerWin: enemyPet.current_hp <= 0 };
  }

  // Second attack
  const attacker2 = playerFirst ? enemyPet : playerPet;
  const defender2 = playerFirst ? playerPet : enemyPet;
  const skill2 = playerFirst ? enemySkill : playerSkill;
  const isPlayer2 = !playerFirst;

  const act2 = canAct(attacker2);
  if (!act2.canAct) {
    results.push({ isPlayerAttacking: isPlayer2, skillName: null, message: act2.reason, skipped: true });
  } else {
    const result2 = executeAttack(attacker2, defender2, skill2, isPlayer2);
    results.push(result2);
  }

  // ---- TURN END: Tick status effects ----
  const playerEndMsgs = tickStatusEffects(playerPet);
  const enemyEndMsgs = tickStatusEffects(enemyPet);
  [...playerEndMsgs, ...enemyEndMsgs].forEach(msg => {
    if (msg) results.push({ isPlayerAttacking: null, skillName: null, message: msg, statusEffect: true });
  });

  const battleEnd = playerPet.current_hp <= 0 || enemyPet.current_hp <= 0;
  const playerWin = battleEnd ? enemyPet.current_hp <= 0 : null;

  return { results, playerPet, enemyPet, battleEnd, playerWin };
}

function executeAttack(attacker, defender, skill, isPlayerAttacking) {
  // Accuracy check
  if (Math.random() * 100 > (skill.accuracy ?? 100)) {
    return {
      isPlayerAttacking,
      skillName: skill.name,
      missed: true,
      message: `${isPlayerAttacking ? '我方' : '对方'}的${attacker.nickname}使用了${skill.name}，但是没有命中！`
    };
  }

  // Apply buff to self (status skills)
  if (skill.buff) {
    ensureOrigStats(attacker);
    for (const [stat, multiplier] of Object.entries(skill.buff)) {
      const dbStat = stat === 'spAttack' ? 'sp_attack' : stat === 'spDefense' ? 'sp_defense' : stat;
      const baseStat = getOriginalStat(attacker, dbStat);
      if (attacker[dbStat] < baseStat * 4) {
        attacker[dbStat] = Math.floor(attacker[dbStat] * multiplier);
        if (attacker[dbStat] > baseStat * 4) attacker[dbStat] = Math.floor(baseStat * 4);
      }
    }
  }

  // Apply shield to self (status skills)
  let shieldMsg = '';
  if (skill.shield) {
    const shieldHp = Math.floor(attacker.max_hp * skill.shield.hpPercent);
    attacker._shieldHp = Math.min(attacker.max_hp, (attacker._shieldHp || 0) + shieldHp);
    shieldMsg = ` 获得了护盾！`;
  }

  // Apply critUp to self
  if (skill.critUp) {
    attacker._critRateMult = skill.critUp.multiplier || 2.0;
    attacker._critUpTurns = skill.critUp.turns || 3;
  }

  // Heal
  let healMsg = '';
  if (skill.heal) {
    const healAmount = Math.floor(attacker.max_hp * skill.heal);
    attacker.current_hp = Math.min(attacker.max_hp, attacker.current_hp + healAmount);
    healMsg = ` 恢复了${healAmount}点HP！`;
  }

  // Clear debuffs
  let clearMsg = '';
  if (skill.clearDebuff && attacker.statusEffects) {
    attacker.statusEffects = attacker.statusEffects.filter(e => e.type !== 'debuff' && e.type !== 'paralyze');
    if (attacker._origStats) {
      attacker.attack = getOriginalStat(attacker, 'attack');
      attacker.defense = getOriginalStat(attacker, 'defense');
      attacker.sp_attack = getOriginalStat(attacker, 'sp_attack');
      attacker.sp_defense = getOriginalStat(attacker, 'sp_defense');
      attacker.speed = getOriginalStat(attacker, 'speed');
    }
    clearMsg = ' 负面状态被清除了！';
  }

  // Status-only skill
  if (skill.category === 'status') {
    let msg = `${isPlayerAttacking ? '我方' : '对方'}的${attacker.nickname}使用了${skill.name}！`;
    if (shieldMsg) msg += shieldMsg;
    if (healMsg) msg += healMsg;
    if (clearMsg) msg += clearMsg;

    // Apply debuff to defender from status skill (e.g., 嚎叫)
    applyDebuff(defender, skill);
    applyStatusEffect(defender, skill);

    return { isPlayerAttacking, skillName: skill.name, message: msg };
  }

  // === DAMAGE ATTACK ===
  const { damage, critical, typeMultiplier } = calculateDamage(attacker, defender, skill);

  // Apply shield absorption
  let actualDamage = damage;
  let shieldAbsorbed = 0;
  if (defender._shieldHp && defender._shieldHp > 0) {
    if (defender._shieldHp >= actualDamage) {
      shieldAbsorbed = actualDamage;
      defender._shieldHp -= actualDamage;
      actualDamage = 0;
    } else {
      shieldAbsorbed = defender._shieldHp;
      actualDamage -= defender._shieldHp;
      defender._shieldHp = 0;
    }
  }

  // Apply damage to defender
  defender.current_hp = Math.max(0, defender.current_hp - actualDamage);

  let message;
  if (actualDamage > 0) {
    message = `${isPlayerAttacking ? '我方' : '对方'}的${attacker.nickname}使用了${skill.name}，造成${actualDamage}点伤害！`;
  } else if (shieldAbsorbed > 0) {
    message = `${isPlayerAttacking ? '我方' : '对方'}的${attacker.nickname}使用了${skill.name}，但被护盾吸收了${shieldAbsorbed}点伤害！`;
  } else {
    message = `${isPlayerAttacking ? '我方' : '对方'}的${attacker.nickname}使用了${skill.name}！`;
  }

  if (critical) message += ' 暴击！';
  if (typeMultiplier > 1) message += ' 效果拔群！';
  if (typeMultiplier < 1) message += ' 效果不佳...';
  if (skill.execute && defender.current_hp / defender.max_hp < skill.execute.hpThreshold) message += ' 致命一击！';

  // Recoil damage to self
  let recoilDmg = 0;
  if (skill.recoil && actualDamage > 0) {
    recoilDmg = Math.floor(actualDamage * skill.recoil);
    attacker.current_hp = Math.max(0, attacker.current_hp - recoilDmg);
    message += ` ${attacker.nickname}受到了${recoilDmg}点反伤！`;
  }

  // Counter damage reflection
  let counterDmg = 0;
  if (skill.counter && actualDamage > 0) {
    counterDmg = Math.floor(actualDamage * skill.counter);
    defender.current_hp = Math.max(0, defender.current_hp - counterDmg);
  }

  // Drain (lifesteal)
  let drainHeal = 0;
  if (skill.drain && actualDamage > 0) {
    drainHeal = Math.floor(actualDamage * skill.drain);
    attacker.current_hp = Math.min(attacker.max_hp, attacker.current_hp + drainHeal);
    message += ` 吸取了${drainHeal}点HP！`;
  }

  // Heal on attack
  if (skill.heal && actualDamage > 0) {
    const healAmt = Math.floor(attacker.max_hp * skill.heal);
    attacker.current_hp = Math.min(attacker.max_hp, attacker.current_hp + healAmt);
    message += ` 恢复了${healAmt}点HP！`;
  }

  if (defender.current_hp <= 0) {
    message += ` ${!isPlayerAttacking ? '我方' : '对方'}的${defender.nickname}倒下了！`;
  }

  // Apply debuff from attack skill
  applyDebuff(defender, skill);

  // Apply status effects from attack skill to defender
  applyStatusEffect(defender, skill);

  return {
    isPlayerAttacking,
    skillName: skill.name,
    damage: actualDamage,
    shieldAbsorbed,
    critical,
    typeMultiplier,
    drainHeal,
    recoilDmg,
    counterDmg,
    message
  };
}

function applyDebuff(defender, skill) {
  if (!skill.debuff) return;
  if (skill.debuff.chance !== undefined && Math.random() >= skill.debuff.chance) return;
  
  ensureOrigStats(defender);
  const { stat, statMult, turns } = skill.debuff;
  const dbStat = stat === 'spAttack' ? 'sp_attack' : stat === 'spDefense' ? 'sp_defense' : stat;
  
  if (!defender.statusEffects) defender.statusEffects = [];
  const existing = defender.statusEffects.find(e => e.type === 'debuff' && e.stat === dbStat);
  if (existing) {
    existing.turns = Math.max(existing.turns, turns || 3);
    return;
  }
  
  defender[dbStat] = Math.floor(defender[dbStat] * statMult);
  defender.statusEffects.push({ type: 'debuff', stat: dbStat, turns: turns || 3 });
}

function applyStatusEffect(defender, skill) {
  if (!defender.statusEffects) defender.statusEffects = [];
  ensureOrigStats(defender);

  if (skill.burn && shouldApplyEffect(skill.burn)) {
    const existing = defender.statusEffects.find(e => e.type === 'burn');
    if (existing) existing.turns = Math.max(existing.turns, skill.burn.turns);
    else defender.statusEffects.push({ type: 'burn', turns: skill.burn.turns, damage: skill.burn.damage });
  }
  if (skill.freeze && shouldApplyEffect(skill.freeze)) {
    const existing = defender.statusEffects.find(e => e.type === 'freeze');
    if (existing) existing.turns = Math.max(existing.turns, skill.freeze.turns);
    else defender.statusEffects.push({ type: 'freeze', turns: skill.freeze.turns, chance: skill.freeze.skipChance ?? 0.5 });
  }
  if (skill.poison && shouldApplyEffect(skill.poison)) {
    const existing = defender.statusEffects.find(e => e.type === 'poison');
    if (existing) existing.turns = Math.max(existing.turns, skill.poison.turns);
    else defender.statusEffects.push({ type: 'poison', turns: skill.poison.turns, hpPercent: skill.poison.hpPercent });
  }
  if (skill.paralyze && shouldApplyEffect(skill.paralyze)) {
    const existing = defender.statusEffects.find(e => e.type === 'paralyze');
    if (existing) {
      existing.turns = Math.max(existing.turns, skill.paralyze.turns);
    } else {
      defender.speed = Math.floor(defender.speed * skill.paralyze.speedMult);
      defender.statusEffects.push({ type: 'paralyze', turns: skill.paralyze.turns, speedMult: skill.paralyze.speedMult });
    }
  }
  if (skill.stun && shouldApplyEffect(skill.stun)) {
    const existing = defender.statusEffects.find(e => e.type === 'stun');
    if (existing) existing.turns = Math.max(existing.turns, skill.stun.turns);
    else defender.statusEffects.push({ type: 'stun', turns: skill.stun.turns });
  }
}

function shouldApplyEffect(effect) {
  return Math.random() < (effect.chance ?? 1);
}

function chooseEnemySkill(enemyPet) {
  const petSkills = typeof enemyPet.skills === 'string' ? JSON.parse(enemyPet.skills) : enemyPet.skills;
  const available = petSkills.map(id => skillsData.skills.find(s => s.id === id)).filter(Boolean);
  if (available.length === 0) {
    return skillsData.skills.find(s => s.id === 61);
  }
  return available[Math.floor(Math.random() * available.length)];
}

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
    skills: JSON.stringify(skills),
    statusEffects: [],
    _critRateMult: 1.0,
    _critUpTurns: 0,
    _shieldHp: 0,
    _origStats: null
  };
}

module.exports = {
  getTypeMultiplier,
  calculateDamage,
  executePveTurn,
  createWildPet,
  chooseEnemySkill,
  executeAttack,
  processTurnStartStatus,
  canAct,
  tickStatusEffects
};
