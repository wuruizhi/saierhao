// API client with JWT auth
const API = {
  token: localStorage.getItem('saierhao_token'),
  async request(method, url, body) {
    // Add cache-busting query param for GET requests
    if (method === 'GET') {
      const sep = url.includes('?') ? '&' : '?';
      url += `${sep}_t=${Date.now()}`;
    }
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (this.token) opts.headers['Authorization'] = `Bearer ${this.token}`;
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`/api${url}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '请求失败');
    return data;
  },
  setToken(t) { this.token = t; localStorage.setItem('saierhao_token', t); },
  clearToken() { this.token = null; localStorage.removeItem('saierhao_token'); },
  // Auth
  register(u, p) { return this.request('POST', '/auth/register', { username: u, password: p }); },
  login(u, p) { return this.request('POST', '/auth/login', { username: u, password: p }); },
  me() { return this.request('GET', '/auth/me'); },
  // Player
  profile() { return this.request('GET', '/player/profile'); },
  chooseStarter(id) { return this.request('POST', '/player/choose-starter', { petId: id }); },
  getTeam() { return this.request('GET', '/player/team'); },
  swapPet(id, toTeam) { return this.request('POST', '/player/swap-pet', { petInstanceId: id, toTeam }); },
  heal() { return this.request('POST', '/player/heal'); },
  pokedex() { return this.request('GET', '/player/pokedex'); },
  useCandy(petInstanceId, candyId, quantity) { return this.request('POST', '/player/use-candy', { petInstanceId, candyId, quantity }); },
  getSkills() { return this.request('GET', '/player/skills'); },
  useBooster(petInstanceId, boosterId) { return this.request('POST', '/player/use-booster', { petInstanceId, boosterId }); },
  useSpecialItem(petInstanceId, itemId) { return this.request('POST', '/player/use-special-item', { petInstanceId, itemId }); },
  getEssences() { return this.request('GET', '/player/essences'); },
  hatchStart(essenceDbId) { return this.request('POST', '/player/hatch-start', { essenceDbId }); },
  hatchComplete(essenceDbId, speedUp) { return this.request('POST', '/player/hatch-complete', { essenceDbId, speedUp }); },
  equipWardrobe(itemId, part) { return this.request('POST', '/player/equip', { itemId, part }); },
  // Battle
  getScene(mapId, sceneIndex) { return this.request('GET', `/battle/scene/${mapId}/${sceneIndex}`); },
  explore(mapId, sceneIndex, spawnId) { return this.request('POST', '/battle/explore', { mapId, sceneIndex, spawnId }); },
  battleAction(battleId, skillId) { return this.request('POST', '/battle/action', { battleId, skillId }); },
  capture(battleId, capsuleId) { return this.request('POST', '/battle/capture', { battleId, capsuleId }); },
  runAway(battleId) { return this.request('POST', '/battle/run', { battleId }); },
  getMaps() { return this.request('GET', '/battle/maps'); },
  // Shop
  shopList() { return this.request('GET', '/shop/list'); },
  shopBuy(itemId, quantity) { return this.request('POST', '/shop/buy', { itemId, quantity }); },
  inventory() { return this.request('GET', '/shop/inventory'); },
};
window.API = API;
