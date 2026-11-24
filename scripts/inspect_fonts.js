const fs = require('fs');
const css = fs.readFileSync('ref_assets/style1.css', 'utf8');

const ffRegex = /@font-face\s*\{([^}]+)\}/g;
let match;
while ((match = ffRegex.exec(css)) !== null) {
  console.log('--- FONT FACE ---');
  console.log(match[1].trim());
}
