// ===== SCENE & SHOP MODULE =====
let currentMapId = null, currentSceneIndex = null, sceneRefreshTimer = null, sceneCountdown = 30;

// ===== PLANET DETAIL =====
window.showPlanetDetail = async function(mapId) {
  try {
    const {maps} = await API.getMaps();
    const map = maps.find(m => m.id === mapId);
    if (!map) return;
    const profile = await API.profile();
    const maxLv = Math.max(...(profile.teamPets.length ? profile.teamPets.map(p=>p.level) : [1]));
    document.getElementById('planet-detail-title').textContent = `${PLANET_ICONS[map.id]||'🪐'} ${map.name}`;
    document.getElementById('planet-detail-desc').textContent = map.description;
    const grid = document.getElementById('scene-select-grid');
    grid.innerHTML = '';
    (map.scenes||[]).forEach((sc, idx) => {
      const locked = maxLv < sc.requiredLevel;
      const card = document.createElement('div');
      card.className = `scene-card glass-card${locked?' locked':''}`;
      card.innerHTML = `<div class="scene-icon">${sc.icon}</div><div class="scene-card-name">${sc.name}</div><div class="scene-card-desc">${sc.description}</div><div class="scene-card-level">${locked?'🔒 需要 Lv.'+sc.requiredLevel:'Lv.'+sc.wildPets[0].minLevel+'-'+sc.wildPets[sc.wildPets.length-1].maxLevel}</div>${sc.boss?'<div class="scene-boss-tag">👑 Boss</div>':''}`;
      if (!locked) card.addEventListener('click', () => enterScene(mapId, idx));
      grid.appendChild(card);
    });
    showScreen('planet-detail');
  } catch(e) { toast(e.message,'error'); }
};

document.getElementById('planet-detail-back').addEventListener('click', () => { showScreen('hub'); });

// ===== SCENE EXPLORE =====
async function enterScene(mapId, sceneIndex) {
  currentMapId = mapId; currentSceneIndex = sceneIndex;
  try {
    const data = await API.getScene(mapId, sceneIndex);
    document.getElementById('scene-name').textContent = `${data.scene.icon} ${data.mapName} · ${data.scene.name}`;
    const vp = document.getElementById('scene-viewport');
    vp.style.background = data.scene.bgGradient;
    renderSceneSpawns(vp, data.spawns);
    showScreen('scene');
    startSceneRefresh();
  } catch(e) { toast(e.message,'error'); }
}

function renderSceneSpawns(vp, spawns) {
  vp.innerHTML = '';
  spawns.forEach(sp => {
    const el = document.createElement('div');
    el.className = `scene-pet${sp.isBoss?' scene-boss':''}`;
    el.style.left = sp.x + '%'; el.style.top = sp.y + '%';
    el.title = `${sp.isBoss?'👑 ':''}${sp.petDef?.name||'???'} Lv.${sp.level}`;
    const spriteDiv = document.createElement('div');
    spriteDiv.className = 'scene-pet-sprite';
    renderPetSprite(spriteDiv, sp.petId, sp.isBoss ? 80 : 56);
    el.appendChild(spriteDiv);
    const label = document.createElement('div');
    label.className = 'scene-pet-label';
    label.textContent = `${sp.petDef?.name||'???'} Lv.${sp.level}`;
    el.appendChild(label);
    el.addEventListener('click', () => startSceneBattle(sp.spawnId));
    // Random wander animation
    el.style.setProperty('--wx', (Math.random()*40-20)+'px');
    el.style.setProperty('--wy', (Math.random()*20-10)+'px');
    el.style.animationDuration = (3+Math.random()*4)+'s';
    el.style.animationDelay = (Math.random()*2)+'s';
    vp.appendChild(el);
  });
}

async function startSceneBattle(spawnId) {
  stopSceneRefresh();
  try {
    const data = await API.explore(currentMapId, currentSceneIndex, spawnId);
    currentBattleId = data.battleId;
    window._battleSceneReturn = { mapId: currentMapId, sceneIndex: currentSceneIndex };
    showScreen('battle');
    setupBattle(data.playerPet, data.wildPet);
    if (data.wildPet.isBoss) {
      const log = document.getElementById('battle-log');
      log.innerHTML = `<p style="color:#ffd700;font-weight:bold">👑 Boss ${data.wildPet.bossName} 出现了！</p>`;
      document.getElementById('btn-capture').style.display = 'none';
    } else {
      document.getElementById('btn-capture').style.display = '';
    }
  } catch(e) { toast(e.message,'error'); }
}

function startSceneRefresh() {
  sceneCountdown = 30;
  document.getElementById('scene-timer').textContent = '🔄 30s';
  if (sceneRefreshTimer) clearInterval(sceneRefreshTimer);
  sceneRefreshTimer = setInterval(async () => {
    sceneCountdown--;
    document.getElementById('scene-timer').textContent = `🔄 ${sceneCountdown}s`;
    if (sceneCountdown <= 0) {
      sceneCountdown = 30;
      try {
        const data = await API.getScene(currentMapId, currentSceneIndex);
        renderSceneSpawns(document.getElementById('scene-viewport'), data.spawns);
      } catch(e) {}
    }
  }, 1000);
}
function stopSceneRefresh() { if (sceneRefreshTimer) { clearInterval(sceneRefreshTimer); sceneRefreshTimer = null; } }

document.getElementById('scene-back').addEventListener('click', () => {
  stopSceneRefresh();
  if (currentMapId) showPlanetDetail(currentMapId);
  else showScreen('hub');
});

