async function main() {
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
  await send('CSS.enable');

  const docRes = await send('DOM.getDocument');
  const nodeRes = await send('DOM.querySelector', {
    nodeId: docRes.root.nodeId,
    selector: '.terminal-text'
  });

  const matchedRes = await send('CSS.getMatchedStylesForNode', { nodeId: nodeRes.nodeId });
  console.log('=== MATCHED RULES FOR .terminal-text ===');
  matchedRes.matchedCSSRules.forEach(rule => {
    console.log(rule.rule.selectorList.text, rule.rule.style.cssText);
  });

  // Also query children
  const childrenRes = await send('DOM.querySelectorAll', {
    nodeId: nodeRes.nodeId,
    selector: '*'
  });

  for (const childId of childrenRes.nodeIds) {
    const childMatched = await send('CSS.getMatchedStylesForNode', { nodeId: childId });
    const desc = await send('DOM.describeNode', { nodeId: childId });
    console.log('--- Child:', desc.node.nodeName, desc.node.attributes);
    childMatched.matchedCSSRules.forEach(rule => {
      console.log('  ', rule.rule.selectorList.text, rule.rule.style.cssText);
    });
  }

  ws.close();
}

main().catch(console.error);
