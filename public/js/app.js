// ===== MAIN APP =====
const TYPE_NAMES = { fire:'火',water:'水',grass:'草',electric:'电',light:'光',dark:'暗',normal:'普通' };
const TYPE_ICONS = { fire:'🔥',water:'💧',grass:'🌿',electric:'⚡',light:'✨',dark:'🌑',normal:'⚪' };
const PLANET_ICONS = ['','🌋','🌊','🌲','⚡','🌗'];
let currentBattleId = null, currentUserId = null, currentUsername = null, currentEquips = {}, pvpRoomId = null, pvpInviteFrom = null;
let SKILLS_MAP = {};
function getSkillName(sid) { const s = SKILLS_MAP[sid]; return s ? s.name : `技能#${sid}`; }
function getSkillDef(sid) { return SKILLS_MAP[sid] || null; }
function formatMoney(m) { return m >= 90000000 ? '💰 ∞' : `💰 ${m}`; }

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

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
  if (document.getElementById('my-elo-rating')) {
    document.getElementById('my-elo-rating').textContent = `积分: ${data.player.elo_rating || 1000}`;
  }
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
      if(btn.dataset.section === 'social') loadSocial();
      if(btn.dataset.section === 'quests') { loadDailyQuests(); loadStoryQuests(); }
      if(btn.dataset.section === 'bag') loadBag();
      if(btn.dataset.section === 'gacha') loadGacha();
      if(btn.dataset.section === 'expedition') loadExpeditions();
      if(btn.dataset.section === 'base') loadBase();
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
let _allTeamPets = [], _allStoragePets = [];
async function loadTeam(data){
  if(!data){ data = await API.profile(); }
  _allTeamPets = data.teamPets; _allStoragePets = data.storagePets;
  renderPetOverview(data.teamPets, data.storagePets);
  renderFilteredPets();
  document.getElementById('team-count').textContent = `${data.teamPets.length}/6`;
}
async function refreshTeam(){ await loadTeam(); }

function renderPetOverview(team, storage) {
  const all = [...team, ...storage];
  const totalPets = all.length;
  const maxLv = all.length ? Math.max(...all.map(p=>p.level)) : 0;
  const totalPower = all.reduce((s,p) => s + (p.max_hp||0) + (p.attack||0) + (p.defense||0) + (p.speed||0) + (p.sp_attack||0) + (p.sp_defense||0), 0);
  const el = document.getElementById('pet-overview-stats');
  if(!el) return;
  el.innerHTML = `
    <div class="pet-stat-card"><div class="pet-stat-value">${totalPets}</div><div class="pet-stat-label">精灵总数</div></div>
    <div class="pet-stat-card"><div class="pet-stat-value">${maxLv}</div><div class="pet-stat-label">最高等级</div></div>
    <div class="pet-stat-card"><div class="pet-stat-value">${totalPower}</div><div class="pet-stat-label">总战力</div></div>
    <div class="pet-stat-card"><div class="pet-stat-value">${team.length}/6</div><div class="pet-stat-label">队伍</div></div>
  `;
}

function renderFilteredPets() {
  const search = (document.getElementById('pet-search-input')?.value || '').trim().toLowerCase();
  const typeFilter = document.getElementById('pet-filter-type')?.value || 'all';
  const sortOption = document.getElementById('pet-sort')?.value || 'default';
  
  const filterFn = p => {
    if (search && !(p.nickname||'').toLowerCase().includes(search) && !(p.petDef?.name||'').toLowerCase().includes(search)) return false;
    if (typeFilter !== 'all' && p.petDef?.type !== typeFilter) return false;
    return true;
  };
  
  const sortFn = (a, b) => {
    if (sortOption === 'level_desc') return b.level - a.level;
    if (sortOption === 'level_asc') return a.level - b.level;
    if (sortOption === 'hp_desc') return b.max_hp - a.max_hp;
    return 0; // Default
  };

  const filteredTeam = _allTeamPets.filter(filterFn).sort(sortFn);
  const filteredStorage = _allStoragePets.filter(filterFn).sort(sortFn);

  renderPetGrid('team-grid', filteredTeam, true);
  renderPetGrid('storage-grid', filteredStorage, false);
}

// Bind search/filter
document.getElementById('pet-search-input')?.addEventListener('input', renderFilteredPets);
document.getElementById('pet-filter-type')?.addEventListener('change', renderFilteredPets);
document.getElementById('pet-sort')?.addEventListener('change', renderFilteredPets);

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
  
  const ivs = pet.ivs ? JSON.parse(pet.ivs) : {};
  const evs = pet.evs ? JSON.parse(pet.evs) : {};
  const totalIV = Object.values(ivs).reduce((a,b)=>a+(b||15), 0);
  let potential = 'D';
  let potColor = 'var(--text-dim)';
  if (totalIV >= 170) { potential = 'S'; potColor = '#f59e0b'; }
  else if (totalIV >= 140) { potential = 'A'; potColor = '#a855f7'; }
  else if (totalIV >= 100) { potential = 'B'; potColor = '#3b82f6'; }
  else if (totalIV >= 60) { potential = 'C'; potColor = '#22c55e'; }

  header.innerHTML = `<div class="pet-sprite-container" id="pd-sprite"></div><div class="pet-name">${pet.nickname} <span style="font-size:14px;color:${potColor};border:1px solid ${potColor};border-radius:4px;padding:0 4px;">${potential}级</span></div><div>Lv.${pet.level} · <span class="pet-type-badge type-${pet.petDef?.type||'normal'}">${TYPE_ICONS[pet.petDef?.type]||''} ${TYPE_NAMES[pet.petDef?.type]||''}系</span></div><div style="margin-top:4px;font-size:13px;color:var(--text-secondary)">HP: ${pet.current_hp}/${pet.max_hp}</div>`;
  renderPetSprite(document.getElementById('pd-sprite'), pet.pet_id, 120);

  const stats = document.getElementById('pet-detail-stats');
  const statNames = {attack:'物攻',defense:'物防',sp_attack:'法攻',sp_defense:'法防',speed:'速度',hp:'生命'};
  const maxStat = 300;
  stats.innerHTML = Object.entries(statNames).map(([k,n])=>{
    const statKey = k === 'sp_attack' ? 'spAttack' : k === 'sp_defense' ? 'spDefense' : k;
    const v = k==='hp' ? pet.max_hp : (pet[k]||0); 
    const pct = Math.min(100,v/maxStat*100);
    const color = pct>60?'var(--hp-green)':pct>35?'var(--hp-yellow)':'var(--hp-red)';
    const iv = ivs[statKey] !== undefined ? ivs[statKey] : 15;
    return `<div class="stat-bar-row" title="潜力值(IV): ${iv}/31"><span class="stat-label">${n}</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${pct}%;background:${color}"></div></div><span class="stat-value">${v} <span style="font-size:10px;color:var(--text-dim);">(${iv})</span></span></div>`;
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
    : `<button class="btn btn-primary btn-sm" onclick="swapPet(${pet.id},true)">加入队伍</button>
       <button class="btn btn-danger btn-sm" style="background:var(--hp-red);margin-left:4px;" onclick="releasePet(${pet.id})">放生</button>`;
  actionsHtml += ` <button class="btn btn-sm" style="background:linear-gradient(135deg,#facc15,#f59e0b);color:#000;margin-left:4px;" onclick="showCandyPanel(${pet.id})">🍬 喂糖果</button>`;
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

async function releasePet(id) {
  if (!confirm('确定要放生这只精灵吗？此操作不可逆转。')) return;
  try {
    const res = await API.releasePet(id);
    toast(res.message);
    document.getElementById('modal-pet-detail').classList.remove('active');
    refreshTeam();
    // Update money display
    const profile = await API.profile();
    document.getElementById('hub-money').textContent = formatMoney(profile.player.money);
  } catch (err) { toast(err.message, 'error'); }
}
window.releasePet = releasePet;

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
    const map = maps.find(m => m.id == mapId);
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
async function goToPlanet(mapId) {
  console.log('[goToPlanet] mapId:', mapId);
  try {
    const res = await API.getStoryQuests();
    const planetData = res.storyData[mapId];
    
    if (!planetData) {
      showPlanetDetail(mapId);
      return;
    }

    const quest = res.quests.find(q => q.planet_id == mapId);
    
    if (!quest) {
      // Quest not started yet
      promptQuestStart(mapId, async () => {
        // Accept
        try {
          await API.advanceStoryQuest(mapId);
          toast('剧情任务已开启！');
          loadStoryQuests(); // Update global tracker
          showPlanetDetail(mapId);
          checkAndPlayPlanetDialogue(mapId, 0); // Check for dialogue on step 0
        } catch (e) {
          toast(e.message, 'error');
        }
      }, () => {
        // Decline (Free explore)
        showPlanetDetail(mapId);
      });
    } else if (quest.status === 'active') {
      // Quest is active, just enter but maybe play dialogue if step is dialogue
      showPlanetDetail(mapId);
      checkAndPlayPlanetDialogue(mapId, quest.quest_step);
    } else {
      // Completed
      showPlanetDetail(mapId);
    }
  } catch (e) {
    console.error(e);
    showPlanetDetail(mapId);
  }
}
window.goToPlanet = goToPlanet;

async function checkAndPlayPlanetDialogue(mapId, step) {
  try {
    const res = await API.getStoryQuests();
    const planetData = res.storyData[mapId];
    if (!planetData) return;
    const stepData = planetData.steps.find(s => s.step === step);
    if (!stepData) return;
    
    // Play start dialogues if they exist
    const dialogues = stepData.startDialogues || [];
    if (dialogues.length === 0) {
      if (stepData.type === 'dialogue') {
        // If it's a pure dialogue step with no text (shouldn't happen), just advance
        API.advanceStoryQuest(mapId).then(() => loadStoryQuests());
      }
      return;
    }
    
    // Play dialogue sequence
    let q = [];
    dialogues.forEach(d => {
      q.push({
        name: d.character,
        text: d.text,
        spriteUrl: d.avatar === 'player' ? '/img/player.png' : null
      });
    });
    
    let idx = 0;
    const playNext = () => {
      if (idx < q.length) {
        const d = q[idx++];
        showDialogue(d.name, d.text, d.spriteUrl, playNext);
      } else {
        // Dialogue finished
        if (stepData.type === 'dialogue') {
          // If it's a dialogue-only step, advance the quest automatically
          API.advanceStoryQuest(mapId).then(() => {
            loadStoryQuests(); // refresh tracker
            // Maybe check next step's dialogue immediately?
            checkAndPlayPlanetDialogue(mapId, step + 1);
          });
        }
      }
    };
    playNext();
  } catch (e) {
    console.error(e);
  }
}
window.checkAndPlayPlanetDialogue = checkAndPlayPlanetDialogue;

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
  ],
  base: [
    { key: 'furniture', label: '🪑 家具', icon: '🪑' }
  ]
};

