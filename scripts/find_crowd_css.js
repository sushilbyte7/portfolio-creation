const fs = require('fs');

['style1.css', 'style2.css', 'style3.css', 'style4.css'].forEach(f => {
  const content = fs.readFileSync(`ref_assets/${f}`, 'utf8');
  const idx = content.indexOf('footer-crowd');
  if (idx !== -1) {
    console.log(`Found in ${f}:`);
    console.log(content.substring(idx - 50, idx + 1000));
  }
});
