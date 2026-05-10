// ===== MAIN APP =====
const TYPE_NAMES = { fire:'火',water:'水',grass:'草',electric:'电',light:'光',dark:'暗',normal:'普通' };
const TYPE_ICONS = { fire:'🔥',water:'💧',grass:'🌿',electric:'⚡',light:'✨',dark:'🌑',normal:'⚪' };
const PLANET_ICONS = ['','🌋','🌊','🌲','⚡','🌗'];
let currentBattleId = null, currentUserId = null, currentUsername = null, currentEquips = {}, pvpRoomId = null, pvpInviteFrom = null;
let SKILLS_MAP = {};
function getSkillName(sid) { const s = SKILLS_MAP[sid]; return s ? s.name : `技能#${sid}`; }
function getSkillDef(sid) { return SKILLS_MAP[sid] || null; }
function formatMoney(m) { return m >= 90000000 ? '💰 ∞' : `💰 ${m}`; }

// ===== STARS BACKGROUND =====
(function initStars(){
  const c = document.getElementById('stars-canvas'), ctx = c.getContext('2d');
  let stars = [];
  function resize(){ c.width=innerWidth; c.height=innerHeight; stars=[]; for(let i=0;i<150;i++) stars.push({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*1.5+.5,s:Math.random()*.5+.1,o:Math.random()}); }
  function draw(){ ctx.clearRect(0,0,c.width,c.height); stars.forEach(s=>{ s.o+=s.s*.02; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fillStyle=`rgba(200,210,255,${(.3+Math.sin(s.o)*.3).toFixed(2)})`; ctx.fill(); }); requestAnimationFrame(draw); }
  addEventListener('resize',resize); resize(); draw();
})();

// ===== SCREEN MANAGEMENT =====
function showScreen(id){
  const sceneScreen = document.getElementById('screen-scene');
  if (sceneScreen && sceneScreen.classList.contains('active') && id !== 'scene' && id !== 'battle') {
    if (window.ws) window.ws.send({ type: 'leave_scene' });
    if (window.stopSceneRefresh) window.stopSceneRefresh();
  }
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('screen-'+id).classList.add('active');
  // Persistent top bar for game screens
  var gameScreens = ['hub','planet-detail','scene','battle','pvp-battle'];
  var showBar = gameScreens.includes(id);
  document.getElementById('top-bar').classList.toggle('visible', showBar);
  document.body.classList.toggle('has-topbar', showBar);
}
function showSection(id){ document.querySelectorAll('.hub-section').forEach(s=>s.classList.remove('active')); document.getElementById('section-'+id).classList.add('active'); document.querySelectorAll('.hub-nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.section===id)); }
function toast(msg,type='success'){ const t=document.createElement('div'); t.className=`toast ${type}`; t.textContent=msg; document.getElementById('toast-container').appendChild(t); setTimeout(()=>t.remove(),3000); }

// ===== AUTH =====
let authMode = 'login';
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    authMode = tab.dataset.tab;
    document.querySelectorAll('.auth-tab').forEach(t=>t.classList.toggle('active',t===tab));
    const btnContent = document.querySelector('#auth-submit .btn-content');
    if (btnContent) {
      btnContent.textContent = authMode==='login' ? '启动跃迁程序' : '建立新连接';
    } else {
      document.getElementById('auth-submit').textContent = authMode==='login'?'登录':'注册';
    }
  });
});

document.getElementById('auth-form').addEventListener('submit', async(e) => {
  e.preventDefault();
  const u=document.getElementById('auth-username').value.trim(), p=document.getElementById('auth-password').value;
  const errEl=document.getElementById('auth-error');
  errEl.textContent='';
  try {
    const data = authMode==='login' ? await API.login(u,p) : await API.register(u,p);
    API.setToken(data.token);
    currentUserId = data.userId;
    ws.connect(data.token);
    
    // Play warp effect before loading game
    const warp = document.getElementById('warp-overlay');
    if(warp) {
      warp.classList.add('active');
      setTimeout(async () => {
        await loadGame();
        setTimeout(() => warp.classList.remove('active'), 300);
      }, 800); // switch screen at peak of warp
    } else {
      await loadGame();
    }
  } catch(err){ errEl.textContent=err.message; }
});

// Logout
document.getElementById('btn-logout').addEventListener('click', () => {
  API.clearToken();
  currentUserId = null;
  currentBattleId = null;
  if (ws && ws.disconnect) ws.disconnect();
  showScreen('auth');
});

// ===== GAME LOAD =====
async function loadGame(){
  try {
    const data = await API.profile();
    currentUserId = data.player.user_id;
    currentEquips = data.player.equips || {};
    document.getElementById('hub-username').textContent = data.player.user_id ? `训练师` : '';
    document.getElementById('hub-money').textContent = formatMoney(data.player.money);
    if(data.player.starter_pet_id === 0){ showStarterScreen(); }
    else { await loadHub(data); }
  } catch(err){ showScreen('auth'); API.clearToken(); }
}

// ===== STARTER =====
let selectedStarter = null;
function showStarterScreen(){
  showScreen('starter');
  const grid = document.getElementById('starter-grid');
  grid.innerHTML = '';
  [1,4,7].forEach(id => {
    const pets = {1:{name:'小火猴',type:'fire',desc:'性格活泼，尾巴跳动着火焰'},4:{name:'水灵蛙',type:'water',desc:'温顺可爱，能分泌水珠'},7:{name:'叶小芽',type:'grass',desc:'头顶嫩绿叶片，温和善良'}};
    const p = pets[id];
    const card = document.createElement('div');
    card.className = 'starter-card glass-card';
    card.innerHTML = `<div class="pet-sprite-container" id="starter-sprite-${id}"></div><div class="pet-name">${p.name}</div><div class="pet-type-badge type-${p.type}">${TYPE_ICONS[p.type]} ${TYPE_NAMES[p.type]}系</div><div class="pet-desc">${p.desc}</div>`;
    card.addEventListener('click', ()=>{
      document.querySelectorAll('.starter-card').forEach(c=>c.classList.remove('selected'));
      card.classList.add('selected');
      selectedStarter = id;
      document.getElementById('confirm-starter').disabled = false;
    });
    grid.appendChild(card);
    renderPetSprite(document.getElementById(`starter-sprite-${id}`), id, 120);
  });
}
document.getElementById('confirm-starter').addEventListener('click', async()=>{
  if(!selectedStarter) return;
  try {
    await API.chooseStarter(selectedStarter);
    toast('获得了初始精灵！');
    await loadGame();
  } catch(err){ toast(err.message,'error'); }
});

