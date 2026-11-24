const fs = require('fs');
const code = fs.readFileSync('ref_assets/scripts/16l4lpbktiaum.js', 'utf8');

const idx = code.indexOf('portrait-journey');
// Find start of the component
const start = code.lastIndexOf('function', idx);
console.log(code.slice(start, idx + 2000));
