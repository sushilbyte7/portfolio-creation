const fs = require('fs');
const css = fs.readFileSync('ref_assets/style1.css', 'utf8');

const idx = css.indexOf('.footer-crowd-scene');
if (idx !== -1) {
  console.log(css.substring(idx - 100, idx + 1200));
}
