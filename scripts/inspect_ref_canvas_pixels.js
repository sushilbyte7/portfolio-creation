async function inspectRefCanvasPixels() {
  const targetsRes = await fetch('http://127.0.0.1:9222/json');
  const targets = await targetsRes.json();
  const refTarget = targets.find(t => t.url.includes('aswinpanengal.me'));

  const ws = new WebSocket(refTarget.webSocketDebuggerUrl);
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

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.glyph-background');
      if (!el) return { error: 'no el' };
      const canvas = el.querySelector('canvas');
      const pre = el.querySelector('pre');
      const gl = canvas ? canvas.getContext('webgl') : null;
      return {
        dataset: Object.assign({}, el.dataset),
        preVisibility: pre ? getComputedStyle(pre).visibility : null,
        preOpacity: pre ? getComputedStyle(pre).opacity : null,
        canvasOpacity: canvas ? getComputedStyle(canvas).opacity : null,
        hasGL: !!gl
      };
    })()`,
    returnByValue: true
  });

  console.log('REF GLYPH BG STATE:', JSON.stringify(res.result.value, null, 2));

  // Let's capture a screenshot of just the background code area on REF
  const snapRes = await send('Page.captureScreenshot', {
    clip: { x: 50, y: 50, width: 400, height: 300, scale: 1 }
  });
  const fs = require('fs');
  fs.writeFileSync('scripts/screenshots/ref_hero_bg_code.png', Buffer.from(snapRes.data, 'base64'));

  ws.close();
}

inspectRefCanvasPixels().catch(console.error);
