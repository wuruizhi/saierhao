const db = require('better-sqlite3')('db/saierhao.db');
console.log(db.prepare('SELECT * FROM friends').all());