// ===== HUB =====
async function loadHub(data){
  showScreen('hub');
  const me = await API.me();
  currentUsername = me.username;
  currentEquips = data.player.equips || {};
  document.getElementById('hub-username').textContent = me.username;
  document.getElementById('hub-money').textContent = formatMoney(data.player.money);
  loadPlanets();
  
  // Preload shop data for wardrobe rendering in scenes
  if (!shopDataCache) {
    try {
      shopDataCache = await API.shopList();
    } catch (e) {
      console.error('Failed to preload shop data', e);
    }
  }

  // Bind hub navigation
  document.querySelectorAll('.hub-nav-btn').forEach(btn => {
    btn.onclick = null; // clear old listeners
    btn.addEventListener('click', () => {
      showScreen('hub');
      showSection(btn.dataset.section);
      if(btn.dataset.section === 'team'){ refreshTeam(); if(window.loadEssences) loadEssences(); }
      if(btn.dataset.section === 'shop' && window.loadShop) loadShop();
      if(btn.dataset.section === 'wardrobe' && window.loadWardrobe) loadWardrobe();
      if(btn.dataset.section === 'pokedex') loadPokedex();
    });
  });

  loadTeam(data);
}

// ===== PLANETS =====
async function loadPlanets(){
  try {
    const {maps} = await API.getMaps();
    const profile = await API.profile();
    const maxLv = Math.max(...(profile.teamPets.length?profile.teamPets.map(p=>p.level):[1]));
    const grid = document.getElementById('planet-grid');
    grid.innerHTML = '';
    maps.forEach(m=>{
      const locked = maxLv < m.requiredLevel;
      const colors = {fire:'#ff4757',water:'#3b82f6',grass:'#22c55e',electric:'#facc15',neutral:'#a855f7'};
      const pColor = colors[m.theme] || '#00f5d4';
      
      const container = document.createElement('div');
      container.className = `planet-container${locked ? ' locked' : ''}`;
      container.style.setProperty('--planet-color', pColor);
      
      let rgb = '0, 245, 212';
      if(pColor.startsWith('#')) {
        const r = parseInt(pColor.slice(1,3), 16);
        const g = parseInt(pColor.slice(3,5), 16);
        const b = parseInt(pColor.slice(5,7), 16);
        rgb = `${r}, ${g}, ${b}`;
      }
      container.style.setProperty('--planet-color-rgb', rgb);
      
      const model = document.createElement('div');
      model.className = 'planet-model';
      model.style.backgroundImage = `url('/img/planets/${m.theme}.png')`;
      
      const info = document.createElement('div');
      info.className = 'planet-info';
      info.style.transition = 'opacity 0.3s';
      info.innerHTML = `<div class="planet-name">${m.name}</div><div class="planet-desc">${m.description}</div><div class="planet-req">${locked ? `需要 Lv.${m.requiredLevel}` : '点击降落'}</div>`;
      
      if(!locked) {
        model.addEventListener('click', () => {
          model.classList.add('zoom-in');
          info.style.opacity = '0';
          // Hide siblings to keep the screen clean during zoom
          Array.from(grid.children).forEach(child => {
            if (child !== container) child.style.opacity = '0';
          });
          
          setTimeout(() => {
            goToPlanet(m.id);
            setTimeout(() => {
              model.classList.remove('zoom-in');
              info.style.opacity = '1';
              Array.from(grid.children).forEach(child => child.style.opacity = '1');
            }, 500);
          }, 700);
        });
      }
      
      container.appendChild(model);
      container.appendChild(info);
      grid.appendChild(container);
    });
  } catch(err){ toast(err.message,'error'); }
}

// ===== TEAM =====
async function loadTeam(data){
  if(!data){ data = await API.profile(); }
  renderPetGrid('team-grid', data.teamPets, true);
  renderPetGrid('storage-grid', data.storagePets, false);
  document.getElementById('team-count').textContent = `${data.teamPets.length}/6`;
}
async function refreshTeam(){ await loadTeam(); }

function renderPetGrid(containerId, pets, isTeam){
  const grid = document.getElementById(containerId);
  grid.innerHTML = '';
  if(!pets||pets.length===0){ grid.innerHTML='<p style="color:var(--text-dim);padding:20px">暂无精灵</p>'; return; }
  pets.forEach(p=>{
    const hpPct = (p.current_hp/p.max_hp*100);
    const hpColor = hpPct>50?'var(--hp-green)':hpPct>25?'var(--hp-yellow)':'var(--hp-red)';
    const card = document.createElement('div');
    card.className = 'pet-card glass-card';
    card.innerHTML = `<div class="pet-sprite-container" id="pg-sprite-${p.id}"></div><div class="pet-name">${p.nickname}</div><div class="pet-level">Lv.${p.level} <span class="pet-type-badge type-${p.petDef?.type||'normal'}" style="font-size:11px;padding:1px 6px">${TYPE_ICONS[p.petDef?.type]||''}</span></div><div class="pet-hp-mini"><div class="pet-hp-mini-fill" style="width:${hpPct}%;background:${hpColor}"></div></div>`;
    card.addEventListener('click',()=>showPetDetail(p, isTeam));
    grid.appendChild(card);
    renderPetSprite(document.getElementById(`pg-sprite-${p.id}`), p.pet_id, 80);
  });
}

