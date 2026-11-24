const fs = require('fs');

const f2 = fs.readFileSync('ref_assets/scripts/16l4lpbktiaum.js', 'utf8');
const expIdx = f2.indexOf('experience-section');
if (expIdx !== -1) {
  console.log('--- Experience Section ---');
  console.log(f2.substring(expIdx - 500, expIdx + 3500));
}
