async function main() {
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

  for (const w of [1440, 1024, 768, 480, 390]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: 900,
      deviceScaleFactor: 1,
      mobile: w <= 768
    });
    await new Promise(r => setTimeout(r, 600));

    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const hf = document.querySelector('.hero-footer');
        const text = document.querySelector('.terminal-text');
        const year = document.querySelector('.hero-year');
        const focus = document.querySelector('.hero-focus');
        return {
          viewport: ${w},
          footer: hf ? {
            rect: hf.getBoundingClientRect(),
            display: getComputedStyle(hf).display,
            justifyContent: getComputedStyle(hf).justifyContent,
            flexDirection: getComputedStyle(hf).flexDirection
          } : null,
          year: year ? {
            rect: year.getBoundingClientRect(),
            display: getComputedStyle(year).display
          } : null,
          focus: focus ? {
            rect: focus.getBoundingClientRect(),
            textAlign: getComputedStyle(focus).textAlign
          } : null,
          text: text ? {
            rect: text.getBoundingClientRect(),
            fontSize: getComputedStyle(text).fontSize
          } : null
        };
      })()`,
      returnByValue: true
    });
    console.log(JSON.stringify(res.result.value, null, 2));
  }
  ws.close();
}

main().catch(console.error);
