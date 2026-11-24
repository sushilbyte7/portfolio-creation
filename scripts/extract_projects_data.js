const fs = require('fs');

const f2 = fs.readFileSync('ref_assets/scripts/16l4lpbktiaum.js', 'utf8');
const eIdx = f2.indexOf('let S=(0,k.f)("arrow-right"');
if (eIdx !== -1) {
  console.log('--- Projects array and panel ---');
  console.log(f2.substring(eIdx, eIdx + 5000));
}
