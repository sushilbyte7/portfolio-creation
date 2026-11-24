const fs = require('fs');

const css = fs.readFileSync('ref_assets/style1.css', 'utf8');

function findCssRules(selector) {
  let idx = 0;
  while ((idx = css.indexOf(selector, idx)) !== -1) {
    const start = Math.max(0, idx - 20);
    const end = Math.min(css.length, idx + 500);
    console.log(`\n--- Match for "${selector}" ---`);
    console.log(css.substring(start, end));
    idx += selector.length + 10;
  }
}

findCssRules('.project-folder');
findCssRules('.folder-scene');
findCssRules('.folder-front');
findCssRules('.folder-back');
findCssRules('.folder-paper');
