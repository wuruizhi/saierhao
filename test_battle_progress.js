const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'db', 'saierhao.db'));

const storyQuestsData = require('./data/story_quests.json');

const playerId = 1;
const mapId = "1";
const pet_id = 1;

console.log("Checking active quests for player 1:");
const quests = db.prepare("SELECT * FROM player_story_quests WHERE player_id = ? AND status = 'active'").all(playerId);
console.log(quests);

quests.forEach(quest => {
  const planetData = storyQuestsData.planets[quest.planet_id];
  console.log("Planet data:", planetData ? "Found" : "Not found");
  
  const stepData = planetData.steps.find(s => s.step === quest.quest_step);
  console.log("Step data:", stepData ? stepData.name : "Not found");
  
  if (quest.planet_id == mapId) {
    console.log("mapId match");
    if (stepData.type === 'battle') {
       console.log("type match");
       let validTarget = false;
       if (Array.isArray(stepData.targetId)) {
         validTarget = stepData.targetId.includes(pet_id);
       }
       console.log("Valid target:", validTarget);
       if (validTarget) {
         console.log("Will increment! Current progress:", quest.progress);
       }
    }
  }
});