// ===== PET DETAIL MODAL =====
function showPetDetail(pet, isTeam){
  const modal = document.getElementById('modal-pet-detail');
  modal.classList.add('active');
  const header = document.getElementById('pet-detail-header');
  header.innerHTML = `<div class="pet-sprite-container" id="pd-sprite"></div><div class="pet-name">${pet.nickname}</div><div>Lv.${pet.level} · <span class="pet-type-badge type-${pet.petDef?.type||'normal'}">${TYPE_ICONS[pet.petDef?.type]||''} ${TYPE_NAMES[pet.petDef?.type]||''}系</span></div><div style="margin-top:4px;font-size:13px;color:var(--text-secondary)">HP: ${pet.current_hp}/${pet.max_hp}</div>`;
  renderPetSprite(document.getElementById('pd-sprite'), pet.pet_id, 120);

  const stats = document.getElementById('pet-detail-stats');
  const statNames = {attack:'物攻',defense:'物防',sp_attack:'法攻',sp_defense:'法防',speed:'速度',hp:'生命'};
  const maxStat = 200;
  stats.innerHTML = Object.entries(statNames).map(([k,n])=>{
    const v = k==='hp' ? pet.max_hp : (pet[k]||0); const pct = Math.min(100,v/maxStat*100);
    const color = pct>60?'var(--hp-green)':pct>35?'var(--hp-yellow)':'var(--hp-red)';
    return `<div class="stat-bar-row"><span class="stat-label">${n}</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${pct}%;background:${color}"></div></div><span class="stat-value">${v}</span></div>`;
  }).join('');

  const skillsDiv = document.getElementById('pet-detail-skills');
  const skills = Array.isArray(pet.skills)?pet.skills:[];
  skillsDiv.innerHTML = `<h4>技能</h4>${skills.length?skills.map(sid=>{
    const sk = getSkillDef(sid);
    return `<span class="skill-btn" style="display:inline-block;margin:4px;cursor:default" title="${sk?sk.description:''}"><span class="skill-name">${getSkillName(sid)}</span><span class="skill-meta" style="font-size:10px;display:block">威力:${sk?sk.power||'-':'-'} ${sk&&sk.category==='status'?'辅助':sk&&sk.category==='physical'?'物攻':'法攻'}</span></span>`;
  }).join(''):'<p style="color:var(--text-dim)">暂无技能</p>'}`;

  const actions = document.getElementById('pet-detail-actions');
  let actionsHtml = isTeam
    ? `<button class="btn btn-danger btn-sm" onclick="swapPet(${pet.id},false)">移至仓库</button>`
    : `<button class="btn btn-primary btn-sm" onclick="swapPet(${pet.id},true)">加入队伍</button>`;
  actionsHtml += ` <button class="btn btn-sm" style="background:linear-gradient(135deg,#facc15,#f59e0b);color:#000" onclick="showCandyPanel(${pet.id})">🍬 喂糖果</button>`;
  actions.innerHTML = actionsHtml;

  // Candy panel (initially hidden)
  const candyPanel = document.createElement('div');
  candyPanel.id = 'candy-panel';
  candyPanel.style.cssText = 'display:none;margin-top:12px;';
  actions.appendChild(candyPanel);
}
document.getElementById('modal-close').addEventListener('click',()=>document.getElementById('modal-pet-detail').classList.remove('active'));

async function swapPet(id, toTeam){
  try { await API.swapPet(id,toTeam); toast(toTeam?'已加入队伍':'已移至仓库'); document.getElementById('modal-pet-detail').classList.remove('active'); refreshTeam(); }
  catch(err){ toast(err.message,'error'); }
}
window.swapPet = swapPet;

// ===== HEAL =====
document.getElementById('heal-btn').addEventListener('click', async()=>{
  try { const r=await API.heal(); document.getElementById('heal-result').textContent=r.message; toast('治疗完成！'); refreshTeam(); }
  catch(err){ toast(err.message,'error'); }
});

// ===== PLANET DETAIL (fully self-contained) =====
async function showPlanetDetail(mapId) {
  console.log('[showPlanetDetail] START mapId:', mapId);
  try {
    const { maps } = await API.getMaps();
    const map = maps.find(m => m.id === mapId);
    if (!map) { toast('星球不存在', 'error'); return; }
    const profile = await API.profile();
    const maxLv = Math.max(...(profile.teamPets.length ? profile.teamPets.map(p=>p.level) : [1]));
    document.getElementById('planet-detail-title').textContent = `${PLANET_ICONS[map.id]||'🪐'} ${map.name}`;
    document.getElementById('planet-detail-desc').textContent = map.description;
    const grid = document.getElementById('scene-select-grid');
    grid.innerHTML = '';
    (map.scenes||[]).forEach((sc, idx) => {
      const locked = maxLv < (sc.requiredLevel || 1);
      const card = document.createElement('div');
      card.className = `scene-card glass-card${locked?' locked':''}`;
      card.innerHTML = `<div class="scene-icon">${sc.icon}</div><div class="scene-card-name">${sc.name}</div><div class="scene-card-desc">${sc.description}</div><div class="scene-card-level">${locked?'🔒 需要 Lv.'+sc.requiredLevel:'Lv.'+sc.wildPets[0].minLevel+'-'+sc.wildPets[sc.wildPets.length-1].maxLevel}</div>${sc.boss?'<div class="scene-boss-tag">👑 Boss</div>':''}`;
      if (!locked) card.addEventListener('click', () => enterScene(mapId, idx));
      grid.appendChild(card);
    });
    showScreen('planet-detail');
    console.log('[showPlanetDetail] END - showed planet-detail screen with', map.scenes.length, 'scenes');
  } catch(e) { console.error('[showPlanetDetail] ERROR:', e); toast(e.message, 'error'); }
}

// Planet card click entry point
function goToPlanet(mapId) {
  console.log('[goToPlanet] mapId:', mapId, 'typeof showPlanetDetail:', typeof showPlanetDetail);
  showPlanetDetail(mapId);
}
window.goToPlanet = goToPlanet;

// Scene entry: tries 3D exploration (scene.js), falls back to direct battle
async function enterScene(mapId, sceneIndex) {
  console.log('[enterScene] mapId:', mapId, 'sceneIndex:', sceneIndex, 'has enterScene3D:', typeof window.enterScene3D);
  if (window.enterScene3D && typeof window.enterScene3D === 'function') {
    return window.enterScene3D(mapId, sceneIndex);
  }
  // Fallback: direct battle
  try {
    const data = await API.explore(mapId, sceneIndex);
    currentBattleId = data.battleId;
    showScreen('battle');
    document.getElementById('btn-capture').style.display = '';
    if (data.wildPet?.isBoss) {
      document.getElementById('battle-log').innerHTML = '<p style="color:#ffd700;font-weight:bold">👑 Boss出现了！</p>';
    }
    setupBattle(data.playerPet, data.wildPet);
  } catch(err) { toast(err.message,'error'); }
}

// Legacy
async function startExplore(mapId){
  try {
    const data = await API.explore(mapId, 0);
    currentBattleId = data.battleId;
    showScreen('battle');
    document.getElementById('btn-capture').style.display = '';
    setupBattle(data.playerPet, data.wildPet);
  } catch(err){ toast(err.message,'error'); }
}

// ===== SHOP =====
let shopDataCache = null;
let shopActiveGroup = 'supply';
let shopActiveSub = 0;

const SHOP_CATEGORIES = {
  supply: [
    { key: 'capsules', label: '🔵 胶囊', icon: '🔵' },
    { key: 'candies', label: '🍬 糖果', icon: '🍬' },
    { key: 'boosters', label: '💪 强化', icon: '💪' },
    { key: 'others', label: '📦 道具', icon: '📦' },
  ],
  fashion: [
    { key: 'head', label: '🎩 头饰', icon: '🎩' },
    { key: 'body', label: '👕 服饰', icon: '👕' },
    { key: 'back', label: '🦸 背饰', icon: '🦸' },
    { key: 'accessory', label: '👓 饰品', icon: '👓' },
  ]
};

