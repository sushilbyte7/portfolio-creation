async function checkTheme() {
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

  const res = await send('Runtime.evaluate', {
    expression: '(() => { return { portfolioTheme: localStorage.getItem("portfolio-theme"), dataTheme: document.documentElement.dataset.theme }; })()',
    returnByValue: true
  });
  console.log(res.result.value);

  // If dark, reset to light
  await send('Runtime.evaluate', {
    expression: '(() => { localStorage.removeItem("portfolio-theme"); delete document.documentElement.dataset.theme; })()'
  });

  await fetch('http://127.0.0.1:9222/json/close/' + cloneTarget.id);
  ws.close();
}

checkTheme().catch(console.error);
