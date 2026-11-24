const fs = require('fs');
const html = fs.readFileSync('index_ref.html', 'utf8');

// Let's find all section tags
const sectionRegex = /<section\b([^>]*)>([\s\S]*?)<\/section>/gi;
let match;
const sections = [];
while ((match = sectionRegex.exec(html)) !== null) {
  const attrs = match[1];
  const inner = match[2];
  
  // extract id and class
  const idMatch = attrs.match(/id="([^"]*)"/i);
  const classMatch = attrs.match(/class="([^"]*)"/i);
  const scMatch = attrs.match(/data-sc-[a-z0-9-]+="([^"]*)"/gi);
  
  // extract h1, h2, h3
  const headings = [];
  const hRegex = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let hMatch;
  while ((hMatch = hRegex.exec(inner)) !== null) {
    headings.push(`${hMatch[1]}: ${hMatch[2].replace(/<[^>]+>/g, '').trim()}`);
  }
  
  sections.push({
    id: idMatch ? idMatch[1] : null,
    className: classMatch ? classMatch[1] : null,
    scAttrs: scMatch || [],
    headings,
    innerLength: inner.length
  });
}

console.log('--- FOUND SECTIONS ---');
console.log(JSON.stringify(sections, null, 2));

// Also check for header, footer, dialog, nav
const headerMatch = html.match(/<header\b([^>]*)>([\s\S]*?)<\/header>/i);
if (headerMatch) {
  console.log('--- HEADER ---', headerMatch[1]);
}

const footerMatch = html.match(/<footer\b([^>]*)>([\s\S]*?)<\/footer>/i);
if (footerMatch) {
  console.log('--- FOOTER ---', footerMatch[1]);
}

const dialogs = [];
const dialogRegex = /<dialog\b([^>]*)>([\s\S]*?)<\/dialog>/gi;
let dMatch;
while ((dMatch = dialogRegex.exec(html)) !== null) {
  dialogs.push(dMatch[1]);
}
console.log('--- DIALOGS ---', dialogs);