function getShopItems(group, subKey) {
  if (!shopDataCache) return [];
  if (group === 'supply' || group === 'base') {
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

// ===== BAG =====
async function loadBag() {
  try {
    const res = await API.inventory();
    const grid = document.getElementById('bag-grid');
    grid.innerHTML = '';
    if (!res.items || res.items.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-dim);padding:24px;text-align:center">你的背包空空如也，快去商店或者探索吧！</p>';
      return;
    }
    
    const categories = [
      { id: 'capsules', name: '🔮 捕捉胶囊', filter: i => i.item_id.startsWith('capsule_') },
      { id: 'candies', name: '🍬 经验道具', filter: i => i.item_id.startsWith('candy_') },
      { id: 'boosters', name: '💪 强化道具', filter: i => i.item_id.startsWith('booster_') },
      { id: 'others', name: '📦 其他道具', filter: i => !i.item_id.startsWith('capsule_') && !i.item_id.startsWith('candy_') && !i.item_id.startsWith('booster_') }
    ];

    categories.forEach(cat => {
      const items = res.items.filter(cat.filter);
      if (items.length > 0) {
        const title = document.createElement('h3');
        title.style.cssText = 'margin: 15px 0 10px; font-size: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 5px; color: var(--neon-cyan);';
        title.textContent = cat.name;
        grid.appendChild(title);
        
        const subGrid = document.createElement('div');
        subGrid.className = 'shop-grid';
        items.forEach(item => {
          const el = document.createElement('div');
          el.className = 'shop-item';
          el.innerHTML = `
            <span class="shop-item-icon">${item.def.icon}</span>
            <div class="shop-item-info">
              <div class="shop-item-name">${item.def.name}</div>
              <div class="shop-item-desc">${item.def.description || ''}</div>
            </div>
            <span class="shop-item-owned">拥有: ${item.quantity}</span>
          `;
          subGrid.appendChild(el);
        });
        grid.appendChild(subGrid);
      }
    });
  } catch(err) { toast(err.message, 'error'); }
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
  renderStatusEffects('player', pp);
  renderPetSprite(document.getElementById('player-sprite'), pp.pet_id, 140);

  document.getElementById('enemy-name').textContent = `野生 ${wp.nickname||wp.petDef?.name}`;
  document.getElementById('enemy-level').textContent = `Lv.${wp.level}`;
  document.getElementById('enemy-type').textContent = `${TYPE_ICONS[wp.petDef?.type]||''}`;
  document.getElementById('enemy-type').className = `battle-pet-type type-${wp.petDef?.type||'normal'}`;
  updateHpBar('enemy', wp.current_hp, wp.max_hp);
  renderStatusEffects('enemy', wp);
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

function renderStatusEffects(side, pet) {
  const container = document.getElementById(`${side}-status`);
  if (!container) return;
  container.innerHTML = '';
  if (!pet.statusEffects || pet.statusEffects.length === 0) return;
  
  const labels = { burn: '灼烧', poison: '中毒', freeze: '冰冻', paralyze: '麻痹', stun: '眩晕', debuff: '减益' };
  pet.statusEffects.forEach(eff => {
    const el = document.createElement('div');
    el.className = `status-icon status-${eff.type}`;
    el.textContent = `${labels[eff.type] || eff.type} (${eff.turns})`;
    container.appendChild(el);
  });
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

    if(r.playerPet) { updateHpBar('player', r.playerPet.current_hp, r.playerPet.max_hp); renderStatusEffects('player', r.playerPet); }
    if(r.wildPet) { updateHpBar('enemy', r.wildPet.current_hp, r.wildPet.max_hp); renderStatusEffects('enemy', r.wildPet); }

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

// Ranked Matchmaking handlers
document.getElementById('btn-ranked-match')?.addEventListener('click', () => {
  ws.send({ type: 'pvp_queue_join' });
});
document.getElementById('btn-ranked-cancel')?.addEventListener('click', () => {
  ws.send({ type: 'pvp_queue_leave' });
});

ws.on('pvp_queue_joined', () => {
  document.getElementById('btn-ranked-match').style.display = 'none';
  document.getElementById('btn-ranked-cancel').style.display = 'block';
  toast('已加入天梯排位队列，正在寻找对手...', 'success');
});

ws.on('pvp_queue_left', () => {
  document.getElementById('btn-ranked-match').style.display = 'block';
  document.getElementById('btn-ranked-cancel').style.display = 'none';
  toast('已取消匹配');
});

ws.on('pvp_ranked_result', (msg) => {
  toast(`排位赛结算：${msg.result === 'win' ? '胜利' : '失败'}！积分: ${msg.oldElo} -> ${msg.newElo}`, msg.result === 'win' ? 'success' : 'error');
  document.getElementById('my-elo-rating').textContent = `积分: ${msg.newElo}`;
});

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
    setTimeout(()=>{ 
      showScreen('hub'); 
      refreshTeam(); 
      document.getElementById('btn-ranked-match').style.display = 'block';
      document.getElementById('btn-ranked-cancel').style.display = 'none';
    },3000);
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

  // ===== CHAT SYSTEM =====
  let chatOpen = false;
  let chatUnread = 0;
  const chatToggle = document.getElementById('chat-float-toggle');
  const chatPanel = document.getElementById('chat-float-panel');
  const chatClose = document.getElementById('chat-float-close');
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const chatBadge = document.getElementById('chat-unread-badge');

  function toggleChat() {
    chatOpen = !chatOpen;
    chatPanel.classList.toggle('open', chatOpen);
    if (chatOpen) {
      chatUnread = 0;
      chatBadge.style.display = 'none';
      chatMessages.scrollTop = chatMessages.scrollHeight;
      chatInput.focus();
    }
  }

  if (chatToggle) chatToggle.addEventListener('click', toggleChat);
  if (chatClose) chatClose.addEventListener('click', () => { chatOpen = true; toggleChat(); });

  function renderChatMsg(msg, prepend = false) {
    const div = document.createElement('div');
    const isSelf = msg.userId === currentUserId;
    div.className = `chat-msg${isSelf ? ' self' : ''}`;
    const t = new Date(msg.time);
    const timeStr = `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`;
    div.innerHTML = `
      <div class="chat-msg-user">${escapeHtml(msg.username)}</div>
      <div class="chat-msg-text">${escapeHtml(msg.text)}</div>
      <div class="chat-msg-time">${timeStr}</div>
    `;
    if (prepend) chatMessages.prepend(div);
    else chatMessages.appendChild(div);
    return div;
  }



  function sendChat() {
    const text = chatInput.value.trim();
    if (!text || !window.ws) return;
    window.ws.send({ type: 'chat_message', text });
    chatInput.value = '';
  }

  if (chatSend) chatSend.addEventListener('click', sendChat);
  if (chatInput) chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); sendChat(); }
  });

  // WebSocket chat handlers
  if (window.ws) {
    window.ws.on('chat_history', (msg) => {
      chatMessages.innerHTML = '';
      (msg.messages || []).forEach(m => renderChatMsg(m));
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    window.ws.on('chat_new', (msg) => {
      renderChatMsg(msg.message);
      if (window.showSceneChatBubble) {
        window.showSceneChatBubble(msg.message.userId, msg.message.text, currentUserId);
      }
      chatMessages.scrollTop = chatMessages.scrollHeight;
      if (!chatOpen) {
        chatUnread++;
        chatBadge.textContent = chatUnread > 99 ? '99+' : chatUnread;
        chatBadge.style.display = 'flex';
      }
    });
  }

  // Hook chat nav button is removed because we now use a floating chat only

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

// ===== SOCIAL (Friends & Leaderboard) =====
async function loadSocial() {
  // Setup tabs
  document.querySelectorAll('#section-social .pokedex-tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('#section-social .pokedex-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('social-friends').style.display = tab.dataset.social === 'friends' ? 'block' : 'none';
      document.getElementById('social-leaderboard').style.display = tab.dataset.social === 'leaderboard' ? 'block' : 'none';
      document.getElementById('social-achievements').style.display = tab.dataset.social === 'achievements' ? 'block' : 'none';
      if (tab.dataset.social === 'friends') loadFriends();
      if (tab.dataset.social === 'achievements') loadAchievements();
      if (tab.dataset.social === 'leaderboard') {
        const activeLb = document.querySelector('#social-leaderboard .shop-sub-tab.active');
        if(activeLb) loadLeaderboard(activeLb.dataset.lb);
        else loadLeaderboard('money');
      }
    };
  });

  // Setup leaderboard sub-tabs
  document.querySelectorAll('#social-leaderboard .shop-sub-tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('#social-leaderboard .shop-sub-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loadLeaderboard(tab.dataset.lb);
    };
  });

  // Setup add friend button
  const addBtn = document.getElementById('btn-add-friend');
  if (addBtn) {
    addBtn.onclick = async () => {
      const input = document.getElementById('friend-username');
      const username = input.value.trim();
      if (!username) return;
      try {
        const res = await API.addFriend(username);
        toast(res.message);
        input.value = '';
        loadFriends();
      } catch(e) { toast(e.message, 'error'); }
    };
  }

  // Initial load
  loadFriends();
}

