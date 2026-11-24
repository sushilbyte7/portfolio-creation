const fs = require('fs');
const f2 = fs.readFileSync('ref_assets/scripts/16l4lpbktiaum.js', 'utf8');

function extractAround(term, pre = 200, post = 1000) {
  let idx = 0;
  while ((idx = f2.indexOf(term, idx)) !== null && idx !== -1) {
    console.log(`\n================ FOUND "${term}" at ${idx} ================`);
    console.log(f2.substring(Math.max(0, idx - pre), Math.min(f2.length, idx + post)));
    idx += term.length + 500;
  }
}

console.log('--- EXTRACTING PORTRAIT CODE ---');
extractAround('portrait-journey', 200, 1500);

console.log('\n--- EXTRACTING WAVE CODE ---');
extractAround('wave-glyph', 100, 1000);
