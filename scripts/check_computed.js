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

  const actualEval = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const dialog = document.querySelector('#navigation-panel');
        const piece = dialog ? dialog.querySelector('.nav-menu-piece') : null;
        const primaryLink = dialog ? dialog.querySelector('.nav-menu-primary a') : null;
        const closeCircle = dialog ? dialog.querySelector('.nav-close-circle') : null;

        return {
          dialogTransitions: dialog ? getComputedStyle(dialog).transition : null,
          dialogAnimation: dialog ? getComputedStyle(dialog).animation : null,
          pieceTransition: piece ? getComputedStyle(piece).transition : null,
          pieceAnimation: piece ? getComputedStyle(piece).animation : null,
          primaryLinkTransition: primaryLink ? getComputedStyle(primaryLink).transition : null,
          primaryLinkAnimation: primaryLink ? getComputedStyle(primaryLink).animation : null,
          closeCircleTransition: closeCircle ? getComputedStyle(closeCircle).transition : null
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Computed animations/transitions:', JSON.stringify(actualEval.result.value, null, 2));

  ws.close();
  process.exit(0);
}

main().catch(console.error);
