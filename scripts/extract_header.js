const fs = require('fs');

const f1 = fs.readFileSync('ref_assets/scripts/21sr_t--ov9wk.js', 'utf8');

const hdrIdx = f1.indexOf('site-header');
if (hdrIdx !== -1) {
  console.log('--- Site Header in f1 ---');
  console.log(f1.substring(hdrIdx - 500, hdrIdx + 2500));
} else {
  console.log('Not in f1, checking other scripts...');
  const scriptDir = 'ref_assets/scripts';
  fs.readdirSync(scriptDir).forEach(file => {
    const content = fs.readFileSync(`${scriptDir}/${file}`, 'utf8');
    if (content.includes('site-header')) {
      console.log(`site-header in ${file}`);
      const idx = content.indexOf('site-header');
      console.log(content.substring(idx - 500, idx + 2500));
    }
  });
}