async function loadFriends() {
  const container = document.getElementById('friends-list');
  if (!container) return;
  container.innerHTML = '<p style="color:var(--text-dim)">加载中...</p>';
  try {
    const res = await API.getFriends();
    container.innerHTML = '';
    if (!res.friends || res.friends.length === 0) {
      container.innerHTML = '<p style="color:var(--text-dim)">暂无好友</p>';
      return;
    }
    res.friends.forEach(f => {
      const card = document.createElement('div');
      card.className = 'glass-card';
      card.style.padding = '12px';
      card.style.display = 'flex';
      card.style.justifyContent = 'space-between';
      card.style.alignItems = 'center';
      
      let statusHtml = '';
      if (f.status === 'accepted') {
        statusHtml = '<span style="color:var(--hp-green);font-size:12px;">✅ 已添加</span>';
      } else {
        if (f.sender_id === currentUserId) {
          statusHtml = '<span style="color:var(--text-dim);font-size:12px;">⌛ 等待验证</span>';
        } else {
          statusHtml = `
            <button class="btn btn-primary btn-xs" onclick="acceptFriend(${f.friendship_id})">接受</button>
            <button class="btn btn-danger btn-xs" onclick="removeFriend(${f.friendship_id})">拒绝</button>
          `;
        }
      }

      card.innerHTML = `
        <div style="font-weight:bold; font-size: 15px;">👤 ${escapeHtml(f.username)}</div>
        <div style="display:flex; gap:6px; align-items:center;">
          ${statusHtml}
          ${f.status === 'accepted' ? `<button class="btn btn-danger btn-xs" onclick="removeFriend(${f.friendship_id})">删除</button>` : ''}
        </div>
      `;
      container.appendChild(card);
    });
  } catch (e) {
    container.innerHTML = `<p style="color:var(--hp-red)">${e.message}</p>`;
  }
}

async function acceptFriend(id) {
  try { await API.acceptFriend(id); toast('已添加好友'); loadFriends(); } catch(e) { toast(e.message, 'error'); }
}
window.acceptFriend = acceptFriend;

async function removeFriend(id) {
  try { await API.removeFriend(id); toast('已删除'); loadFriends(); } catch(e) { toast(e.message, 'error'); }
}
window.removeFriend = removeFriend;

async function loadLeaderboard(type) {
  const container = document.getElementById('leaderboard-list');
  if (!container) return;
  container.innerHTML = '<p style="color:var(--text-dim)">加载中...</p>';
  try {
    const res = await API.getLeaderboard(type);
    container.innerHTML = '';
    if (!res.topPlayers || res.topPlayers.length === 0) {
      container.innerHTML = '<p style="color:var(--text-dim)">暂无数据</p>';
      return;
    }
    res.topPlayers.forEach((p, idx) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.padding = '10px 15px';
      row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
      row.style.alignItems = 'center';

      let rankColor = 'var(--text-primary)';
      let rankIcon = `#${idx + 1}`;
      if (idx === 0) { rankColor = '#ffd700'; rankIcon = '🥇 1'; }
      if (idx === 1) { rankColor = '#c0c0c0'; rankIcon = '🥈 2'; }
      if (idx === 2) { rankColor = '#cd7f32'; rankIcon = '🥉 3'; }

      let scoreLabel = '';
      if (type === 'money') scoreLabel = '💰 ' + p.score;
      else if (type === 'level') scoreLabel = 'Lv.' + p.score;
      else if (type === 'pets') scoreLabel = p.score + ' 只';
      else if (type === 'pvp') scoreLabel = p.score + ' 胜';

      row.innerHTML = `
        <div style="font-weight:bold; color:${rankColor}; width: 50px;">${rankIcon}</div>
        <div style="flex:1; font-weight:500;">${escapeHtml(p.username)}</div>
        <div style="color:var(--neon-cyan); font-weight:bold;">${scoreLabel}</div>
      `;
      container.appendChild(row);
    });
  } catch (e) {
    container.innerHTML = `<p style="color:var(--hp-red)">${e.message}</p>`;
  }
}

