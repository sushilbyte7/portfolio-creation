const fs = require('fs');
const html = fs.readFileSync('index_ref.html', 'utf8');

const footerStart = html.indexOf('<footer');
const footerEnd = html.indexOf('</footer>') + 9;
if (footerStart !== -1 && footerEnd !== -1) {
  const footerHtml = html.substring(footerStart, footerEnd);
  console.log('--- FOOTER HTML ---');
  console.log(footerHtml);
  fs.writeFileSync('ref_footer.html', footerHtml, 'utf8');
} else {
  console.log('Footer not found');
}
