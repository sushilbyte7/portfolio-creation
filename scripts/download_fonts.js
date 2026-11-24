const fs = require('fs');

const css = fs.readFileSync('ref_assets/style1.css', 'utf8');
const fontMatches = css.match(/url\(([^)]+\.woff2?)\)/g) || [];
console.log('Font matches in style1.css:', fontMatches);

const cleanUrls = fontMatches.map(m => m.replace(/url\(['"]?/, '').replace(/['"]?\)/, ''));
console.log('Clean font URLs:', cleanUrls);

async function downloadFonts() {
  if (!fs.existsSync('ref_assets/fonts')) {
    fs.mkdirSync('ref_assets/fonts', { recursive: true });
  }
  for (const url of cleanUrls) {
    const fullUrl = url.startsWith('http') ? url : `https://www.aswinpanengal.me${url}`;
    const filename = url.split('/').pop().split('?')[0];
    try {
      const res = await fetch(fullUrl);
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(`ref_assets/fonts/${filename}`, buffer);
      console.log(`Downloaded ${filename} (${buffer.length} bytes)`);
    } catch (e) {
      console.error(`Failed to download ${fullUrl}:`, e);
    }
  }
}

downloadFonts();
