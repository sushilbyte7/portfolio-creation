const fs = require('fs');
const path = require('path');

const dir = 'ref_assets/scripts';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

const searchTerms = [
  'ScrollCraft',
  'scrollcraft',
  'data-sc',
  'wave-window',
  'wave-glyph',
  'folder-paper',
  'project-details-panel',
  'journey-roadmap',
  'smartops',
  'IntersectionObserver',
  'webgl',
  'requestAnimationFrame'
];

searchTerms.forEach(term => {
  console.log(`\n=== SEARCH: "${term}" ===`);
  files.forEach(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    let count = 0;
    let pos = 0;
    while ((pos = content.indexOf(term, pos)) !== -1) {
      count++;
      pos += term.length;
    }
    if (count > 0) {
      console.log(`  ${file}: ${count} occurrences`);
    }
  });
});
