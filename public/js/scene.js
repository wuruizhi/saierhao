// ===== SCENE & SHOP MODULE =====
let currentMapId = null, currentSceneIndex = null, sceneRefreshTimer = null, sceneCountdown = 30;

// Scene background map (planet theme -> image)
const SCENE_BACKGROUNDS = {
  fire: '/img/scenes/fire.png',
  water: '/img/scenes/water.png',
  grass: '/img/scenes/grass.png',
  electric: '/img/scenes/electric.png',
  dark: '/img/scenes/dark.png',
  neutral: '/img/scenes/light-twilight.png'
};

// Planet icons (defined in app.js, accessible globally)

// ===== PLAYER AVATAR STATE =====
let playerAvatar = null;
let playerPos = { x: 50, y: 75 }; // percentage
let playerMoving = false;
let playerMoveAnim = null;
let _lastTouchTime = 0; // Prevent double-trigger on mobile

// Planet detail & scene selection is handled by app.js (goToPlanet → showPlanetDetail)
// Scene back button returns to planet detail
document.getElementById('scene-back').addEventListener('click', () => {
  stopSceneRefresh();
  if (playerMoveAnim) cancelAnimationFrame(playerMoveAnim);
  playerMoving = false;
  if (window.ws) window.ws.send({ type: 'leave_scene' });
  window._sceneReturn = null;
  document.getElementById('btn-return-scene').style.display = 'none';
  if (currentMapId) { if (window.goToPlanet) window.goToPlanet(currentMapId); else showScreen('hub'); }
  else showScreen('hub');
});
document.getElementById('planet-detail-back').addEventListener('click', () => {
  window._sceneReturn = null;
  document.getElementById('btn-return-scene').style.display = 'none';
  showScreen('hub');
});

// ===== SCENE EXPLORE =====
async function enterScene3D(mapId, sceneIndex) {
  currentMapId = mapId; currentSceneIndex = sceneIndex;
  playerPos = { x: 50, y: 80 }; // Reset player position
  // Save return state so nav buttons can bring user back
  window._sceneReturn = { mapId, sceneIndex };
  document.getElementById('btn-return-scene').style.display = 'flex';
  try {
    const data = await API.getScene(mapId, sceneIndex);
    document.getElementById('scene-name').textContent = `${data.scene.icon} ${data.mapName} · ${data.scene.name}`;
    const vp = document.getElementById('scene-viewport');
    
    // Prefer scene-specific art, then fall back to the planet theme.
    const theme = data.mapTheme || 'fire';
    const bgUrl = data.scene?.backgroundImage || SCENE_BACKGROUNDS[theme] || SCENE_BACKGROUNDS.fire;
    vp.style.background = bgUrl
      ? `url("${bgUrl}") center/cover no-repeat`
      : (data.scene?.bgGradient || SCENE_BACKGROUNDS.fire);
    vp.style.position = 'relative';
    
    renderSceneSpawns(vp, data.spawns);
    if (data.scene.npcs) renderSceneNpcs(vp, data.scene.npcs);
    renderSceneNav(mapId, sceneIndex);
    showScreen('scene');
    startSceneRefresh();
    
    // Add click-to-move listener (use touch for mobile)
    vp.onclick = handleViewportClick;
    vp.ontouchstart = handleViewportTouch;
    
    if (window.ws) {
      window.ws.send({ type: 'join_scene', mapId, sceneIndex, x: playerPos.x, y: playerPos.y });
    }
  } catch(e) { toast(e.message,'error'); }
}
let _wanderInterval = null;

