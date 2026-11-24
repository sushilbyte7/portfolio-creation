const fs = require('fs');
const f1 = fs.readFileSync('ref_assets/scripts/21sr_t--ov9wk.js', 'utf8');

const idx = f1.indexOf('/footer/bengaluru/crowd-');
if (idx !== -1) {
  console.log('--- Context around crowd- ---');
  console.log(f1.substring(idx - 500, idx + 1500));
}
