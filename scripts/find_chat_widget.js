const fs = require('fs');
const path = require('path');

const dir = 'ref_assets/scripts';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  if (content.includes('ChatWidget')) {
    console.log(`Found ChatWidget in ${file}`);
    const idx = content.indexOf('ChatWidget');
    console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 400)));
  }
});
