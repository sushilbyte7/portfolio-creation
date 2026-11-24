const fs = require('fs');

const html = fs.readFileSync('index_ref.html', 'utf8');

// Find all elements with data-sc
const scMatches = [...html.matchAll(/data-sc-[a-z0-9-]+(?:="[^"]*")?/g)].map(m => m[0]);
console.log('--- DATA-SC ATTRIBUTES (Count:', scMatches.length, ') ---');
console.log([...new Set(scMatches)]);

// Find all tags in main
const sections = [...html.matchAll(/<(header|section|footer|main|nav|dialog|aside)[^>]*>/gi)].map(m => m[0]);
console.log('\n--- MAIN STRUCTURE TAGS ---');
sections.forEach(s => console.log(s));

// Find script tags
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[0]);
console.log('\n--- SCRIPT TAGS (Count:', scripts.length, ') ---');
scripts.forEach((s, i) => {
  if (s.includes('src=')) {
    console.log(`[Script ${i}] External:`, s.match(/src="([^"]*)"/)?.[1]);
  } else {
    console.log(`[Script ${i}] Inline (${s.length} chars):`, s.slice(0, 150).replace(/\n/g, ' '));
  }
});