// ===== SHOP =====
async function loadShop() {
  try {
    const data = await API.shopList();
    renderShopGrid('shop-capsules', data.capsules, data.inventory);
    renderShopGrid('shop-candies', data.candies, data.inventory);
    renderShopGrid('shop-others', data.others, data.inventory);
    document.getElementById('hub-money').textContent = `💰 ${data.playerMoney}`;
  } catch(e) { toast(e.message,'error'); }
}

function renderShopGrid(containerId, items, inventory) {
  const grid = document.getElementById(containerId);
  grid.innerHTML = '';
  items.forEach(item => {
    const owned = inventory[item.id] || 0;
    const el = document.createElement('div');
    el.className = 'shop-item';
    el.innerHTML = `<span class="shop-item-icon">${item.icon}</span><span class="shop-item-name">${item.name}</span><span class="shop-item-price">${item.price}💰</span><span class="shop-item-owned">拥有: ${owned}</span><button class="btn btn-primary btn-xs" onclick="buyItem('${item.id}')">购买</button>`;
    grid.appendChild(el);
  });
}

window.buyItem = async function(itemId) {
  try {
    const r = await API.shopBuy(itemId, 1);
    toast(r.message);
    document.getElementById('hub-money').textContent = `💰 ${r.playerMoney}`;
    loadShop();
  } catch(e) { toast(e.message,'error'); }
};

// ===== CAPSULE SELECT =====
window.showCapsuleSelect = async function() {
  if (!currentBattleId) return;
  try {
    const inv = await API.inventory();
    const capsules = inv.items.filter(i => i.item_id.startsWith('capsule_'));
    const list = document.getElementById('capsule-list');
    list.innerHTML = '';
    if (capsules.length === 0) {
      list.innerHTML = '<p style="color:var(--text-dim);text-align:center">没有胶囊了，去商店购买吧！</p>';
    } else {
      capsules.forEach(c => {
        const el = document.createElement('div');
        el.className = 'capsule-option';
        el.innerHTML = `<span>${c.def.icon} ${c.def.name}</span><span>×${c.quantity}</span>`;
        el.addEventListener('click', () => doCapture(c.item_id));
        list.appendChild(el);
      });
    }
    document.getElementById('modal-capsule').classList.add('active');
  } catch(e) { toast(e.message,'error'); }
};
document.getElementById('capsule-cancel').addEventListener('click', () => {
  document.getElementById('modal-capsule').classList.remove('active');
});

async function doCapture(capsuleId) {
  document.getElementById('modal-capsule').classList.remove('active');
  if (!currentBattleId) return;
  try {
    const r = await API.capture(currentBattleId, capsuleId);
    const log = document.getElementById('battle-log');
    const p = document.createElement('p');
    p.textContent = r.message;
    p.style.color = r.captured ? 'var(--neon-purple)' : 'var(--hp-red)';
    log.appendChild(p); log.scrollTop = log.scrollHeight;
    if (r.captured) {
      currentBattleId = null;
      toast(`捕获成功！${r.inTeam?'已加入队伍':'已存入仓库'}`);
      setTimeout(() => returnFromBattle(), 2000);
    } else if (r.playerPet) {
      updateHpBar('player', r.playerPet.current_hp, r.playerPet.max_hp);
    }
  } catch(e) { toast(e.message,'error'); }
}

// ===== ESSENCES =====
async function loadEssences() {
  try {
    const data = await API.getEssences();
    const grid = document.getElementById('essence-grid');
    grid.innerHTML = '';
    if (!data.essences || data.essences.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-dim);padding:12px">暂无精元，击败Boss可获取</p>';
      return;
    }
    data.essences.forEach(e => {
      const card = document.createElement('div');
      card.className = 'pet-card glass-card';
      let statusText, btnHtml;
      if (e.ready) { statusText = '✅ 可领取'; btnHtml = `<button class="btn btn-primary btn-xs" onclick="hatchComplete(${e.id},false)">领取</button>`; }
      else if (e.hatching) { statusText = '🥚 孵化中...'; btnHtml = `<button class="btn btn-xs" onclick="hatchComplete(${e.id},true)">💰加速</button>`; }
      else { statusText = '待孵化'; btnHtml = `<button class="btn btn-primary btn-xs" onclick="hatchStart(${e.id})">开始孵化</button>`; }
      card.innerHTML = `<div style="font-size:32px">${e.def?.icon||'🥚'}</div><div class="pet-name">${e.def?.name||e.essence_id}</div><div style="font-size:12px;color:var(--text-secondary)">${statusText}</div>${btnHtml}`;
      grid.appendChild(card);
    });
  } catch(e) {}
}

window.hatchStart = async function(id) {
  try { const r = await API.hatchStart(id); toast(r.message); loadEssences(); } catch(e) { toast(e.message,'error'); }
};
window.hatchComplete = async function(id, speedUp) {
  try { const r = await API.hatchComplete(id, speedUp); toast(r.message); loadEssences(); refreshTeam(); } catch(e) { toast(e.message,'error'); }
};

// Return from battle to scene or hub
function returnFromBattle() {
  if (window._battleSceneReturn) {
    const {mapId, sceneIndex} = window._battleSceneReturn;
    window._battleSceneReturn = null;
    enterScene(mapId, sceneIndex);
  } else {
    showScreen('hub'); loadPlanets(); refreshTeam();
  }
}
window.returnFromBattle = returnFromBattle;
window.loadShop = loadShop;
window.loadEssences = loadEssences;
window.enterScene = enterScene;
