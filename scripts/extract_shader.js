const fs = require('fs');
const f2 = fs.readFileSync('ref_assets/scripts/16l4lpbktiaum.js', 'utf8');

const sIdx = f2.indexOf('attribute vec2 position');
if (sIdx !== -1) {
  console.log('--- Shader & WebGL Canvas code ---');
  console.log(f2.substring(sIdx - 100, sIdx + 4500));
}
