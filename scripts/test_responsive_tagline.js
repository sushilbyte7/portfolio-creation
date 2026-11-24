async function testResponsive() {
  const newTabRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:3000', { method: 'PUT' });
  const cloneTarget = await newTabRes.json();

  const targetsRes = await fetch('http://127.0.0.1:9222/json');
  const targets = await targetsRes.json();
  const refTarget = targets.find(t => t.url.includes('aswinpanengal.me'));

  async function checkViewports(wsUrl, isClone) {
    const ws = new WebSocket(wsUrl);
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

    const results = {};
    for (const w of [1440, 1024, 768, 390]) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: w,
        height: 900,
        deviceScaleFactor: 1,
        mobile: w <= 768
      });
      await new Promise(r => setTimeout(r, 1200));

      const res = await send('Runtime.evaluate', {
        expression: `(() => {
          const text = document.querySelector('.terminal-text');
          const spans = Array.from(text.children).map(s => {
            const r = s.getBoundingClientRect();
            return {
              width: r.width,
              left: r.left
            };
          });
          const tr = text.getBoundingClientRect();
          return {
            textWidth: tr.width,
            textLeft: tr.left,
            spans
          };
        })()`,
        returnByValue: true
      });
      results[w] = res.result.value;

      // Capture screenshot at 1440 and 390
      if (w === 1440 || w === 390) {
        const clipRes = await send('Runtime.evaluate', {
          expression: `(() => {
            const text = document.querySelector('.terminal-text');
            const r = text.getBoundingClientRect();
            return { x: r.left - 10, y: r.top - 10, width: r.width + 20, height: r.height + 20, scale: 1 };
          })()`,
          returnByValue: true
        });
        if (clipRes && clipRes.result && clipRes.result.value) {
          const snap = await send('Page.captureScreenshot', { clip: clipRes.result.value });
          const fs = require('fs');
          fs.writeFileSync(`scripts/screenshots/${isClone ? 'clone' : 'ref'}_${w}_tagline.png`, Buffer.from(snap.data, 'base64'));
        }
      }
    }
    ws.close();
    return results;
  }

  const refRes = await checkViewports(refTarget.webSocketDebuggerUrl, false);
  const cloneRes = await checkViewports(cloneTarget.webSocketDebuggerUrl, true);

  console.log('=== RESPONSIVE COMPARISON ===');
  for (const w of [1440, 1024, 768, 390]) {
    console.log(`Viewport ${w}px:`);
    console.log('  REF:  ', JSON.stringify(refRes[w]));
    console.log('  CLONE:', JSON.stringify(cloneRes[w]));
  }

  await fetch('http://127.0.0.1:9222/json/close/' + cloneTarget.id);
}

testResponsive().catch(console.error);
