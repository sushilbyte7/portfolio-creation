const fs = require('fs');

const s1 = fs.readFileSync('ref_assets/style1.css', 'utf8');
const globals = fs.readFileSync('src/styles/globals.css', 'utf8');

console.log('style1.css length:', s1.length);
console.log('globals.css length:', globals.length);

// Check key selectors
const selectors = [
  '.hero-letter-window',
  '.hero-letter',
  '.hero-code-mark',
  '.hero-code-depth',
  '.hero-word',
  '.title-line',
  '.portrait-journey',
  '.portrait-sticky-stage',
  '.portrait-card',
  '.portrait-face',
  '.portrait-motion-ready',
  '.portrait-motion-active',
  '.bio-introduction',
  '.bio-portrait',
  '.bio-description',
  '.skills-specimens',
  '.skills-specimen',
  '.skills-type-mosaic',
  '.project-folder',
  '.folder-scene',
  '.folder-back',
  '.folder-paper',
  '.folder-paper-preview',
  '.folder-front',
  '.project-details-panel',
  '.project-study',
  '.smartops-act',
  '.journey-roadmap',
  '.journey-road-track',
  '.journey-road-ink',
  '.journey-stop',
  '.journey-stop-marker',
  '.career-road-draw',
  '.career-pin-arrive',
  '.contact-layout',
  '.contact-opening',
  '.contact-form',
  '.email-block',
  '.site-footer',
  '.footer-top',
  '.footer-crowd-scene',
  '.footer-crowd-name'
];

selectors.forEach(sel => {
  const inGlobals = globals.includes(sel);
  const inS1 = s1.includes(sel);
  if (!inGlobals && inS1) {
    console.log(`[MISSING in globals.css]: ${sel}`);
  }
});
