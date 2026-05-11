const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// Load story quests data
const storyQuestsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/story_quests.json'), 'utf8'));

function createQuestRouter(db) {
  const router = express.Router();

  // Helper to get player_id from req.userId
  const getPlayerId = (userId) => {
    const player = db.prepare('SELECT id FROM players WHERE user_id = ?').get(userId);
    return player ? player.id : null;
  };

  // Get current story quests progress
  router.get('/story', authMiddleware, (req, res) => {
    try {
      const playerId = getPlayerId(req.userId);
      if (!playerId) return res.status(404).json({ error: 'Player not found' });

      const stmt = db.prepare('SELECT * FROM player_story_quests WHERE player_id = ?');
      const quests = stmt.all(playerId);
      res.json({ quests, storyData: storyQuestsData.planets });
    } catch (err) {
      console.error('Get story quests error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Start or advance a story quest
  router.post('/story/advance', authMiddleware, (req, res) => {
    try {
      const playerId = getPlayerId(req.userId);
      if (!playerId) return res.status(404).json({ error: 'Player not found' });

      const { planetId } = req.body;
      const planetData = storyQuestsData.planets[planetId];
      if (!planetData) {
        return res.status(400).json({ error: 'Invalid planet ID' });
      }

      // Check current progress
      const stmt = db.prepare('SELECT * FROM player_story_quests WHERE player_id = ? AND planet_id = ?');
      let quest = stmt.get(playerId, planetId);

      if (!quest) {
        // Start the first step
        const insertStmt = db.prepare('INSERT INTO player_story_quests (player_id, planet_id, quest_step, progress, status) VALUES (?, ?, 0, 0, \'active\')');
        insertStmt.run(playerId, planetId);
        
        return res.json({ success: true, message: 'Quest started', step: 0 });
      }

      const currentStepDef = planetData.steps.find(s => s.step === quest.quest_step);
      if (!currentStepDef) {
        return res.status(400).json({ error: 'Quest already fully completed or invalid' });
      }

      if (quest.status === 'completed') {
        return res.status(400).json({ error: 'This planet quest is already completed.' });
      }

      // If this is a dialogue step, advancing it means we completed the dialogue.
      // We should check the target conditions. If it's pure dialogue, we can advance.
      if (currentStepDef.type === 'dialogue') {
        // Note: For now, we assume frontend calls advance when a dialogue finishes,
        // and if it's pure dialogue, we increment the step.
        // Actually, the battle script handles battle types, so here we can just 
        // increment step if type is dialogue.
        const nextStep = quest.quest_step + 1;
        const nextStepDef = planetData.steps.find(s => s.step === nextStep);
        
        if (nextStepDef) {
          db.prepare('UPDATE player_story_quests SET quest_step = ?, progress = 0 WHERE player_id = ? AND planet_id = ?').run(nextStep, playerId, planetId);
        } else {
          db.prepare('UPDATE player_story_quests SET status = \'completed\' WHERE player_id = ? AND planet_id = ?').run(playerId, planetId);
        }
      }

      res.json({ success: true, quest });

    } catch (err) {
      console.error('Advance story quest error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}

module.exports = createQuestRouter;