function renderSceneSpawns(vp, spawns) {
  vp.querySelectorAll('.scene-pet').forEach(el => el.remove());
  if (_wanderInterval) { clearInterval(_wanderInterval); _wanderInterval = null; }
  
  // Add player avatar first if not exists
  if (!document.getElementById('player-avatar')) {
    createPlayerAvatar(vp);
  }
  
  // Track pet elements for wandering
  const petElements = [];
  
  // Render wild pets with 3D effects
  spawns.forEach(sp => {
    const el = document.createElement('div');
    el.className = `scene-pet scene-pet-3d${sp.isBoss?' scene-boss':''}`;
    el.style.left = sp.x + '%'; el.style.top = sp.y + '%';
    el.dataset.spawnId = sp.spawnId;
    el.dataset.petName = sp.petDef?.name || '???';
    el.dataset.petLevel = sp.level;
    
    // 3D pet container
    const pet3d = document.createElement('div');
    pet3d.className = 'pet-3d-container';
    
    const spriteDiv = document.createElement('div');
    spriteDiv.className = 'scene-pet-sprite';
    renderPetSprite(spriteDiv, sp.petId, sp.isBoss ? 80 : 60);
    pet3d.appendChild(spriteDiv);
    
    // Ground shadow for 3D effect
    const shadow = document.createElement('div');
    shadow.className = 'pet-ground-shadow';
    pet3d.appendChild(shadow);
    
    el.appendChild(pet3d);
    
    const label = document.createElement('div');
    label.className = 'scene-pet-label';
    label.textContent = sp.isBoss
      ? `👑 ${sp.bossName || sp.petDef?.name || '???'} Lv.${sp.level}`
      : `${sp.petDef?.name||'???'} Lv.${sp.level}`;
    el.appendChild(label);
    
    // Click pet to walk toward it, then battle when close
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      walkToPet(parseFloat(el.style.left), parseFloat(el.style.top), sp.spawnId);
    });
    el.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      e.preventDefault();
      walkToPet(parseFloat(el.style.left), parseFloat(el.style.top), sp.spawnId);
    }, { passive: false });
    
    vp.appendChild(el);
    
    // Store for wandering (bosses wander slower)
    petElements.push({
      el, isBoss: sp.isBoss,
      x: sp.x, y: sp.y,
      targetX: sp.x, targetY: sp.y,
      speed: sp.isBoss ? 0.15 : 0.3 + Math.random() * 0.3,
      waitTimer: Math.random() * 80
    });
  });
  
  // Start wander loop: pets move to random targets
  _wanderInterval = setInterval(() => {
    petElements.forEach(p => {
      if (p.waitTimer > 0) {
        p.waitTimer--;
        return;
      }
      // Pick new target if close to current target
      const dist = Math.sqrt((p.x - p.targetX)**2 + (p.y - p.targetY)**2);
      if (dist < 1) {
        // Reached target, wait then pick a new one
        p.waitTimer = 30 + Math.random() * 60;
        const range = p.isBoss ? 12 : 25;
        p.targetX = Math.max(5, Math.min(92, p.x + (Math.random() - 0.5) * range));
        p.targetY = Math.max(15, Math.min(80, p.y + (Math.random() - 0.5) * range * 0.6));
        return;
      }
      // Move toward target
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const angle = Math.atan2(dy, dx);
      p.x += Math.cos(angle) * p.speed;
      p.y += Math.sin(angle) * p.speed;
      p.el.style.left = p.x + '%';
      p.el.style.top = p.y + '%';
      
      // Flip sprite based on direction
      const sprite = p.el.querySelector('.pet-3d-container');
      if (sprite) {
        sprite.style.transform = dx < 0 ? 'scaleX(-1)' : '';
      }
    });
  }, 50);
}

