async function inspectBackground() {
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
      // 1. Check all elements for background-image, filter, SVG filters, canvas, ::before/::after
      const allElements = Array.from(document.querySelectorAll('*'));
      const bgImages = [];
      const svgFilters = [];
      const canvases = [];

      document.querySelectorAll('svg filter').forEach(f => {
        svgFilters.push(f.outerHTML);
      });

      document.querySelectorAll('canvas').forEach(c => {
        const r = c.getBoundingClientRect();
        canvases.push({
          className: c.className,
          id: c.id,
          rect: { left: r.left, top: r.top, width: r.width, height: r.height },
          style: {
            position: getComputedStyle(c).position,
            zIndex: getComputedStyle(c).zIndex,
            pointerEvents: getComputedStyle(c).pointerEvents,
            opacity: getComputedStyle(c).opacity
          }
        });
      });

      allElements.forEach(el => {
        const cs = getComputedStyle(el);
        const bg = cs.backgroundImage;
        if (bg && bg !== 'none') {
          bgImages.push({
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            backgroundImage: bg,
            backgroundSize: cs.backgroundSize,
            backgroundRepeat: cs.backgroundRepeat,
            backgroundPosition: cs.backgroundPosition,
            opacity: cs.opacity,
            mixBlendMode: cs.mixBlendMode,
            zIndex: cs.zIndex,
            pointerEvents: cs.pointerEvents,
            position: cs.position
          });
        }

        // Pseudo elements
        ['::before', '::after'].forEach(pseudo => {
          const pcs = getComputedStyle(el, pseudo);
          const pbg = pcs.backgroundImage;
          const pcontent = pcs.content;
          if ((pbg && pbg !== 'none') || (pcs.filter && pcs.filter !== 'none')) {
            bgImages.push({
              pseudo,
              tagName: el.tagName,
              className: el.className,
              id: el.id,
              content: pcontent,
              backgroundImage: pbg,
              filter: pcs.filter,
              backgroundSize: pcs.backgroundSize,
              backgroundRepeat: pcs.backgroundRepeat,
              backgroundPosition: pcs.backgroundPosition,
              opacity: pcs.opacity,
              mixBlendMode: pcs.mixBlendMode,
              zIndex: pcs.zIndex,
              pointerEvents: pcs.pointerEvents,
              position: pcs.position
            });
          }
        });
      });

      // 2. Check the background code text layer behind hero
      // Look for pre, code, or background text in .hero or body
      const codeElements = Array.from(document.querySelectorAll('pre, code, [class*="code"], [class*="glyph"], [class*="bg-text"], [class*="watermark"]')).map(el => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          outerHTML: el.outerHTML.slice(0, 200),
          rect: { left: r.left, top: r.top, width: r.width, height: r.height },
          computed: {
            color: cs.color,
            opacity: cs.opacity,
            fontFamily: cs.fontFamily,
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            lineHeight: cs.lineHeight,
            mixBlendMode: cs.mixBlendMode,
            filter: cs.filter,
            userSelect: cs.userSelect,
            pointerEvents: cs.pointerEvents,
            zIndex: cs.zIndex,
            position: cs.position
          },
          childrenCount: el.children.length,
          childrenTags: Array.from(el.children).slice(0, 5).map(c => ({
            tagName: c.tagName,
            className: c.className,
            color: getComputedStyle(c).color,
            fontWeight: getComputedStyle(c).fontWeight,
            opacity: getComputedStyle(c).opacity
          }))
        };
      });

      // Also check body & html styles
      const bodyCS = getComputedStyle(document.body);
      const htmlCS = getComputedStyle(document.documentElement);

      return {
        html: {
          backgroundColor: htmlCS.backgroundColor,
          backgroundImage: htmlCS.backgroundImage,
          filter: htmlCS.filter
        },
        body: {
          backgroundColor: bodyCS.backgroundColor,
          backgroundImage: bodyCS.backgroundImage,
          filter: bodyCS.filter
        },
        bgImages,
        svgFilters,
        canvases,
        codeElements
      };
    })()`,
    returnByValue: true
  });

  console.log(JSON.stringify(res.result.value, null, 2));
  ws.close();
}

inspectBackground().catch(console.error);
