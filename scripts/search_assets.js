const fs = require('fs');

const f1 = fs.readFileSync('ref_assets/scripts/21sr_t--ov9wk.js', 'utf8');
const f2 = fs.readFileSync('ref_assets/scripts/16l4lpbktiaum.js', 'utf8');

function findMatches(text, regex) {
  const matches = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    matches.push(m[0]);
  }
  return matches;
}

console.log('--- Paths in f1 ---');
const paths1 = findMatches(f1, /\/footer\/[a-zA-Z0-9_\-\.\/]+/g);
console.log(Array.from(new Set(paths1)));

console.log('--- Paths in f2 ---');
const paths2 = findMatches(f2, /\/footer\/[a-zA-Z0-9_\-\.\/]+/g);
console.log(Array.from(new Set(paths2)));

// Let's also look for png / webp / svg / jpg in both
console.log('--- Image paths in f1 ---');
const imgs1 = findMatches(f1, /\/[a-zA-Z0-9_\-\.\/]+\.(png|webp|svg|jpg|jpeg)/g);
console.log(Array.from(new Set(imgs1)));

console.log('--- Image paths in f2 ---');
const imgs2 = findMatches(f2, /\/[a-zA-Z0-9_\-\.\/]+\.(png|webp|svg|jpg|jpeg)/g);
console.log(Array.from(new Set(imgs2)));
