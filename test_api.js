const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const result = JSON.parse(data);
    const token = result.token;
    
    // Test advanceStoryQuest
    const req2 = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/quests/story/advance',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    }, (res2) => {
      let data2 = '';
      res2.on('data', d => data2 += d);
      res2.on('end', () => {
        console.log('Advance response:', res2.statusCode, data2);
      });
    });
    req2.write(JSON.stringify({ planetId: 1 }));
    req2.end();
  });
});

req.write(JSON.stringify({ username: 'testuser', password: 'password123' }));
req.end();
