const fs = require('fs');
const js = fs.readFileSync('ref_assets/scripts/16l4lpbktiaum.js', 'utf8');
const css1 = fs.readFileSync('ref_assets/style1.css', 'utf8');

// Search for Aswin in JS
const idx = js.indexOf('Aswin, home');
if (idx !== -1) {
  console.log('--- JS CONTEXT ---');
  console.log(js.slice(idx - 300, idx + 600));
}

// Search for header or pill or nav in style1.css
const lines = css1.split('\n');
const matchingRules = lines.filter(line => /site-header|wordmark|floating|dialog|nav-panel/i.test(line));
console.log('--- CSS MATCHES ---');
console.log(matchingRules.slice(0, 30).join('\n'));