// ===== ACHIEVEMENTS =====
async function loadAchievements() {
  try {
    // Check for new unlocks first
    const checkRes = await API.checkAchievements();
    if (checkRes.newUnlocks && checkRes.newUnlocks.length > 0) {
      showAchievementCelebration(checkRes.newUnlocks[0]);
    }
    const res = await API.getAchievements();
    const header = document.getElementById('achievement-header');
    const grid = document.getElementById('achievement-grid');
    if (!header || !grid) return;
    const pct = res.total > 0 ? (res.unlockedCount / res.total * 100) : 0;
    header.innerHTML = `
      <span class="achievement-progress-text">${res.unlockedCount}/${res.total}</span>
      <div class="achievement-progress-bar"><div class="achievement-progress-fill" style="width:${pct}%"></div></div>
    `;
    grid.innerHTML = '';
    res.achievements.forEach(a => {
      const card = document.createElement('div');
      card.className = `achievement-card ${a.unlocked ? 'unlocked' : 'locked'}`;
      card.innerHTML = `
        <div class="achievement-icon">${a.icon}</div>
        <div class="achievement-info">
          <div class="achievement-name">${a.name}</div>
          <div class="achievement-desc">${a.desc}</div>
          ${a.unlocked && a.unlockedAt ? `<div class="achievement-time">✅ ${new Date(a.unlockedAt).toLocaleDateString()}</div>` : ''}
        </div>
        <span class="achievement-badge">${a.unlocked ? '已解锁' : '🔒'}</span>
      `;
      grid.appendChild(card);
    });
  } catch(e) { toast(e.message, 'error'); }
}

function showAchievementCelebration(achievement) {
  const el = document.getElementById('achievement-celebration');
  if (!el) return;
  document.getElementById('achievement-celebration-icon').textContent = achievement.icon;
  document.getElementById('achievement-celebration-name').textContent = achievement.name;
  document.getElementById('achievement-celebration-desc').textContent = achievement.desc;
  el.classList.add('active');
  setTimeout(() => el.classList.remove('active'), 3000);
}

// ===== DAILY QUESTS =====
async function loadDailyQuests() {
  try {
    const res = await API.getDailyQuests();
    document.getElementById('quest-reset-hint').textContent = `今日任务 (${res.today}) · 每日0点重置`;
    const list = document.getElementById('quest-list');
    if (!list) return;
    list.innerHTML = '';
    let hasClaimable = false;
    res.quests.forEach(q => {
      const done = q.progress >= q.target;
      const claimed = !!q.reward_claimed;
      if (done && !claimed) hasClaimable = true;
      const pct = Math.min(100, q.target > 0 ? q.progress / q.target * 100 : 0);
      const card = document.createElement('div');
      card.className = `quest-card ${done ? 'completed' : ''} ${claimed ? 'claimed' : ''}`;
      card.innerHTML = `
        <div class="quest-header">
          <span class="quest-icon">${q.icon}</span>
          <div class="quest-info"><div class="quest-name">${q.name}</div><div class="quest-desc">${q.desc}</div></div>
        </div>
        <div class="quest-progress-bar"><div class="quest-progress-fill" style="width:${pct}%"></div></div>
        <div class="quest-progress-text">${q.progress}/${q.target}</div>
        <div class="quest-reward">
          <span class="quest-reward-amount">奖励: ${q.reward_money} 💰</span>
          ${claimed ? '<span style="color:var(--text-dim);font-size:13px">✅ 已领取</span>' : (done ? `<button class="quest-claim-btn" data-qid="${q.id}">领取奖励</button>` : '<span style="color:var(--text-dim);font-size:13px">进行中...</span>')}
        </div>
      `;
      if (done && !claimed) {
        card.querySelector('.quest-claim-btn')?.addEventListener('click', async () => {
          try {
            const r = await API.claimQuestReward(q.id);
            toast(r.message);
            document.getElementById('hub-money').textContent = formatMoney(r.playerMoney);
            loadDailyQuests();
          } catch(e) { toast(e.message, 'error'); }
        });
      }
      list.appendChild(card);
    });
    // Red dot
    const dot = document.getElementById('quest-red-dot');
    if (dot) dot.style.display = hasClaimable ? 'block' : 'none';
  } catch(e) { toast(e.message, 'error'); }
}

// ===== STORY QUESTS =====
async function loadStoryQuests() {
  try {
    const res = await API.getStoryQuests();
    const list = document.getElementById('story-quest-list');
    if (!list) return;
    list.innerHTML = '';
    let hasActiveStory = false;

    if (!res.quests || res.quests.length === 0) {
      list.innerHTML = '<p style="color:var(--text-dim);padding:20px;text-align:center;">暂无主线剧情，去各大星球探索吧！</p>';
      return;
    }

    res.quests.forEach(q => {
      const pData = res.storyData[q.planet_id];
      if (!pData) return;
      
      const stepDef = pData.steps.find(s => s.step === q.quest_step);
      
      const card = document.createElement('div');
      card.className = 'story-quest-card';
      let statusHtml = '';
      
      if (q.status === 'completed') {
        statusHtml = '<span style="color:var(--hp-green)">✅ 已通关</span>';
      } else {
        hasActiveStory = true;
        statusHtml = `<span style="color:var(--neon-cyan)">进行中 (${q.progress}/${stepDef ? stepDef.targetCount : 0})</span>`;
      }

      card.innerHTML = `
        <div class="story-quest-info">
          <h4>${pData.planetName} - 剧情任务</h4>
          <p>${q.status === 'completed' ? '本星球的危机已经解除。' : (stepDef ? stepDef.description : '正在探索中...')}</p>
        </div>
        <div class="story-quest-status">
          ${statusHtml}
        </div>
      `;
      list.appendChild(card);
    });

  } catch(e) { console.error('Failed to load story quests:', e); }
}

window.loadStoryQuests = loadStoryQuests;

// Quest tabs logic
document.querySelectorAll('.pokedex-tabs .pokedex-tab').forEach(tab => {
  if (tab.id === 'quest-tab-daily' || tab.id === 'quest-tab-story') {
    tab.addEventListener('click', () => {
      document.getElementById('quest-tab-daily').classList.remove('active');
      document.getElementById('quest-tab-story').classList.remove('active');
      tab.classList.add('active');
      
      if (tab.id === 'quest-tab-daily') {
        document.getElementById('quest-daily-panel').style.display = 'block';
        document.getElementById('quest-story-panel').style.display = 'none';
        document.getElementById('quest-reset-hint').style.display = 'block';
      } else {
        document.getElementById('quest-daily-panel').style.display = 'none';
        document.getElementById('quest-story-panel').style.display = 'block';
        document.getElementById('quest-reset-hint').style.display = 'none';
      }
    });
  }
});

// ===== DIALOGUE AND STORY PROMPTS =====
let dialogueQueue = [];
let isDialoguePlaying = false;

function showDialogue(name, text, spriteUrl, callback) {
  dialogueQueue.push({ name, text, spriteUrl, callback });
  if (!isDialoguePlaying) {
    playNextDialogue();
  }
}

function playNextDialogue() {
  if (dialogueQueue.length === 0) {
    document.getElementById('dialogue-overlay').classList.remove('active');
    isDialoguePlaying = false;
    return;
  }
  
  isDialoguePlaying = true;
  const dialog = dialogueQueue.shift();
  
  const overlay = document.getElementById('dialogue-overlay');
  const nameEl = document.getElementById('dialogue-name');
  const textEl = document.getElementById('dialogue-text');
  const avatarEl = document.getElementById('dialogue-avatar');
  
  nameEl.textContent = dialog.name;
  textEl.innerHTML = dialog.text; // allow basic HTML like <span style="color:red">
  avatarEl.style.backgroundImage = dialog.spriteUrl ? `url(${dialog.spriteUrl})` : 'none';
  
  overlay.classList.add('active');
  
  // Click to advance
  const advance = () => {
    overlay.removeEventListener('click', advance);
    if (dialog.callback) dialog.callback();
    playNextDialogue();
  };
  
  // Slight delay to prevent immediate clicking if triggered by a click
  setTimeout(() => {
    overlay.addEventListener('click', advance);
  }, 200);
}
window.showDialogue = showDialogue;

