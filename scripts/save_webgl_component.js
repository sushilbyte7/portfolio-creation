const fs = require('fs');

const code = fs.readFileSync('ref_assets/scripts/16l4lpbktiaum.js', 'utf8');

const vsIdx = code.indexOf('attribute vec2 position;');
const compEnd = code.indexOf('let m=`const aswin = {');

console.log('Shader component span:', vsIdx, 'to', compEnd);
const compCode = code.slice(vsIdx - 30, compEnd);
fs.writeFileSync('scripts/extracted_webgl_component.js', compCode);
console.log('Saved to scripts/extracted_webgl_component.js (length:', compCode.length, ')');
