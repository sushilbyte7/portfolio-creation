const fs = require('fs');

const code = fs.readFileSync('ref_assets/scripts/16l4lpbktiaum.js', 'utf8');

// Find vertex and fragment shaders
const vsMatch = code.match(/attribute vec2 position;[\s\S]*?(?=let u=)/);
const fsMatch = code.match(/precision highp float;[\s\S]*?(?=\(0,a\.useEffect\))/);

console.log('=== VERTEX SHADER ===');
if (vsMatch) console.log(vsMatch[0].slice(0, 500));

console.log('=== FRAGMENT SHADER ===');
if (fsMatch) console.log(fsMatch[0].slice(0, 1500));
