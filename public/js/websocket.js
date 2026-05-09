// WebSocket client for PVP
class WS {
  constructor() { this.ws = null; this.handlers = {}; this.reconnectTimer = null; }
  connect(token) {
    if (this.ws) this.ws.close();
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    this.ws = new WebSocket(`${proto}://${location.host}/ws?token=${token}`);
    this.ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (this.handlers[msg.type]) this.handlers[msg.type](msg);
      } catch(err) { console.error('WS parse error', err); }
    };
    this.ws.onclose = () => {
      this.reconnectTimer = setTimeout(() => { if (API.token) this.connect(API.token); }, 3000);
    };
  }
  on(type, fn) { this.handlers[type] = fn; }
  send(data) { if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(data)); }
  disconnect() { clearTimeout(this.reconnectTimer); if (this.ws) this.ws.close(); this.ws = null; }
}
window.ws = new WS();
