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
    return new Promise((resolve) => {
      const msgId = id++;
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === msgId) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await new Promise((res) => ws.addEventListener('open', res));
  console.log('Connected to CDP for reference site!');

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  // Inspect .theme-toggle structure & styles
  const inspectRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('.theme-toggle');
        if (!btn) return { error: 'theme-toggle not found' };

        const svgs = Array.from(btn.querySelectorAll('svg')).map(s => ({
          outerHTML: s.outerHTML,
          viewBox: s.getAttribute('viewBox'),
          width: s.getAttribute('width'),
          height: s.getAttribute('height'),
          classList: Array.from(s.classList)
        }));

        const waveIcon = btn.querySelector('.wave-icon');
        const waveTrack = btn.querySelector('.wave-icon-track');

        return {
          outerHTML: btn.outerHTML,
          className: btn.className,
          rect: btn.getBoundingClientRect(),
          computed: {
            width: getComputedStyle(btn).width,
            height: getComputedStyle(btn).height,
            backgroundColor: getComputedStyle(btn).backgroundColor,
            borderRadius: getComputedStyle(btn).borderRadius,
            color: getComputedStyle(btn).color,
            transition: getComputedStyle(btn).transition
          },
          hasWaveIcon: !!waveIcon,
          waveIconComputed: waveIcon ? {
            width: getComputedStyle(waveIcon).width,
            height: getComputedStyle(waveIcon).height,
            overflow: getComputedStyle(waveIcon).overflow
          } : null,
          hasWaveTrack: !!waveTrack,
          waveTrackComputed: waveTrack ? {
            transform: getComputedStyle(waveTrack).transform,
            transition: getComputedStyle(waveTrack).transition,
            flexDirection: getComputedStyle(waveTrack).flexDirection
          } : null,
          svgs
        };
      })()
    `,
    returnByValue: true
  });

  console.log('=== REFERENCE THEME-TOGGLE INSPECTION ===');
  console.log(JSON.stringify(inspectRes.result.value, null, 2));

  // Now emulate hovering over the button using Input.dispatchMouseEvent
  const btnRect = inspectRes.result.value.rect;
  const cx = btnRect.left + btnRect.width / 2;
  const cy = btnRect.top + btnRect.height / 2;

  console.log('Moving mouse to button at', cx, cy);

  // Take screenshot before hover
  const shot0 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/screenshots/ref_theme_before_hover.png', Buffer.from(shot0.data, 'base64'));

  // Move mouse onto button
  await send('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: cx,
    y: cy
  });

  // Sample track transform & capture frames during hover
  const frames = [];
  const start = performance.now();
  for (let t = 0; t <= 400; t += 50) {
    await new Promise(r => setTimeout(r, 50));
    const sample = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('.theme-toggle');
          const track = btn ? btn.querySelector('.wave-icon-track') : null;
          const svg = btn ? btn.querySelector('svg') : null;
          return {
            btnBg: btn ? getComputedStyle(btn).backgroundColor : null,
            trackTransform: track ? getComputedStyle(track).transform : null,
            svgTransform: svg ? getComputedStyle(svg).transform : null
          };
        })()
      `,
      returnByValue: true
    });
    frames.push({ t, ...sample.result.value });
  }

  console.log('=== HOVER MOTION FRAMES ===');
  console.log(JSON.stringify(frames, null, 2));

  // Screenshot during hover
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/screenshots/ref_theme_during_hover.png', Buffer.from(shot1.data, 'base64'));

  // Move mouse away (unhover)
  await send('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: 0,
    y: 0
  });

  // Sample track transform during unhover
  const unhoverFrames = [];
  for (let t = 0; t <= 400; t += 50) {
    await new Promise(r => setTimeout(r, 50));
    const sample = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('.theme-toggle');
          const track = btn ? btn.querySelector('.wave-icon-track') : null;
          return {
            btnBg: btn ? getComputedStyle(btn).backgroundColor : null,
            trackTransform: track ? getComputedStyle(track).transform : null
          };
        })()
      `,
      returnByValue: true
    });
    unhoverFrames.push({ t, ...sample.result.value });
  }

  console.log('=== UNHOVER MOTION FRAMES ===');
  console.log(JSON.stringify(unhoverFrames, null, 2));

  ws.close();
  process.exit(0);
}

main().catch(console.error);
