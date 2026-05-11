const fs = require('fs');
const path = require('path');
const petsDataFile = path.join(__dirname, '../data/pets.json');
const data = JSON.parse(fs.readFileSync(petsDataFile, 'utf8'));

let maxId = Math.max(...data.pets.map(p => p.id));

const newPets = [
  // FIRE
  { name: '赤狐', type: 'fire', form: '幼体', desc: '红色的狐狸幼崽，尾巴总是温暖的。', icon: '🦊', evolvesAt: 18, evolvesToName: '焰尾狐' },
  { name: '焰尾狐', type: 'fire', form: '成体', desc: '拥有三条燃烧的尾巴，动作非常灵敏。', icon: '🦊', evolvesAt: 38, evolvesToName: '九尾炎狐' },
  { name: '九尾炎狐', type: 'fire', form: '究极体', desc: '传说中的九尾神狐，火焰能燃尽一切邪恶。', icon: '🦊', evolvesAt: null },
  { name: '火岩龟', type: 'fire', form: '幼体', desc: '背负着岩浆壳的乌龟，防御力极强。', icon: '🐢', evolvesAt: 20, evolvesToName: '熔岩巨龟' },
  { name: '熔岩巨龟', type: 'fire', form: '成体', desc: '体型巨大，龟壳上的火山口不时喷发。', icon: '🌋', evolvesAt: 40, evolvesToName: '地火玄武' },
  { name: '地火玄武', type: 'fire', form: '究极体', desc: '火系神兽之一，拥有绝对的防御与毁灭的火焰。', icon: '🌋', evolvesAt: null },
  
  // WATER
  { name: '水泡鱼', type: 'water', form: '幼体', desc: '喜欢吐彩色水泡的可爱小鱼。', icon: '🐡', evolvesAt: 16, evolvesToName: '刺甲鱼' },
  { name: '刺甲鱼', type: 'water', form: '成体', desc: '长出尖刺的鱼类精灵，性情变得暴躁。', icon: '🐡', evolvesAt: 35, evolvesToName: '深海狂鲨' },
  { name: '深海狂鲨', type: 'water', form: '究极体', desc: '深海中的霸主，拥有撕裂海流的恐怖力量。', icon: '🦈', evolvesAt: null },
  { name: '蓝宝石', type: 'water', form: '幼体', desc: '像蓝宝石一样的软体精灵，晶莹剔透。', icon: '💎', evolvesAt: 18, evolvesToName: '冰灵贝' },
  { name: '冰灵贝', type: 'water', form: '成体', desc: '藏在坚硬冰晶贝壳里的精灵，能发射冰箭。', icon: '🐚', evolvesAt: 38, evolvesToName: '极寒之主' },
  { name: '极寒之主', type: 'water', form: '究极体', desc: '掌控极寒水流的皇者，所到之处皆结为冰。', icon: '❄️', evolvesAt: null },

  // GRASS
  { name: '藤蔓蛇', type: 'grass', form: '幼体', desc: '像藤蔓一样柔软的青蛇，喜欢缠绕在树枝上。', icon: '🐍', evolvesAt: 17, evolvesToName: '青叶蟒' },
  { name: '青叶蟒', type: 'grass', form: '成体', desc: '身披树叶鳞片的巨蟒，潜伏在密林中。', icon: '🐍', evolvesAt: 36, evolvesToName: '森罗巨蟒' },
  { name: '森罗巨蟒', type: 'grass', form: '究极体', desc: '体型如同一条长河，掌控剧毒与生机的双重力量。', icon: '🐉', evolvesAt: null },
  { name: '花骨朵', type: 'grass', form: '幼体', desc: '含苞待放的小花，散发着淡淡清香。', icon: '🌸', evolvesAt: 18, evolvesToName: '荆棘花' },
  { name: '荆棘花', type: 'grass', form: '成体', desc: '长满倒刺的美丽花朵，危险而迷人。', icon: '🌹', evolvesAt: 40, evolvesToName: '百花仙子' },
  { name: '百花仙子', type: 'grass', form: '究极体', desc: '百花之神，拥有让枯木逢春的奇迹之力。', icon: '🧚', evolvesAt: null },

  // ELECTRIC
  { name: '静电球', type: 'electric', form: '幼体', desc: '随时在放电的小圆球，碰到会麻麻的。', icon: '🔮', evolvesAt: 20, evolvesToName: '闪电魔方' },
  { name: '闪电魔方', type: 'electric', form: '成体', desc: '充满电气能量的几何体，能自由变换形状。', icon: '🎲', evolvesAt: 42, evolvesToName: '雷电矩阵' },
  { name: '雷电矩阵', type: 'electric', form: '究极体', desc: '由纯粹雷电组成的生命体，超越了物理形态。', icon: '🌌', evolvesAt: null },
  { name: '电光鹰', type: 'electric', form: '幼体', desc: '喜欢在雷雨天飞行的雏鹰。', icon: '🦅', evolvesAt: 18, evolvesToName: '疾风雷鹰' },
  { name: '疾风雷鹰', type: 'electric', form: '成体', desc: '双翅展开能制造闪电风暴，速度极快。', icon: '🦅', evolvesAt: 38, evolvesToName: '雷霆金雕' },
  { name: '雷霆金雕', type: 'electric', form: '究极体', desc: '雷系天空霸主，一声长啸能召唤万钧雷霆。', icon: '🦅', evolvesAt: null },

  // LIGHT
  { name: '光斑', type: 'light', form: '幼体', desc: '一团温暖的光斑，总在阳光下飘舞。', icon: '✨', evolvesAt: 22, evolvesToName: '晨星' },
  { name: '晨星', type: 'light', form: '成体', desc: '像星星一样的精灵，给人带来希望。', icon: '⭐', evolvesAt: 45, evolvesToName: '辉煌圣使' },
  { name: '辉煌圣使', type: 'light', form: '究极体', desc: '浑身散发着神圣光辉的使者，能驱散一切黑暗。', icon: '👼', evolvesAt: null },

  // DARK
  { name: '暗影球', type: 'dark', form: '幼体', desc: '一团漆黑的阴影，喜欢躲在角落里。', icon: '🌑', evolvesAt: 22, evolvesToName: '幽灵' },
  { name: '幽灵', type: 'dark', form: '成体', desc: '没有实体的暗影生物，能穿透墙壁。', icon: '👻', evolvesAt: 45, evolvesToName: '深渊死神' },
  { name: '深渊死神', type: 'dark', form: '究极体', desc: '挥舞着镰刀的死神，是黑暗的最深处化身。', icon: '💀', evolvesAt: null },
  
  // NORMAL
  { name: '波波', type: 'normal', form: '幼体', desc: '普普通通的小肥鸟，到处都能看到。', icon: '🐦', evolvesAt: 16, evolvesToName: '大比鸟' },
  { name: '大比鸟', type: 'normal', form: '成体', desc: '体型变大了很多的鸟，飞行速度快。', icon: '🦅', evolvesAt: 36, evolvesToName: '龙卷战鹰' },
  { name: '龙卷战鹰', type: 'normal', form: '究极体', desc: '羽翼如钢铁般坚硬的战鹰，普通系的巅峰。', icon: '🌪️', evolvesAt: null },
];

