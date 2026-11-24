const fs = require('fs');

async function main() {
  // First find or create a tab for localhost:3000
  const targetsRes = await fetch('http://127.0.0.1:9222/json');
  const targets = await targetsRes.json();
  console.log('Current Chrome targets:', targets.length);

  // Create a new tab or reuse
  const newTabRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:3000', { method: 'PUT' });
  const target = await newTabRes.json();
  console.log('Opened target:', target.id, target.webSocketDebuggerUrl);

  const ws = new WebSocket(target.webSocketDebuggerUrl);
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
  console.log('Connected to CDP for localhost:3000');

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Wait 2.5s for page to load and fonts/shaders to initialize
  await new Promise(r => setTimeout(r, 2500));

  // Inspect Navbar and Ellipsis trigger
  const navInspect = await send('Runtime.evaluate', {
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

  console.log('=== CLONE NAVBAR & TRIGGER ===');
  console.log(JSON.stringify(navInspect.result.value, null, 2));

  // Check wordmark rotation after hovering or waiting
  const rotateInspect = await send('Runtime.evaluate', {
    expression: `
      new Promise((resolve) => {
        const wordmarkLink = document.querySelector('.wordmark');
        const wordmark = document.querySelector('.wordmark-text');
        const startTransform = wordmark ? wordmark.style.transform : '';

        // Simulate hover
        wordmarkLink.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));

        setTimeout(() => {
          const midTransform = wordmark ? wordmark.style.transform : '';
          const isSpinning = wordmark ? wordmark.dataset.spinning : '';
          resolve({ startTransform, midTransform, isSpinning });
        }, 150);
      })
    `,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('=== WORDMARK ROTATION VERIFICATION ===');
  console.log(JSON.stringify(rotateInspect.result.value, null, 2));

  // Now click the 3-dot trigger to test modal opening and text animation
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.nav-menu-trigger').click()`
  });
  console.log('Clicked 3-dot trigger to open modal!');

  // Wait 400ms for open animation to complete
  await new Promise(r => setTimeout(r, 500));

  // Inspect Modal DOM & styles
  const modalInspect = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const dialog = document.querySelector('#navigation-panel');
        if (!dialog) return { error: 'no dialog' };
        const panel = dialog.querySelector('.nav-panel');
        const primaryLinks = Array.from(dialog.querySelectorAll('.nav-menu-primary a')).map(a => ({
          text: a.textContent.trim(),
          href: a.getAttribute('href'),
          fontSize: getComputedStyle(a).fontSize,
          fontWeight: getComputedStyle(a).fontWeight,
          lineHeight: getComputedStyle(a).lineHeight,
          letterSpacing: getComputedStyle(a).letterSpacing,
          pieceCount: a.querySelectorAll('.nav-menu-piece').length
        }));
        const secondaryLinks = Array.from(dialog.querySelectorAll('.nav-menu-secondary a')).map(a => ({
          text: a.textContent.trim(),
          href: a.getAttribute('href'),
          fontSize: getComputedStyle(a).fontSize,
          pieceCount: a.querySelectorAll('.nav-menu-piece').length
        }));
        const closeBtn = dialog.querySelector('.nav-panel-close');
        const closeCircle = dialog.querySelector('.nav-close-circle');
        const email = dialog.querySelector('.nav-panel-email');
        const socials = Array.from(dialog.querySelectorAll('.nav-panel-socials a')).map(a => ({
          label: a.getAttribute('aria-label'),
          hasSvg: !!a.querySelector('svg'),
          isPiece: a.classList.contains('nav-menu-piece')
        }));

        return {
          dialog: {
            open: dialog.open,
            motion: dialog.dataset.motion,
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
          panel: {
            padding: getComputedStyle(panel).padding
          },
          closeBtn: {
            fontSize: getComputedStyle(closeBtn).fontSize,
            gap: getComputedStyle(closeBtn).gap,
            circleWidth: getComputedStyle(closeCircle).width,
            circleHeight: getComputedStyle(closeCircle).height,
            circleBackground: getComputedStyle(closeCircle).backgroundColor
          },
          email: {
            text: email.textContent.trim(),
            pieceCount: email.querySelectorAll('.nav-menu-piece').length
          },
          primaryLinks,
          secondaryLinks,
          socials,
          totalPieces: dialog.querySelectorAll('.nav-menu-piece').length
        };
      })()
    `,
    returnByValue: true
  });

  console.log('=== CLONE MODAL INSPECTION ===');
  console.log(JSON.stringify(modalInspect.result.value, null, 2));

  // Capture screenshot of open modal in our clone
  const modalShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/screenshots/local_nav_modal.png', Buffer.from(modalShot.data, 'base64'));
  console.log('Saved screenshot to scripts/screenshots/local_nav_modal.png');

  // Test close animation: click close and measure pieces scattering
  const closeTest = await send('Runtime.evaluate', {
    expression: `
      new Promise((resolve) => {
        const dialog = document.querySelector('#navigation-panel');
        const closeBtn = dialog.querySelector('.nav-panel-close');
        const pieces = Array.from(dialog.querySelectorAll('.nav-menu-piece'));

        closeBtn.click();

        setTimeout(() => {
          const sample = pieces.slice(0, 5).map(p => ({
            char: p.textContent,
            transform: p.style.transform,
            opacity: p.style.opacity
          }));
          const dialogMotion = dialog.dataset.motion;
          resolve({ dialogMotion, sample });
        }, 300);
      })
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('=== CLOSE SCATTER ANIMATION TEST ===');
  console.log(JSON.stringify(closeTest.result.value, null, 2));

  // Wait for close animation to fully complete
  await new Promise(r => setTimeout(r, 900));

  const afterClose = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const dialog = document.querySelector('#navigation-panel');
        return {
          open: dialog.open,
          motion: dialog.dataset.motion
        };
      })()
    `,
    returnByValue: true
  });
  console.log('After close completed:', afterClose.result.value);

  // Close tab
  await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
  ws.close();
  process.exit(0);
}

main().catch(console.error);
