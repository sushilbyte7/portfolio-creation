const fs = require('fs');

const f1 = fs.readFileSync('ref_assets/scripts/21sr_t--ov9wk.js', 'utf8');
const f2 = fs.readFileSync('ref_assets/scripts/16l4lpbktiaum.js', 'utf8');

// Let's see what components are exported or defined
function findComponentNames(text) {
  const matches = [];
  const regex = /e\.s\(\["([a-zA-Z0-9_]+)"/g;
  let m;
  while ((m = regex.exec(text)) !== null) {
    matches.push(m[1]);
  }
  return matches;
}

console.log('Components in 21sr_t--ov9wk.js:', findComponentNames(f1));
console.log('Components in 16l4lpbktiaum.js:', findComponentNames(f2));

// Also let's search for function / component names in all scripts
const scriptDir = 'ref_assets/scripts';
fs.readdirSync(scriptDir).forEach(file => {
  const content = fs.readFileSync(`${scriptDir}/${file}`, 'utf8');
  const comps = findComponentNames(content);
  if (comps.length > 0) {
    console.log(`Components in ${file}:`, comps);
  }
});