function renderSceneNpcs(vp, npcs) {
  vp.querySelectorAll('.scene-npc-container').forEach(el => el.remove());
  npcs.forEach(npc => {
    const el = document.createElement('div');
    el.className = 'scene-npc-container scene-pet-3d'; 
    el.style.left = npc.x + '%';
    el.style.top = npc.y + '%';
    
    const pet3d = document.createElement('div');
    pet3d.className = 'pet-3d-container';
    
    const spriteDiv = document.createElement('div');
    spriteDiv.className = 'scene-pet-sprite';
    spriteDiv.style.fontSize = '40px';
    spriteDiv.style.display = 'flex';
    spriteDiv.style.alignItems = 'flex-end';
    spriteDiv.style.justifyContent = 'center';
    spriteDiv.textContent = npc.sprite;
    pet3d.appendChild(spriteDiv);
    
    const shadow = document.createElement('div');
    shadow.className = 'pet-ground-shadow';
    pet3d.appendChild(shadow);
    
    el.appendChild(pet3d);
    
    const label = document.createElement('div');
    label.className = 'scene-pet-label';
    label.textContent = npc.name;
    label.style.color = 'var(--neon-cyan)';
    el.appendChild(label);
    
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      walkToNpc(parseFloat(el.style.left), parseFloat(el.style.top), npc);
    });
    el.addEventListener('touchstart', (e) => {
      e.stopPropagation(); e.preventDefault();
      walkToNpc(parseFloat(el.style.left), parseFloat(el.style.top), npc);
    }, { passive: false });
    
    vp.appendChild(el);
  });
}

// ===== SCENE NAVIGATION: Corner arrows inside viewport =====
// Arrows placed at scene edge corners, pointing toward adjacent scenes
const CORNER_POSITIONS = ['bottom-left', 'bottom-right', 'top-left', 'top-right'];

async function renderSceneNav(mapId, currentIdx) {
  const navBar = document.getElementById('scene-nav-bar');
  if (navBar) navBar.innerHTML = '';
  document.querySelectorAll('.scene-edge-arrow, .scene-dots-bar').forEach(el => el.remove());

  try {
    const { maps } = await API.getMaps();
    const map = maps.find(m => m.id === mapId);
    if (!map || !map.scenes || map.scenes.length <= 1) return;

    const vp = document.getElementById('scene-viewport');
    const scenes = map.scenes;
    const total = scenes.length;

    // ---- Corner exit arrows ----
    const exits = [];

    // Previous scene -> bottom-left corner
    if (currentIdx > 0) {
      exits.push({ scene: scenes[currentIdx - 1], idx: currentIdx - 1, pos: 'bottom-left', arrow: '↙' });
    }
    // Next scene -> bottom-right corner
    if (currentIdx < total - 1) {
      exits.push({ scene: scenes[currentIdx + 1], idx: currentIdx + 1, pos: 'bottom-right', arrow: '↘' });
    }
    // Remaining scenes -> top corners
    const remaining = scenes
      .map((s, i) => ({ scene: s, idx: i }))
      .filter(({ idx }) => idx !== currentIdx && idx !== currentIdx - 1 && idx !== currentIdx + 1);
    remaining.forEach(({ scene, idx }, i) => {
      exits.push({
        scene, idx,
        pos: i === 0 ? 'top-left' : 'top-right',
        arrow: i === 0 ? '↖' : '↗'
      });
    });

    exits.forEach(({ scene, idx, pos, arrow }) => {
      createEdgeArrow(vp, pos, arrow, scene, mapId, idx);
    });

    // ---- Scene indicator dots at bottom center ----
    const dotsBar = document.createElement('div');
    dotsBar.className = 'scene-dots-bar';
    scenes.forEach((sc, i) => {
      const dot = document.createElement('div');
      dot.className = `scene-dot${i === currentIdx ? ' active' : ''}`;
      dot.title = sc.name;
      if (i !== currentIdx) {
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          stopSceneRefresh();
          if (_wanderInterval) { clearInterval(_wanderInterval); _wanderInterval = null; }
          if (playerMoveAnim) cancelAnimationFrame(playerMoveAnim);
          playerMoving = false;
          enterScene3D(mapId, i);
        });
        dot.addEventListener('touchstart', (e) => {
          e.stopPropagation(); e.preventDefault();
          stopSceneRefresh();
          if (_wanderInterval) { clearInterval(_wanderInterval); _wanderInterval = null; }
          if (playerMoveAnim) cancelAnimationFrame(playerMoveAnim);
          playerMoving = false;
          enterScene3D(mapId, i);
        }, { passive: false });
      }
      dotsBar.appendChild(dot);
    });
    vp.appendChild(dotsBar);
  } catch (e) {}
}

