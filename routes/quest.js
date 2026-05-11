const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// Load story quests data
const storyQuestsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/story_quests.json'), 'utf8'));

function createQuestRouter(db) {
  const router = express.Router();

  // Get current story quests progress
  router.get('/story', authMiddleware, (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM player_story_quests WHERE player_id = ?');
      const quests = stmt.all(req.userId);
      res.json({ quests, storyData: storyQuestsData.planets });
    } catch (err) {
      console.error('Get story quests error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Start or advance a story quest
  router.post('/story/advance', authMiddleware, (req, res) => {
    try {
      const { planetId } = req.body;
      const planetData = storyQuestsData.planets[planetId];
      if (!planetData) {
        return res.status(400).json({ error: 'Invalid planet ID' });
      }

      // Check current progress
      const stmt = db.prepare('SELECT * FROM player_story_quests WHERE player_id = ? AND planet_id = ?');
      let quest = stmt.get(req.userId, planetId);

      if (!quest) {
        // Start the first step
        const insertStmt = db.prepare('INSERT INTO player_story_quests (player_id, planet_id, quest_step, progress, status) VALUES (?, ?, 0, 0, "active")');
        insertStmt.run(req.userId, planetId);
        
        return res.json({ success: true, message: 'Quest started', step: 0 });
      }

      const currentStepDef = planetData.steps.find(s => s.step === quest.quest_step);
      if (!currentStepDef) {
        return res.status(400).json({ error: 'Quest already fully completed or invalid' });
      }

      if (quest.status === 'completed') {
        return res.status(400).json({ error: 'This planet quest is already completed.' });
      }

      // For dialogue/interaction type quests, advancing simply completes the step
      // Battle/boss type quests are advanced automatically during battle resolution
      // But we can allow advancing here for dialogue parts
      
      // We will handle battle progress in routes/battle.js
      // If this is called from UI for a dialogue/prompt, we just return success to indicate the dialogue was read
      
      res.json({ success: true, quest });

    } catch (err) {
      console.error('Advance story quest error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}

module.exports = createQuestRouter;
