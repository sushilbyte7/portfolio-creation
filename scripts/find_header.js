const fs = require('fs');
const c = fs.readFileSync('ref_assets/scripts/21sr_t--ov9wk.js', 'utf8');
const pos = c.indexOf('wordmark-text');
console.log(c.slice(pos - 1800, pos - 800));
