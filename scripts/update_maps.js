const fs = require('fs');
const path = require('path');
const mapsDataFile = path.join(__dirname, '../data/maps.json');
const data = JSON.parse(fs.readFileSync(mapsDataFile, 'utf8'));

// The newly added pets start from ID 34.
// 34: 赤狐, 35: 焰尾狐, 36: 九尾炎狐, 37: 火岩龟, 38: 熔岩巨龟, 39: 地火玄武
// 40: 水泡鱼, 41: 刺甲鱼, 42: 深海狂鲨, 43: 蓝宝石, 44: 冰灵贝, 45: 极寒之主
// 46: 藤蔓蛇, 47: 青叶蟒, 48: 森罗巨蟒, 49: 花骨朵, 50: 荆棘花, 51: 百花仙子
// 52: 静电球, 53: 闪电魔方, 54: 雷电矩阵, 55: 电光鹰, 56: 疾风雷鹰, 57: 雷霆金雕
// 58: 光斑, 59: 晨星, 60: 辉煌圣使
// 61: 暗影球, 62: 幽灵, 63: 深渊死神
// 64: 波波, 65: 大比鸟, 66: 龙卷战鹰

// Add new pets to maps and set rare pets
const updateScene = (mapId, sceneIdx, newWildPets, rarePet, npcs = []) => {
  const map = data.maps.find(m => m.id === mapId);
  const scene = map.scenes[sceneIdx];
  scene.wildPets.push(...newWildPets);
  if (rarePet) {
    scene.wildPets.push(rarePet);
  }
  // normalize rates to sum to 100
  let total = scene.wildPets.reduce((sum, p) => sum + p.rate, 0);
  scene.wildPets.forEach(p => p.rate = Math.round((p.rate / total) * 100));
  
  if (npcs.length > 0) {
    scene.npcs = npcs;
  }
};

// 1: 火焰星
updateScene(1, 0, 
  [{ petId: 34, minLevel: 4, maxLevel: 9, rate: 40 }], // 赤狐
  { petId: 37, minLevel: 5, maxLevel: 10, rate: 5 }, // 火岩龟 (rare)
  [{ id: "npc_elder_fire", name: "烈焰智者", x: 20, y: 55, sprite: "🧙‍♂️", defaultText: "火山深处的封印似乎松动了……" }]
);
updateScene(1, 1, 
  [{ petId: 35, minLevel: 14, maxLevel: 20, rate: 30 }], // 焰尾狐
  { petId: 38, minLevel: 16, maxLevel: 22, rate: 4 }, // 熔岩巨龟 (rare)
  [{ id: "npc_miner", name: "迷路的矿工", x: 80, y: 70, sprite: "👷", defaultText: "救命啊，海盗把我的钻探机抢走了！" }]
);
updateScene(1, 2, 
  [{ petId: 36, minLevel: 30, maxLevel: 40, rate: 20 }], // 九尾炎狐
  { petId: 39, minLevel: 35, maxLevel: 45, rate: 2 }, // 地火玄武 (rare)
  []
);

// 2: 海洋星
updateScene(2, 0, 
  [{ petId: 40, minLevel: 3, maxLevel: 8, rate: 40 }], 
  { petId: 43, minLevel: 5, maxLevel: 10, rate: 5 }, 
  [{ id: "npc_sailor", name: "老水手", x: 70, y: 40, sprite: "⚓", defaultText: "最近海里的水质越来越差了，鱼儿们都在发狂。" }]
);
updateScene(2, 1, 
  [{ petId: 41, minLevel: 15, maxLevel: 22, rate: 30 }], 
  { petId: 44, minLevel: 18, maxLevel: 25, rate: 4 }, 
  [{ id: "npc_mermaid", name: "人鱼公主", x: 30, y: 60, sprite: "🧜‍♀️", defaultText: "海神大人被污染控制了，请你救救他！" }]
);
updateScene(2, 2, 
  [{ petId: 42, minLevel: 30, maxLevel: 40, rate: 20 }], 
  { petId: 45, minLevel: 35, maxLevel: 45, rate: 2 }, 
  []
);

// 3: 丛林星
updateScene(3, 0, 
  [{ petId: 46, minLevel: 5, maxLevel: 10, rate: 40 }], 
  { petId: 49, minLevel: 6, maxLevel: 11, rate: 5 }, 
  [{ id: "npc_ranger", name: "游侠", x: 40, y: 65, sprite: "🏹", defaultText: "森林里的植物正在枯萎，这绝对不是自然现象。" }]
);
updateScene(3, 1, 
  [{ petId: 47, minLevel: 16, maxLevel: 24, rate: 30 }], 
  { petId: 50, minLevel: 18, maxLevel: 26, rate: 4 }, 
  [{ id: "npc_fairy", name: "花仙子", x: 80, y: 45, sprite: "🧚‍♀️", defaultText: "毒气已经蔓延到这里了，咳咳……" }]
);
updateScene(3, 2, 
  [{ petId: 48, minLevel: 32, maxLevel: 42, rate: 20 }], 
  { petId: 51, minLevel: 35, maxLevel: 45, rate: 2 }, 
  []
);

// 4: 雷霆星
updateScene(4, 0, 
  [{ petId: 52, minLevel: 8, maxLevel: 15, rate: 40 }], 
  { petId: 55, minLevel: 10, maxLevel: 16, rate: 5 }, 
  [{ id: "npc_engineer", name: "雷电工程师", x: 25, y: 70, sprite: "👨‍🔧", defaultText: "磁场完全紊乱了，我的仪器都失效了！" }]
);
updateScene(4, 1, 
  [{ petId: 53, minLevel: 20, maxLevel: 28, rate: 30 }], 
  { petId: 56, minLevel: 22, maxLevel: 30, rate: 4 }, 
  [{ id: "npc_guard", name: "神殿守卫", x: 60, y: 55, sprite: "🛡️", defaultText: "海盗破坏了能量节点，雷帝大人发怒了！" }]
);
updateScene(4, 2, 
  [{ petId: 54, minLevel: 35, maxLevel: 45, rate: 20 }], 
  { petId: 57, minLevel: 38, maxLevel: 48, rate: 2 }, 
  []
);

// 5: 光暗星
updateScene(5, 0, 
  [{ petId: 58, minLevel: 22, maxLevel: 30, rate: 35 }], 
  { petId: 64, minLevel: 15, maxLevel: 25, rate: 10 }, // 波波 also here
  [{ id: "npc_priest", name: "光之祭司", x: 85, y: 50, sprite: "👼", defaultText: "黑暗正在侵蚀这片晨曦，我们必须守住最后的碎片。" }]
);
updateScene(5, 1, 
  [{ petId: 61, minLevel: 28, maxLevel: 36, rate: 30 }], 
  { petId: 65, minLevel: 25, maxLevel: 35, rate: 8 }, 
  [{ id: "npc_oracle", name: "暗影先知", x: 15, y: 65, sprite: "🔮", defaultText: "虚空魔神即将苏醒，宇宙的终结要来了……" }]
);
updateScene(5, 2, 
  [{ petId: 62, minLevel: 38, maxLevel: 48, rate: 20 }], 
  { petId: 63, minLevel: 40, maxLevel: 50, rate: 3 }, 
  []
);

fs.writeFileSync(mapsDataFile, JSON.stringify(data, null, 2));
console.log('maps.json updated successfully.');
