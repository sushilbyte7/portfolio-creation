const fs = require('fs');

async function main() {
  const wsUrl = 'ws://127.0.0.1:9222/devtools/page/0475F7BBA178F61FCC0E1261E829189F';
  const ws = new WebSocket(wsUrl);

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
  console.log('Connected to Chrome CDP!');

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  const evalRes1 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const wordmark = document.querySelector('.wordmark-text');
        const trigger = document.querySelector('.nav-menu-trigger');
        const triggerSvg = trigger ? trigger.querySelector('svg') : null;
        const circles = triggerSvg ? Array.from(triggerSvg.querySelectorAll('circle')).map(c => ({
          cx: c.getAttribute('cx'),
          cy: c.getAttribute('cy'),
          r: c.getAttribute('r'),
          fill: getComputedStyle(c).fill,
          stroke: getComputedStyle(c).stroke,
          strokeWidth: getComputedStyle(c).strokeWidth
        })) : [];

        return {
          wordmark: wordmark ? {
            text: wordmark.textContent,
            computed: {
              fontSize: getComputedStyle(wordmark).fontSize,
              fontWeight: getComputedStyle(wordmark).fontWeight,
              fontFamily: getComputedStyle(wordmark).fontFamily,
              letterSpacing: getComputedStyle(wordmark).letterSpacing,
              transformOrigin: getComputedStyle(wordmark).transformOrigin
            }
          } : null,
          trigger: trigger ? {
            rect: trigger.getBoundingClientRect(),
            computed: {
              width: getComputedStyle(trigger).width,
              height: getComputedStyle(trigger).height,
              background: getComputedStyle(trigger).backgroundColor,
              borderRadius: getComputedStyle(trigger).borderRadius,
              padding: getComputedStyle(trigger).padding
            },
            svg: triggerSvg ? {
              outerHTML: triggerSvg.outerHTML,
              rect: triggerSvg.getBoundingClientRect(),
              computedWidth: getComputedStyle(triggerSvg).width,
              computedHeight: getComputedStyle(triggerSvg).height,
              circles
            } : null
          } : null
        };
      })()
    `,
    returnByValue: true
  });

  console.log('--- NAVBAR & TRIGGER INSPECTION ---');
  console.log(JSON.stringify(evalRes1.result.value, null, 2));

  // Now, let's close the dialog if already open, then inject a frame-recorder and open it!
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const d = document.querySelector('#navigation-panel');
        if (d && d.open) d.close();
      })()
    `
  });

  await new Promise(r => setTimeout(r, 300));

  // Now inject animation recorder and click trigger
  const recordRes = await send('Runtime.evaluate', {
    expression: `
      new Promise((resolve) => {
        const trigger = document.querySelector('.nav-menu-trigger');
        const samples = [];
        const startTime = performance.now();

        // Trigger open
        trigger.click();

        const dialog = document.querySelector('#navigation-panel');
        const pieces = Array.from(dialog.querySelectorAll('.nav-menu-piece'));
        const primaryLinks = Array.from(dialog.querySelectorAll('.nav-menu-primary a'));

        function sample() {
          const t = performance.now() - startTime;
          const pieceSamples = pieces.slice(0, 10).map((p, idx) => ({
            char: p.textContent,
            transform: p.style.transform || getComputedStyle(p).transform,
            opacity: p.style.opacity || getComputedStyle(p).opacity,
            willChange: p.style.willChange || getComputedStyle(p).willChange
          }));

          const dialogTransform = dialog.style.transform || getComputedStyle(dialog).transform;
          const dialogOpacity = dialog.style.opacity || getComputedStyle(dialog).opacity;
          const backdropOpacity = dialog.style.getPropertyValue('--nav-backdrop-opacity') || getComputedStyle(dialog).getPropertyValue('--nav-backdrop-opacity');

          samples.push({
            t: Math.round(t),
            dialog: { transform: dialogTransform, opacity: dialogOpacity, backdropOpacity },
            pieces: pieceSamples
          });

          if (t < 1200) {
            requestAnimationFrame(sample);
          } else {
            resolve({
              sampleCount: samples.length,
              samples: samples.filter((_, i) => i % 5 === 0), // take every 5th frame for concise log
              dialogStyles: {
                open: dialog.open,
                rect: dialog.getBoundingClientRect(),
                computed: {
                  position: getComputedStyle(dialog).position,
                  inset: getComputedStyle(dialog).inset,
                  width: getComputedStyle(dialog).width,
                  height: getComputedStyle(dialog).height,
                  background: getComputedStyle(dialog).backgroundColor,
                  borderRadius: getComputedStyle(dialog).borderRadius,
                  boxShadow: getComputedStyle(dialog).boxShadow,
                  border: getComputedStyle(dialog).border,
                  overflow: getComputedStyle(dialog).overflow
                }
              },
              primaryLinks: primaryLinks.map(a => ({
                text: a.textContent.trim(),
                href: a.getAttribute('href'),
                fontSize: getComputedStyle(a).fontSize,
                fontWeight: getComputedStyle(a).fontWeight,
                lineHeight: getComputedStyle(a).lineHeight,
                letterSpacing: getComputedStyle(a).letterSpacing
              })),
              fullHtml: dialog.outerHTML
            });
          }
        }

        requestAnimationFrame(sample);
      })
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('--- MODAL ANIMATION & DESIGN INSPECTION ---');
  const res = recordRes.result.value;
  console.log('Dialog Styles:', JSON.stringify(res.dialogStyles, null, 2));
  console.log('Primary Links:', JSON.stringify(res.primaryLinks, null, 2));
  console.log('Sample count:', res.sampleCount);
  console.log('First 10 sampled frames:');
  console.log(JSON.stringify(res.samples.slice(0, 10), null, 2));

  fs.writeFileSync('scripts/dialog_full.html', res.fullHtml);
  fs.writeFileSync('scripts/dialog_samples.json', JSON.stringify(res.samples, null, 2));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/screenshots/ref_nav_modal.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot to scripts/screenshots/ref_nav_modal.png');

  ws.close();
  process.exit(0);
}

main().catch(console.error);