function createEdgeArrow(vp, position, arrowIcon, scene, mapId, targetIdx) {
  const arrow = document.createElement('div');
  arrow.className = `scene-edge-arrow scene-edge-${position}`;

  arrow.innerHTML = `
    <span class="edge-arrow-icon">${arrowIcon}</span>
    <div class="edge-arrow-body">
      <span class="edge-arrow-hint">前往</span>
      <span class="edge-arrow-label">${scene.icon} ${scene.name}</span>
    </div>`;

  arrow.addEventListener('click', (e) => {
    e.stopPropagation();
    stopSceneRefresh();
    if (_wanderInterval) { clearInterval(_wanderInterval); _wanderInterval = null; }
    if (playerMoveAnim) cancelAnimationFrame(playerMoveAnim);
    playerMoving = false;
    enterScene3D(mapId, targetIdx);
  });
  arrow.addEventListener('touchstart', (e) => {
    e.stopPropagation();
    e.preventDefault();
    stopSceneRefresh();
    if (_wanderInterval) { clearInterval(_wanderInterval); _wanderInterval = null; }
    if (playerMoveAnim) cancelAnimationFrame(playerMoveAnim);
    playerMoving = false;
    enterScene3D(mapId, targetIdx);
  }, { passive: false });

  vp.appendChild(arrow);
}

// ===== PLAYER AVATAR =====
function createPlayerAvatar(vp) {
  playerAvatar = document.createElement('div');
  playerAvatar.id = 'player-avatar';
  playerAvatar.className = 'player-avatar';
  playerAvatar.style.left = playerPos.x + '%';
  playerAvatar.style.top = playerPos.y + '%';
  
  const imgWrapper = document.createElement('div');
  imgWrapper.className = 'player-img-wrapper';
  
  const img = document.createElement('img');
  img.src = '/img/player.png?v=14';
  img.alt = '赛尔';
  img.className = 'player-sprite';
  img.draggable = false;
  imgWrapper.appendChild(img);
  
  if (window.applyEquipsToWrapper && currentEquips) {
    window.applyEquipsToWrapper(imgWrapper, currentEquips);
  }
  
  // Player shadow
  const shadow = document.createElement('div');
  shadow.className = 'player-ground-shadow';
  imgWrapper.appendChild(shadow);
  
  playerAvatar.appendChild(imgWrapper);
  
  // Name tag
  const tag = document.createElement('div');
  tag.className = 'player-name-tag';
  tag.textContent = currentUsername || '我的赛尔';
  playerAvatar.appendChild(tag);
  
  vp.appendChild(playerAvatar);
}

// ===== CLICK TO MOVE (with mobile touch support) =====
function handleViewportTouch(e) {
  e.preventDefault(); // Prevent blue screen / scroll
  _lastTouchTime = Date.now();
  const touch = e.touches[0];
  if (!touch) return;
  const vp = e.currentTarget;
  const rect = vp.getBoundingClientRect();
  const targetX = ((touch.clientX - rect.left) / rect.width) * 100;
  const targetY = ((touch.clientY - rect.top) / rect.height) * 100;
  const clampedX = Math.max(5, Math.min(95, targetX));
  const clampedY = Math.max(25, Math.min(90, targetY));
  movePlayerTo(clampedX, clampedY);
}

function handleViewportClick(e) {
  // Skip if this was triggered right after a touch event (prevent double-fire)
  if (Date.now() - _lastTouchTime < 500) return;
  const vp = e.currentTarget;
  const rect = vp.getBoundingClientRect();
  const targetX = ((e.clientX - rect.left) / rect.width) * 100;
  const targetY = ((e.clientY - rect.top) / rect.height) * 100;
  
  // Clamp to walkable area (10-90% x, 30-90% y)
  const clampedX = Math.max(5, Math.min(95, targetX));
  const clampedY = Math.max(25, Math.min(90, targetY));
  
  movePlayerTo(clampedX, clampedY);
}

