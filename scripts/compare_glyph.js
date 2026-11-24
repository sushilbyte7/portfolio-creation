async function compareGlyph() {
  const fs = require('fs');
  const cloneCode = fs.readFileSync('src/components/GlyphBackground.tsx', 'utf8');
  const refCode = fs.readFileSync('ref_assets/scripts/16l4lpbktiaum.js', 'utf8');
  
  const refStart = refCode.indexOf('function p({code:e');
  const refEnd = refCode.indexOf('let m=`const aswin', refStart);
  const refFn = refCode.slice(refStart, refEnd);

  console.log('REF FUNCTION LENGTH:', refFn.length);
  // Check parameters and uniforms
  console.log('Ref uniforms:');
  const uniforms = refFn.match(/uniform[^(]*\([^)]*\)/g);
  console.log(uniforms);

  // Check shader differences
  const shaderStart = refCode.lastIndexOf('void main() {', refStart);
  const shaderCode = refCode.slice(shaderStart, refStart);
  console.log('Ref fragment shader includes:');
  console.log('clouds:', shaderCode.includes('clouds'));
  console.log('idle:', shaderCode.includes('idle'));
  console.log('mask:', shaderCode.includes('mask'));
  console.log('grey formula:');
  const greyMatch = shaderCode.match(/float grey = [^;]*;/);
  console.log(greyMatch ? greyMatch[0] : 'not found');

  const cloneGreyMatch = cloneCode.match(/float grey = [^;]*;/);
  console.log('Clone grey formula:');
  console.log(cloneGreyMatch ? cloneGreyMatch[0] : 'not found');
}
compareGlyph().catch(console.error);
