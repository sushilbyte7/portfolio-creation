async function test() {
  const newTabRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:3000', { method: 'PUT' });
  const target = await newTabRes.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
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
  await new Promise(r => setTimeout(r, 2000));

  // Open modal
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.nav-menu-trigger').click()`
  });
  await new Promise(r => setTimeout(r, 800));

  // Check inline style on .nav-close-circle
  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const c = document.querySelector('.nav-close-circle');
      return { inlineTransform: c.style.transform, inlineStyle: c.getAttribute('style') };
    })()`,
    returnByValue: true
  });
  console.log('Nav close circle style after open:', res.result.value);

  // Now hover over close button
  const rectRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const r = document.querySelector('.nav-panel-close').getBoundingClientRect();
      return { left: r.left, top: r.top, width: r.width, height: r.height };
    })()`,
    returnByValue: true
  });
  const r = rectRes.result.value;
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r.left + r.width / 2, y: r.top + r.height / 2 });
  await new Promise(r => setTimeout(r, 200));

  const hoverRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const c = document.querySelector('.nav-close-circle');
      return { computedTransform: getComputedStyle(c).transform };
    })()`,
    returnByValue: true
  });
  console.log('Nav close circle transform during hover:', hoverRes.result.value);

  await fetch('http://127.0.0.1:9222/json/close/' + target.id);
  ws.close();
}
test().catch(console.error);