function movePlayerTo(targetX, targetY, callback) {
  if (!playerAvatar || playerMoving) return;
  playerMoving = true;
  
  if (window.ws) {
    window.ws.send({ type: 'scene_move', targetX, targetY });
  }

  const startX = playerPos.x;
  const startY = playerPos.y;
  const dx = targetX - startX;
  const dy = targetY - startY;
  const distance = Math.sqrt(dx*dx + dy*dy);
  const duration = Math.min(2000, Math.max(300, distance * 25));
  
  // Flip player based on direction
  const imgWrapper = playerAvatar.querySelector('.player-img-wrapper');
  if (dx < -2) imgWrapper.style.transform = 'scaleX(-1)';
  else if (dx > 2) imgWrapper.style.transform = 'scaleX(1)';
  
  // Add walking animation class
  playerAvatar.classList.add('walking');
  
  // Show click indicator
  showClickIndicator(targetX, targetY);
  
  const startTime = performance.now();
  
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    // Ease out
    const ease = 1 - Math.pow(1 - progress, 3);
    
    playerPos.x = startX + dx * ease;
    playerPos.y = startY + dy * ease;
    playerAvatar.style.left = playerPos.x + '%';
    playerAvatar.style.top = playerPos.y + '%';
    
    // Bobbing while walking
    const bob = Math.sin(elapsed * 0.01) * 3;
    playerAvatar.querySelector('.player-sprite').style.transform = `translateY(${bob}px)`;
    
    if (progress < 1) {
      playerMoveAnim = requestAnimationFrame(step);
    } else {
      playerMoving = false;
      playerAvatar.classList.remove('walking');
      playerAvatar.querySelector('.player-sprite').style.transform = '';
      if (callback) callback();
    }
  }
  
  if (playerMoveAnim) cancelAnimationFrame(playerMoveAnim);
  playerMoveAnim = requestAnimationFrame(step);
}

function showClickIndicator(x, y) {
  const vp = document.getElementById('scene-viewport');
  const indicator = document.createElement('div');
  indicator.className = 'click-indicator';
  indicator.style.left = x + '%';
  indicator.style.top = y + '%';
  vp.appendChild(indicator);
  setTimeout(() => indicator.remove(), 600);
}

// Walk to pet then trigger battle
function walkToPet(petX, petY, spawnId) {
  // Walk to position near the pet
  const offsetX = petX + (playerPos.x < petX ? -5 : 5);
  const offsetY = petY + 3;
  movePlayerTo(offsetX, offsetY, () => {
    // Check if close enough to battle
    const dist = Math.sqrt((playerPos.x-petX)**2 + (playerPos.y-petY)**2);
    if (dist < 12) {
      startSceneBattle(spawnId);
    }
  });
}

// Walk to NPC then interact
function walkToNpc(npcX, npcY, npc) {
  const offsetX = npcX + (playerPos.x < npcX ? -5 : 5);
  const offsetY = npcY + 3;
  movePlayerTo(offsetX, offsetY, () => {
    const dist = Math.sqrt((playerPos.x-npcX)**2 + (playerPos.y-npcY)**2);
    if (dist < 15) {
      interactWithNpc(npc);
    }
  });
}