function getShopItems(group, subKey) {
  if (!shopDataCache) return [];
  if (group === 'supply') {
    return shopDataCache[subKey] || [];
  } else {
    return (shopDataCache.wardrobe || []).filter(w => w.part === subKey);
  }
}

async function loadShop() {
  try {
    shopDataCache = await API.shopList();
    document.getElementById('hub-money').textContent = formatMoney(shopDataCache.playerMoney);
    renderShopTabs();
    renderShopItems();
  } catch(err) { toast(err.message, 'error'); }
}

function renderShopTabs() {
  // Top tabs
  document.querySelectorAll('.shop-top-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.group === shopActiveGroup);
    btn.onclick = () => {
      shopActiveGroup = btn.dataset.group;
      shopActiveSub = 0;
      renderShopTabs();
      renderShopItems();
    };
  });

  // Sub tabs
  const subContainer = document.getElementById('shop-sub-tabs');
  subContainer.innerHTML = '';
  const subs = SHOP_CATEGORIES[shopActiveGroup];
  subs.forEach((cat, i) => {
    const items = getShopItems(shopActiveGroup, cat.key);
    const btn = document.createElement('button');
    btn.className = `shop-sub-tab${i === shopActiveSub ? ' active' : ''}`;
    btn.innerHTML = `${cat.label} <span class="shop-sub-count">${items.length}</span>`;
    btn.addEventListener('click', () => {
      shopActiveSub = i;
      renderShopTabs();
      renderShopItems();
    });
    subContainer.appendChild(btn);
  });
}

function renderShopItems() {
  const panel = document.getElementById('shop-item-panel');
  panel.innerHTML = '';
  const subs = SHOP_CATEGORIES[shopActiveGroup];
  const cat = subs[shopActiveSub];
  if (!cat) return;
  const items = getShopItems(shopActiveGroup, cat.key);

  if (items.length === 0) {
    panel.innerHTML = '<p style="color:var(--text-dim);padding:24px;text-align:center">暂无商品</p>';
    return;
  }

  items.forEach(item => {
    const qty = shopDataCache.inventory[item.id] || 0;
    const row = document.createElement('div');
    row.className = 'shop-item';
    row.innerHTML = `
      <span class="shop-item-icon">${item.icon}</span>
      <div class="shop-item-info">
        <span class="shop-item-name">${item.name}</span>
        <span class="shop-item-desc">${item.description || ''}</span>
      </div>
      <span class="shop-item-owned">拥有: ${qty}</span>
      <button class="btn btn-sm shop-buy-btn">${item.price === 0 ? '免费' : '🛒 ' + item.price + '💰'}</button>
    `;
    const btn = row.querySelector('.shop-buy-btn');
    const ownedSpan = row.querySelector('.shop-item-owned');
    btn.addEventListener('click', async () => {
      if (confirm(`花费 ${item.price}💰 购买 ${item.name} 吗？`)) {
        try {
          const res = await API.shopBuy(item.id, 1);
          document.getElementById('hub-money').textContent = formatMoney(res.playerMoney);
          if (shopDataCache) {
            shopDataCache.playerMoney = res.playerMoney;
            shopDataCache.inventory[item.id] = res.newQuantity;
          }
          toast(res.message);
          ownedSpan.textContent = `拥有: ${res.newQuantity}`;
        } catch(err) { toast(err.message, 'error'); }
      }
    });
    panel.appendChild(row);
  });
}
window.loadShop = loadShop;



// ===== WARDROBE =====
let currentWardrobeTab = 'head';

async function loadWardrobe() {
  if (!shopDataCache) shopDataCache = await API.shopList();
  renderWardrobeAvatar();
  renderWardrobeGrid();
}

document.querySelectorAll('.wardrobe-tabs .pokedex-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.wardrobe-tabs .pokedex-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentWardrobeTab = tab.dataset.part;
    renderWardrobeGrid();
  });
});

function renderWardrobeGrid() {
  const grid = document.getElementById('wardrobe-grid');
  grid.innerHTML = '';
  
  const items = (shopDataCache.wardrobe || []).filter(w => w.part === currentWardrobeTab);
  
  // Add "Unequip" option
  const unequipBtn = document.createElement('div');
  unequipBtn.className = 'wardrobe-item-card';
  if (!currentEquips[currentWardrobeTab]) unequipBtn.classList.add('equipped');
  unequipBtn.innerHTML = `<span class="wardrobe-item-icon">❌</span><div class="wardrobe-item-name">脱下</div>`;
  unequipBtn.onclick = () => equipItem(null, currentWardrobeTab);
  grid.appendChild(unequipBtn);

  items.forEach(item => {
    // Only show if owned
    const owned = shopDataCache.inventory[item.id] > 0;
    if (!owned) return;
    
    const isEquipped = currentEquips[item.part] === item.id;
    const div = document.createElement('div');
    div.className = `wardrobe-item-card ${isEquipped ? 'equipped' : ''}`;
    div.innerHTML = `
      <span class="wardrobe-item-icon">${item.icon}</span>
      <div class="wardrobe-item-name">${item.name}</div>
      ${isEquipped ? '<div class="wardrobe-equipped-badge">已装备</div>' : ''}
    `;
    div.onclick = () => equipItem(item.id, item.part);
    grid.appendChild(div);
  });
}

async function equipItem(itemId, part) {
  try {
    await API.equipWardrobe(itemId, part);
    if (itemId) {
      currentEquips[part] = itemId;
    } else {
      delete currentEquips[part];
    }
    renderWardrobeGrid();
    renderWardrobeAvatar();
    
    // Update real avatar if in scene
    if (document.getElementById('player-avatar')) {
      const wrapper = document.getElementById('player-avatar').querySelector('.player-img-wrapper');
      applyEquipsToWrapper(wrapper, currentEquips);
    }
  } catch(e) {
    toast(e.message, 'error');
  }
}

function applyEquipsToWrapper(wrapper, equips) {
  wrapper.querySelectorAll('.player-part').forEach(el => el.remove());
  
  if (!shopDataCache || !shopDataCache.wardrobe) return;
  const wardrobeData = shopDataCache.wardrobe;
  
  ['back', 'body', 'head', 'accessory'].forEach(part => {
    if (equips[part]) {
      const itemDef = wardrobeData.find(w => w.id === equips[part]);
      if (itemDef) {
        const div = document.createElement('div');
        div.className = `player-part player-part-${part}`;
        div.textContent = itemDef.icon;
        wrapper.appendChild(div);
      }
    }
  });
}

