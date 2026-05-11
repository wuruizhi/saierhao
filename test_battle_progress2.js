const fs = require('fs');


async function test() {
  try {
    // 1. Register a new user
    const username = 'testuser_' + Date.now();
    const registerRes = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: 'password' })
    });
    const authData = await registerRes.json();
    const token = authData.token;

    // 2. Select starter pet
    await fetch('http://localhost:3000/api/player/starter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ petId: 1 }) // Fire monkey
    });

    // 3. Start quest
    await fetch('http://localhost:3000/api/quests/story/advance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ planetId: "1" })
    });

    // 4. Get scenes
    const sceneRes = await fetch('http://localhost:3000/api/battle/scene/1/0', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const sceneData = await sceneRes.json();
    console.log(sceneData); const spawn = sceneData.spawns.find(s => s.petId === 1 || s.petId === 10 || s.petId === 17);
    if (!spawn) { console.log('No valid spawn found!'); return; }

    // 5. Explore
    const exploreRes = await fetch('http://localhost:3000/api/battle/explore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ mapId: "1", sceneIndex: 0, spawnId: spawn.spawnId })
    });
    const exploreData = await exploreRes.json();
    const battleId = exploreData.battleId;

    // 6. Defeat the pet (use skill 1 repeatedly until win)
    let won = false;
    for (let i = 0; i < 20; i++) {
      const actionRes = await fetch('http://localhost:3000/api/battle/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ battleId, skillId: 1 }) // Scratch
      });
      const actionData = await actionRes.json();
      if (actionData.battleEnd) {
        won = actionData.playerWin;
        console.log('Battle ended. Player win?', won);
        break;
      }
    }

    // 7. Check progress
    const questRes = await fetch('http://localhost:3000/api/quests/story', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const questData = await questRes.json();
    console.log('Final quests:', JSON.stringify(questData.quests, null, 2));

  } catch (err) {
    console.error(err);
  }
}
test();
