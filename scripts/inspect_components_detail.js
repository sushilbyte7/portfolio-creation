const fs = require('fs');
const code = fs.readFileSync('ref_assets/scripts/16l4lpbktiaum.js', 'utf8');

const fnMatches = [...code.matchAll(/function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)\s*\{/g)];
[20, 21, 22, 23, 24, 25, 26, 27].forEach(i => {
  if (!fnMatches[i]) return;
  const start = fnMatches[i].index;
  const end = fnMatches[i+1] ? fnMatches[i+1].index : start + 3000;
  console.log(`\n=================== COMPONENT [${i}] ${fnMatches[i][1]} ===================`);
  console.log(code.slice(start, Math.min(start + 2500, end)));
});