window.applyEquipsToWrapper = applyEquipsToWrapper;

function renderWardrobeAvatar() {
  document.getElementById('wardrobe-name-tag').textContent = currentUsername || '我的赛尔';
  const wrapper = document.querySelector('#wardrobe-avatar-preview .player-img-wrapper');
  applyEquipsToWrapper(wrapper, currentEquips);
}

function setupBattle(pp, wp){
  document.getElementById('player-name').textContent = pp.nickname||pp.petDef?.name;
  document.getElementById('player-level').textContent = `Lv.${pp.level}`;
  document.getElementById('player-type').textContent = `${TYPE_ICONS[pp.petDef?.type]||''}`;
  document.getElementById('player-type').className = `battle-pet-type type-${pp.petDef?.type||'normal'}`;
  updateHpBar('player', pp.current_hp, pp.max_hp);
  renderPetSprite(document.getElementById('player-sprite'), pp.pet_id, 140);

  document.getElementById('enemy-name').textContent = `野生 ${wp.nickname||wp.petDef?.name}`;
  document.getElementById('enemy-level').textContent = `Lv.${wp.level}`;
  document.getElementById('enemy-type').textContent = `${TYPE_ICONS[wp.petDef?.type]||''}`;
  document.getElementById('enemy-type').className = `battle-pet-type type-${wp.petDef?.type||'normal'}`;
  updateHpBar('enemy', wp.current_hp, wp.max_hp);
  renderPetSprite(document.getElementById('enemy-sprite'), wp.pet_id, 140);

  document.getElementById('battle-log').innerHTML = `<p>野生的 ${wp.petDef?.name} 出现了！</p>`;

  // Skills
  const skills = Array.isArray(pp.skills)?pp.skills:(typeof pp.skills==='string'?JSON.parse(pp.skills):[]);
  const grid = document.getElementById('skill-grid');
  grid.innerHTML = '';
  skills.forEach(sid=>{
    const sk = getSkillDef(sid);
    const btn = document.createElement('button');
    btn.className = 'skill-btn';
    if(sk) btn.classList.add(`type-${sk.type}`);
    btn.innerHTML = `<span class="skill-name">${getSkillName(sid)}</span><span class="skill-meta">${sk?sk.description:'点击使用'}</span>`;
    btn.addEventListener('click',()=>doBattleAction(sid));
    grid.appendChild(btn);
  });
}

function updateHpBar(side, current, max){
  const pct = Math.max(0,Math.min(100,current/max*100));
  const bar = document.getElementById(`${side}-hp-bar`);
  bar.style.width = pct+'%';
  bar.className = 'hp-bar'+(pct<=25?' low':pct<=50?' medium':'');
  document.getElementById(`${side}-hp-text`).textContent = `${Math.max(0,current)} / ${max}`;
}

async function playBattleAnimationSequence(results, isPvp) {
  const log = document.getElementById(isPvp ? 'pvp-battle-log' : 'battle-log');
  let pPrefix = isPvp ? 'pvp-player' : 'player';
  let ePrefix = isPvp ? 'pvp-enemy' : 'enemy';
  
  let pText = document.getElementById(pPrefix + '-hp-text').textContent;
  let eText = document.getElementById(ePrefix + '-hp-text').textContent;
  let ppHp = parseInt(pText.split('/')[0]);
  let ppMax = parseInt(pText.split('/')[1]);
  let epHp = parseInt(eText.split('/')[0]);
  let wpMax = parseInt(eText.split('/')[1]);

  for(let i=0; i<results.length; i++) {
    const res = results[i];
    
    const p = document.createElement('p'); 
    if (isPvp) {
       p.textContent = `${res.attackerName}使用了${res.skillName}！`;
    } else {
       p.textContent = res.message;
       if(res.critical) p.classList.add('critical'); 
       if(res.typeMultiplier>1) p.classList.add('effective'); 
       if(res.typeMultiplier<1) p.classList.add('not-effective'); 
       if(res.statusEffect) p.style.color='#f59e0b'; 
       if(res.skipped) p.style.color='#60a5fa'; 
       if(res.shieldAbsorbed>0) p.style.color='#67e8f9';
    }
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
    
    const isPlayerAttacking = isPvp ? (res.attackerId === currentUserId) : res.isPlayerAttacking;
    const attackerSpriteId = isPlayerAttacking ? (pPrefix + '-sprite') : (ePrefix + '-sprite');
    const defenderSpriteId = isPlayerAttacking ? (ePrefix + '-sprite') : (pPrefix + '-sprite');
    
    const attEl = document.getElementById(attackerSpriteId);
    const defEl = document.getElementById(defenderSpriteId);
    
    if (attEl && !res.skipped) {
      attEl.classList.add(isPlayerAttacking ? 'anim-dash-right' : 'anim-dash-left');
      await new Promise(r => setTimeout(r, 200)); 
    }
    
    if(res.damage > 0 || (isPvp && !res.missed)) {
      if(defEl) {
        defEl.classList.add('anim-shake');
        const impact = document.createElement('div');
        impact.className = 'impact-fx';
        defEl.parentElement.appendChild(impact);
        setTimeout(() => impact.remove(), 300);
        
        if (res.damage > 0) {
          const dmgText = document.createElement('div');
          dmgText.className = `damage-text ${res.critical ? 'critical' : ''}`;
          dmgText.textContent = `-${res.damage}`;
          defEl.parentElement.appendChild(dmgText);
          setTimeout(() => dmgText.remove(), 1000);
          
          if (isPlayerAttacking) {
            epHp = Math.max(0, epHp - res.damage);
            updateHpBar(ePrefix, epHp, wpMax);
          } else {
            ppHp = Math.max(0, ppHp - res.damage);
            updateHpBar(pPrefix, ppHp, ppMax);
          }
        }
      }
      if(isPvp) {
         const dp=document.createElement('p'); 
         dp.textContent = res.missed ? '没有命中！' : `造成${res.damage}伤害！${res.critical?' 暴击！':''}`;
         if(res.critical) dp.classList.add('critical');
         log.appendChild(dp);
         log.scrollTop = log.scrollHeight;
      }
      setTimeout(() => defEl && defEl.classList.remove('anim-shake'), 600);
    } else if (res.heal > 0) {
      if(attEl) {
          const healText = document.createElement('div');
          healText.className = `damage-text heal`;
          healText.textContent = `+${res.heal}`;
          attEl.parentElement.appendChild(healText);
          setTimeout(() => healText.remove(), 1000);
          if (isPlayerAttacking) {
            ppHp = Math.min(ppMax, ppHp + res.heal);
            updateHpBar(pPrefix, ppHp, ppMax);
          } else {
            epHp = Math.min(wpMax, epHp + res.heal);
            updateHpBar(ePrefix, epHp, wpMax);
          }
      }
    }
    
    if (attEl) {
      setTimeout(() => attEl.classList.remove('anim-dash-right', 'anim-dash-left'), 300);
    }
    await new Promise(r => setTimeout(r, 800));
  }
}

