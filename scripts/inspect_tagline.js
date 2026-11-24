async function main() {
  const newTabRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:3000', { method: 'PUT' });
  const cloneTarget = await newTabRes.json();

  const targetsRes = await fetch('http://127.0.0.1:9222/json');
  const targets = await targetsRes.json();
  const refTarget = targets.find(t => t.url.includes('aswinpanengal.me'));

  async function evalInPage(wsUrl) {
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
    // Wait for hydration
    await new Promise(r => setTimeout(r, 3000));

    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const text = document.querySelector('.terminal-text');
        if (!text) return { error: 'No .terminal-text found' };
        const cs = getComputedStyle(text);
        const parent = text.parentElement;
        const pcs = getComputedStyle(parent);
        
        const children = Array.from(text.childNodes).map(node => {
          if (node.nodeType === 3) {
            return { type: 'text', text: node.textContent, charCodes: Array.from(node.textContent).map(c => c.charCodeAt(0)) };
          }
          const r = node.getBoundingClientRect();
          const s = getComputedStyle(node);
          return {
            tagName: node.tagName,
            className: node.className,
            outerHTML: node.outerHTML,
            textContent: node.textContent,
            charCodes: Array.from(node.textContent).map(c => c.charCodeAt(0)),
            rect: { left: r.left, top: r.top, width: r.width, height: r.height },
            computed: {
              display: s.display,
              fontFamily: s.fontFamily,
              fontSize: s.fontSize,
              fontWeight: s.fontWeight,
              letterSpacing: s.letterSpacing,
              wordSpacing: s.wordSpacing,
              whiteSpace: s.whiteSpace,
              marginLeft: s.marginLeft,
              marginRight: s.marginRight,
              paddingLeft: s.paddingLeft,
              paddingRight: s.paddingRight
            }
          };
        });

        const tr = text.getBoundingClientRect();
        const pr = parent.getBoundingClientRect();

        return {
          parent: {
            tagName: parent.tagName,
            className: parent.className,
            rect: { left: pr.left, width: pr.width, center: pr.left + pr.width / 2 },
            display: pcs.display,
            justifyContent: pcs.justifyContent,
            textAlign: pcs.textAlign
          },
          container: {
            outerHTML: text.outerHTML.slice(0, 100),
            rect: { left: tr.left, width: tr.width, center: tr.left + tr.width / 2 },
            computed: {
              display: cs.display,
              fontFamily: cs.fontFamily,
              fontSize: cs.fontSize,
              fontWeight: cs.fontWeight,
              letterSpacing: cs.letterSpacing,
              wordSpacing: cs.wordSpacing,
              whiteSpace: cs.whiteSpace,
              textAlign: cs.textAlign,
              justifyContent: cs.justifyContent,
              alignItems: cs.alignItems,
              gap: cs.gap,
              width: cs.width,
              maxWidth: cs.maxWidth
            }
          },
          children
        };
      })()`,
      returnByValue: true
    });
    ws.close();
    return res.result.value;
  }

  const ref = await evalInPage(refTarget.webSocketDebuggerUrl);
  const clone = await evalInPage(cloneTarget.webSocketDebuggerUrl);

  console.log('REF:', JSON.stringify(ref, null, 2));
  console.log('CLONE:', JSON.stringify(clone, null, 2));

  await fetch('http://127.0.0.1:9222/json/close/' + cloneTarget.id);
}

main().catch(console.error);
