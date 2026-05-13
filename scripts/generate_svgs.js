const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public/img/icons');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Common SVG wrapper
const makeSvg = (paths, viewBox = '0 0 24 24') => 
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

// SVGs using clean, modern paths (Lucide-inspired)
const icons = {
  // Nav Icons
  'nav_planets': makeSvg(`<circle cx="12" cy="12" r="8"></circle><path d="M22 12c0-4.4-3.6-8-8-8-4.4 0-8 3.6-8 8"></path><path d="M2 12c0 4.4 3.6 8 8 8 4.4 0 8-3.6 8-8"></path><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" stroke-dasharray="2 2"></path>`),
  'nav_team': makeSvg(`<path d="M4 10h16M6 10v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10M9 6v4M15 6v4M8 6h8a2 2 0 0 0 2-2V2H6v2a2 2 0 0 0 2 2z"></path>`),
  'nav_bag': makeSvg(`<path d="M4 10h16M6 10v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10M9 6v4M15 6v4M8 6h8a2 2 0 0 0 2-2V2H6v2a2 2 0 0 0 2 2z"></path>`),
  'nav_pokedex': makeSvg(`<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>`),
  'nav_wardrobe': makeSvg(`<path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>`),
  'nav_shop': makeSvg(`<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>`),
  'nav_pvp': makeSvg(`<path d="M14.5 17.5L3 6V3h3l11.5 11.5"></path><path d="M13 19l6-6"></path><path d="M16 16l4 4"></path><path d="M19 21l2-2"></path><path d="M9.5 6.5L21 18v3h-3L6.5 9.5"></path><path d="M5 11l6-6"></path><path d="M8 8L4 4"></path><path d="M3 5l2-2"></path>`),
  'nav_heal': makeSvg(`<path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>`),
  'nav_social': makeSvg(`<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>`),
  'nav_quests': makeSvg(`<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14h6"></path><path d="M9 18h6"></path><path d="M9 10h6"></path>`),
  'nav_gacha': makeSvg(`<circle cx="12" cy="12" r="10"></circle><path d="M12 2v20"></path><path d="M2 12h20"></path><circle cx="12" cy="12" r="4"></circle>`),
  'nav_expedition': makeSvg(`<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="M12 15l-3-3a22 22 0 0 1 3.86-8.86c.81-1.36 2.14-2.14 3.14-2.14s1.33.78 2.14 2.14c1.36 2.27 2.14 5 2.14 7.86 0 2.86-.78 5.59-2.14 7.86-1 .8-2.33 1.14-3.14 1.14-1 0-2.33-.34-3.14-1.14A22 22 0 0 1 12 15z"></path>`),
  'nav_base': makeSvg(`<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>`),
  
  // Elements / Types
  'type_fire': makeSvg(`<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>`),
  'type_water': makeSvg(`<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>`),
  'type_grass': makeSvg(`<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>`),
  'type_electric': makeSvg(`<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>`),
  'type_light': makeSvg(`<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`),
  'type_dark': makeSvg(`<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`),
  'type_normal': makeSvg(`<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle>`),
  
  // System / General
  'icon_money': makeSvg(`<circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path>`),
  'icon_recharge': makeSvg(`<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>`),
  'icon_logout': makeSvg(`<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>`),
  'icon_capture': makeSvg(`<circle cx="12" cy="12" r="10"></circle><path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path><path d="M2 12h6"></path><path d="M16 12h6"></path>`),
  'icon_run': makeSvg(`<path d="M13 5H19V11"></path><path d="M19 5L5 19"></path>`)
};

for (const [name, content] of Object.entries(icons)) {
  fs.writeFileSync(path.join(dir, `${name}.svg`), content);
}
console.log('Icons generated successfully.');
