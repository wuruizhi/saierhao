// SVG Pet Sprite Generator
const PET_SPRITES = {
  1: (s) => `<svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="fg1"><stop offset="0%" stop-color="#ff6b4a"/><stop offset="100%" stop-color="#d63031"/></radialGradient>
    <filter id="glow1"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <ellipse cx="${s/2}" cy="${s*.82}" rx="${s*.25}" ry="${s*.06}" fill="rgba(0,0,0,.3)"/>
    <circle cx="${s/2}" cy="${s*.55}" r="${s*.22}" fill="url(#fg1)"/>
    <circle cx="${s/2}" cy="${s*.38}" r="${s*.2}" fill="url(#fg1)"/>
    <circle cx="${s*.42}" cy="${s*.34}" r="${s*.05}" fill="white"/><circle cx="${s*.42}" cy="${s*.34}" r="${s*.03}" fill="#222"/>
    <circle cx="${s*.58}" cy="${s*.34}" r="${s*.05}" fill="white"/><circle cx="${s*.58}" cy="${s*.34}" r="${s*.03}" fill="#222"/>
    <path d="M${s*.44} ${s*.42} Q${s*.5} ${s*.46} ${s*.56} ${s*.42}" stroke="#222" stroke-width="2" fill="none"/>
    <circle cx="${s*.38}" cy="${s*.28}" r="${s*.04}" fill="#ffcc00"/>
    <circle cx="${s*.62}" cy="${s*.28}" r="${s*.04}" fill="#ffcc00"/>
    <path d="M${s*.65} ${s*.65} Q${s*.78} ${s*.45} ${s*.72} ${s*.35}" stroke="#ff4500" stroke-width="4" fill="none" filter="url(#glow1)"/>
    <ellipse cx="${s*.7}" cy="${s*.32}" rx="${s*.04}" ry="${s*.05}" fill="#ffcc00" filter="url(#glow1)"/>
    </svg>`,
  2: (s) => `<svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="fg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff4500"/><stop offset="100%" stop-color="#c0392b"/></linearGradient>
    <filter id="glow2"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <ellipse cx="${s/2}" cy="${s*.85}" rx="${s*.2}" ry="${s*.05}" fill="rgba(0,0,0,.3)"/>
    <rect x="${s*.32}" y="${s*.4}" width="${s*.36}" height="${s*.4}" rx="12" fill="url(#fg2)"/>
    <circle cx="${s/2}" cy="${s*.35}" r="${s*.18}" fill="url(#fg2)"/>
    <circle cx="${s*.44}" cy="${s*.32}" r="${s*.04}" fill="white"/><circle cx="${s*.44}" cy="${s*.32}" r="${s*.025}" fill="#222"/>
    <circle cx="${s*.56}" cy="${s*.32}" r="${s*.04}" fill="white"/><circle cx="${s*.56}" cy="${s*.32}" r="${s*.025}" fill="#222"/>
    <path d="M${s*.45} ${s*.4} Q${s*.5} ${s*.43} ${s*.55} ${s*.4}" stroke="#222" stroke-width="2" fill="none"/>
    <path d="M${s*.3} ${s*.55} L${s*.2} ${s*.5}" stroke="#c0392b" stroke-width="8" stroke-linecap="round"/>
    <path d="M${s*.7} ${s*.55} L${s*.8} ${s*.5}" stroke="#c0392b" stroke-width="8" stroke-linecap="round"/>
    <path d="M${s*.4} ${s*.2} Q${s*.5} ${s*.05} ${s*.6} ${s*.2}" fill="#ff6600" filter="url(#glow2)"/>
    <path d="M${s*.45} ${s*.18} Q${s*.5} ${s*.08} ${s*.55} ${s*.18}" fill="#ffcc00" filter="url(#glow2)"/>
    </svg>`,
  3: (s) => `<svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="fg3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff6600"/><stop offset="100%" stop-color="#8b0000"/></linearGradient>
    <filter id="glow3"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <ellipse cx="${s/2}" cy="${s*.88}" rx="${s*.28}" ry="${s*.06}" fill="rgba(0,0,0,.4)"/>
    <rect x="${s*.25}" y="${s*.35}" width="${s*.5}" height="${s*.48}" rx="16" fill="url(#fg3)"/>
    <circle cx="${s/2}" cy="${s*.3}" r="${s*.2}" fill="url(#fg3)"/>
    <circle cx="${s*.43}" cy="${s*.28}" r="${s*.04}" fill="#ffcc00"/><circle cx="${s*.43}" cy="${s*.28}" r="${s*.02}" fill="#222"/>
    <circle cx="${s*.57}" cy="${s*.28}" r="${s*.04}" fill="#ffcc00"/><circle cx="${s*.57}" cy="${s*.28}" r="${s*.02}" fill="#222"/>
    <path d="M${s*.43} ${s*.35} Q${s*.5} ${s*.38} ${s*.57} ${s*.35}" stroke="#222" stroke-width="2.5" fill="none"/>
    <path d="M${s*.22}" y="${s*.5} L${s*.1} ${s*.4}" stroke="#8b0000" stroke-width="12" stroke-linecap="round"/>
    <path d="M${s*.78}" y="${s*.5} L${s*.9} ${s*.4}" stroke="#8b0000" stroke-width="12" stroke-linecap="round"/>
    <path d="M${s*.35} ${s*.15} Q${s*.5} ${s*-.05} ${s*.65} ${s*.15}" fill="#ff4500" filter="url(#glow3)"/>
    <path d="M${s*.38} ${s*.12} Q${s*.5} ${s*.02} ${s*.62} ${s*.12}" fill="#ffcc00" filter="url(#glow3)"/>
    <rect x="${s*.35}" y="${s*.1}" width="${s*.3}" height="${s*.06}" rx="3" fill="#ffd700" opacity=".8"/>
    </svg>`,
  4: (s) => `<svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="fg4"><stop offset="0%" stop-color="#74b9ff"/><stop offset="100%" stop-color="#0984e3"/></radialGradient></defs>
    <ellipse cx="${s/2}" cy="${s*.82}" rx="${s*.22}" ry="${s*.06}" fill="rgba(0,0,0,.3)"/>
    <ellipse cx="${s/2}" cy="${s*.6}" rx="${s*.24}" ry="${s*.2}" fill="url(#fg4)"/>
    <circle cx="${s/2}" cy="${s*.4}" r="${s*.18}" fill="url(#fg4)"/>
    <circle cx="${s*.43}" cy="${s*.36}" r="${s*.055}" fill="white"/><circle cx="${s*.43}" cy="${s*.36}" r="${s*.035}" fill="#222"/>
    <circle cx="${s*.57}" cy="${s*.36}" r="${s*.055}" fill="white"/><circle cx="${s*.57}" cy="${s*.36}" r="${s*.035}" fill="#222"/>
    <ellipse cx="${s/2}" cy="${s*.46}" rx="${s*.06}" ry="${s*.03}" fill="#ff6b81" opacity=".5"/>
    <circle cx="${s*.36}" cy="${s*.42}" r="${s*.025}" fill="#ff6b81" opacity=".4"/>
    <circle cx="${s*.64}" cy="${s*.42}" r="${s*.025}" fill="#ff6b81" opacity=".4"/>
    <circle cx="${s*.5}" cy="${s*.25}" r="${s*.06}" fill="#00cec9" opacity=".6"/>
    </svg>`,
  5: (s) => `<svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="fg5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0984e3"/><stop offset="100%" stop-color="#0652DD"/></linearGradient></defs>
    <ellipse cx="${s/2}" cy="${s*.85}" rx="${s*.2}" ry="${s*.05}" fill="rgba(0,0,0,.3)"/>
    <ellipse cx="${s/2}" cy="${s*.58}" rx="${s*.22}" ry="${s*.24}" fill="url(#fg5)"/>
    <circle cx="${s/2}" cy="${s*.35}" r="${s*.17}" fill="url(#fg5)"/>
    <circle cx="${s*.43}" cy="${s*.32}" r="${s*.04}" fill="white"/><circle cx="${s*.43}" cy="${s*.32}" r="${s*.025}" fill="#222"/>
    <circle cx="${s*.57}" cy="${s*.32}" r="${s*.04}" fill="white"/><circle cx="${s*.57}" cy="${s*.32}" r="${s*.025}" fill="#222"/>
    <path d="M${s*.46} ${s*.39} Q${s*.5} ${s*.41} ${s*.54} ${s*.39}" stroke="#222" stroke-width="2" fill="none"/>
    <rect x="${s*.38}" y="${s*.22}" width="${s*.24}" height="${s*.04}" rx="2" fill="#00cec9"/>
    </svg>`,
  6: (s) => `<svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="fg6" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0652DD"/><stop offset="100%" stop-color="#1B1464"/></linearGradient>
    <filter id="glow6"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <ellipse cx="${s/2}" cy="${s*.88}" rx="${s*.25}" ry="${s*.06}" fill="rgba(0,0,0,.4)"/>
    <ellipse cx="${s/2}" cy="${s*.58}" rx="${s*.28}" ry="${s*.28}" fill="url(#fg6)"/>
    <circle cx="${s/2}" cy="${s*.32}" r="${s*.19}" fill="url(#fg6)"/>
    <circle cx="${s*.42}" cy="${s*.3}" r="${s*.04}" fill="#00cec9"/><circle cx="${s*.42}" cy="${s*.3}" r="${s*.02}" fill="#222"/>
    <circle cx="${s*.58}" cy="${s*.3}" r="${s*.04}" fill="#00cec9"/><circle cx="${s*.58}" cy="${s*.3}" r="${s*.02}" fill="#222"/>
    <line x1="${s*.7}" y1="${s*.4}" x2="${s*.85}" y2="${s*.2}" stroke="#00cec9" stroke-width="4" filter="url(#glow6)"/>
    <polygon points="${s*.83},${s*.15} ${s*.88},${s*.22} ${s*.78},${s*.22}" fill="#00cec9"/>
    <rect x="${s*.38}" y="${s*.2}" width="${s*.24}" height="${s*.05}" rx="2" fill="#ffd700"/>
    </svg>`,
  7: (s) => `<svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="fg7"><stop offset="0%" stop-color="#55efc4"/><stop offset="100%" stop-color="#00b894"/></radialGradient></defs>
    <ellipse cx="${s/2}" cy="${s*.82}" rx="${s*.2}" ry="${s*.05}" fill="rgba(0,0,0,.3)"/>
    <circle cx="${s/2}" cy="${s*.58}" r="${s*.2}" fill="url(#fg7)"/>
    <circle cx="${s/2}" cy="${s*.4}" r="${s*.17}" fill="url(#fg7)"/>
    <circle cx="${s*.43}" cy="${s*.37}" r="${s*.045}" fill="white"/><circle cx="${s*.43}" cy="${s*.37}" r="${s*.03}" fill="#222"/>
    <circle cx="${s*.57}" cy="${s*.37}" r="${s*.045}" fill="white"/><circle cx="${s*.57}" cy="${s*.37}" r="${s*.03}" fill="#222"/>
    <path d="M${s*.46} ${s*.44} Q${s*.5} ${s*.46} ${s*.54} ${s*.44}" stroke="#222" stroke-width="1.5" fill="none"/>
    <ellipse cx="${s/2}" cy="${s*.24}" rx="${s*.12}" ry="${s*.08}" fill="#2ecc71"/>
    <ellipse cx="${s/2}" cy="${s*.22}" rx="${s*.06}" ry="${s*.04}" fill="#27ae60"/>
    </svg>`,
  8: (s) => `<svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="fg8" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#00b894"/><stop offset="100%" stop-color="#006c54"/></linearGradient></defs>
    <ellipse cx="${s/2}" cy="${s*.86}" rx="${s*.22}" ry="${s*.05}" fill="rgba(0,0,0,.3)"/>
    <rect x="${s*.3}" y="${s*.4}" width="${s*.4}" height="${s*.42}" rx="14" fill="url(#fg8)"/>
    <circle cx="${s/2}" cy="${s*.35}" r="${s*.18}" fill="url(#fg8)"/>
    <circle cx="${s*.43}" cy="${s*.32}" r="${s*.04}" fill="white"/><circle cx="${s*.43}" cy="${s*.32}" r="${s*.025}" fill="#222"/>
    <circle cx="${s*.57}" cy="${s*.32}" r="${s*.04}" fill="white"/><circle cx="${s*.57}" cy="${s*.32}" r="${s*.025}" fill="#222"/>
    <path d="M${s*.35} ${s*.18} L${s*.28} ${s*.08}" stroke="#2ecc71" stroke-width="6" stroke-linecap="round"/>
    <path d="M${s*.65} ${s*.18} L${s*.72} ${s*.08}" stroke="#2ecc71" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="${s*.25}" cy="${s*.06}" rx="${s*.06}" ry="${s*.04}" fill="#27ae60"/>
    <ellipse cx="${s*.75}" cy="${s*.06}" rx="${s*.06}" ry="${s*.04}" fill="#27ae60"/>
    </svg>`,
  9: (s) => `<svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="fg9" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#00b894"/><stop offset="100%" stop-color="#004d40"/></linearGradient>
    <filter id="glow9"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <ellipse cx="${s/2}" cy="${s*.9}" rx="${s*.3}" ry="${s*.06}" fill="rgba(0,0,0,.4)"/>
    <rect x="${s*.24}" y="${s*.35}" width="${s*.52}" height="${s*.5}" rx="18" fill="url(#fg9)"/>
    <circle cx="${s/2}" cy="${s*.3}" r="${s*.2}" fill="url(#fg9)"/>
    <circle cx="${s*.42}" cy="${s*.28}" r="${s*.04}" fill="#55efc4"/><circle cx="${s*.42}" cy="${s*.28}" r="${s*.02}" fill="#004d40"/>
    <circle cx="${s*.58}" cy="${s*.28}" r="${s*.04}" fill="#55efc4"/><circle cx="${s*.58}" cy="${s*.28}" r="${s*.02}" fill="#004d40"/>
    <path d="M${s*.3} ${s*.15} Q${s*.35} ${s*-.02} ${s*.45} ${s*.12}" fill="#2ecc71" filter="url(#glow9)"/>
    <path d="M${s*.7} ${s*.15} Q${s*.65} ${s*-.02} ${s*.55} ${s*.12}" fill="#2ecc71" filter="url(#glow9)"/>
    <path d="M${s*.5} ${s*.12} Q${s*.5} ${s*-.02} ${s*.5} ${s*.08}" stroke="#27ae60" stroke-width="3" fill="none"/>
    <circle cx="${s*.5}" cy="${s*.05}" r="${s*.03}" fill="#f1c40f" filter="url(#glow9)"/>
    </svg>`,
  10: (s) => `<svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="fg10"><stop offset="0%" stop-color="#fdcb6e"/><stop offset="100%" stop-color="#f39c12"/></radialGradient>
    <filter id="glow10"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <ellipse cx="${s/2}" cy="${s*.82}" rx="${s*.18}" ry="${s*.05}" fill="rgba(0,0,0,.3)"/>
    <ellipse cx="${s/2}" cy="${s*.6}" rx="${s*.18}" ry="${s*.18}" fill="url(#fg10)"/>
    <circle cx="${s/2}" cy="${s*.4}" r="${s*.16}" fill="url(#fg10)"/>
    <circle cx="${s*.44}" cy="${s*.37}" r="${s*.04}" fill="#222"/><circle cx="${s*.44}" cy="${s*.36}" r="${s*.015}" fill="white"/>
    <circle cx="${s*.56}" cy="${s*.37}" r="${s*.04}" fill="#222"/><circle cx="${s*.56}" cy="${s*.36}" r="${s*.015}" fill="white"/>
    <circle cx="${s*.38}" cy="${s*.42}" r="${s*.03}" fill="#e74c3c" opacity=".5"/>
    <circle cx="${s*.62}" cy="${s*.42}" r="${s*.03}" fill="#e74c3c" opacity=".5"/>
    <path d="M${s*.38} ${s*.26} L${s*.32} ${s*.18}" stroke="#f1c40f" stroke-width="3" filter="url(#glow10)"/>
    <path d="M${s*.62} ${s*.26} L${s*.68} ${s*.18}" stroke="#f1c40f" stroke-width="3" filter="url(#glow10)"/>
    <path d="M${s*.68} ${s*.18} L${s*.72} ${s*.2} L${s*.74} ${s*.14}" stroke="#f1c40f" stroke-width="2.5" fill="none" filter="url(#glow10)"/>
    <path d="M${s*.32} ${s*.18} L${s*.28} ${s*.2} L${s*.26} ${s*.14}" stroke="#f1c40f" stroke-width="2.5" fill="none" filter="url(#glow10)"/>
    </svg>`,
  11: (s) => `<svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="fg11"><stop offset="0%" stop-color="#ffeaa7"/><stop offset="100%" stop-color="#fdcb6e"/></radialGradient>
    <filter id="glow11"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <ellipse cx="${s/2}" cy="${s*.85}" rx="${s*.18}" ry="${s*.05}" fill="rgba(0,0,0,.3)"/>
    <ellipse cx="${s/2}" cy="${s*.55}" rx="${s*.16}" ry="${s*.22}" fill="url(#fg11)"/>
    <circle cx="${s/2}" cy="${s*.35}" r="${s*.15}" fill="url(#fg11)"/>
    <circle cx="${s*.44}" cy="${s*.33}" r="${s*.035}" fill="#6c5ce7"/><circle cx="${s*.44}" cy="${s*.32}" r="${s*.015}" fill="white"/>
    <circle cx="${s*.56}" cy="${s*.33}" r="${s*.035}" fill="#6c5ce7"/><circle cx="${s*.56}" cy="${s*.32}" r="${s*.015}" fill="white"/>
    <path d="M${s*.47} ${s*.39} Q${s*.5} ${s*.41} ${s*.53} ${s*.39}" stroke="#e17055" stroke-width="1.5" fill="none"/>
    <path d="M${s*.3} ${s*.45} Q${s*.15} ${s*.2} ${s*.3} ${s*.15}" fill="none" stroke="#ffd700" stroke-width="3" filter="url(#glow11)"/>
    <path d="M${s*.7} ${s*.45} Q${s*.85} ${s*.2} ${s*.7} ${s*.15}" fill="none" stroke="#ffd700" stroke-width="3" filter="url(#glow11)"/>
    <path d="M${s*.25} ${s*.35} Q${s*.1} ${s*.15} ${s*.25} ${s*.1}" fill="rgba(255,215,0,.3)" filter="url(#glow11)"/>
    <path d="M${s*.75} ${s*.35} Q${s*.9} ${s*.15} ${s*.75} ${s*.1}" fill="rgba(255,215,0,.3)" filter="url(#glow11)"/>
    <circle cx="${s/2}" cy="${s*.22}" r="${s*.03}" fill="#fff" filter="url(#glow11)"/>
    </svg>`,
  12: (s) => `<svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="fg12"><stop offset="0%" stop-color="#6c5ce7"/><stop offset="100%" stop-color="#2d1b69"/></radialGradient>
    <filter id="glow12"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <ellipse cx="${s/2}" cy="${s*.85}" rx="${s*.15}" ry="${s*.04}" fill="rgba(0,0,0,.3)"/>
    <ellipse cx="${s/2}" cy="${s*.55}" rx="${s*.15}" ry="${s*.25}" fill="url(#fg12)"/>
    <circle cx="${s/2}" cy="${s*.32}" r="${s*.15}" fill="url(#fg12)"/>
    <circle cx="${s*.44}" cy="${s*.3}" r="${s*.03}" fill="#e74c3c"/><circle cx="${s*.44}" cy="${s*.3}" r="${s*.012}" fill="#222"/>
    <circle cx="${s*.56}" cy="${s*.3}" r="${s*.03}" fill="#e74c3c"/><circle cx="${s*.56}" cy="${s*.3}" r="${s*.012}" fill="#222"/>
    <path d="M${s*.36} ${s*.22} L${s*.32} ${s*.16}" stroke="#a29bfe" stroke-width="3"/>
    <path d="M${s*.64} ${s*.22} L${s*.68} ${s*.16}" stroke="#a29bfe" stroke-width="3"/>
    <path d="M${s*.65} ${s*.6} L${s*.78} ${s*.55}" stroke="#6c5ce7" stroke-width="3" filter="url(#glow12)"/>
    <path d="M${s*.78} ${s*.55} L${s*.82} ${s*.48}" stroke="#a29bfe" stroke-width="2.5" filter="url(#glow12)"/>
    <path d="M${s*.42} ${s*.2} Q${s*.5} ${s*.12} ${s*.58} ${s*.2}" fill="none" stroke="#a29bfe" stroke-width="2" filter="url(#glow12)"/>
    </svg>`
};

function renderPetSprite(container, petId, size = 120) {
  const fn = PET_SPRITES[petId];
  if (fn) { container.innerHTML = fn(size); }
  else { container.innerHTML = `<div style="width:${size}px;height:${size}px;background:rgba(255,255,255,.1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${size/3}px">?</div>`; }
}

window.renderPetSprite = renderPetSprite;
