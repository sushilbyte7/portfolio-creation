const fs = require('fs');

const f2 = fs.readFileSync('ref_assets/scripts/16l4lpbktiaum.js', 'utf8');
const contactIdx = f2.indexOf('contact-section');
if (contactIdx !== -1) {
  console.log('--- Contact Section ---');
  console.log(f2.substring(contactIdx - 500, contactIdx + 3000));
}
