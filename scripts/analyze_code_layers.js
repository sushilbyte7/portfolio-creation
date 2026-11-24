async function analyzeCodeLayers() {
  const newTabRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:3000', { method: 'PUT' });
  const cloneTarget = await newTabRes.json();

  const targetsRes = await fetch('http://127.0.0.1:9222/json');
  const targets = await targetsRes.json();
  const refTarget = targets.find(t => t.url.includes('aswinpanengal.me'));

  async function inspectHero(wsUrl) {
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

    await new Promise(r => setTimeout(r, 2000));

    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const hero = document.querySelector('.hero');
        const codeEls = hero ? Array.from(hero.querySelectorAll('.glyph-background, .glyph-code-fallback, canvas, pre, code')) : [];
        return codeEls.map(el => {
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return {
            tagName: el.tagName,
            className: el.className,
            parentClass: el.parentElement.className,
            rect: { top: r.top, left: r.left, width: r.width, height: r.height },
            opacity: cs.opacity,
            visibility: cs.visibility,
            color: cs.color,
            fontSize: cs.fontSize,
            lineHeight: cs.lineHeight,
            fontWeight: cs.fontWeight,
            fontFamily: cs.fontFamily,
            zIndex: cs.zIndex,
            position: cs.position
          };
        });
      })()`,
      returnByValue: true
    });
    ws.close();
    return res.result.value;
  }

  const refLayers = await inspectHero(refTarget.webSocketDebuggerUrl);
  const cloneLayers = await inspectHero(cloneTarget.webSocketDebuggerUrl);

  console.log('REF HERO CODE LAYERS:');
  console.log(JSON.stringify(refLayers, null, 2));

  console.log('CLONE HERO CODE LAYERS:');
  console.log(JSON.stringify(cloneLayers, null, 2));

  await fetch('http://127.0.0.1:9222/json/close/' + cloneTarget.id);
}

analyzeCodeLayers().catch(console.error);
