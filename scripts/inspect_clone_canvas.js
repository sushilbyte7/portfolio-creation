async function inspectCloneCanvas() {
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

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const bg = document.querySelector('.glyph-background');
      if (!bg) return { error: 'no bg' };
      const canvas = bg.querySelector('canvas');
      const pre = bg.querySelector('pre');
      const cs = getComputedStyle(canvas);
      const pcs = getComputedStyle(pre);
      return {
        bgDataset: Object.assign({}, bg.dataset),
        canvas: {
          width: canvas.width,
          height: canvas.height,
          clientWidth: canvas.clientWidth,
          clientHeight: canvas.clientHeight,
          display: cs.display,
          position: cs.position,
          inset: cs.inset,
          opacity: cs.opacity,
          zIndex: cs.zIndex
        },
        pre: {
          display: pcs.display,
          visibility: pcs.visibility,
          opacity: pcs.opacity,
          position: pcs.position,
          zIndex: pcs.zIndex,
          color: pcs.color,
          fontSize: pcs.fontSize,
          lineHeight: pcs.lineHeight
        }
      };
    })()`,
    returnByValue: true
  });

  console.log(JSON.stringify(res.result.value, null, 2));

  await fetch('http://127.0.0.1:9222/json/close/' + cloneTarget.id);
  ws.close();
}

inspectCloneCanvas().catch(console.error);
