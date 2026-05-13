const fs = require('fs');
const path = require('path');

const petsFile = path.join(__dirname, '../data/pets.json');
const skillsFile = path.join(__dirname, '../data/skills.json');

let petsData = JSON.parse(fs.readFileSync(petsFile, 'utf8'));
let skillsData = JSON.parse(fs.readFileSync(skillsFile, 'utf8'));

let maxSkillId = Math.max(...skillsData.skills.map(s => s.id));

const effectTypes = ['burn', 'freeze', 'poison', 'paralyze', 'stun', 'debuff', 'drain', 'recoil', 'heal', 'priority'];

petsData.pets.forEach(pet => {
  // Check if pet already has a signature skill
  const hasSignature = pet.learnset.some(ls => {
    const skill = skillsData.skills.find(s => s.id === ls.skillId);
    return skill && skill.description && (skill.description.includes('专属') || skill.name.includes(pet.name));
  });

  if (!hasSignature) {
    maxSkillId++;
    const newSkillId = maxSkillId;
    
    // Generate cool name
    const suffix = ['爆裂', '惩戒', '守护', '风暴', '绝息', '真诀', '奥义', '之魂', '怒吼', '审判'][Math.floor(Math.random() * 10)];
    const skillName = `${pet.name}${suffix}`;
    
    const power = 90 + Math.floor(Math.random() * 40); // 90-120
    const effectType = effectTypes[Math.floor(Math.random() * effectTypes.length)];
    
    const skill = {
      id: newSkillId,
      name: skillName,
      type: pet.type,
      category: Math.random() > 0.5 ? 'physical' : 'special',
      power: power,
      accuracy: 95,
      pp: 5,
      description: `${pet.name}专属·引动天地之力的独门绝技`
    };
    
    // Add effect
    let effectDesc = '';
    const chance = 0.3; // 30% for status
    switch (effectType) {
      case 'burn':
        skill.burn = { turns: 3, damage: 20, chance: 0.5 };
        effectDesc = '50%几率使对手严重灼伤';
        break;
      case 'freeze':
        skill.freeze = { turns: 1, chance: 0.3 };
        effectDesc = '30%几率使对手绝对冰冻';
        break;
      case 'poison':
        skill.poison = { turns: 3, hpPercent: 0.1, chance: 0.5 };
        effectDesc = '50%几率使对手深度中毒';
        break;
      case 'paralyze':
        skill.paralyze = { turns: 2, speedMult: 0.3, chance: 0.5 };
        effectDesc = '50%几率使对手深度麻痹';
        break;
      case 'stun':
        skill.stun = { turns: 1, chance: 0.25 };
        effectDesc = '25%几率使对手眩晕一回合';
        break;
      case 'debuff':
        skill.debuff = { stat: 'defense', statMult: 0.5, turns: 2, chance: 0.4 };
        effectDesc = '40%几率大幅降低对手防御';
        break;
      case 'drain':
        skill.drain = 0.3;
        effectDesc = '将造成伤害的30%转化为自身生命值';
        break;
      case 'recoil':
        skill.power += 30; // Stronger!
        skill.recoil = 0.2;
        effectDesc = '自身承受20%反弹伤害';
        break;
      case 'heal':
        skill.heal = 0.2;
        effectDesc = '恢复自身20%最大生命值';
        break;
      case 'priority':
        skill.power = 80; // slightly weaker
        skill.priority = true;
        effectDesc = '必定先制攻击';
        break;
    }
    
    skill.description += ` [特效: ${effectDesc}]`;
    
    skillsData.skills.push(skill);
    
    // Add to pet's learnset at their highest level + 5, or max 60
    let highestLevel = Math.max(...pet.learnset.map(l => l.level), 1);
    let learnLevel = Math.min(highestLevel + 5, 80);
    
    pet.learnset.push({
      level: learnLevel,
      skillId: newSkillId
    });
    
    pet.learnset.sort((a, b) => a.level - b.level);
  }
});

fs.writeFileSync(petsFile, JSON.stringify(petsData, null, 2));
fs.writeFileSync(skillsFile, JSON.stringify(skillsData, null, 2));
console.log('Unique signature skills generated and assigned!');
