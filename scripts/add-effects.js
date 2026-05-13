const fs = require('fs');
const path = require('path');

const skillsFile = path.join(__dirname, '../data/skills.json');
let skillsData = JSON.parse(fs.readFileSync(skillsFile, 'utf8'));

const hasEffect = s => s.burn || s.freeze || s.poison || s.paralyze || s.stun || s.debuff || s.buff || s.heal || s.drain || s.recoil || s.clearDebuff || s.priority || s.critUp || s.counter;

// Only apply to damaging skills without effects
skillsData.skills.forEach(skill => {
  if (skill.category !== 'status' && !hasEffect(skill)) {
    const power = skill.power || 40;
    
    // Low power skills get higher chance, high power get lower chance or recoil
    if (power >= 120 && Math.random() < 0.5) {
      skill.recoil = 0.15;
    } else {
      let chance = power <= 60 ? 0.2 : (power <= 90 ? 0.15 : 0.1);
      
      switch (skill.type) {
        case 'fire':
          skill.burn = { turns: 2, damage: Math.floor(power / 5) || 10, chance };
          break;
        case 'water':
          if (Math.random() < 0.5) {
            skill.debuff = { stat: 'speed', statMult: 0.8, turns: 2, chance };
          } else {
            skill.freeze = { turns: 1, chance: chance * 0.8 }; // freeze is stronger, so lower chance
          }
          break;
        case 'grass':
          if (Math.random() < 0.5) {
            skill.poison = { turns: 3, hpPercent: 0.05, chance };
          } else {
            skill.drain = 0.15;
          }
          break;
        case 'electric':
          skill.paralyze = { turns: 2, speedMult: 0.5, chance };
          break;
        case 'light':
          if (Math.random() < 0.5) {
            skill.heal = 0.1;
          } else {
             // Light debuffs accuracy by lowering attack? or buffs self?
             // Since debuff is easier to implement and supported on defender:
             skill.debuff = { stat: 'attack', statMult: 0.8, turns: 2, chance };
          }
          break;
        case 'dark':
          if (Math.random() < 0.5) {
            skill.debuff = { stat: 'defense', statMult: 0.8, turns: 2, chance };
          } else {
            skill.stun = { turns: 1, chance: chance * 0.8 };
          }
          break;
        case 'normal':
          if (Math.random() < 0.5) {
            skill.critUp = { multiplier: 2.0, turns: 1 }; // implicitly 100% chance but applies to self? wait, critUp applies to self.
            // Wait, does battle-engine support `chance` on critUp? No, critUp is not in applyStatusEffect. 
            // So let's just use debuff or stun.
            skill.debuff = { stat: 'defense', statMult: 0.9, turns: 2, chance };
          } else {
            skill.priority = true;
          }
          break;
      }
    }
  }
});

// Update descriptions
const statNames = {
  attack: '物攻',
  defense: '物防',
  spAttack: '法攻',
  spDefense: '法防',
  speed: '速度'
};

skillsData.skills.forEach(skill => {
  // Remove existing effect text if we run this script multiple times
  skill.description = skill.description.replace(/ \[特效:.*\]$/, '');
  
  let effects = [];
  if (skill.burn) effects.push(`${Math.floor((skill.burn.chance||1)*100)}%几率使对手灼伤`);
  if (skill.freeze) effects.push(`${Math.floor((skill.freeze.chance||1)*100)}%几率使对手冰冻`);
  if (skill.poison) effects.push(`${Math.floor((skill.poison.chance||1)*100)}%几率使对手中毒`);
  if (skill.paralyze) effects.push(`${Math.floor((skill.paralyze.chance||1)*100)}%几率使对手麻痹`);
  if (skill.stun) effects.push(`${Math.floor((skill.stun.chance||1)*100)}%几率使对手眩晕`);
  if (skill.debuff) effects.push(`${Math.floor((skill.debuff.chance||1)*100)}%几率降低对手${statNames[skill.debuff.stat] || skill.debuff.stat}`);
  if (skill.buff) {
    const bStats = Object.keys(skill.buff).map(k => statNames[k] || k).join('和');
    effects.push(`提升自身${bStats}`);
  }
  if (skill.heal) effects.push(`恢复${Math.floor(skill.heal*100)}%生命值`);
  if (skill.drain) effects.push(`将造成伤害的${Math.floor(skill.drain*100)}%转化为生命值`);
  if (skill.recoil) effects.push(`自身受到${Math.floor(skill.recoil*100)}%反弹伤害`);
  if (skill.priority) effects.push(`必定先制`);
  if (skill.critUp) effects.push(`容易击中要害`);
  if (skill.clearDebuff) effects.push(`清除自身所有负面状态`);
  if (skill.counter) effects.push(`反弹${Math.floor(skill.counter*100)}%受到的伤害`);
  if (skill.execute) effects.push(`对生命值低于${Math.floor(skill.execute.hpThreshold*100)}%的对手一击必杀`);

  if (effects.length > 0) {
    skill.description += ` [特效: ${effects.join(', ')}]`;
  }
});

fs.writeFileSync(skillsFile, JSON.stringify(skillsData, null, 2));
console.log('Skills enriched with effects and descriptions updated!');
