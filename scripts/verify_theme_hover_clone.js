async function run() {
  // Ensure localhost:3000 is open in Chrome
  const newTabRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:3000', { method: 'PUT' });
  const target = await newTabRes.json();
  console.log('Opened clone target:', target.id);

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

  // Inspect .theme-toggle in clone
  const inspectRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.theme-toggle');
      if (!btn) return { error: 'theme-toggle not found' };

      const waveIcon = btn.querySelector('.wave-icon');
      const waveTrack = btn.querySelector('.wave-icon-track');
      const spans = waveTrack ? Array.from(waveTrack.children) : [];
      const svgs = btn.querySelectorAll('svg');

      const r = btn.getBoundingClientRect();
      return {
        outerHTML: btn.outerHTML,
        className: btn.className,
        rect: { left: r.left, top: r.top, width: r.width, height: r.height },
        hasWaveIcon: !!waveIcon,
        waveIconSize: waveIcon ? getComputedStyle(waveIcon).getPropertyValue('--wave-icon-size') : null,
        spanCount: spans.length,
        svgCount: svgs.length,
        computed: {
          width: getComputedStyle(btn).width,
          height: getComputedStyle(btn).height,
          backgroundColor: getComputedStyle(btn).backgroundColor,
          color: getComputedStyle(btn).color,
          trackTransition: waveTrack ? getComputedStyle(waveTrack).transition : null
        }
      };
    })()`,
    returnByValue: true
  });

  console.log('=== CLONE THEME-TOGGLE INSPECTION ===');
  console.log(JSON.stringify(inspectRes.result.value, null, 2));

  const r = inspectRes.result.value.rect;
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  // Move mouse onto button to trigger hover
  console.log('Dispatching mouseMoved to', cx, cy);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: cx, y: cy });

  // Sample track transform every 50ms for 350ms
  const hoverFrames = [];
  for (let t = 0; t <= 350; t += 50) {
    await new Promise(res => setTimeout(res, 50));
    const sample = await send('Runtime.evaluate', {
      expression: `(() => {
        const tr = document.querySelector('.theme-toggle .wave-icon-track');
        return { transform: getComputedStyle(tr).transform };
      })()`,
      returnByValue: true
    });
    hoverFrames.push({ t, ...sample.result.value });
  }
  console.log('=== CLONE HOVER FRAMES ===');
  console.log(JSON.stringify(hoverFrames, null, 2));

  // Move mouse away to trigger unhover
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 });
  const unhoverFrames = [];
  for (let t = 0; t <= 350; t += 50) {
    await new Promise(res => setTimeout(res, 50));
    const sample = await send('Runtime.evaluate', {
      expression: `(() => {
        const tr = document.querySelector('.theme-toggle .wave-icon-track');
        return { transform: getComputedStyle(tr).transform };
      })()`,
      returnByValue: true
    });
    unhoverFrames.push({ t, ...sample.result.value });
  }
  console.log('=== CLONE UNHOVER FRAMES ===');
  console.log(JSON.stringify(unhoverFrames, null, 2));

  // Now click to switch theme
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.theme-toggle').click()`
  });
  await new Promise(r => setTimeout(r, 200));

  const afterClick = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('.theme-toggle');
      const theme = document.documentElement.dataset.theme;
      const svgs = Array.from(btn.querySelectorAll('svg')).map(s => s.classList.value);
      return { theme, ariaPressed: btn.getAttribute('aria-pressed'), svgClasses: svgs };
    })()`,
    returnByValue: true
  });
  console.log('=== AFTER CLICK THEME SWITCH ===', afterClick.result.value);

  // Test hover in dark mode
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: cx, y: cy });
  await new Promise(r => setTimeout(r, 250));
  const darkHover = await send('Runtime.evaluate', {
    expression: `(() => {
      const tr = document.querySelector('.theme-toggle .wave-icon-track');
      return { transform: getComputedStyle(tr).transform };
    })()`,
    returnByValue: true
  });
  console.log('Dark mode hover transform:', darkHover.result.value);

  // Clean up
  await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
  ws.close();
  process.exit(0);
}

run().catch(console.error);
