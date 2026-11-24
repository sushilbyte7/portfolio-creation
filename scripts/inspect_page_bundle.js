const fs = require('fs');

const f2 = fs.readFileSync('ref_assets/scripts/16l4lpbktiaum.js', 'utf8');

// Search for state hooks, effects, and section renders
console.log('File length:', f2.length);

// Look for mentions of "portrait", "glyph", "career", "projects", "smartops", "talk"
const terms = ['portrait', 'glyph', 'career', 'SmartOps', 'ResumeLens', 'CRIS', 'wave', 'dialog', 'matrix'];
terms.forEach(term => {
  const count = (f2.match(new RegExp(term, 'gi')) || []).length;
  console.log(`Term "${term}": ${count} occurrences`);
});

// Let's dump the first 3000 chars of 16l4lpbktiaum.js
console.log('\n--- First 2000 chars ---');
console.log(f2.substring(0, 2000));
