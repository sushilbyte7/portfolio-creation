const fs = require('fs');

const f2 = fs.readFileSync('ref_assets/scripts/16l4lpbktiaum.js', 'utf8');

const pIdx = f2.indexOf('project-details-panel');
if (pIdx !== -1) {
  console.log('--- Project Details Panel in f2 ---');
  console.log(f2.substring(pIdx - 1000, pIdx + 2000));
} else {
  console.log('Not in f2, checking f1...');
  const f1 = fs.readFileSync('ref_assets/scripts/21sr_t--ov9wk.js', 'utf8');
  const pIdx1 = f1.indexOf('project-details-panel');
  if (pIdx1 !== -1) {
    console.log('--- Project Details Panel in f1 ---');
    console.log(f1.substring(pIdx1 - 1000, pIdx1 + 2000));
  }
}
