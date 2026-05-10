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
    const map = mapsData.maps.find(m => m.id === mapId);
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
   * Create a single spawn from scene config
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

    // Check for boss spawn (only in scenes with boss config)
    let isBoss = false;
    if (scene.boss && Math.random() * 100 < scene.boss.rate) {
      isBoss = true;
    }

    const level = isBoss
      ? scene.boss.level
      : wildPetDef.minLevel + Math.floor(Math.random() * (wildPetDef.maxLevel - wildPetDef.minLevel + 1));

    const petId = isBoss ? scene.boss.petId : wildPetDef.petId;

    return {
      spawnId: uuidv4(),
      petId,
      level,
      isBoss,
      bossName: isBoss ? scene.boss.name : null,
      essenceId: isBoss ? scene.boss.essenceId : null,
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
   */
  removePet(mapId, sceneIndex, spawnId) {
    const key = this.getKey(mapId, sceneIndex);
    const spawns = this.scenes.get(key);
    if (!spawns) return null;

    const idx = spawns.findIndex(s => s.spawnId === spawnId);
    if (idx === -1) return null;

    const removed = spawns.splice(idx, 1)[0];
    this.scenes.set(key, spawns);
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
      for (const map of mapsData.maps) {
        if (!map.scenes) continue;
        for (let i = 0; i < map.scenes.length; i++) {
          const key = this.getKey(map.id, i);
          const scene = map.scenes[i];
          const last = this.lastRefresh.get(key) || 0;
          const interval = (scene.refreshInterval || 30) * 1000;

          if (Date.now() - last >= interval) {
            this.spawnPets(map.id, i);
          }
        }
      }
    }, 5000); // Check every 5 seconds
  }
}

module.exports = SceneManager;
