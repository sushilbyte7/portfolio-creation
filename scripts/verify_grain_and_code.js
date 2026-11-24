async function verify() {
  const newTabRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:3000', { method: 'PUT' });
  const cloneTarget = await newTabRes.json();

  const targetsRes = await fetch('http://127.0.0.1:9222/json');
  const targets = await targetsRes.json();
  const refTarget = targets.find(t => t.url.includes('aswinpanengal.me'));

  async function inspectPage(wsUrl, isClone) {
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

    if (isClone) {
      // Ensure clone starts in light mode to match reference default
      await send('Runtime.evaluate', {
        expression: `(() => {
          localStorage.removeItem('portfolio-theme');
          delete document.documentElement.dataset.theme;
        })()`
      });
    }

    await new Promise(r => setTimeout(r, 2000));

    // 1. Inspect body::before in light mode
    const lightCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const bBefore = getComputedStyle(document.body, '::before');
        const bg = document.querySelector('.glyph-background');
        const canvas = bg ? bg.querySelector('canvas') : null;
        const pre = bg ? bg.querySelector('pre') : null;
        return {
          grain: {
            content: bBefore.content,
            backgroundImage: bBefore.backgroundImage,
            backgroundSize: bBefore.backgroundSize,
            opacity: bBefore.opacity,
            zIndex: bBefore.zIndex,
            pointerEvents: bBefore.pointerEvents,
            position: bBefore.position,
            filter: bBefore.filter
          },
          glyphBg: {
            renderer: bg ? bg.dataset.renderer : null,
            canvasSize: canvas ? { width: canvas.width, height: canvas.height } : null,
            preVisibility: pre ? getComputedStyle(pre).visibility : null,
            preOpacity: pre ? getComputedStyle(pre).opacity : null
          }
        };
      })()`,
      returnByValue: true
    });

    // 2. Capture screenshot of hero background (clean crop)
    const snap = await send('Page.captureScreenshot', {
      clip: { x: 40, y: 40, width: 600, height: 400, scale: 1 }
    });
    const fs = require('fs');
    fs.writeFileSync(`scripts/screenshots/${isClone ? 'clone' : 'ref'}_hero_grain_verified.png`, Buffer.from(snap.data, 'base64'));

    // 3. Test dark mode
    await send('Runtime.evaluate', {
      expression: `(() => {
        const themeBtn = document.querySelector('.theme-toggle, [aria-label*="theme"], [aria-label*="Theme"], button.theme');
        if (themeBtn) themeBtn.click();
        else document.documentElement.dataset.theme = 'dark';
      })()`
    });
    await new Promise(r => setTimeout(r, 500));

    const darkCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const bBefore = getComputedStyle(document.body, '::before');
        return {
          opacity: bBefore.opacity,
          filter: bBefore.filter
        };
      })()`,
      returnByValue: true
    });

    // Reset back to light
    await send('Runtime.evaluate', {
      expression: `(() => {
        const themeBtn = document.querySelector('.theme-toggle, [aria-label*="theme"], [aria-label*="Theme"], button.theme');
        if (themeBtn) themeBtn.click();
        else delete document.documentElement.dataset.theme;
      })()`
    });

    ws.close();
    return {
      light: lightCheck.result.value,
      dark: darkCheck.result.value
    };
  }

  const refData = await inspectPage(refTarget.webSocketDebuggerUrl, false);
  const cloneData = await inspectPage(cloneTarget.webSocketDebuggerUrl, true);

  console.log('=== REFERENCE ===');
  console.log(JSON.stringify(refData, null, 2));

  console.log('=== CLONE ===');
  console.log(JSON.stringify(cloneData, null, 2));

  await fetch('http://127.0.0.1:9222/json/close/' + cloneTarget.id);
}

verify().catch(console.error);
