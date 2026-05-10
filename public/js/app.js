// ===== MAIN APP =====
const TYPE_NAMES = { fire:'火',water:'水',grass:'草',electric:'电',light:'光',dark:'暗',normal:'普通' };
const TYPE_ICONS = { fire:'🔥',water:'💧',grass:'🌿',electric:'⚡',light:'✨',dark:'🌑',normal:'⚪' };
const PLANET_ICONS = ['','🌋','🌊','🌲','⚡','🌗'];
let currentBattleId = null, currentUserId = null, pvpRoomId = null, pvpInviteFrom = null;
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
    document.getElementById('auth-submit').textContent = authMode==='login'?'登录':'注册';
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
    await loadGame();
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
  document.getElementById('hub-username').textContent = me.username;
  document.getElementById('hub-money').textContent = formatMoney(data.player.money);
  loadPlanets();
  loadTeam(data);
}

document.querySelectorAll('.hub-nav-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    showScreen('hub');
    showSection(btn.dataset.section);
    if(btn.dataset.section==='team'){ refreshTeam(); if(window.loadEssences) loadEssences(); }
    if(btn.dataset.section==='shop' && window.loadShop) loadShop();
  });
});

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
      const card = document.createElement('div');
      card.className = `planet-card glass-card${locked?' locked':''}`;
      card.style.setProperty('--planet-color', colors[m.theme]||'#00f5d4');
      card.innerHTML = `<div class="planet-icon">${PLANET_ICONS[m.id]||'🪐'}</div><div class="planet-name">${m.name}</div><div class="planet-desc">${m.description}</div><div class="planet-req">${locked?`需要精灵达到 Lv.${m.requiredLevel}`:'可以探索'}</div>`;
      if(!locked) card.addEventListener('click',()=>{ goToPlanet(m.id); });
      grid.appendChild(card);
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

async function doBattleAction(skillId){
  if(!currentBattleId) return;
  document.querySelectorAll('.skill-btn').forEach(b=>b.disabled=true);
  try {
    const r = await API.battleAction(currentBattleId, skillId);
    const log = document.getElementById('battle-log');
    r.results.forEach(res=>{ const p=document.createElement('p'); p.textContent=res.message; if(res.critical) p.classList.add('critical'); if(res.typeMultiplier>1) p.classList.add('effective'); if(res.typeMultiplier<1) p.classList.add('not-effective'); if(res.statusEffect) p.style.color='#f59e0b'; if(res.skipped) p.style.color='#60a5fa'; if(res.shieldAbsorbed>0) p.style.color='#67e8f9'; log.appendChild(p); });
    log.scrollTop = log.scrollHeight;

    if(r.playerPet) updateHpBar('player', r.playerPet.current_hp, r.playerPet.max_hp);
    if(r.wildPet) updateHpBar('enemy', r.wildPet.current_hp, r.wildPet.max_hp);

    // Animations
    r.results.forEach(res=>{
      if(res.damage>0){
        const target = res.isPlayerAttacking?'enemy-sprite':'player-sprite';
        const el = document.getElementById(target);
        el.classList.add('anim-shake'); setTimeout(()=>el.classList.remove('anim-shake'),600);
      }
    });

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
      const retFn = window.returnFromBattle || (()=>{ showScreen('hub'); loadPlanets(); refreshTeam(); });
      setTimeout(retFn, r.playerWin&&r.levelResult?.evolved?4000:2500);
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

ws.on('pvp_turn_result', (msg) => {
  const log=document.getElementById('pvp-battle-log');
  msg.results.forEach(r=>{ const p=document.createElement('p'); p.textContent=`${r.attackerName}使用了${r.skillName}，${r.missed?'没有命中！':`造成${r.damage}伤害！${r.critical?' 暴击！':''}`}`; log.appendChild(p); });
  log.scrollTop=log.scrollHeight;
  if(msg.yourPet) updateHpBar('pvp-player',msg.yourPet.current_hp,msg.yourPet.max_hp);
  if(msg.opponentPet) updateHpBar('pvp-enemy',msg.opponentPet.current_hp,msg.opponentPet.max_hp);
  if(msg.battleEnd){
    const won=msg.winnerId===currentUserId;
    const p=document.createElement('p'); p.textContent=won?'🎉 你赢了！':'😢 你输了...'; p.style.color=won?'var(--neon-cyan)':'var(--hp-red)'; log.appendChild(p);
    setTimeout(()=>{ showScreen('hub'); refreshTeam(); },3000);
  } else {
    document.getElementById('pvp-skill-grid').querySelectorAll('.skill-btn').forEach(b=>b.disabled=false);
  }
});

ws.on('pvp_opponent_disconnected', ()=>{ toast('对手已断开连接','error'); setTimeout(()=>showScreen('hub'),1500); });

// ===== INIT =====
(async function init(){
  // Load skills map
  try {
    const { skills } = await API.getSkills();
    skills.forEach(s => { SKILLS_MAP[s.id] = s; });
  } catch(e) {}

  if(API.token){
    try { ws.connect(API.token); await loadGame(); } catch(e){ showScreen('auth'); }
  } else { showScreen('auth'); }
})();
