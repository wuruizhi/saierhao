const mapsData = require('../data/maps.json');
const { createWildPet } = require('./battle-engine');
const { v4: uuidv4 } = require('uuid');

class SceneManager {
  constructor() {
    // Map<string, SpawnedPet[]>  key = "mapId_sceneIndex"
    this.scenes = new Map();
    this.lastRefresh = new Map();
    this.startRefreshLoop();
  }

  getKey(mapId, sceneIndex) {
    return `${mapId}_${sceneIndex}`;
  }

  getScene(mapId, sceneIndex) {
    let map = null;
    for (const g of (mapsData.galaxies || [])) {
      map = g.planets.find(m => m.id === mapId);
      if (map) break;
    }
    if (!map || !map.scenes || !map.scenes[sceneIndex]) return null;
    return map.scenes[sceneIndex];
  }

  /**
   * Get currently spawned pets for a scene, auto-spawn if empty
   */
  getSceneSpawns(mapId, sceneIndex) {
    const key = this.getKey(mapId, sceneIndex);
    if (!this.scenes.has(key)) {
      this.spawnPets(mapId, sceneIndex);
    }
    // Always ensure boss exists in boss scenes
    this.ensureBossSpawn(mapId, sceneIndex);
    return this.scenes.get(key) || [];
  }

  /**
   * Spawn wild pets for a scene
   */
  spawnPets(mapId, sceneIndex) {
    const scene = this.getScene(mapId, sceneIndex);
    if (!scene) return;

    const key = this.getKey(mapId, sceneIndex);
    const existing = this.scenes.get(key) || [];
    const toSpawn = scene.maxSpawns - existing.length;

    if (toSpawn <= 0) return;

    for (let i = 0; i < toSpawn; i++) {
      const spawn = this.createSpawn(scene);
      if (spawn) existing.push(spawn);
    }

    this.scenes.set(key, existing);
    this.lastRefresh.set(key, Date.now());
  }

  /**
   * Ensure a boss is always present in scenes with boss config
   */
  ensureBossSpawn(mapId, sceneIndex) {
    const scene = this.getScene(mapId, sceneIndex);
    if (!scene || !scene.boss) return;

    const key = this.getKey(mapId, sceneIndex);
    const spawns = this.scenes.get(key) || [];
    
    // Check if a boss already exists
    const hasBoss = spawns.some(s => s.isBoss);
    if (hasBoss) return;

    // Force-spawn a boss
    const boss = {
      spawnId: uuidv4(),
      petId: scene.boss.petId,
      level: scene.boss.level,
      isBoss: true,
      bossName: scene.boss.name,
      essenceId: scene.boss.essenceId,
      // Boss gets a prominent position
      x: 50 + (Math.random() - 0.5) * 20,
      y: 30 + Math.random() * 15,
      dx: (Math.random() - 0.5) * 1,
      dy: (Math.random() - 0.5) * 0.5,
      spawnedAt: Date.now()
    };

    spawns.push(boss);
    this.scenes.set(key, spawns);
  }

  /**
   * Create a single spawn from scene config (non-boss only)
   */
  createSpawn(scene) {
    // Roll for which pet appears
    const roll = Math.random() * 100;
    let cumulative = 0;
    let wildPetDef = null;

    for (const wp of scene.wildPets) {
      cumulative += wp.rate;
      if (roll < cumulative) {
        wildPetDef = wp;
        break;
      }
    }
    if (!wildPetDef) wildPetDef = scene.wildPets[0];

    const level = wildPetDef.minLevel + Math.floor(Math.random() * (wildPetDef.maxLevel - wildPetDef.minLevel + 1));
    const petId = wildPetDef.petId;

    return {
      spawnId: uuidv4(),
      petId,
      level,
      isBoss: false,
      bossName: null,
      essenceId: null,
      // Random position (percentage)
      x: 10 + Math.random() * 80,
      y: 20 + Math.random() * 55,
      // Movement
      dx: (Math.random() - 0.5) * 2, // pixels per update
      dy: (Math.random() - 0.5) * 1.5,
      spawnedAt: Date.now()
    };
  }

  /**
   * Remove a pet from scene (when battle starts or captured)
   * For bosses: immediately respawn a new boss
   */
  removePet(mapId, sceneIndex, spawnId) {
    const key = this.getKey(mapId, sceneIndex);
    const spawns = this.scenes.get(key);
    if (!spawns) return null;

    const idx = spawns.findIndex(s => s.spawnId === spawnId);
    if (idx === -1) return null;

    const removed = spawns.splice(idx, 1)[0];
    this.scenes.set(key, spawns);

    // If boss was removed, immediately respawn
    if (removed.isBoss) {
      this.ensureBossSpawn(mapId, sceneIndex);
    }

    return removed;
  }

  /**
   * Get a specific spawn
   */
  getSpawn(mapId, sceneIndex, spawnId) {
    const key = this.getKey(mapId, sceneIndex);
    const spawns = this.scenes.get(key) || [];
    return spawns.find(s => s.spawnId === spawnId) || null;
  }

  /**
   * Refresh loop - replenish pets every 30 seconds
   */
  startRefreshLoop() {
    setInterval(() => {
      for (const g of (mapsData.galaxies || [])) {
        for (const map of (g.planets || [])) {
          if (!map.scenes) continue;
          for (let i = 0; i < map.scenes.length; i++) {
            const key = this.getKey(map.id, i);
            const scene = map.scenes[i];
            const last = this.lastRefresh.get(key) || 0;
            const interval = (scene.refreshInterval || 30) * 1000;

            if (Date.now() - last >= interval) {
              this.spawnPets(map.id, i);
              // Always ensure boss
              this.ensureBossSpawn(map.id, i);
            }
          }
        }
      }
    }, 5000); // Check every 5 seconds
  }
}

module.exports = SceneManager;