function promptQuestStart(planetId, onAccept, onDecline) {
  const modal = document.getElementById('modal-story-prompt');
  
  const btnAccept = document.getElementById('btn-story-accept');
  const btnDecline = document.getElementById('btn-story-decline');
  
  // Remove old listeners
  const newAccept = btnAccept.cloneNode(true);
  const newDecline = btnDecline.cloneNode(true);
  btnAccept.parentNode.replaceChild(newAccept, btnAccept);
  btnDecline.parentNode.replaceChild(newDecline, btnDecline);
  
  newAccept.addEventListener('click', () => {
    modal.style.display = 'none';
    if (onAccept) onAccept();
  });
  
  newDecline.addEventListener('click', () => {
    modal.style.display = 'none';
    if (onDecline) onDecline();
  });
  
  modal.style.display = 'flex';
}
window.promptQuestStart = promptQuestStart;

// ===== GACHA =====
async function loadGacha() {
  try {
    const res = await API.getGachaPools();
    const container = document.getElementById('gacha-pools');
    if (!container) return;
    container.innerHTML = '';
    document.getElementById('gacha-result-area').style.display = 'none';
    res.pools.forEach(pool => {
      const card = document.createElement('div');
      card.className = 'gacha-pool-card glass-card';
      let tags = '';
      if (pool.hasRare) tags += '<span class="gacha-tag gacha-tag-rare">含稀有</span>';
      if (pool.hasLegendary) tags += '<span class="gacha-tag gacha-tag-legendary">含传说</span>';
      card.innerHTML = `
        <div class="gacha-pool-icon">${pool.icon}</div>
        <div class="gacha-pool-name">${pool.name}</div>
        <div class="gacha-pool-price">${pool.price} 💰</div>
        <div class="gacha-pool-tags">${tags}<span class="gacha-tag" style="background:rgba(255,255,255,.05);color:var(--text-dim)">${pool.itemCount}种奖品</span></div>
        <button class="btn gacha-pull-btn">🎲 抽一次</button>
      `;
      card.querySelector('.gacha-pull-btn').addEventListener('click', () => pullGacha(pool.key));
      container.appendChild(card);
    });
  } catch(e) { toast(e.message, 'error'); }
}

async function pullGacha(poolKey) {
  // Show spinning animation
  const overlay = document.getElementById('gacha-overlay');
  if (overlay) {
    overlay.classList.add('active');
    // Reset animation
    const ball = overlay.querySelector('.gacha-ball');
    if(ball) { ball.style.animation = 'none'; ball.offsetHeight; ball.style.animation = ''; }
  }
  try {
    const res = await API.pullGacha(poolKey);
    document.getElementById('hub-money').textContent = formatMoney(res.playerMoney);
    // Wait for animation
    await new Promise(r => setTimeout(r, 1800));
    if (overlay) overlay.classList.remove('active');
    // Show result
    const area = document.getElementById('gacha-result-area');
    area.style.display = 'block';
    let rarityHtml = '';
    if (res.result.rarity === 'rare') rarityHtml = '<div class="gacha-result-rarity rare">★ 稀有 ★</div>';
    if (res.result.rarity === 'legendary') rarityHtml = '<div class="gacha-result-rarity legendary">★★ 传说 ★★</div>';
    area.innerHTML = `
      <div class="gacha-result-icon">${res.result.icon}</div>
      <div class="gacha-result-name">${res.result.name}</div>
      <div class="gacha-result-type">${res.message}</div>
      ${rarityHtml}
      <p style="color:var(--text-dim);font-size:12px;margin-top:10px">保底计数: ${res.pity}/10</p>
    `;
    area.style.animation = 'none'; area.offsetHeight; area.style.animation = '';
    toast(res.message);
  } catch(e) {
    if (overlay) overlay.classList.remove('active');
    toast(e.message, 'error');
  }
}

// ===== SOCIAL TAB ENHANCEMENT (achievements & guild tab) =====
const _origLoadSocial = loadSocial;
loadSocial = async function() {
  await _origLoadSocial();
  // Re-bind tabs to include achievements and guild
  document.querySelectorAll('#section-social .pokedex-tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('#section-social .pokedex-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('social-friends').style.display = tab.dataset.social === 'friends' ? 'block' : 'none';
      document.getElementById('social-leaderboard').style.display = tab.dataset.social === 'leaderboard' ? 'block' : 'none';
      document.getElementById('social-achievements').style.display = tab.dataset.social === 'achievements' ? 'block' : 'none';
      document.getElementById('social-guild').style.display = tab.dataset.social === 'guild' ? 'block' : 'none';
      
      if (tab.dataset.social === 'friends') loadFriends();
      if (tab.dataset.social === 'leaderboard') {
        const activeLb = document.querySelector('#social-leaderboard .shop-sub-tab.active');
        loadLeaderboard(activeLb?.dataset.lb || 'money');
      }
      if (tab.dataset.social === 'achievements') loadAchievements();
      if (tab.dataset.social === 'guild') loadGuild();
    };
  });
};

// ===== ENHANCED HEAL =====
const origHealBtn = document.getElementById('heal-btn');
if (origHealBtn) {
  origHealBtn.replaceWith(origHealBtn.cloneNode(true));
  document.getElementById('heal-btn').addEventListener('click', async () => {
    const icon = document.querySelector('.heal-icon');
    if (icon) { icon.classList.add('healing'); setTimeout(() => icon.classList.remove('healing'), 1000); }
    // Particles
    const center = document.querySelector('.heal-center');
    if (center) {
      for(let i=0;i<6;i++) {
        const p = document.createElement('span');
        p.className = 'heal-particle';
        p.textContent = ['✨','💚','💖','🌟','❤️‍🩹','💫'][i];
        p.style.left = (20 + Math.random()*60) + '%';
        p.style.top = (40 + Math.random()*30) + '%';
        p.style.animationDelay = (i*0.1) + 's';
        center.appendChild(p);
        setTimeout(() => p.remove(), 2000);
      }
    }
    try {
      const r = await API.heal();
      document.getElementById('heal-result').textContent = r.message;
      toast('治疗完成！');
      refreshTeam();
      // Quest progress
      try { await API.questProgress('heal'); } catch(e) {}
    } catch(err) { toast(err.message, 'error'); }
  });
}

// Check achievements periodically after battles
const _origDoBattleAction = doBattleAction;
// Expose for quest tracking
window.trackQuestProgress = async function(type) {
  // Now handled by server
};

// ===== RECHARGE / REDEEM =====
const btnRecharge = document.getElementById('btn-recharge');
const modalRecharge = document.getElementById('modal-recharge');
const btnSubmitRecharge = document.getElementById('btn-submit-recharge');
const inputRecharge = document.getElementById('recharge-code-input');

if (btnRecharge && modalRecharge) {
  btnRecharge.addEventListener('click', () => {
    inputRecharge.value = '';
    modalRecharge.classList.add('active');
  });
}

if (btnSubmitRecharge && inputRecharge) {
  btnSubmitRecharge.addEventListener('click', async () => {
    const code = inputRecharge.value.trim();
    if (!code) { toast('请输入兑换码', 'error'); return; }
    
    btnSubmitRecharge.disabled = true;
    btnSubmitRecharge.textContent = '兑换中...';
    try {
      const res = await API.redeemCode(code);
      toast(res.message, 'success');
      modalRecharge.classList.remove('active');
      
      // Update money UI immediately
      const me = await API.profile();
      if (me && me.player) {
        document.getElementById('hub-money').textContent = formatMoney(me.player.money);
      }
      
      // Reload bag if we are on the bag tab
      if (document.getElementById('section-bag').classList.contains('active')) {
        if (typeof loadBag === 'function') loadBag();
      }
      
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      btnSubmitRecharge.disabled = false;
      btnSubmitRecharge.textContent = '立即兑换';
    }
  });
}