async function doBattleAction(skillId){
  if(!currentBattleId) return;
  document.querySelectorAll('.skill-btn').forEach(b=>b.disabled=true);
  try {
    const r = await API.battleAction(currentBattleId, skillId);
    
    await playBattleAnimationSequence(r.results, false);

    if(r.playerPet) updateHpBar('player', r.playerPet.current_hp, r.playerPet.max_hp);
    if(r.wildPet) updateHpBar('enemy', r.wildPet.current_hp, r.wildPet.max_hp);

    const log = document.getElementById('battle-log');
    if(r.battleEnd){
      currentBattleId = null;
      if(r.playerWin){
        const p=document.createElement('p'); p.textContent=`🎉 胜利！获得 ${r.expGain} 经验 ${r.moneyGain?'+ '+r.moneyGain+'💰':''}`; p.style.color='var(--neon-cyan)'; log.appendChild(p);
        if(r.bossReward){
          const bp=document.createElement('p'); bp.textContent=`👑 Boss奖励：${r.bossReward.essenceName} + ${r.bossReward.money}💰`; bp.style.color='#ffd700'; log.appendChild(bp);
        }
        if(r.levelResult?.evolved){
          setTimeout(()=>showEvolution(r.levelResult), 1500);
        }
        if(r.levelResult?.levelUps?.length){
          const lp=document.createElement('p'); lp.textContent=`⬆️ 升级到 Lv.${r.levelResult.levelUps[r.levelResult.levelUps.length-1]}！`; lp.style.color='var(--exp-blue)'; log.appendChild(lp);
        }
      } else {
        const p=document.createElement('p'); p.textContent='😢 战斗失败...'; p.style.color='var(--hp-red)'; log.appendChild(p);
      }
      log.scrollTop = log.scrollHeight;
      const retFn = window.returnFromBattle || (()=>{ showScreen('hub'); loadPlanets(); refreshTeam(); });
      setTimeout(async () => {
        if (localStorage.getItem('saierhao_auto_heal') === 'true') {
          try { await API.heal(); toast('战斗结束，精灵体力已自动恢复！', 'success'); } catch(e){}
        }
        retFn();
      }, r.playerWin&&r.levelResult?.evolved?4000:2500);
      return;
    }
  } catch(err){ toast(err.message,'error'); }
  document.querySelectorAll('.skill-btn').forEach(b=>b.disabled=false);
}

// Capture - now uses capsule modal
document.getElementById('btn-capture').addEventListener('click', ()=>{
  if(!currentBattleId) return;
  if(window.showCapsuleSelect) showCapsuleSelect();
  else toast('请先购买胶囊','error');
});

// Run
document.getElementById('btn-run').addEventListener('click', async()=>{
  if(!currentBattleId) return;
  try { await API.runAway(currentBattleId); currentBattleId=null; toast('成功逃跑！'); const retFn = window.returnFromBattle || (()=>showScreen('hub')); retFn(); }
  catch(err){ toast(err.message,'error'); }
});

// ===== EVOLUTION =====
function showEvolution(result){
  if(!result.evolved) return;
  const overlay = document.getElementById('evolution-overlay');
  overlay.classList.add('active');
  renderPetSprite(document.getElementById('evolution-old'), result.pet.pet_id, 120);
  renderPetSprite(document.getElementById('evolution-new'), result.newPetId, 120);
  document.getElementById('evolution-name').textContent = `进化为 ${result.pet.nickname}！`;
}
document.getElementById('evolution-ok').addEventListener('click',()=>document.getElementById('evolution-overlay').classList.remove('active'));

// ===== PVP =====
ws.on('online_players', (msg) => {
  const list = document.getElementById('online-players-list');
  list.innerHTML = '';
  msg.players.filter(p=>p.userId!==currentUserId).forEach(p=>{
    const item = document.createElement('div');
    item.className = 'player-list-item';
    item.innerHTML = `<span class="player-name">🟢 ${p.username}</span><button class="btn btn-primary btn-sm" onclick="invitePvp(${p.userId})">邀请对战</button>`;
    list.appendChild(item);
  });
  if(list.children.length===0) list.innerHTML='<p style="color:var(--text-dim);padding:16px;text-align:center">暂无其他在线玩家</p>';
});

window.invitePvp = (targetId) => { ws.send({type:'pvp_invite',targetUserId:targetId}); toast('已发送对战邀请'); };

ws.on('pvp_invitation', (msg) => {
  pvpInviteFrom = msg.fromUserId;
  document.getElementById('pvp-invite-text').textContent = `${msg.fromUsername} 向你发起了对战邀请！`;
  document.getElementById('modal-pvp-invite').classList.add('active');
});
document.getElementById('pvp-accept').addEventListener('click',()=>{ ws.send({type:'pvp_accept',fromUserId:pvpInviteFrom}); document.getElementById('modal-pvp-invite').classList.remove('active'); });
document.getElementById('pvp-reject').addEventListener('click',()=>{ ws.send({type:'pvp_reject',fromUserId:pvpInviteFrom}); document.getElementById('modal-pvp-invite').classList.remove('active'); });

ws.on('pvp_invite_sent', ()=>toast('邀请已发送，等待对方回应'));
ws.on('pvp_rejected', (msg)=>toast(`${msg.byUsername} 拒绝了你的邀请`,'error'));
ws.on('pvp_error', (msg)=>toast(msg.message,'error'));

