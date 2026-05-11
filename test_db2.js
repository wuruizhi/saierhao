const db = require('better-sqlite3')('db/saierhao.db');

try {
  const friendshipId = 4;
  const friendship = db.prepare('SELECT * FROM friends WHERE id = ?').get(friendshipId);
  console.log("Friendship:", friendship);
  db.prepare("UPDATE friends SET status = 'accepted' WHERE id = ?").run(friendshipId);
  console.log("Updated!");
} catch (e) {
  console.error("Error:", e);
}