// ===== EXPEDITION LOGIC =====
async function loadExpeditions() {
  try {
    const res = await API.getExpeditions();
    const list = document.getElementById('expedition-list');
    list.innerHTML = '';
    
    if (res.expeditions.length === 0) {
      list.innerHTML = '<div style="text-align:center; padding: 20px; color: var(--text-dim);">当前没有进行中的派遣任务。</div>';
    } else {
      res.expeditions.forEach(exp => {
        const div = document.createElement('div');
        div.className = `quest-card ${exp.completed ? 'completed' : ''}`;
        
        let progressHtml = '';
        let btnHtml = '';
        
        if (exp.completed) {
          progressHtml = `<div class="quest-progress-text" style="color: var(--neon-cyan);">任务已完成！</div>`;
          btnHtml = `<button class="quest-claim-btn" onclick="claimExpedition(${exp.id})">领取奖励</button>`;
        } else {
          const hours = Math.floor(exp.remainingTime / 3600);
          const minutes = Math.floor((exp.remainingTime % 3600) / 60);
          const percent = Math.min(100, Math.floor(((exp.duration - exp.remainingTime) / exp.duration) * 100));
          progressHtml = `
            <div class="quest-progress-bar"><div class="quest-progress-fill" style="width: ${percent}%"></div></div>
            <div class="quest-progress-text">剩余时间：${hours}小时 ${minutes}分钟</div>
          `;
          btnHtml = `
            <div style="display:flex; gap:8px;">
              <button class="btn btn-danger btn-sm" onclick="cancelExpedition(${exp.id})" title="中止派遣并召回精灵，但不会获得任何奖励">中止召回</button>
              <button class="quest-claim-btn" disabled>进行中</button>
            </div>
          `;
        }
        
        div.innerHTML = `
          <div class="quest-header">
            <div class="quest-icon">🚀</div>
            <div class="quest-info">
              <div class="quest-name">${exp.petName} 的派遣任务</div>
              <div class="quest-desc">目标星球：星系边缘 · 预计时长：${exp.duration / 3600}小时</div>
            </div>
            ${btnHtml}
          </div>
          ${progressHtml}
        `;
        list.appendChild(div);
      });
    }
  } catch (err) {
    toast(err.message, 'error');
  }
}

window.claimExpedition = async function(id) {
  try {
    const res = await API.claimExpedition(id);
    toast(res.message, 'success');
    loadExpeditions();
    
    const me = await API.profile();
    if (me && me.player) {
      document.getElementById('hub-money').textContent = formatMoney(me.player.money);
    }
  } catch (err) {
    toast(err.message, 'error');
  }
};

window.cancelExpedition = async function(id) {
  if (!confirm('确定要提前召回精灵吗？中止任务将无法获得任何奖励！')) return;
  try {
    const res = await API.cancelExpedition(id);
    toast(res.message, 'success');
    loadExpeditions();
  } catch (err) {
    toast(err.message, 'error');
  }
};

let selectedExpeditionPetId = null;
let selectedExpeditionDuration = 2;

document.getElementById('btn-new-expedition')?.addEventListener('click', async () => {
  try {
    const me = await API.profile();
    const expRes = await API.getExpeditions();
    
    const busyPetIds = expRes.expeditions.map(e => e.petId);
    const availablePets = (me.storagePets || []).filter(p => !busyPetIds.includes(p.id));

    if (availablePets.length === 0) {
      toast('没有可派遣的闲置精灵！（队伍中的精灵和正在派遣中的精灵无法出任务）', 'error');
      return;
    }
    
    const grid = document.getElementById('expedition-pet-select-grid');
    grid.innerHTML = '';
    selectedExpeditionPetId = null;
    document.getElementById('btn-submit-expedition').disabled = true;
    
    availablePets.forEach(pet => {
      const card = document.createElement('div');
      card.className = 'glass-card pet-select-card';
      card.style.cssText = 'padding: 10px; cursor: pointer; display: flex; align-items: center; gap: 10px; border: 1px solid transparent; transition: all 0.2s;';
      
      card.innerHTML = `
        <div style="width:40px; height:40px; background:var(--glass-bg); border-radius:8px; display:flex; align-items:center; justify-content:center; overflow:hidden;" id="modal-pet-icon-${pet.id}"></div>
        <div style="flex:1">
          <div style="font-weight:bold;">${pet.nickname}</div>
          <div style="font-size:12px; color:var(--text-dim);">Lv.${pet.level}</div>
        </div>
      `;
      
      card.addEventListener('click', () => {
        document.querySelectorAll('.pet-select-card').forEach(c => {
          c.style.borderColor = 'transparent';
          c.style.background = 'var(--glass-bg)';
        });
        card.style.borderColor = 'var(--neon-cyan)';
        card.style.background = 'rgba(0, 245, 212, 0.1)';
        selectedExpeditionPetId = pet.id;
        document.getElementById('btn-submit-expedition').disabled = false;
      });
      
      grid.appendChild(card);
      renderPetSprite(document.getElementById(`modal-pet-icon-${pet.id}`), pet.pet_id, 40);
    });
    
    document.getElementById('modal-expedition-select').classList.add('active');
  } catch (err) {
    toast(err.message, 'error');
  }
});

document.querySelectorAll('#expedition-duration-options .duration-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#expedition-duration-options .duration-btn').forEach(b => {
      b.classList.remove('btn-primary');
      b.classList.add('btn-secondary');
    });
    btn.classList.remove('btn-secondary');
    btn.classList.add('btn-primary');
    selectedExpeditionDuration = parseInt(btn.dataset.duration);
  });
});

document.getElementById('btn-submit-expedition')?.addEventListener('click', async () => {
  if (!selectedExpeditionPetId) return;
  try {
    const res = await API.startExpedition(selectedExpeditionPetId, 1, selectedExpeditionDuration);
    toast(res.message, 'success');
    document.getElementById('modal-expedition-select').classList.remove('active');
    loadExpeditions();
  } catch (err) {
    toast(err.message, 'error');
  }
});

// ===== GUILD LOGIC =====
async function loadGuild() {
  try {
    const res = await API.getGuilds();
    if (res.myGuildId) {
      document.getElementById('guild-unjoined').style.display = 'none';
      document.getElementById('guild-joined').style.display = 'block';
      loadMyGuild();
    } else {
      document.getElementById('guild-unjoined').style.display = 'block';
      document.getElementById('guild-joined').style.display = 'none';
      
      const list = document.getElementById('guild-list');
      list.innerHTML = '';
      if(res.guilds.length === 0) {
        list.innerHTML = '<div style="color:var(--text-dim); text-align:center;">暂无战队，你可以创建一个！</div>';
      } else {
        res.guilds.forEach(g => {
          const div = document.createElement('div');
          div.className = 'player-list-item glass-card';
          div.innerHTML = `
            <div>
              <div class="player-name">${g.name} <span style="font-size:11px; color:var(--text-dim);">(Lv.${g.level})</span></div>
              <div style="font-size:11px; color:var(--text-secondary);">队长: ${g.creator_name} | 人数: ${g.member_count}/50</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="joinGuild(${g.id})">申请加入</button>
          `;
          list.appendChild(div);
        });
      }
    }
  } catch(e) {
    toast(e.message, 'error');
  }
}

