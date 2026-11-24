const fs = require('fs');

const css = fs.readFileSync('ref_assets/style1.css', 'utf8');

function findCssRules(selector) {
  let idx = 0;
  while ((idx = css.indexOf(selector, idx)) !== -1) {
    const start = Math.max(0, idx - 50);
    const end = Math.min(css.length, idx + 400);
    console.log(`\n--- Match for "${selector}" ---`);
    console.log(css.substring(start, end));
    idx += selector.length + 10;
  }
}

findCssRules('.footer-top');
findCssRules('.footer-crowd');
findCssRules('.footer-finale');
