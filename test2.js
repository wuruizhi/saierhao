const http = require('http');

const loginOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
};

const req = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const { token } = JSON.parse(data);
    if (!token) return console.log('Login failed', data);
    
    // Check quests
    http.get({
      hostname: 'localhost', port: 3000, path: '/api/player/daily-quests',
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
      let d = ''; res.on('data', c=>d+=c); res.on('end', ()=>console.log('Quests:', res.statusCode, d));
    });
    
    // Check friends
    http.get({
      hostname: 'localhost', port: 3000, path: '/api/player/friends',
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
      let d = ''; res.on('data', c=>d+=c); res.on('end', ()=>console.log('Friends:', res.statusCode, d));
    });

    // Check achievements
    http.get({
      hostname: 'localhost', port: 3000, path: '/api/player/achievements',
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
      let d = ''; res.on('data', c=>d+=c); res.on('end', ()=>console.log('Achievements:', res.statusCode, d));
    });
  });
});

req.write(JSON.stringify({ username: 'test1', password: '123' }));
req.end();
