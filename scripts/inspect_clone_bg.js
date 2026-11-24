async function inspectCloneBg() {
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

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.glyph-background') || document.querySelector('[class*="glyph"]');
      if (!el) return { error: 'No glyph-background found in clone' };
      const pre = el.querySelector('pre');
      const canvas = el.querySelector('canvas');
      const cs = getComputedStyle(el);

      return {
        outerHTML: el.outerHTML.slice(0, 300),
        dataset: Object.assign({}, el.dataset),
        computed: {
          color: cs.color,
          opacity: cs.opacity,
          position: cs.position,
          zIndex: cs.zIndex
        },
        pre: pre ? {
          outerHTML: pre.outerHTML.slice(0, 200),
          className: pre.className,
          computed: {
            color: getComputedStyle(pre).color,
            opacity: getComputedStyle(pre).opacity,
            fontSize: getComputedStyle(pre).fontSize,
            lineHeight: getComputedStyle(pre).lineHeight,
            fontWeight: getComputedStyle(pre).fontWeight,
            visibility: getComputedStyle(pre).visibility
          },
          spans: Array.from(pre.querySelectorAll('span')).slice(0, 10).map(s => ({
            className: s.className,
            text: s.textContent,
            color: getComputedStyle(s).color,
            fontWeight: getComputedStyle(s).fontWeight,
            opacity: getComputedStyle(s).opacity
          }))
        } : null,
        canvas: canvas ? {
          width: canvas.width,
          height: canvas.height,
          style: canvas.getAttribute('style')
        } : null
      };
    })()`,
    returnByValue: true
  });

  console.log('CLONE BG CODE DETAILS:');
  console.log(JSON.stringify(res.result.value, null, 2));

  await fetch('http://127.0.0.1:9222/json/close/' + cloneTarget.id);
  ws.close();
}

inspectCloneBg().catch(console.error);