async function loadMyGuild() {
  try {
    const res = await API.getMyGuild();
    document.getElementById('my-guild-name').textContent = res.guild.name + ' (Lv.' + res.guild.level + ')';
    document.getElementById('my-guild-info').textContent = `经验: ${res.guild.exp} / ${res.guild.level * 10000} | 公告: ${res.guild.notice}`;
    
    const list = document.getElementById('guild-members-list');
    list.innerHTML = '';
    res.members.forEach(m => {
      const div = document.createElement('div');
      div.className = `leaderboard-row ${m.user_id === res.myMembership.user_id ? 'leaderboard-row-self' : ''}`;
      div.innerHTML = `
        <div class="lb-rank" style="font-size: 14px; width: 40px; color:var(--text-dim);">${m.role === 'leader'?'队长':'队员'}</div>
        <div class="lb-name">${m.username}</div>
        <div class="lb-score">贡献: ${m.contribution}</div>
      `;
      list.appendChild(div);
    });
  } catch(e) {
    toast(e.message, 'error');
  }
}

document.getElementById('btn-create-guild')?.addEventListener('click', async () => {
  const name = document.getElementById('guild-create-name').value;
  if (!name) return toast('请输入战队名称', 'error');
  try {
    const res = await API.createGuild(name);
    toast(res.message, 'success');
    loadGuild();
    // Update money UI immediately
    const me = await API.profile();
    if (me && me.player) {
      document.getElementById('hub-money').textContent = formatMoney(me.player.money);
    }
  } catch(e) { toast(e.message, 'error'); }
});

window.joinGuild = async function(id) {
  try {
    const res = await API.joinGuild(id);
    toast(res.message, 'success');
    loadGuild();
  } catch(e) { toast(e.message, 'error'); }
};

document.getElementById('btn-guild-leave')?.addEventListener('click', async () => {
  if(!confirm('确定要退出当前战队吗？')) return;
  try {
    const res = await API.leaveGuild();
    toast(res.message, 'success');
    loadGuild();
  } catch(e) { toast(e.message, 'error'); }
});

document.getElementById('btn-guild-donate')?.addEventListener('click', async () => {
  try {
    const res = await API.donateGuild(10000);
    toast(res.message, 'success');
    loadMyGuild();
    // Update money UI immediately
    const me = await API.profile();
    if (me && me.player) {
      document.getElementById('hub-money').textContent = formatMoney(me.player.money);
    }
  } catch(e) { toast(e.message, 'error'); }
});


// ===== BASE SYSTEM =====
let baseItems = [];
let baseInventory = [];
let basePets = [];
let allPlayerPets = [];

document.getElementById('tab-base-furniture')?.addEventListener('click', () => {
  document.getElementById('tab-base-furniture').style.borderBottom = '2px solid var(--neon-cyan)';
  document.getElementById('tab-base-furniture').style.color = 'var(--text-primary)';
  document.getElementById('tab-base-pets').style.borderBottom = 'none';
  document.getElementById('tab-base-pets').style.color = 'var(--text-dim)';
  document.getElementById('base-inventory-list').style.display = 'flex';
  document.getElementById('base-pets-list').style.display = 'none';
});

document.getElementById('tab-base-pets')?.addEventListener('click', () => {
  document.getElementById('tab-base-pets').style.borderBottom = '2px solid var(--neon-cyan)';
  document.getElementById('tab-base-pets').style.color = 'var(--text-primary)';
  document.getElementById('tab-base-furniture').style.borderBottom = 'none';
  document.getElementById('tab-base-furniture').style.color = 'var(--text-dim)';
  document.getElementById('base-inventory-list').style.display = 'none';
  document.getElementById('base-pets-list').style.display = 'flex';
});

async function loadBase() {
  try {
    const invData = await API.inventory();
    baseInventory = invData.items.filter(i => i.item_id.startsWith('base_'));
    
    const baseData = await API.getBase();
    baseItems = baseData.items.map(i => ({
      id: i.id,
      itemId: i.item_id,
      x: i.x,
      y: i.y,
      rotation: i.rotation,
      placed: i.placed === 1
    }));

    const petsData = await API.getBasePets();
    allPlayerPets = petsData.pets || [];
    basePets = allPlayerPets.filter(p => p.in_base === 1).map(p => ({
      ...p,
      x: Math.random() * 500 + 100,
      y: Math.random() * 300 + 100
    }));
    
    renderBaseInventory();
    renderBasePetsList();
    renderBaseViewport();
  } catch(e) {
    toast(e.message, 'error');
  }
}

// Sidebar toggle logic
document.getElementById('btn-collapse-sidebar')?.addEventListener('click', () => {
  const sidebar = document.getElementById('base-sidebar');
  if(sidebar) {
    sidebar.style.width = '0px';
    sidebar.style.padding = '0px';
    sidebar.style.opacity = '0';
  }
  const btnExp = document.getElementById('btn-expand-sidebar');
  if(btnExp) btnExp.style.display = 'block';
});

document.getElementById('btn-expand-sidebar')?.addEventListener('click', () => {
  const sidebar = document.getElementById('base-sidebar');
  if(sidebar) {
    sidebar.style.width = '250px';
    sidebar.style.padding = '15px';
    sidebar.style.opacity = '1';
  }
  const btnExp = document.getElementById('btn-expand-sidebar');
  if(btnExp) btnExp.style.display = 'none';
});

let basePlayerPos = { x: 300, y: 300 }; // px
let basePlayerMoving = false;
let basePlayerMoveAnim = null;
let basePlayerAvatar = null;

function createBasePlayerAvatar(vp) {
  basePlayerAvatar = document.createElement('div');
  basePlayerAvatar.id = 'base-player-avatar';
  basePlayerAvatar.className = 'player-avatar';
  basePlayerAvatar.style.left = basePlayerPos.x + 'px';
  basePlayerAvatar.style.top = basePlayerPos.y + 'px';
  basePlayerAvatar.style.zIndex = '40';
  basePlayerAvatar.style.pointerEvents = 'none';
  
  const imgWrapper = document.createElement('div');
  imgWrapper.className = 'player-img-wrapper';
  
  const img = document.createElement('img');
  img.src = '/img/player.png';
  img.alt = '赛尔';
  img.className = 'player-sprite';
  img.draggable = false;
  imgWrapper.appendChild(img);
  
  if (typeof applyEquipsToWrapper === 'function' && typeof currentEquips !== 'undefined') {
    applyEquipsToWrapper(imgWrapper, currentEquips);
  }
  
  const shadow = document.createElement('div');
  shadow.className = 'player-ground-shadow';
  imgWrapper.appendChild(shadow);
  
  basePlayerAvatar.appendChild(imgWrapper);
  
  const tag = document.createElement('div');
  tag.className = 'player-name-tag';
  tag.textContent = window.currentUsername || '我的赛尔';
  basePlayerAvatar.appendChild(tag);
  
  vp.appendChild(basePlayerAvatar);
}

function moveBasePlayerTo(targetX, targetY) {
  if (!basePlayerAvatar || basePlayerMoving) return;
  basePlayerMoving = true;

  const startX = basePlayerPos.x;
  const startY = basePlayerPos.y;
  const dx = targetX - startX;
  const dy = targetY - startY;
  const distance = Math.sqrt(dx*dx + dy*dy);
  const duration = Math.min(2000, Math.max(300, distance * 5)); // faster speed
  
  const imgWrapper = basePlayerAvatar.querySelector('.player-img-wrapper');
  if (dx < -2) imgWrapper.style.transform = 'scaleX(-1)';
  else if (dx > 2) imgWrapper.style.transform = 'scaleX(1)';
  
  basePlayerAvatar.classList.add('walking');
  
  const vp = document.getElementById('base-viewport');
  const indicator = document.createElement('div');
  indicator.className = 'click-indicator';
  indicator.style.left = targetX + 'px';
  indicator.style.top = targetY + 'px';
  vp.appendChild(indicator);
  setTimeout(() => indicator.remove(), 600);
  
  const startTime = performance.now();
  
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const ease = 1 - Math.pow(1 - progress, 3);
    
    basePlayerPos.x = startX + dx * ease;
    basePlayerPos.y = startY + dy * ease;
    basePlayerAvatar.style.left = basePlayerPos.x + 'px';
    basePlayerAvatar.style.top = basePlayerPos.y + 'px';
    
    const bob = Math.sin(elapsed * 0.01) * 3;
    basePlayerAvatar.querySelector('.player-sprite').style.transform = `translateY(${bob}px)`;
    
    if (progress < 1) {
      basePlayerMoveAnim = requestAnimationFrame(step);
    } else {
      basePlayerMoving = false;
      basePlayerAvatar.classList.remove('walking');
      basePlayerAvatar.querySelector('.player-sprite').style.transform = '';
    }
  }
  
  if (basePlayerMoveAnim) cancelAnimationFrame(basePlayerMoveAnim);
  basePlayerMoveAnim = requestAnimationFrame(step);
}

