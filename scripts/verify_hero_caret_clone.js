const fs = require('fs');

async function main() {
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
  await send('DOM.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Wait 2.5s for page to load
  await new Promise(r => setTimeout(r, 2500));

  // Inspect hero caret in clone
  const inspectRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const heroFocus = document.querySelector('.hero-focus');
      const terminalText = document.querySelector('.terminal-text');
      const caret = document.querySelector('.terminal-caret');

      return {
        heroFocus: heroFocus ? {
          outerHTML: heroFocus.outerHTML,
          computed: {
            fontSize: getComputedStyle(heroFocus).fontSize,
            fontWeight: getComputedStyle(heroFocus).fontWeight,
            color: getComputedStyle(heroFocus).color
          }
        } : null,
        terminalText: terminalText ? {
          outerHTML: terminalText.outerHTML,
          dataset: { ...terminalText.dataset },
          computed: {
            display: getComputedStyle(terminalText).display,
            whiteSpace: getComputedStyle(terminalText).whiteSpace,
            alignItems: getComputedStyle(terminalText).alignItems,
            letterSpacing: getComputedStyle(terminalText).letterSpacing,
            fontFamily: getComputedStyle(terminalText).fontFamily
          }
        } : null,
        caret: caret ? {
          outerHTML: caret.outerHTML,
          computed: {
            display: getComputedStyle(caret).display,
            width: getComputedStyle(caret).width,
            height: getComputedStyle(caret).height,
            marginLeft: getComputedStyle(caret).marginLeft,
            backgroundColor: getComputedStyle(caret).backgroundColor,
            color: getComputedStyle(caret).color,
            animation: getComputedStyle(caret).animation,
            verticalAlign: getComputedStyle(caret).verticalAlign
          }
        } : null
      };
    })()`,
    returnByValue: true
  });

  console.log('=== CLONE HERO CARET INSPECTION ===');
  console.log(JSON.stringify(inspectRes.result.value, null, 2));

  // Sample blink opacity and container rect over 1200ms to verify blink + layout stability
  const blinkSamples = [];
  const start = performance.now();
  for (let t = 0; t <= 1200; t += 100) {
    await new Promise(r => setTimeout(r, 100));
    const sample = await send('Runtime.evaluate', {
      expression: `(() => {
        const caret = document.querySelector('.terminal-caret');
        const text = document.querySelector('.terminal-text');
        const textRect = text ? text.getBoundingClientRect() : null;
        return {
          opacity: caret ? getComputedStyle(caret).opacity : null,
          textWidth: textRect ? textRect.width : null,
          textLeft: textRect ? textRect.left : null
        };
      })()`,
      returnByValue: true
    });
    blinkSamples.push({ t, ...sample.result.value });
  }

  console.log('=== BLINK OPACITY & LAYOUT STABILITY SAMPLES ===');
  console.log(JSON.stringify(blinkSamples, null, 2));

  // Test dark mode colors
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.theme-toggle').click()`
  });
  await new Promise(r => setTimeout(r, 200));

  const darkRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const caret = document.querySelector('.terminal-caret');
      return {
        theme: document.documentElement.dataset.theme,
        caretBg: caret ? getComputedStyle(caret).backgroundColor : null,
        caretColor: caret ? getComputedStyle(caret).color : null
      };
    })()`,
    returnByValue: true
  });
  console.log('=== CLONE DARK THEME CARET INSPECTION ===', darkRes.result.value);

  // Switch back to light theme
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.theme-toggle').click()`
  });

  // Capture close-up screenshot of hero footer
  const clipRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.hero-footer');
      const r = el.getBoundingClientRect();
      return { x: r.left, y: r.top, width: r.width, height: r.height };
    })()`,
    returnByValue: true
  });

  const clip = clipRes.result.value;
  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    clip: {
      x: Math.max(0, clip.x - 20),
      y: Math.max(0, clip.y - 20),
      width: clip.width + 40,
      height: clip.height + 40,
      scale: 1
    }
  });

  fs.writeFileSync('scripts/screenshots/clone_hero_tagline_caret.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot to scripts/screenshots/clone_hero_tagline_caret.png');

  // Close tab
  await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
  ws.close();
  process.exit(0);
}

main().catch(console.error);
