async function inspectDetails() {
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

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      // 1. Exact CSS rules for body::before
      const styleSheets = Array.from(document.styleSheets);
      const matchedRules = [];
      styleSheets.forEach(sheet => {
        try {
          Array.from(sheet.cssRules || []).forEach(rule => {
            if (rule.selectorText && (rule.selectorText.includes('::before') || rule.selectorText.includes('grain') || rule.selectorText.includes('glyph') || rule.selectorText.includes('hero-code'))) {
              matchedRules.push({ selector: rule.selectorText, cssText: rule.cssText });
            }
          });
        } catch(e) {}
      });

      // 2. Check dark mode rules
      // Toggle dark mode or check html class
      const htmlClasses = document.documentElement.className;
      const bodyBefore = getComputedStyle(document.body, '::before');
      const lightTheme = {
        htmlClass: htmlClasses,
        grain: {
          backgroundImage: bodyBefore.backgroundImage,
          opacity: bodyBefore.opacity,
          mixBlendMode: bodyBefore.mixBlendMode,
          backgroundSize: bodyBefore.backgroundSize,
          position: bodyBefore.position,
          top: bodyBefore.top,
          left: bodyBefore.left,
          width: bodyBefore.width,
          height: bodyBefore.height,
          zIndex: bodyBefore.zIndex,
          pointerEvents: bodyBefore.pointerEvents
        },
        glyphBg: (() => {
          const el = document.querySelector('.glyph-background');
          if (!el) return null;
          const pre = el.querySelector('.glyph-code-fallback');
          const canvas = el.querySelector('canvas');
          return {
            elDataset: Object.assign({}, el.dataset),
            elStyle: {
              opacity: getComputedStyle(el).opacity,
              position: getComputedStyle(el).position
            },
            preStyle: pre ? {
              color: getComputedStyle(pre).color,
              opacity: getComputedStyle(pre).opacity,
              fontSize: getComputedStyle(pre).fontSize,
              lineHeight: getComputedStyle(pre).lineHeight,
              fontFamily: getComputedStyle(pre).fontFamily,
              fontWeight: getComputedStyle(pre).fontWeight
            } : null,
            canvasStyle: canvas ? {
              width: canvas.width,
              height: canvas.height,
              styleWidth: canvas.style.width,
              styleHeight: canvas.style.height,
              opacity: getComputedStyle(canvas).opacity
            } : null
          };
        })()
      };

      return {
        matchedRules,
        lightTheme
      };
    })()`,
    returnByValue: true
  });

  console.log('REF DETAILS:');
  console.log(JSON.stringify(res.result.value, null, 2));

  // Toggle theme to dark and re-inspect
  const darkRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const themeBtn = document.querySelector('.theme-toggle, [aria-label*="theme"], [aria-label*="Theme"], button.theme');
      if (themeBtn) themeBtn.click();
      return document.documentElement.className;
    })()`,
    returnByValue: true
  });

  await new Promise(r => setTimeout(r, 600));

  const darkDetails = await send('Runtime.evaluate', {
    expression: `(() => {
      const bodyBefore = getComputedStyle(document.body, '::before');
      const el = document.querySelector('.glyph-background');
      const pre = el ? el.querySelector('.glyph-code-fallback') : null;
      return {
        htmlClass: document.documentElement.className,
        grain: {
          backgroundImage: bodyBefore.backgroundImage,
          opacity: bodyBefore.opacity,
          mixBlendMode: bodyBefore.mixBlendMode
        },
        preStyle: pre ? {
          color: getComputedStyle(pre).color,
          opacity: getComputedStyle(pre).opacity
        } : null
      };
    })()`,
    returnByValue: true
  });

  console.log('REF DARK DETAILS:');
  console.log(JSON.stringify(darkDetails.result.value, null, 2));

  // Switch back to light
  await send('Runtime.evaluate', {
    expression: `(() => {
      const themeBtn = document.querySelector('.theme-toggle, [aria-label*="theme"], [aria-label*="Theme"], button.theme');
      if (themeBtn) themeBtn.click();
    })()`
  });

  ws.close();
}

inspectDetails().catch(console.error);
