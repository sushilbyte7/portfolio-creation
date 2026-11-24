const fs = require('fs');

async function main() {
  const wsUrl = 'ws://127.0.0.1:9222/devtools/page/0475F7BBA178F61FCC0E1261E829189F';
  const ws = new WebSocket(wsUrl);

  let id = 1;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === msgId) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await new Promise((res) => ws.addEventListener('open', res));

  // Ensure modal is closed
  await send('Runtime.evaluate', {
    expression: `(() => {
      const d = document.querySelector('#navigation-panel');
      if (d && d.open) d.close();
    })()`
  });
  await new Promise(r => setTimeout(r, 200));

  // Click trigger
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.nav-menu-trigger').click()`
  });

  // Capture frames at 0ms, 50ms, 100ms, 150ms, 200ms, 300ms, 500ms
  const delays = [0, 50, 100, 150, 200, 300, 500];
  for (let i = 0; i < delays.length; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, delays[i] - delays[i - 1]));
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`scripts/screenshots/open_frame_${delays[i]}ms.png`, Buffer.from(shot.data, 'base64'));
  }
  console.log('Saved open frames!');

  // Now click close and capture frames
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.nav-panel-close').click()`
  });

  const closeDelays = [0, 100, 200, 300, 400, 500, 700, 900, 1100];
  for (let i = 0; i < closeDelays.length; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, closeDelays[i] - closeDelays[i - 1]));
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`scripts/screenshots/close_frame_${closeDelays[i]}ms.png`, Buffer.from(shot.data, 'base64'));
  }
  console.log('Saved close frames!');

  ws.close();
  process.exit(0);
}

main().catch(console.error);
