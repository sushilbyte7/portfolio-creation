const fs = require('fs');

const f2 = fs.readFileSync('ref_assets/scripts/16l4lpbktiaum.js', 'utf8');
const zIdx = f2.indexOf('rect",{width:"8",height:"8",x:"3",y:"3",rx:"2"');
if (zIdx !== -1) {
  console.log('--- Projects SmartOps, ResumeLens, CRIS ---');
  console.log(f2.substring(zIdx, zIdx + 8000));
}
