async function check() {
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
    expression: '(() => ({ hasScGrain: !!document.querySelector(".sc-grain"), grainNodes: Array.from(document.querySelectorAll("[class*=\\"grain\\"]")).map(n => n.className) }))()',
    returnByValue: true
  });
  console.log('REF GRAIN DOM:', res.result.value);
  ws.close();
}
check().catch(console.error);