async function interactWithNpc(npc) {
  try {
    const res = await API.getStoryQuests();
    const activeQuest = res.quests.find(q => q.status === 'active' && q.planet_id == currentMapId);
    if (activeQuest) {
      const pData = res.storyData[currentMapId];
      const stepDef = pData.steps.find(s => s.step === activeQuest.quest_step);
      if (stepDef && stepDef.type === 'npc_talk' && stepDef.targetId === npc.id) {
         let q = [];
         (stepDef.startDialogues || []).forEach(d => {
           q.push({
             name: d.character,
             text: d.text,
             spriteUrl: d.avatar === 'player' ? '/img/player.png?v=14' : null
           });
         });
         let idx = 0;
         const playNext = () => {
           if (idx < q.length) {
             const d = q[idx++];
             showDialogue(d.name, d.text, d.spriteUrl, playNext);
           } else {
             API.advanceStoryQuest(currentMapId).then(() => {
               toast('剧情已推进！');
               if (window.loadStoryQuests) window.loadStoryQuests();
               if (stepDef.endDialogues && stepDef.endDialogues.length > 0) {
                 let eq = [];
                 stepDef.endDialogues.forEach(d => eq.push({ name: d.character, text: d.text, spriteUrl: d.avatar === 'player' ? '/img/player.png?v=14' : null }));
                 let eidx = 0;
                 const playEndNext = () => {
                   if (eidx < eq.length) {
                     const d = eq[eidx++];
                     showDialogue(d.name, d.text, d.spriteUrl, playEndNext);
                   }
                 };
                 playEndNext();
               }
             }).catch(e => toast(e.message, 'error'));
           }
         };
         if (q.length > 0) {
           playNext();
         } else {
           API.advanceStoryQuest(currentMapId).then(() => {
               toast('剧情已推进！');
               if (window.loadStoryQuests) window.loadStoryQuests();
           });
         }
         return;
      }
    }
  } catch(e) { console.error(e); }
  
  showDialogue(npc.name, npc.defaultText || "你好，小赛尔！");
}

async function startSceneBattle(spawnId) {
  stopSceneRefresh();
  if (window.ws) window.ws.send({ type: 'leave_scene' });
  try {
    const data = await API.explore(currentMapId, currentSceneIndex, spawnId);
    currentBattleId = data.battleId;
    window._battleSceneReturn = { mapId: currentMapId, sceneIndex: currentSceneIndex };
    showScreen('battle');
    setupBattle(data.playerPet, data.wildPet);
    if (data.wildPet.isBoss) {
      const log = document.getElementById('battle-log');
      log.innerHTML = `<p style="color:#ffd700;font-weight:bold">👑 Boss ${data.wildPet.bossName} 出现了！</p>`;
    }
    document.getElementById('btn-capture').style.display = '';
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
        if (data.scene.npcs) renderSceneNpcs(document.getElementById('scene-viewport'), data.scene.npcs);
      } catch(e) {}
    }
  }, 1000);
}
function stopSceneRefresh() { if (sceneRefreshTimer) { clearInterval(sceneRefreshTimer); sceneRefreshTimer = null; } }


// ===== SHOP (handled by app.js) =====

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
  if (window.loadStoryQuests) window.loadStoryQuests();
  if (window._battleSceneReturn) {
    const {mapId, sceneIndex} = window._battleSceneReturn;
    window._battleSceneReturn = null;
    enterScene3D(mapId, sceneIndex);
  } else {
    window._sceneReturn = null;
    document.getElementById('btn-return-scene').style.display = 'none';
    showScreen('hub'); loadPlanets(); refreshTeam();
  }
}

// Return-to-scene button in persistent top bar
document.getElementById('btn-return-scene').addEventListener('click', () => {
  if (window._sceneReturn) {
    const {mapId, sceneIndex} = window._sceneReturn;
    enterScene3D(mapId, sceneIndex);
  }
});