function renderBasePetsList() {
  const list = document.getElementById('base-pets-list');
  if(!list) return;
  list.innerHTML = '';
  
  allPlayerPets.forEach(pet => {
    const inBase = pet.in_base === 1;
    
    const itemEl = document.createElement('div');
    itemEl.className = `glass-card`;
    itemEl.style.cssText = `padding:10px; display:flex; align-items:center; gap:10px;`;
    
    itemEl.innerHTML = `
      <div style="width:40px; height:40px; background:var(--glass-bg); border-radius:8px; display:flex; align-items:center; justify-content:center; overflow:hidden;" id="base-pet-icon-${pet.id}"></div>
      <div style="flex:1">
        <div style="font-weight:bold;">${pet.nickname}</div>
        <div style="font-size:12px; color:var(--text-dim);">Lv.${pet.level}</div>
      </div>
      <button class="btn btn-sm ${inBase ? 'btn-danger' : 'btn-primary'}">${inBase ? '收回' : '放入'}</button>
    `;
    
    itemEl.querySelector('button').addEventListener('click', async () => {
      try {
        await API.toggleBasePet(pet.id, !inBase);
        pet.in_base = inBase ? 0 : 1;
        if (!inBase) {
          basePets.push({ ...pet, x: 400, y: 300 });
        } else {
          basePets = basePets.filter(bp => bp.id !== pet.id);
        }
        renderBasePetsList();
        renderBaseViewport();
      } catch(e) { toast(e.message, 'error'); }
    });
    
    list.appendChild(itemEl);
    renderPetSprite(document.getElementById(`base-pet-icon-${pet.id}`), pet.pet_id, 40);
  });
}

function renderBaseInventory() {
  const list = document.getElementById('base-inventory-list');
  list.innerHTML = '';
  
  baseInventory.forEach(inv => {
    const placedCount = baseItems.filter(bi => bi.itemId === inv.item_id && bi.placed).length;
    const available = inv.quantity - placedCount;
    
    const itemEl = document.createElement('div');
    itemEl.className = `glass-card ${available <= 0 ? 'locked' : ''}`;
    itemEl.style.cssText = `padding:10px; cursor:pointer; display:flex; align-items:center; gap:10px; user-select:none;`;
    itemEl.innerHTML = `
      <div style="font-size:24px;">${inv.def.icon}</div>
      <div style="flex:1">
        <div style="font-weight:bold;">${inv.def.name}</div>
        <div style="font-size:12px; color:var(--text-dim);">拥有: ${inv.quantity} / 可用: ${available}</div>
      </div>
    `;
    
    if (available > 0) {
      itemEl.addEventListener('click', () => {
        baseItems.push({
          itemId: inv.item_id,
          x: 100, y: 100, rotation: 0, placed: true,
          def: inv.def
        });
        renderBaseInventory();
        renderBaseViewport();
      });
    }
    list.appendChild(itemEl);
  });
}

let activeDragItem = null;
let dragStartX, dragStartY, dragInitialX, dragInitialY;

window.addEventListener('mousemove', e => {
  if(!activeDragItem) return;
  activeDragItem.item.x = dragInitialX + (e.clientX - dragStartX);
  activeDragItem.item.y = dragInitialY + (e.clientY - dragStartY);
  activeDragItem.el.style.left = activeDragItem.item.x + 'px';
  activeDragItem.el.style.top = activeDragItem.item.y + 'px';
});

window.addEventListener('mouseup', () => {
  if(activeDragItem) {
    activeDragItem.el.style.zIndex = '';
    activeDragItem = null;
  }
});

function renderBaseViewport() {
  const vp = document.getElementById('base-viewport');
  if(!vp) return;
  
  // Safely cleanup old dynamic elements instead of clearing innerHTML
  vp.querySelectorAll('.base-furniture, .base-pet, .player-avatar, .click-indicator').forEach(el => el.remove());
  
  // Click to move player
  vp.onclick = (e) => {
    if(e.target.closest('button') || e.target.closest('.base-furniture')) return;
    const rect = vp.getBoundingClientRect();
    const targetX = e.clientX - rect.left;
    const targetY = e.clientY - rect.top;
    const clampedX = Math.max(20, Math.min(rect.width - 20, targetX));
    const clampedY = Math.max(50, Math.min(rect.height - 20, targetY));
    moveBasePlayerTo(clampedX, clampedY);
  };
  
  // Render player avatar
  createBasePlayerAvatar(vp);
  
  const getDef = id => baseInventory.find(i => i.item_id === id)?.def || { icon:'📦', name:'未知' };
  
  baseItems.filter(i => i.placed).forEach((item) => {
    const def = item.def || getDef(item.itemId);
    const el = document.createElement('div');
    el.className = 'base-furniture';
    el.style.cssText = `
      position: absolute; left: ${item.x}px; top: ${item.y}px;
      font-size: 48px; cursor: move; user-select: none;
      transform: rotate(${item.rotation}deg);
      transition: transform 0.2s;
    `;
    el.innerHTML = def.icon;
    el.title = "拖拽移动，右键收起，双击旋转";
    
    el.addEventListener('mousedown', e => {
      if(e.button !== 0) return; 
      activeDragItem = { item, el };
      dragStartX = e.clientX; dragStartY = e.clientY;
      dragInitialX = item.x; dragInitialY = item.y;
      el.style.zIndex = 100;
      e.stopPropagation();
    });
    
    el.addEventListener('dblclick', () => {
      item.rotation = (item.rotation + 90) % 360;
      el.style.transform = `rotate(${item.rotation}deg)`;
    });
    
    el.addEventListener('contextmenu', e => {
      e.preventDefault();
      item.placed = false;
      renderBaseInventory();
      renderBaseViewport();
    });
    
    vp.appendChild(el);
  });

  // Render roaming pets
  let petIntervals = window.basePetIntervals || [];
  petIntervals.forEach(clearInterval);
  window.basePetIntervals = [];

  basePets.forEach(pet => {
    const el = document.createElement('div');
    el.className = 'base-pet';
    el.style.cssText = `
      position: absolute; left: ${pet.x}px; top: ${pet.y}px;
      width: 100px; height: 100px;
      transition: left 2s ease-in-out, top 2s ease-in-out;
      pointer-events: none;
      z-index: 10;
    `;
    vp.appendChild(el);
    renderPetSprite(el, pet.pet_id, 100);
    
    // Roaming AI
    const interval = setInterval(() => {
      if(Math.random() > 0.4 && vp.contains(el)) {
        pet.x = Math.max(20, Math.min(vp.clientWidth - 120, pet.x + (Math.random() - 0.5) * 200));
        pet.y = Math.max(100, Math.min(vp.clientHeight - 150, pet.y + (Math.random() - 0.5) * 200));
        el.style.left = pet.x + 'px';
        el.style.top = pet.y + 'px';
        // Flip sprite direction based on movement
        const img = el.querySelector('img');
        if (img) {
          img.style.transform = (Math.random() > 0.5) ? 'scaleX(-1)' : 'scaleX(1)';
        }
      }
    }, 2500);
    window.basePetIntervals.push(interval);
  });
}

document.getElementById('btn-save-base')?.addEventListener('click', async () => {
  try {
    const res = await API.saveBase(baseItems.filter(i => i.placed));
    toast(res.message, 'success');
  } catch(e) { toast(e.message, 'error'); }
});
