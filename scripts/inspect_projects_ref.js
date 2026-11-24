const fs = require('fs');
const html = fs.readFileSync('index_ref.html', 'utf8');

const start = html.indexOf('<section id=\"projects\"');
const nextSection = html.indexOf('<section id=\"experience\"');
const projHtml = html.slice(start, nextSection);

console.log('--- PROJECTS SECTION HTML LENGTH:', projHtml.length);

// List direct child tags or articles
const articles = [...projHtml.matchAll(/<article[^>]*>[\s\S]*?<\/article>/gi)];
console.log('Found articles:', articles.length);
articles.forEach((a, i) => {
  const openTag = a[0].match(/<article[^>]*>/)[0];
  const h = a[0].match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/)?.[1];
  console.log(`Article ${i}: ${openTag} -> Heading: ${h}`);
});

// Also print the elements before the articles
const beforeArticles = projHtml.slice(0, projHtml.indexOf('<article'));
console.log('\n--- BEFORE ARTICLES ---:\n', beforeArticles);
