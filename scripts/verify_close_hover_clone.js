async function verify() {
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

  // Wait 2s for page load
  await new Promise(r => setTimeout(r, 2000));

  // Open modal
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.nav-menu-trigger').click()`
  });
  // Wait for open animation to finish and onComplete clearProps to execute
  await new Promise(r => setTimeout(r, 900));

  // Check inline styles on .nav-close-circle
  const initial = await send('Runtime.evaluate', {
    expression: `(() => {
      const c = document.querySelector('.nav-close-circle');
      const r = c.getBoundingClientRect();
      const btn = document.querySelector('.nav-panel-close');
      const rBtn = btn.getBoundingClientRect();
      return {
        inlineStyle: c.getAttribute('style'),
        computedTransform: getComputedStyle(c).transform,
        computedTransition: getComputedStyle(c).transition,
        circleRect: { left: r.left, top: r.top, width: r.width, height: r.height },
        btnRect: { left: rBtn.left, top: rBtn.top, width: rBtn.width, height: rBtn.height }
      };
    })()`,
    returnByValue: true
  });
  console.log('=== CLONE CLOSE CIRCLE INITIAL ===');
  console.log(JSON.stringify(initial.result.value, null, 2));

  // Move mouse onto close circle
  const cr = initial.result.value.circleRect;
  const cx = cr.left + cr.width / 2;
  const cy = cr.top + cr.height / 2;

  console.log('Hovering at close circle center:', cx, cy);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: cx, y: cy });

  // Sample every 25ms for 300ms
  const hoverFrames = [];
  for (let t = 0; t <= 300; t += 25) {
    await new Promise(r => setTimeout(r, 25));
    const sample = await send('Runtime.evaluate', {
      expression: `(() => {
        const c = document.querySelector('.nav-close-circle');
        return { transform: getComputedStyle(c).transform };
      })()`,
      returnByValue: true
    });
    hoverFrames.push({ t, ...sample.result.value });
  }
  console.log('=== CLONE CLOSE HOVER FRAMES ===');
  console.log(JSON.stringify(hoverFrames, null, 2));

  // Unhover: move mouse away
  console.log('Unhovering...');
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 });

  const unhoverFrames = [];
  for (let t = 0; t <= 300; t += 25) {
    await new Promise(r => setTimeout(r, 25));
    const sample = await send('Runtime.evaluate', {
      expression: `(() => {
        const c = document.querySelector('.nav-close-circle');
        return { transform: getComputedStyle(c).transform };
      })()`,
      returnByValue: true
    });
    unhoverFrames.push({ t, ...sample.result.value });
  }
  console.log('=== CLONE CLOSE UNHOVER FRAMES ===');
  console.log(JSON.stringify(unhoverFrames, null, 2));

  // Test hovering over the "close" label text
  const br = initial.result.value.btnRect;
  const textX = br.left + 15;
  const textY = br.top + br.height / 2;
  console.log('Hovering over "close" text at:', textX, textY);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: textX, y: textY });
  await new Promise(r => setTimeout(r, 250));

  const textHover = await send('Runtime.evaluate', {
    expression: `(() => {
      const c = document.querySelector('.nav-close-circle');
      return { transform: getComputedStyle(c).transform };
    })()`,
    returnByValue: true
  });
  console.log('=== CLONE TEXT HOVER TRANSFORM ===', textHover.result.value);

  // Close tab
  await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
  ws.close();
  process.exit(0);
}

verify().catch(console.error);