const typeSkills = {
  fire: [7, 1, 2, 8, 9, 10, 11, 4, 50, 51, 75, 76],
  water: [7, 5, 12, 6, 13, 14, 15, 16, 52, 53, 54, 74],
  grass: [7, 17, 18, 19, 20, 21, 22, 23, 55, 56, 57, 73],
  electric: [7, 24, 25, 26, 27, 28, 58, 59, 60, 61, 80],
  light: [7, 29, 30, 31, 32, 33, 62, 63, 64],
  dark: [7, 34, 35, 36, 37, 38, 65, 66, 67],
  normal: [7, 1, 39, 40, 41]
};

// Generate full pet definitions
const petsToAdd = [];
newPets.forEach((p, i) => {
  maxId++;
  p.id = maxId;
});

// Map links for evolution
newPets.forEach((p) => {
  let evolution = null;
  if (p.evolvesAt) {
    const target = newPets.find(n => n.name === p.evolvesToName);
    if (target) {
      evolution = { to: target.id, level: p.evolvesAt };
    }
  }

  // Random base stats based on form
  let statBase = p.form === '幼体' ? 45 : (p.form === '成体' ? 65 : 85);
  const baseStats = {
    hp: statBase + Math.floor(Math.random() * 15),
    attack: statBase + Math.floor(Math.random() * 15),
    defense: statBase + Math.floor(Math.random() * 15),
    speed: statBase + Math.floor(Math.random() * 15),
    spAttack: statBase + Math.floor(Math.random() * 15),
    spDefense: statBase + Math.floor(Math.random() * 15)
  };

  const growthRate = {
    hp: 2 + Math.random() * 2 + (p.form === '究极体'? 1 : 0),
    attack: 2 + Math.random() * 2 + (p.form === '究极体'? 1 : 0),
    defense: 2 + Math.random() * 2 + (p.form === '究极体'? 1 : 0),
    speed: 2 + Math.random() * 2 + (p.form === '究极体'? 1 : 0),
    spAttack: 2 + Math.random() * 2 + (p.form === '究极体'? 1 : 0),
    spDefense: 2 + Math.random() * 2 + (p.form === '究极体'? 1 : 0)
  };
  
  Object.keys(growthRate).forEach(k => growthRate[k] = parseFloat(growthRate[k].toFixed(1)));

  // Pick skills
  const skillsPool = typeSkills[p.type] || typeSkills.normal;
  const learnset = [];
  learnset.push({ level: 1, skillId: 7 }); // Tackle
  learnset.push({ level: 1, skillId: skillsPool[1 % skillsPool.length] });
  let currentLevel = 8;
  for(let i=2; i<6; i++) {
    const sId = skillsPool[Math.floor(Math.random() * skillsPool.length)];
    if (!learnset.find(l => l.skillId === sId)) {
      learnset.push({ level: currentLevel, skillId: sId });
      currentLevel += 5 + Math.floor(Math.random()*5);
    }
  }
  
  learnset.sort((a,b) => a.level - b.level);

  petsToAdd.push({
    id: p.id,
    name: p.name,
    type: p.type,
    form: p.form,
    icon: p.icon,
    description: p.desc,
    baseStats,
    growthRate,
    evolution,
    learnset,
    lore: p.desc,
    captureGuide: p.form === '幼体' ? "可以在对应属性的星球上捕获。" : "无法直接捕获，需要由幼体进化而来。"
  });
});

data.pets = data.pets.concat(petsToAdd);
fs.writeFileSync(petsDataFile, JSON.stringify(data, null, 2));
console.log(`Added ${petsToAdd.length} pets.`);
