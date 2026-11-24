const fs = require('fs');

const cssFiles = ['style1.css', 'style2.css', 'style3.css', 'style4.css'];
cssFiles.forEach(file => {
  if (!fs.existsSync('ref_assets/' + file)) return;
  const content = fs.readFileSync('ref_assets/' + file, 'utf8');
  console.log(`\n=== KEYFRAMES IN ${file} ===`);
  const kfMatches = [...content.matchAll(/@keyframes\s+([a-zA-Z0-9_-]+)\s*\{([^}]*\{[^}]*\}[^}]*)\}/g)];
  kfMatches.forEach(m => {
    console.log(`\nKeyframe: ${m[1]}`);
    console.log(m[2].trim().slice(0, 300));
  });
  
  console.log(`\n=== TRANSITIONS / ANIMATIONS IN ${file} ===`);
  const animMatches = [...content.matchAll(/(animation(?:-[a-z]+)?\s*:[^;]+;)/g)];
  console.log('Animation rules count:', animMatches.length);
  const uniqueAnims = [...new Set(animMatches.map(m => m[1]))];
  uniqueAnims.slice(0, 30).forEach(a => console.log('  ', a));
});
