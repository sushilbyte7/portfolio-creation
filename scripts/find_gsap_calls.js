const fs = require('fs');

const code = fs.readFileSync('ref_assets/scripts/16l4lpbktiaum.js', 'utf8');

// Find all occurrences of timeline, to, fromTo, matchMedia, ScrollTrigger
const patterns = [/f\.f\.([a-zA-Z0-9_]+)/g, /gsap\.([a-zA-Z0-9_]+)/g, /timeline\(/g];

console.log('--- GSAP USAGE ---');
let m;
const usages = [];
const regex = /f\.f\.([a-zA-Z0-9_]+)/g;
while ((m = regex.exec(code)) !== null) {
  const start = Math.max(0, m.index - 50);
  const end = Math.min(code.length, m.index + 250);
  usages.push({ method: m[1], snippet: code.slice(start, end).replace(/\n/g, ' ') });
}
console.log('Total f.f calls:', usages.length);
usages.forEach((u, i) => console.log(`[${i}] f.f.${u.method}: ${u.snippet}\n`));
