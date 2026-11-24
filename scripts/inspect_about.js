const fs = require('fs');
const html = fs.readFileSync('index_ref.html', 'utf8');
const idx = html.indexOf('<section id="about"');
const end = html.indexOf('<section id="skills"');
console.log(html.slice(idx, end));
