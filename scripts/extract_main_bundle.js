const fs = require('fs');

const code = fs.readFileSync('ref_assets/scripts/16l4lpbktiaum.js', 'utf8');
console.log('File size:', code.length);

// Look for turbopack module declarations or standard function definitions
// Typically: (0, r.useEffect)(() => { ... }) or similar
// Let's search for snippets around IntersectionObserver, ScrollCraft, folder, roadmap, webgl
function findSnippets(term, count = 5, radius = 400) {
  console.log(`\n=================== TERM: "${term}" ===================`);
  let pos = 0;
  let found = 0;
  while ((pos = code.indexOf(term, pos)) !== -1 && found < count) {
    const start = Math.max(0, pos - 100);
    const end = Math.min(code.length, pos + radius);
    console.log(`\n[Occurrence ${found + 1} at ${pos}]:\n${code.slice(start, end)}\n-------------------`);
    found++;
    pos += term.length;
  }
}

findSnippets('ScrollCraft', 2, 600);
findSnippets('IntersectionObserver', 6, 600);
findSnippets('journey-roadmap', 2, 800);
findSnippets('webgl', 4, 600);
findSnippets('folder-paper', 2, 600);
