const fs = require('fs');
const js = fs.readFileSync('ref_assets/scripts/16l4lpbktiaum.js', 'utf8');
const idx = js.indexOf('Aswin, home');
if (idx !== -1) {
  console.log(js.slice(idx - 400, idx + 400));
} else {
  console.log('Not found');
}
