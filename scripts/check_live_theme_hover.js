async function run() {
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

  const rectRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const r = document.querySelector('.theme-toggle').getBoundingClientRect();
      return { left: r.left, top: r.top, width: r.width, height: r.height };
    })()`,
    returnByValue: true
  });
  console.log('Button rect:', rectRes.result.value);
  const r = rectRes.result.value;
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  // Move mouse onto button
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: cx, y: cy });

  // Sample track transform every 50ms for 350ms
  const frames = [];
  for (let t = 0; t <= 350; t += 50) {
    await new Promise(res => setTimeout(res, 50));
    const sample = await send('Runtime.evaluate', {
      expression: `(() => {
        const tr = document.querySelector('.theme-toggle .wave-icon-track');
        return { transform: getComputedStyle(tr).transform };
      })()`,
      returnByValue: true
    });
    frames.push({ t, ...sample.result.value });
  }
  console.log('Hover frames:', JSON.stringify(frames, null, 2));

  // Unhover
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
  console.log('Unhover frames:', JSON.stringify(unhoverFrames, null, 2));

  ws.close();
}
run().catch(console.error);
