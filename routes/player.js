const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { createPetInstance, healPet, addExp } = require('../game/pet-manager');
const petsData = require('../data/pets.json');
const skillsData = require('../data/skills.json');

function createPlayerRouter(db) {
  const router = express.Router();

  // Get player profile with all pets
  router.get('/profile', authMiddleware, (req, res) => {
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const pets = db.prepare('SELECT * FROM player_pets WHERE player_id = ? ORDER BY team_order ASC').all(player.id);
    const teamPets = pets.filter(p => p.in_team).map(p => ({
      ...p,
      skills: JSON.parse(p.skills),
      petDef: petsData.pets.find(pd => pd.id === p.pet_id)
    }));
    const storagePets = pets.filter(p => !p.in_team).map(p => ({
      ...p,
      skills: JSON.parse(p.skills),
      petDef: petsData.pets.find(pd => pd.id === p.pet_id)
    }));

    res.json({ player, teamPets, storagePets });
  });

  // Choose starter pet
  router.post('/choose-starter', authMiddleware, (req, res) => {
    const { petId } = req.body;
    if (![1, 4, 7].includes(petId)) {
      return res.status(400).json({ error: '只能选择小火猴(1)、水灵蛙(4)或叶小芽(7)' });
    }

    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });
    if (player.starter_pet_id !== 0) {
      return res.status(400).json({ error: '已经选择过初始精灵了' });
    }

    const instanceId = createPetInstance(db, player.id, petId, 5, true, 0);
    db.prepare('UPDATE players SET starter_pet_id = ?, team = ? WHERE id = ?')
      .run(petId, JSON.stringify([instanceId]), player.id);

    const pet = db.prepare('SELECT * FROM player_pets WHERE id = ?').get(instanceId);
    const petDef = petsData.pets.find(p => p.id === petId);
    res.json({ pet: { ...pet, skills: JSON.parse(pet.skills), petDef } });
  });

  // Get team
  router.get('/team', authMiddleware, (req, res) => {
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const team = db.prepare(
      'SELECT * FROM player_pets WHERE player_id = ? AND in_team = 1 ORDER BY team_order ASC'
    ).all(player.id);

    res.json({
      team: team.map(p => ({
        ...p,
        skills: JSON.parse(p.skills),
        petDef: petsData.pets.find(pd => pd.id === p.pet_id)
      }))
    });
  });

  // Swap pet between team and storage
  router.post('/swap-pet', authMiddleware, (req, res) => {
    const { petInstanceId, toTeam } = req.body;
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const pet = db.prepare('SELECT * FROM player_pets WHERE id = ? AND player_id = ?').get(petInstanceId, player.id);
    if (!pet) return res.status(404).json({ error: '精灵不存在' });

    if (toTeam) {
      const teamCount = db.prepare('SELECT COUNT(*) as c FROM player_pets WHERE player_id = ? AND in_team = 1').get(player.id).c;
      if (teamCount >= 6) return res.status(400).json({ error: '队伍已满（最多6只）' });
      db.prepare('UPDATE player_pets SET in_team = 1, team_order = ? WHERE id = ?').run(teamCount, petInstanceId);
    } else {
      const teamCount = db.prepare('SELECT COUNT(*) as c FROM player_pets WHERE player_id = ? AND in_team = 1').get(player.id).c;
      if (teamCount <= 1) return res.status(400).json({ error: '队伍至少需要1只精灵' });
      db.prepare('UPDATE player_pets SET in_team = 0, team_order = -1 WHERE id = ?').run(petInstanceId);
    }

    res.json({ success: true });
  });

  // Heal all team pets
  router.post('/heal', authMiddleware, (req, res) => {
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    db.prepare('UPDATE player_pets SET current_hp = max_hp WHERE player_id = ? AND in_team = 1').run(player.id);
    res.json({ success: true, message: '所有精灵已恢复满血！' });
  });

  // Get all pets data (for pokedex)
  router.get('/pokedex', authMiddleware, (req, res) => {
    res.json({ pets: petsData.pets, skills: skillsData.skills });
  });

  return router;
}

module.exports = createPlayerRouter;
