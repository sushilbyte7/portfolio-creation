const fs = require('fs');
const f2 = fs.readFileSync('ref_assets/scripts/16l4lpbktiaum.js', 'utf8');

const pIdx = f2.indexOf('portrait-journey');
if (pIdx !== -1) {
  console.log('--- Portrait Journey code ---');
  console.log(f2.substring(pIdx - 3500, pIdx + 1500));
}
