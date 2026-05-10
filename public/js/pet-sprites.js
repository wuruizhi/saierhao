// Pet sprite renderer with dynamic animations
// Renders PNG image + CSS animations + Canvas particle effects

const PET_ELEMENT_COLORS = {
  fire: { main: '#ff4757', glow: 'rgba(255,71,87,0.4)', particles: ['#ff6b6b','#ffa502','#ff4757','#ffbe76'] },
  water: { main: '#3b82f6', glow: 'rgba(59,130,246,0.4)', particles: ['#74b9ff','#0984e3','#81ecec','#dfe6e9'] },
  grass: { main: '#22c55e', glow: 'rgba(34,197,94,0.4)', particles: ['#55efc4','#00b894','#81ecec','#a3d977'] },
  electric: { main: '#facc15', glow: 'rgba(250,204,21,0.4)', particles: ['#ffeaa7','#fdcb6e','#f9ca24','#fff9c4'] },
  light: { main: '#fbbf24', glow: 'rgba(251,191,36,0.4)', particles: ['#fffde7','#fff9c4','#ffeaa7','#ffffff'] },
  dark: { main: '#7c3aed', glow: 'rgba(124,58,237,0.4)', particles: ['#a29bfe','#6c5ce7','#5f27cd','#341f97'] },
  normal: { main: '#94a3b8', glow: 'rgba(148,163,184,0.3)', particles: ['#dfe6e9','#b2bec3','#636e72','#ffffff'] }
};

// Get pet type from pets data (cached)
const PET_TYPE_MAP = {
  1:'fire',2:'fire',3:'fire',
  4:'water',5:'water',6:'water',
  7:'grass',8:'grass',9:'grass',
  10:'electric',11:'light',12:'dark',
  13:'electric',14:'electric',
  15:'light',16:'light',
  17:'dark',18:'dark'
};

function renderPetSprite(container, petId, size) {
  if (!container) return;
  const s = size || 80;
  container.innerHTML = '';
  container.style.position = 'relative';
  container.style.width = s + 'px';
  container.style.height = s + 'px';

  const type = PET_TYPE_MAP[petId] || 'normal';
  const colors = PET_ELEMENT_COLORS[type];

  // Wrapper with breathing + float animation
  const wrapper = document.createElement('div');
  wrapper.className = 'pet-anim-wrapper';
  wrapper.style.cssText = `width:${s}px;height:${s}px;position:relative;`;

  // Glow layer
  const glow = document.createElement('div');
  glow.className = 'pet-glow';
  glow.style.cssText = `
    position:absolute;inset:-${s*0.15}px;border-radius:50%;
    background:radial-gradient(circle,${colors.glow},transparent 70%);
    animation:pet-glow-pulse 2s ease-in-out infinite;
    pointer-events:none;z-index:0;
  `;
  wrapper.appendChild(glow);

  // Image
  const img = document.createElement('img');
  img.src = `/img/pets/${petId}.png`;
  img.alt = `Pet ${petId}`;
  img.style.cssText = `
    width:${s}px;height:${s}px;object-fit:contain;
    position:relative;z-index:1;
    animation:pet-breathe 3s ease-in-out infinite, pet-float ${2.5+Math.random()}s ease-in-out infinite;
    filter:drop-shadow(0 0 ${s*0.08}px ${colors.main});
  `;
  img.draggable = false;
  img.onerror = function() {
    wrapper.innerHTML = `<div style="width:${s}px;height:${s}px;display:flex;align-items:center;justify-content:center;font-size:${s*0.5}px">❓</div>`;
  };
  wrapper.appendChild(img);

  // Particle canvas
  if (s >= 56) {
    const canvas = document.createElement('canvas');
    const canvasSize = Math.floor(s * 1.4);
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    canvas.style.cssText = `
      position:absolute;top:${-(canvasSize-s)/2}px;left:${-(canvasSize-s)/2}px;
      width:${canvasSize}px;height:${canvasSize}px;
      pointer-events:none;z-index:2;
    `;
    wrapper.appendChild(canvas);
    startParticles(canvas, type, colors);
  }

  container.appendChild(wrapper);
}

