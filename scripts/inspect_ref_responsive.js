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

  for (const w of [1440, 1024, 768, 390]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: 900,
      deviceScaleFactor: 1,
      mobile: w <= 768
    });
    await new Promise(r => setTimeout(r, 800));

    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const text = document.querySelector('.terminal-text');
        const focus = document.querySelector('.hero-focus');
        const hero = document.querySelector('.hero');
        return {
          viewport: ${w},
          hero: hero ? {
            rect: hero.getBoundingClientRect(),
            style: {
              display: getComputedStyle(hero).display,
              justifyContent: getComputedStyle(hero).justifyContent,
              alignItems: getComputedStyle(hero).alignItems
            }
          } : null,
          focus: focus ? {
            rect: focus.getBoundingClientRect(),
            parentClass: focus.parentElement ? focus.parentElement.className : '',
            style: {
              display: getComputedStyle(focus).display,
              textAlign: getComputedStyle(focus).textAlign,
              position: getComputedStyle(focus).position
            }
          } : null,
          text: text ? {
            rect: text.getBoundingClientRect(),
            style: {
              fontSize: getComputedStyle(text).fontSize,
              letterSpacing: getComputedStyle(text).letterSpacing,
              fontFamily: getComputedStyle(text).fontFamily,
              textAlign: getComputedStyle(text).textAlign
            }
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
