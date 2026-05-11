function getToday() { return new Date().toISOString().slice(0, 10); }

function incrementQuestProgress(db, playerId, questType, amount = 1) {
  try {
    const today = getToday();
    const quests = db.prepare('SELECT * FROM daily_quests WHERE player_id = ? AND quest_date = ? AND quest_type = ? AND completed = 0').all(playerId, today, questType);
    
    for (const q of quests) {
      const newProgress = q.progress + amount;
      const completed = newProgress >= q.target ? 1 : 0;
      db.prepare('UPDATE daily_quests SET progress = ?, completed = ? WHERE id = ?').run(newProgress, completed, q.id);
    }
  } catch (err) {
    console.error('Quest progress error:', err);
  }
}

module.exports = { incrementQuestProgress };