// Particle system per element type
function startParticles(canvas, type, colors) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const cx = w/2, cy = h/2;
  const particles = [];
  const maxP = type === 'normal' ? 4 : 8;

  function createParticle() {
    const angle = Math.random() * Math.PI * 2;
    const dist = w * 0.25 + Math.random() * w * 0.15;
    const color = colors.particles[Math.floor(Math.random() * colors.particles.length)];
    const base = {
      x: cx + Math.cos(angle) * dist * 0.6,
      y: cy + Math.sin(angle) * dist * 0.6,
      size: 1 + Math.random() * 3,
      life: 0,
      maxLife: 40 + Math.random() * 60,
      color,
      angle,
      speed: 0.3 + Math.random() * 0.8,
      orbit: dist
    };

    switch(type) {
      case 'fire':
        base.y = cy + h*0.15;
        base.vy = -(0.5 + Math.random() * 1.5);
        base.vx = (Math.random()-0.5) * 0.8;
        base.size = 1.5 + Math.random() * 3;
        break;
      case 'water':
        base.orbitSpeed = 0.02 + Math.random() * 0.02;
        base.orbitAngle = angle;
        base.size = 1 + Math.random() * 2.5;
        break;
      case 'grass':
        base.vy = 0.3 + Math.random() * 0.5;
        base.vx = (Math.random()-0.5) * 0.5;
        base.rot = Math.random() * Math.PI * 2;
        base.rotSpeed = (Math.random()-0.5) * 0.1;
        base.size = 2 + Math.random() * 2;
        break;
      case 'electric':
        base.flash = true;
        base.flashInterval = 5 + Math.floor(Math.random()*10);
        base.size = 1 + Math.random() * 2;
        break;
      case 'light':
        base.twinkle = true;
        base.twinkleSpeed = 0.05 + Math.random() * 0.1;
        base.size = 1 + Math.random() * 2.5;
        break;
      case 'dark':
        base.orbitSpeed = 0.015 + Math.random() * 0.015;
        base.orbitAngle = angle;
        base.fadeDir = 1;
        base.size = 1.5 + Math.random() * 3;
        break;
    }
    return base;
  }

  // Pre-fill some particles
  for (let i = 0; i < maxP; i++) {
    const p = createParticle();
    p.life = Math.floor(Math.random() * p.maxLife);
    particles.push(p);
  }

  let animId;
  function animate() {
    ctx.clearRect(0, 0, w, h);

    // Spawn new particles
    while (particles.length < maxP) {
      particles.push(createParticle());
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life++;
      if (p.life > p.maxLife) { particles.splice(i, 1); continue; }

      const lifeRatio = p.life / p.maxLife;
      const alpha = lifeRatio < 0.2 ? lifeRatio/0.2 : lifeRatio > 0.7 ? (1-lifeRatio)/0.3 : 1;

      ctx.globalAlpha = alpha * 0.7;

      switch(type) {
        case 'fire':
          p.x += p.vx;
          p.y += p.vy;
          p.vx += (Math.random()-0.5) * 0.2;
          const fireSize = p.size * (1 - lifeRatio * 0.5);
          const grad = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,fireSize*2);
          grad.addColorStop(0, p.color);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.fillRect(p.x-fireSize*2, p.y-fireSize*2, fireSize*4, fireSize*4);
          break;

        case 'water':
          p.orbitAngle += p.orbitSpeed;
          p.x = cx + Math.cos(p.orbitAngle) * p.orbit * 0.5;
          p.y = cy + Math.sin(p.orbitAngle) * p.orbit * 0.35;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
          ctx.fill();
          break;

        case 'grass':
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.rotSpeed;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          // Leaf shape
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size*0.5, 0, 0, Math.PI*2);
          ctx.fill();
          ctx.restore();
          break;

        case 'electric':
          if (p.flash && p.life % p.flashInterval < 2) {
            ctx.globalAlpha = 0.9;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            let lx = p.x, ly = p.y;
            ctx.moveTo(lx, ly);
            for (let j = 0; j < 3; j++) {
              lx += (Math.random()-0.5) * 12;
              ly += (Math.random()-0.5) * 12;
              ctx.lineTo(lx, ly);
            }
            ctx.stroke();
          }
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x + (Math.random()-0.5)*2, p.y + (Math.random()-0.5)*2, p.size*0.5, 0, Math.PI*2);
          ctx.fill();
          break;

        case 'light':
          const twinkleAlpha = p.twinkle ? (0.5 + Math.sin(p.life * p.twinkleSpeed) * 0.5) : 1;
          ctx.globalAlpha = alpha * twinkleAlpha * 0.8;
          const starSize = p.size * (0.8 + Math.sin(p.life * 0.1) * 0.3);
          drawStar(ctx, p.x, p.y, starSize, p.color);
          break;

        case 'dark':
          p.orbitAngle += p.orbitSpeed;
          p.x = cx + Math.cos(p.orbitAngle) * p.orbit * 0.45;
          p.y = cy + Math.sin(p.orbitAngle) * p.orbit * 0.35;
          const dg = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size*2.5);
          dg.addColorStop(0, p.color);
          dg.addColorStop(1, 'transparent');
          ctx.fillStyle = dg;
          ctx.fillRect(p.x-p.size*2.5, p.y-p.size*2.5, p.size*5, p.size*5);
          break;

        default:
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
          ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(animate);
  }

  // Only animate when visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!animId) animate();
      } else {
        if (animId) { cancelAnimationFrame(animId); animId = null; }
      }
    });
  });
  observer.observe(canvas);
  animate();
}

function drawStar(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 - Math.PI/2;
    const ox = Math.cos(angle) * size;
    const oy = Math.sin(angle) * size;
    if (i === 0) ctx.moveTo(x+ox, y+oy);
    else ctx.lineTo(x+ox, y+oy);
    const midAngle = angle + Math.PI/4;
    ctx.lineTo(x + Math.cos(midAngle)*size*0.4, y + Math.sin(midAngle)*size*0.4);
  }
  ctx.closePath();
  ctx.fill();
}
