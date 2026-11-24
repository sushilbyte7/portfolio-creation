const fs = require('fs');
const html = fs.readFileSync('index_ref.html', 'utf8');

// find all script src
const scriptSrcs = [];
const scriptRegex = /<script\b[^>]*src="([^"]*)"[^>]*>/gi;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  scriptSrcs.push(match[1]);
}

console.log('Script files:', scriptSrcs);

// Let's download all the script files to ref_assets/scripts/
if (!fs.existsSync('ref_assets/scripts')) {
  fs.mkdirSync('ref_assets/scripts', { recursive: true });
}

async function fetchScripts() {
  for (const src of scriptSrcs) {
    const url = src.startsWith('http') ? src : `https://www.aswinpanengal.me${src}`;
    const filename = src.split('/').pop().split('?')[0];
    const outPath = `ref_assets/scripts/${filename}`;
    try {
      const res = await fetch(url);
      const text = await res.text();
      fs.writeFileSync(outPath, text, 'utf8');
      console.log(`Downloaded ${filename} (${text.length} bytes)`);
      
      // Search for crowd or footer
      if (text.includes('crowd') || text.includes('footer')) {
        console.log(`  -> ${filename} contains 'crowd' or 'footer'!`);
      }
    } catch (e) {
      console.error(`Failed to fetch ${url}:`, e);
    }
  }
}

fetchScripts();
