const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'ref_assets');
const files = ['style1.css', 'style2.css', 'style3.css', 'style4.css'];

let allCss = '';
files.forEach(f => {
  const p = path.join(dir, f);
  if (fs.existsSync(p)) {
    allCss += `\n/* === ${f} === */\n` + fs.readFileSync(p, 'utf8');
  }
});

// Find CSS variables (:root or html or [data-theme])
const varRegex = /(--[a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
const vars = {};
let match;
while ((match = varRegex.exec(allCss)) !== null) {
  vars[match[1]] = match[2].trim();
}

// Find font-family declarations
const fontRegex = /font-family\s*:\s*([^;]+);/g;
const fonts = new Set();
while ((match = fontRegex.exec(allCss)) !== null) {
  fonts.add(match[1].trim());
}

// Find keyframes
const kfRegex = /@keyframes\s+([a-zA-Z0-9-_]+)/g;
const keyframes = new Set();
while ((match = kfRegex.exec(allCss)) !== null) {
  keyframes.add(match[1]);
}

// Find classes
const classRegex = /\.([a-zA-Z0-9-_]+)/g;
const classes = new Set();
while ((match = classRegex.exec(allCss)) !== null) {
  classes.add(match[1]);
}

console.log('--- FOUND CSS VARIABLES ---');
console.log(JSON.stringify(vars, null, 2));

console.log('\n--- FOUND FONTS ---');
console.log(Array.from(fonts));

console.log('\n--- FOUND KEYFRAMES ---');
console.log(Array.from(keyframes));

console.log(`\n--- FOUND ${classes.size} CLASSES ---`);
const interestingClasses = Array.from(classes).filter(c => 
  c.includes('hero') || c.includes('nav') || c.includes('portrait') || 
  c.includes('project') || c.includes('footer') || c.includes('about') || 
  c.includes('skill') || c.includes('contact') || c.includes('sc-') ||
  c.includes('card') || c.includes('modal') || c.includes('glyph') ||
  c.includes('experience') || c.includes('crowd')
);
console.log('Interesting classes sample:', interestingClasses);
