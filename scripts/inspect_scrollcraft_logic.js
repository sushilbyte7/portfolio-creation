const fs = require('fs');

const code = fs.readFileSync('ref_assets/scrollcraft.js', 'utf8');

// Find all matches for data-sc-
const matches = [...code.matchAll(/data-sc-[a-zA-Z0-9_-]+/g)].map(m => m[0]);
console.log('All data-sc attributes handled by ScrollCraft:');
console.log([...new Set(matches)]);

// Let's inspect where flow is handled
const flowIdx = code.indexOf('"flow"');
console.log('\n--- FLOW HANDLING ---');
console.log(code.slice(flowIdx - 200, flowIdx + 600));

// Let's inspect how sc-in or in-view is handled
const inIdx = code.indexOf('sc-in');
console.log('\n--- SC-IN HANDLING ---');
console.log(code.slice(inIdx - 200, inIdx + 600));
