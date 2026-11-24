const fs = require('fs');

const scriptDir = 'ref_assets/scripts';
fs.readdirSync(scriptDir).forEach(file => {
  const content = fs.readFileSync(`${scriptDir}/${file}`, 'utf8');
  if (content.includes('68248')) {
    console.log(`68248 in ${file}`);
    const idx = content.indexOf('68248');
    console.log(content.substring(idx - 100, idx + 800));
  }
  if (content.includes('wave-glyph')) {
    console.log(`wave-glyph in ${file}`);
    const idx = content.indexOf('wave-glyph');
    console.log(content.substring(idx - 200, idx + 800));
  }
});