// ===== CANDY & BOOSTER USAGE =====
window.showCandyPanel = async function(petInstanceId) {
  const panel = document.getElementById('candy-panel');
  if (!panel) return;
  panel.style.display = 'block';
  panel.innerHTML = '<p style="color:var(--text-dim)">加载中...</p>';
  try {
    const inv = await API.inventory();
    const candies = inv.items.filter(i => i.item_id.startsWith('candy_'));
    const boosters = inv.items.filter(i => i.item_id.startsWith('booster_'));
    const specials = inv.items.filter(i => ['level_boost','evolve_stone','reset_stats'].includes(i.item_id));

    panel.innerHTML = '';

    // Candies section
    if (candies.length > 0) {
      const candyTitle = document.createElement('h4');
      candyTitle.style.cssText = 'margin-bottom:8px;font-size:14px';
      candyTitle.textContent = '🍬 经验糖果';
      panel.appendChild(candyTitle);
      candies.forEach(c => {
        const btn = document.createElement('div');
        btn.className = 'candy-option';
        btn.innerHTML = `<span>${c.def.icon} ${c.def.name} <small style="color:var(--text-dim)">(+${c.def.exp}exp)</small></span><span>×${c.quantity}</span>`;
        btn.addEventListener('click', () => useCandy(petInstanceId, c.item_id, c.def.name));
        panel.appendChild(btn);
      });
    }

    // Boosters section
    if (boosters.length > 0) {
      const boosterTitle = document.createElement('h4');
      boosterTitle.style.cssText = 'margin:12px 0 8px;font-size:14px';
      boosterTitle.textContent = '💪 强化剂';
      panel.appendChild(boosterTitle);
      boosters.forEach(b => {
        const btn = document.createElement('div');
        btn.className = 'candy-option';
        btn.innerHTML = `<span>${b.def.icon} ${b.def.name} <small style="color:var(--text-dim)">${b.def.description}</small></span><span>×${b.quantity}</span>`;
        btn.addEventListener('click', () => useBooster(petInstanceId, b.item_id, b.def.name));
        panel.appendChild(btn);
      });
    }

    // Special items section
    if (specials.length > 0) {
      const spTitle = document.createElement('h4');
      spTitle.style.cssText = 'margin:12px 0 8px;font-size:14px';
      spTitle.textContent = '📦 特殊道具';
      panel.appendChild(spTitle);
      specials.forEach(s => {
        const btn = document.createElement('div');
        btn.className = 'candy-option';
        btn.innerHTML = `<span>${s.def.icon} ${s.def.name} <small style="color:var(--text-dim)">${s.def.description}</small></span><span>×${s.quantity}</span>`;
        btn.addEventListener('click', () => useSpecialItem(petInstanceId, s.item_id, s.def.name));
        panel.appendChild(btn);
      });
    }

    if (candies.length === 0 && boosters.length === 0 && specials.length === 0) {
      panel.innerHTML = '<p style="color:var(--text-dim);font-size:13px">没有可用道具，去商店购买吧！</p>';
    }
  } catch(e) { panel.innerHTML = `<p style="color:var(--hp-red)">${e.message}</p>`; }
};

async function useCandy(petInstanceId, candyId, candyName) {
  try {
    const r = await API.useCandy(petInstanceId, candyId, 1);
    toast(r.message);
    document.getElementById('modal-pet-detail').classList.remove('active');
    refreshTeam();
    if (r.levelResult?.evolved) {
      setTimeout(() => showEvolution(r.levelResult), 500);
    }
  } catch(e) { toast(e.message, 'error'); }
}

async function useBooster(petInstanceId, boosterId, boosterName) {
  try {
    const r = await API.useBooster(petInstanceId, boosterId);
    toast(r.message);
    document.getElementById('modal-pet-detail').classList.remove('active');
    refreshTeam();
  } catch(e) { toast(e.message, 'error'); }
}

async function useSpecialItem(petInstanceId, itemId, itemName) {
  try {
    const r = await API.useSpecialItem(petInstanceId, itemId);
    toast(r.message);
    document.getElementById('modal-pet-detail').classList.remove('active');
    refreshTeam();
    if (r.levelResult?.evolved) {
      setTimeout(() => showEvolution(r.levelResult), 500);
    }
  } catch(e) { toast(e.message, 'error'); }
}

window.returnFromBattle = returnFromBattle;
window.loadEssences = loadEssences;
window.enterScene3D = enterScene3D;

// ===== MMO SCENE SYNCHRONIZATION =====
let otherPlayers = new Map();

