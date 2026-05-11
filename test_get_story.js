const db = require('better-sqlite3')('./db/saierhao.db');
const fs = require('fs');
const storyQuestsData = JSON.parse(fs.readFileSync('./data/story_quests.json', 'utf8'));

const stmt = db.prepare('SELECT * FROM player_story_quests WHERE player_id = 1');
const quests = stmt.all();
console.log('Quests:', quests);
console.log('StoryData[1]:', storyQuestsData.planets[1] ? 'Exists' : 'Null');
const stepData = storyQuestsData.planets[1].steps.find(s => s.step === 0);
console.log('StepData:', stepData ? 'Exists' : 'Null');
