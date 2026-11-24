const fs = require('fs');

let css = fs.readFileSync('src/styles/globals.css', 'utf8');

// Replace relative font URLs
css = css.replace(/url\(['"]?\.\.\/media\/edb5f85793adc1bb[^'")]+['"]?\)/g, "url('/fonts/font3.woff2')");
css = css.replace(/url\(['"]?\.\.\/media\/92b6de9cb55945e2[^'")]+['"]?\)/g, "url('/fonts/font2.woff2')");
css = css.replace(/url\(['"]?\.\.\/media\/237858b39a32779d[^'")]+['"]?\)/g, "url('/fonts/font1.woff2')");

// Also check for any other ../ references
const remaining = [...css.matchAll(/url\(['"]?(\.\.[^'")]+)['"]?\)/g)];
console.log('Remaining relative URLs:', remaining.map(m => m[1]));

fs.writeFileSync('src/styles/globals.css', css, 'utf8');
console.log('Successfully updated globals.css!');
