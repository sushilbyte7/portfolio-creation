async function captureCloneBg() {
  const newTabRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:3000', { method: 'PUT' });
  const cloneTarget = await newTabRes.json();

  const ws = new WebSocket(cloneTarget.webSocketDebuggerUrl);
  let id = 1;
  function send(method, params = {}) {
    return new Promise(resolve => {
      const msgId = id++;
      const handler = e => {
        const msg = JSON.parse(e.data);
        if (msg.id === msgId) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }
  await new Promise(r => ws.addEventListener('open', r));
  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  await new Promise(r => setTimeout(r, 2000));

  const snapRes = await send('Page.captureScreenshot', {
    clip: { x: 50, y: 50, width: 400, height: 300, scale: 1 }
  });
  const fs = require('fs');
  fs.writeFileSync('scripts/screenshots/clone_hero_bg_code.png', Buffer.from(snapRes.data, 'base64'));

  await fetch('http://127.0.0.1:9222/json/close/' + cloneTarget.id);
  ws.close();
}

captureCloneBg().catch(console.error);