ws.on('pvp_start', (msg) => {
  pvpRoomId = msg.roomId;
  showScreen('pvp-battle');
  const pp=msg.yourPet, ep=msg.opponentPet;
  document.getElementById('pvp-player-name').textContent=pp.nickname;
  document.getElementById('pvp-player-level').textContent=`Lv.${pp.level}`;
  updateHpBar('pvp-player', pp.current_hp, pp.max_hp);
  renderPetSprite(document.getElementById('pvp-player-sprite'),pp.pet_id,140);
  document.getElementById('pvp-enemy-name').textContent=ep.nickname;
  document.getElementById('pvp-enemy-level').textContent=`Lv.${ep.level}`;
  updateHpBar('pvp-enemy', ep.current_hp, ep.max_hp);
  renderPetSprite(document.getElementById('pvp-enemy-sprite'),ep.pet_id,140);
  const grid=document.getElementById('pvp-skill-grid');
  grid.innerHTML='';
  (pp.skills||[]).forEach(sid=>{
    const sk = getSkillDef(sid);
    const btn=document.createElement('button'); btn.className='skill-btn';
    if(sk) btn.classList.add(`type-${sk.type}`);
    btn.innerHTML=`<span class="skill-name">${getSkillName(sid)}</span><span class="skill-meta">${sk?sk.description:'使用'}</span>`;
    btn.addEventListener('click',()=>{ ws.send({type:'pvp_action',roomId:pvpRoomId,skillId:sid}); grid.querySelectorAll('.skill-btn').forEach(b=>b.disabled=true); });
    grid.appendChild(btn);
  });
  document.getElementById('pvp-battle-log').innerHTML='<p>PVP 对战开始！</p>';
});

ws.on('pvp_waiting', (msg)=>{ const log=document.getElementById('pvp-battle-log'); const p=document.createElement('p'); p.textContent=msg.message; p.style.color='var(--text-secondary)'; log.appendChild(p); });

ws.on('pvp_turn_result', async (msg) => {
  document.getElementById('pvp-skill-grid').querySelectorAll('.skill-btn').forEach(b=>b.disabled=true);
  
  await playBattleAnimationSequence(msg.results, true);
  
  const log=document.getElementById('pvp-battle-log');
  if(msg.yourPet) updateHpBar('pvp-player',msg.yourPet.current_hp,msg.yourPet.max_hp);
  if(msg.opponentPet) updateHpBar('pvp-enemy',msg.opponentPet.current_hp,msg.opponentPet.max_hp);
  if(msg.battleEnd){
    const won=msg.winnerId===currentUserId;
    const p=document.createElement('p'); p.textContent=won?'🎉 你赢了！':'😢 你输了...'; p.style.color=won?'var(--neon-cyan)':'var(--hp-red)'; log.appendChild(p);
    log.scrollTop=log.scrollHeight;
    setTimeout(()=>{ showScreen('hub'); refreshTeam(); },3000);
  } else {
    document.getElementById('pvp-skill-grid').querySelectorAll('.skill-btn').forEach(b=>b.disabled=false);
  }
});

ws.on('pvp_opponent_disconnected', ()=>{ toast('对手已断开连接','error'); setTimeout(()=>showScreen('hub'),1500); });

// ===== POKEDEX =====
let _pokedexData = null;
let _pokedexMode = 'pets'; // 'pets' or 'boss'

document.querySelectorAll('.pokedex-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.pokedex-tab').forEach(t => t.classList.toggle('active', t === tab));
    _pokedexMode = tab.dataset.dex;
    renderPokedex();
  });
});

async function loadPokedex() {
  if (!_pokedexData) {
    try {
      _pokedexData = await API.pokedex();
    } catch(e) { toast(e.message, 'error'); return; }
  }
  renderPokedex();
}

function renderPokedex() {
  if (!_pokedexData) return;
  const container = document.getElementById('pokedex-container');
  container.innerHTML = '';
  const pets = _pokedexData.pets || [];
  
  if (_pokedexMode === 'boss') {
    // Boss pokedex: show Boss evolution lines
    const bossLines = [
      { name: '焱龙帝系列', ids: [19,20,21], theme: 'fire', planet: '火焰星' },
      { name: '渊鲲王系列', ids: [22,23,24], theme: 'water', planet: '海洋星' },
      { name: '蛮荒古树系列', ids: [25,26,27], theme: 'grass', planet: '丛林星' },
      { name: '天雷兽系列', ids: [28,29,30], theme: 'electric', planet: '雷霆星' },
      { name: '虚空魔神系列', ids: [31,32,33], theme: 'dark', planet: '光暗星' }
    ];
    bossLines.forEach(line => {
      const section = document.createElement('div');
      section.className = 'dex-boss-section glass-card';
      section.innerHTML = `<h3 class="dex-boss-title"><span class="dex-boss-planet">${line.planet}</span> ${line.name}</h3>`;
      const grid = document.createElement('div');
      grid.className = 'dex-evo-chain';
      line.ids.forEach((id, idx) => {
        const pet = pets.find(p => p.id === id);
        if (!pet) return;
        if (idx > 0) {
          const arrow = document.createElement('div');
          arrow.className = 'dex-evo-arrow';
          arrow.textContent = '→';
          grid.appendChild(arrow);
        }
        const card = document.createElement('div');
        card.className = `dex-card dex-card-boss type-${pet.type}`;
        card.innerHTML = `<div class="dex-card-sprite" id="dex-sp-${pet.id}"></div><div class="dex-card-name">${pet.name}</div><div class="dex-card-form">${pet.form}</div>`;
        card.addEventListener('click', () => showDexDetail(pet));
        grid.appendChild(card);
        setTimeout(() => renderPetSprite(document.getElementById(`dex-sp-${pet.id}`), pet.id, 72), 0);
      });
      section.appendChild(grid);
      container.appendChild(section);
    });
  } else {
    // Normal pet pokedex: group by type
    const normalPets = pets.filter(p => !p.isBossLine);
    const types = ['fire','water','grass','electric','light','dark'];
    const typeLabels = {fire:'🔥 火系',water:'💧 水系',grass:'🌿 草系',electric:'⚡ 电系',light:'✨ 光系',dark:'🌑 暗系'};
    types.forEach(type => {
      const typePets = normalPets.filter(p => p.type === type);
      if (typePets.length === 0) return;
      const section = document.createElement('div');
      section.className = 'dex-type-section';
      section.innerHTML = `<h3 class="dex-type-title">${typeLabels[type] || type}</h3>`;
      const grid = document.createElement('div');
      grid.className = 'dex-grid';
      typePets.forEach(pet => {
        const card = document.createElement('div');
        card.className = `dex-card type-${pet.type}`;
        card.innerHTML = `<div class="dex-card-sprite" id="dex-sp-${pet.id}"></div><div class="dex-card-name">${pet.name}</div><div class="dex-card-form">${pet.form}</div>`;
        card.addEventListener('click', () => showDexDetail(pet));
        grid.appendChild(card);
        setTimeout(() => renderPetSprite(document.getElementById(`dex-sp-${pet.id}`), pet.id, 64), 0);
      });
      section.appendChild(grid);
      container.appendChild(section);
    });
  }
}

