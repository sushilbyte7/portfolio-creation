async function main() {
  const newTabRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:3000', { method: 'PUT' });
  const cloneTarget = await newTabRes.json();

  const targetsRes = await fetch('http://127.0.0.1:9222/json');
  const targets = await targetsRes.json();
  const refTarget = targets.find(t => t.url.includes('aswinpanengal.me'));

  async function getHeroFooter(wsUrl) {
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
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await new Promise(r => setTimeout(r, 1000));

    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const hf = document.querySelector('.hero-footer');
        if (!hf) return { error: 'no .hero-footer' };
        const cs = getComputedStyle(hf);
        const r = hf.getBoundingClientRect();
        return {
          outerHTML: hf.outerHTML,
          rect: { left: r.left, top: r.top, width: r.width, height: r.height },
          computed: {
            display: cs.display,
            justifyContent: cs.justifyContent,
            alignItems: cs.alignItems,
            padding: cs.padding,
            margin: cs.margin
          }
        };
      })()`,
      returnByValue: true
    });
    ws.close();
    return res.result.value;
  }

  const ref = await getHeroFooter(refTarget.webSocketDebuggerUrl);
  const clone = await getHeroFooter(cloneTarget.webSocketDebuggerUrl);

  console.log('REF HERO FOOTER:');
  console.log(JSON.stringify(ref, null, 2));

  console.log('CLONE HERO FOOTER:');
  console.log(JSON.stringify(clone, null, 2));

  await fetch('http://127.0.0.1:9222/json/close/' + cloneTarget.id);
}

main().catch(console.error);
