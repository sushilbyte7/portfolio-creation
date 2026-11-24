const fs = require('fs');

const code = fs.readFileSync('ref_assets/scripts/16l4lpbktiaum.js', 'utf8');

// Search for component patterns like `function ComponentName(` or `const ComponentName =`
// In minified code, React components typically return `(0,t.jsx)(` or `(0,t.jsxs)(`
const fnMatches = [...code.matchAll(/function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)\s*\{/g)];
console.log('Total functions:', fnMatches.length);

fnMatches.forEach((fn, idx) => {
  const name = fn[1];
  const start = fn.index;
  const snippet = code.slice(start, start + 300);
  if (snippet.includes('(0,t.jsx)') || snippet.includes('(0,t.jsxs)')) {
    console.log(`\nComponent [${idx}] ${name}:`);
    // Find what className or aria-label it renders
    const classes = [...snippet.matchAll(/className:"([^"]+)"/g)].map(m => m[1]);
    console.log('  Classes:', classes.join(', '));
    const ids = [...snippet.matchAll(/id:"([^"]+)"/g)].map(m => m[1]);
    if (ids.length) console.log('  IDs:', ids.join(', '));
  }
});