function showDexDetail(pet) {
  const modal = document.getElementById('modal-dex-detail');
  const content = document.getElementById('dex-detail-content');
  modal.classList.add('active');
  
  // Build evolution chain
  let evoHtml = '';
  if (pet.isBossLine || pet.evolution || pet.form !== '幼体') {
    // Find entire evo chain
    const allPets = _pokedexData.pets;
    let chain = [pet];
    // Find root
    let root = pet;
    let visited = new Set([pet.id]);
    for (let i = 0; i < 5; i++) {
      const parent = allPets.find(p => p.evolution && p.evolution.to === root.id);
      if (parent && !visited.has(parent.id)) { root = parent; visited.add(parent.id); chain.unshift(parent); }
      else break;
    }
    // Find children
    let current = pet;
    visited = new Set(chain.map(c => c.id));
    for (let i = 0; i < 5; i++) {
      if (!current.evolution) break;
      const next = allPets.find(p => p.id === current.evolution.to);
      if (next && !visited.has(next.id)) { chain.push(next); visited.add(next.id); current = next; }
      else break;
    }
    // De-dup and keep order
    const uniqueChain = [];
    const seen = new Set();
    chain.forEach(c => { if (!seen.has(c.id)) { seen.add(c.id); uniqueChain.push(c); } });
    
    evoHtml = `<div class="dex-detail-section"><h4>进化链</h4><div class="dex-evo-chain dex-evo-detail">`;
    uniqueChain.forEach((ep, idx) => {
      if (idx > 0) evoHtml += `<div class="dex-evo-arrow">→<br><small>Lv.${uniqueChain[idx-1].evolution?.level || '?'}</small></div>`;
      const isActive = ep.id === pet.id ? ' dex-evo-active' : '';
      evoHtml += `<div class="dex-evo-node${isActive}"><div class="dex-card-sprite" id="dex-detail-sp-${ep.id}"></div><div class="dex-card-name">${ep.name}</div><div class="dex-card-form">${ep.form}</div></div>`;
    });
    evoHtml += '</div></div>';
  }
  
  // Stats
  const statNames = {hp:'HP',attack:'物攻',defense:'物防',spAttack:'法攻',spDefense:'法防',speed:'速度'};
  const maxStat = 160;
  let statsHtml = '<div class="dex-detail-section"><h4>基础属性</h4>';
  Object.entries(statNames).forEach(([k,n]) => {
    const v = pet.baseStats[k] || 0;
    const pct = Math.min(100, v / maxStat * 100);
    statsHtml += `<div class="stat-bar-row"><span class="stat-label">${n}</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${pct}%;background:${pct>60?'var(--hp-green)':pct>35?'var(--hp-yellow)':'var(--hp-red)'}"></div></div><span class="stat-value">${v}</span></div>`;
  });
  statsHtml += '</div>';

  // Skills
  let skillsHtml = '<div class="dex-detail-section"><h4>可学习技能</h4><div class="dex-skills-list">';
  (pet.learnset || []).forEach(ls => {
    const sk = SKILLS_MAP[ls.skillId];
    skillsHtml += `<div class="dex-skill-item"><span class="dex-skill-level">Lv.${ls.level}</span><span class="dex-skill-name">${sk ? sk.name : '技能#'+ls.skillId}</span><span class="dex-skill-info">${sk ? (sk.power ? '威力'+sk.power : '辅助') : ''}</span></div>`;
  });
  skillsHtml += '</div></div>';
  
  // Lore & Capture guide
  let loreHtml = '';
  if (pet.lore) loreHtml += `<div class="dex-detail-section"><h4>📜 背景故事</h4><p class="dex-lore">${pet.lore}</p></div>`;
  if (pet.captureGuide) loreHtml += `<div class="dex-detail-section"><h4>🎯 收服攻略</h4><p class="dex-capture">${pet.captureGuide}</p></div>`;
  if (pet.captureNotes) loreHtml += `<div class="dex-detail-section dex-warning"><p>${pet.captureNotes}</p></div>`;
  
  content.innerHTML = `
    <div class="dex-detail-header">
      <div class="dex-detail-sprite" id="dex-detail-main-sprite"></div>
      <h2 class="dex-detail-name">${pet.name}</h2>
      <div class="dex-detail-badges">
        <span class="pet-type-badge type-${pet.type}">${TYPE_ICONS[pet.type]||''} ${TYPE_NAMES[pet.type]||''}系</span>
        <span class="dex-form-badge">${pet.form}</span>
        ${pet.isBossLine ? '<span class="dex-boss-badge">👑 Boss系列</span>' : ''}
      </div>
      <p class="dex-detail-desc">${pet.description}</p>
    </div>
    ${evoHtml}
    ${statsHtml}
    ${skillsHtml}
    ${loreHtml}
  `;
  
  setTimeout(() => {
    renderPetSprite(document.getElementById('dex-detail-main-sprite'), pet.id, 120);
    // Render evo chain sprites
    if (_pokedexData) {
      _pokedexData.pets.forEach(p => {
        const el = document.getElementById(`dex-detail-sp-${p.id}`);
        if (el) renderPetSprite(el, p.id, 56);
      });
    }
  }, 0);
}

document.getElementById('dex-detail-close').addEventListener('click', () => {
  document.getElementById('modal-dex-detail').classList.remove('active');
});

// ===== INIT =====
(async function init(){
  // Load skills map
  try {
    const { skills } = await API.getSkills();
    skills.forEach(s => { SKILLS_MAP[s.id] = s; });
  } catch(e) {}

  const autoHealToggle = document.getElementById('auto-heal-toggle');
  if (autoHealToggle) {
    autoHealToggle.checked = localStorage.getItem('saierhao_auto_heal') === 'true';
    autoHealToggle.addEventListener('change', (e) => {
      localStorage.setItem('saierhao_auto_heal', e.target.checked);
      if (e.target.checked) toast('已开启自动治疗！');
    });
  }

  if(API.token){
    try { ws.connect(API.token); await loadGame(); } catch(e){ showScreen('auth'); }
  } else { showScreen('auth'); }

  // Cyber card 3D tilt
  const authContainer = document.querySelector('.auth-container');
  const authCard = document.querySelector('.cyber-card');
  if (authContainer && authCard) {
    authContainer.addEventListener('mousemove', (e) => {
      const rect = authCard.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = -y / 20;
      const rotateY = x / 20;
      authCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    authContainer.addEventListener('mouseleave', () => {
      authCard.style.transform = `perspective(1000px) rotateX(0) rotateY(0)`;
    });
  }
})();
