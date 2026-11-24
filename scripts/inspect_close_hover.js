const fs = require('fs');

async function main() {
  const targetsRes = await fetch('http://127.0.0.1:9222/json');
  const targets = await targetsRes.json();
  const refTarget = targets.find(t => t.url.includes('aswinpanengal.me'));
  if (!refTarget) {
    console.error('No aswinpanengal.me target found');
    process.exit(1);
  }

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
  console.log('Connected to reference page CDP!');

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  // Open the navigation modal if not already open
  await send('Runtime.evaluate', {
    expression: `(() => {
      const d = document.querySelector('#navigation-panel');
      if (!d || !d.open) {
        document.querySelector('.nav-menu-trigger').click();
      }
    })()`
  });

  await new Promise(r => setTimeout(r, 600));

  // Inspect the close button DOM, computed styles, child elements
  const info = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.nav-panel-close');
      const circle = btn.querySelector('.nav-close-circle');
      const svg = circle.querySelector('svg');

      const rBtn = btn.getBoundingClientRect();
      const rCircle = circle.getBoundingClientRect();

      return {
        btnOuter: btn.outerHTML,
        circleOuter: circle.outerHTML,
        svgOuter: svg ? svg.outerHTML : null,
        btnRect: { left: rBtn.left, top: rBtn.top, width: rBtn.width, height: rBtn.height },
        circleRect: { left: rCircle.left, top: rCircle.top, width: rCircle.width, height: rCircle.height },
        computedCircle: {
          transition: getComputedStyle(circle).transition,
          transform: getComputedStyle(circle).transform,
          transformOrigin: getComputedStyle(circle).transformOrigin
        },
        computedSvg: svg ? {
          transition: getComputedStyle(svg).transition,
          transform: getComputedStyle(svg).transform,
          transformOrigin: getComputedStyle(svg).transformOrigin
        } : null
      };
    })()`,
    returnByValue: true
  });

  console.log('=== CLOSE BUTTON INITIAL STATE ===');
  console.log(JSON.stringify(info.result.value, null, 2));

  // Now hover over the circle
  const circleRect = info.result.value.circleRect;
  const cx = circleRect.left + circleRect.width / 2;
  const cy = circleRect.top + circleRect.height / 2;

  console.log('Hovering at circle center:', cx, cy);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: cx, y: cy });

  // Sample every 25ms for 350ms
  const hoverFrames = [];
  for (let t = 0; t <= 350; t += 25) {
    await new Promise(r => setTimeout(r, 25));
    const sample = await send('Runtime.evaluate', {
      expression: `(() => {
        const circle = document.querySelector('.nav-close-circle');
        const svg = circle ? circle.querySelector('svg') : null;
        return {
          circleTransform: circle ? getComputedStyle(circle).transform : null,
          svgTransform: svg ? getComputedStyle(svg).transform : null
        };
      })()`,
      returnByValue: true
    });
    hoverFrames.push({ t, ...sample.result.value });
  }

  console.log('=== HOVER MOTION SAMPLES ===');
  console.log(JSON.stringify(hoverFrames, null, 2));

  // Unhover: move mouse away
  console.log('Unhovering...');
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 });

  const unhoverFrames = [];
  for (let t = 0; t <= 350; t += 25) {
    await new Promise(r => setTimeout(r, 25));
    const sample = await send('Runtime.evaluate', {
      expression: `(() => {
        const circle = document.querySelector('.nav-close-circle');
        const svg = circle ? circle.querySelector('svg') : null;
        return {
          circleTransform: circle ? getComputedStyle(circle).transform : null,
          svgTransform: svg ? getComputedStyle(svg).transform : null
        };
      })()`,
      returnByValue: true
    });
    unhoverFrames.push({ t, ...sample.result.value });
  }

  console.log('=== UNHOVER MOTION SAMPLES ===');
  console.log(JSON.stringify(unhoverFrames, null, 2));

  // Check if hovering over the "close" text also triggers the rotation
  const btnRect = info.result.value.btnRect;
  const textX = btnRect.left + 15;
  const textY = btnRect.top + btnRect.height / 2;

  console.log('Hovering over "close" text at:', textX, textY);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: textX, y: textY });
  await new Promise(r => setTimeout(r, 250));

  const textHoverRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const circle = document.querySelector('.nav-close-circle');
      const textPieces = Array.from(document.querySelectorAll('.nav-panel-close .nav-menu-piece')).map(p => ({
        char: p.textContent,
        transform: getComputedStyle(p).transform
      }));
      return {
        circleTransform: getComputedStyle(circle).transform,
        textPieces
      };
    })()`,
    returnByValue: true
  });

  console.log('=== TEXT HOVER RESULT ===');
  console.log(JSON.stringify(textHoverRes.result.value, null, 2));

  ws.close();
  process.exit(0);
}

main().catch(console.error);
