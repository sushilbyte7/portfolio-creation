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
  console.log('Connected to reference CDP!');

  // Close modal if open
  await send('Runtime.evaluate', {
    expression: `(() => {
      const d = document.querySelector('#navigation-panel');
      if (d && d.open) d.close();
    })()`
  });

  await new Promise(r => setTimeout(r, 400));

  // Inspect .hero-focus, .terminal-text, .terminal-caret
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

  console.log('=== REFERENCE HERO CARET INSPECTION ===');
  console.log(JSON.stringify(inspectRes.result.value, null, 2));

  // Toggle dark mode and inspect colors
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
  console.log('=== DARK THEME CARET INSPECTION ===', darkRes.result.value);

  // Switch back to light theme
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.theme-toggle').click()`
  });

  ws.close();
  process.exit(0);
}

main().catch(console.error);
