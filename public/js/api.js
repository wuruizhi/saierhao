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
  releasePet(petInstanceId) { return this.request('POST', '/player/release-pet', { petInstanceId }); },
  // Social
  getLeaderboard(type) { return this.request('GET', `/player/leaderboard?type=${type}`); },
  getFriends() { return this.request('GET', '/player/friends'); },
  addFriend(username) { return this.request('POST', '/player/friends/add', { username }); },
  acceptFriend(friendshipId) { return this.request('POST', '/player/friends/accept', { friendshipId }); },
  removeFriend(friendshipId) { return this.request('POST', '/player/friends/remove', { friendshipId }); },
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
  // Achievements
  getAchievements() { return this.request('GET', '/player/achievements'); },
  checkAchievements() { return this.request('POST', '/player/check-achievements'); },
  getDailyQuests() { return this.request('GET', '/player/daily-quests'); },
  questProgress(questType) { return this.request('POST', '/player/quest-progress', { questType }); },
  claimQuestReward(questDbId) { return this.request('POST', '/player/claim-quest-reward', { questDbId }); },
  // Story Quests
  getStoryQuests() { return this.request('GET', '/quests/story'); },
  advanceStoryQuest(planetId) { return this.request('POST', '/quests/story/advance', { planetId }); },
  // Gacha
  getGachaPools() { return this.request('GET', '/player/gacha-pools'); },
  pullGacha(poolKey) { return this.request('POST', '/player/gacha', { poolKey }); },
  // Redeem
  redeemCode(code) { return this.request('POST', '/player/redeem', { code }); },
  // Expeditions
  getExpeditions() { return this.request('GET', '/player/expeditions'); },
  startExpedition(petId, planetId, durationHours) { return this.request('POST', '/player/expedition/start', { petId, planetId, durationHours }); },
  claimExpedition(expeditionId) { return this.request('POST', '/player/expedition/claim', { expeditionId }); },
  cancelExpedition(expeditionId) { return this.request('POST', '/player/expedition/cancel', { expeditionId }); },
  // Guilds
  getGuilds() { return this.request('GET', '/player/guilds'); },
  createGuild(name) { return this.request('POST', '/player/guild/create', { name }); },
  joinGuild(guildId) { return this.request('POST', '/player/guild/join', { guildId }); },
  getMyGuild() { return this.request('GET', '/player/guild/my'); },
  leaveGuild() { return this.request('POST', '/player/guild/leave'); },
  donateGuild(amount) { return this.request('POST', '/player/guild/donate', { amount }); },
  // Base
  getBase() { return this.request('GET', '/player/base'); },
  saveBase(items) { return this.request('POST', '/player/base/save', { items }); },
  getBasePets() { return this.request('GET', '/player/base/pets'); },
  toggleBasePet(petId, inBase) { return this.request('POST', '/player/base/pets/toggle', { petId, inBase }); }
};
window.API = API;