function createOtherPlayerAvatar(playerInfo) {
  const vp = document.getElementById('scene-viewport');
  if (!vp) return null;
  const avatar = document.createElement('div');
  avatar.id = `other-player-${playerInfo.userId}`;
  avatar.className = 'other-player-avatar';
  avatar.style.left = playerInfo.x + '%';
  avatar.style.top = playerInfo.y + '%';
  
  const imgWrapper = document.createElement('div');
  imgWrapper.className = 'player-img-wrapper';
  
  const img = document.createElement('img');
  img.src = '/img/player.png?v=14';
  img.className = 'player-sprite';
  img.draggable = false;
  imgWrapper.appendChild(img);

  if (window.applyEquipsToWrapper && playerInfo.equips) {
    window.applyEquipsToWrapper(imgWrapper, playerInfo.equips);
  }
  
  const tag = document.createElement('div');
  tag.className = 'player-name-tag';
  tag.textContent = playerInfo.username;
  
  avatar.appendChild(imgWrapper);
  avatar.appendChild(tag);
  vp.appendChild(avatar);
  
  return { el: avatar, x: playerInfo.x, y: playerInfo.y, animId: null };
}

if (window.ws) {
  window.ws.on('scene_players', (msg) => {
    otherPlayers.forEach(p => p.el.remove());
    otherPlayers.clear();
    msg.players.forEach(p => {
      const avatar = createOtherPlayerAvatar(p);
      if (avatar) {
        otherPlayers.set(p.userId, avatar);
        if (p.targetX !== p.x || p.targetY !== p.y) moveOtherPlayer(p.userId, p.targetX, p.targetY);
      }
    });
  });

  window.ws.on('scene_player_joined', (msg) => {
    if (otherPlayers.has(msg.userId)) otherPlayers.get(msg.userId).el.remove();
    const avatar = createOtherPlayerAvatar(msg);
    if (avatar) otherPlayers.set(msg.userId, avatar);
  });

  window.ws.on('scene_player_left', (msg) => {
    if (otherPlayers.has(msg.userId)) {
      const p = otherPlayers.get(msg.userId);
      if (p.animId) cancelAnimationFrame(p.animId);
      p.el.remove();
      otherPlayers.delete(msg.userId);
    }
  });

  window.ws.on('scene_player_moved', (msg) => {
    moveOtherPlayer(msg.userId, msg.targetX, msg.targetY);
  });
}

function moveOtherPlayer(userId, targetX, targetY) {
  const p = otherPlayers.get(userId);
  if (!p) return;
  if (p.animId) cancelAnimationFrame(p.animId);
  const startX = p.x; const startY = p.y;
  const dx = targetX - startX; const dy = targetY - startY;
  const distance = Math.sqrt(dx*dx + dy*dy);
  const duration = Math.min(2000, Math.max(300, distance * 25));
  
  const imgWrapper = p.el.querySelector('.player-img-wrapper');
  if (dx < -2) imgWrapper.style.transform = 'scaleX(-1)';
  else if (dx > 2) imgWrapper.style.transform = 'scaleX(1)';
  p.el.classList.add('walking');
  const startTime = performance.now();
  
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const ease = 1 - Math.pow(1 - progress, 3);
    p.x = startX + dx * ease; p.y = startY + dy * ease;
    p.el.style.left = p.x + '%'; p.el.style.top = p.y + '%';
    const bob = Math.sin(elapsed * 0.01) * 3;
    p.el.querySelector('.player-sprite').style.transform = `translateY(${bob}px)`;
    if (progress < 1) {
      p.animId = requestAnimationFrame(step);
    } else {
      p.el.classList.remove('walking');
      p.el.querySelector('.player-sprite').style.transform = '';
      p.animId = null;
    }
  }
  p.animId = requestAnimationFrame(step);
}

window.showSceneChatBubble = function(userId, text, myUserId) {
  let targetEl = null;
  if (userId === myUserId) {
    targetEl = document.getElementById('player-avatar');
  } else if (otherPlayers.has(userId)) {
    targetEl = otherPlayers.get(userId).el;
  }
  
  if (!targetEl) return;
  
  // Remove existing bubble if any
  const existing = targetEl.querySelector('.chat-bubble');
  if (existing) existing.remove();
  
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.innerHTML = window.escapeHtml ? window.escapeHtml(text) : text;
  
  targetEl.appendChild(bubble);
  
  setTimeout(() => {
    if (bubble.parentElement) bubble.remove();
  }, 4000);
};
