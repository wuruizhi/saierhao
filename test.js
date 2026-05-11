const http = require('http');

const loginOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
};

const req = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const { token } = JSON.parse(data);
    if (!token) return console.log('Login failed');
    
    // Check quests
    http.get({
      hostname: 'localhost', port: 3000, path: '/player/daily-quests',
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
      let d = ''; res.on('data', c=>d+=c); res.on('end', ()=>console.log('Quests:', d));
    });
    
    // Check friends
    http.get({
      hostname: 'localhost', port: 3000, path: '/player/friends',
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
      let d = ''; res.on('data', c=>d+=c); res.on('end', ()=>console.log('Friends:', d));
    });
  });
});

req.write(JSON.stringify({ username: 'test1', password: '123' }));
req.end();
