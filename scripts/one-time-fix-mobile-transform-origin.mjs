import fs from 'node:fs';

const file = 'mobile-app.js';
const original = fs.readFileSync(file, 'utf8');
const matches = original.match(/top center/g) || [];
if (matches.length !== 2) {
  console.error(`Expected exactly 2 occurrences of "top center", found ${matches.length}`);
  process.exit(1);
}
const updated = original.replaceAll('top center', 'center top');
if (!updated.includes("setProperty('transform-origin', 'center top', 'important')")) {
  console.error('Inline canonical transform-origin was not updated');
  process.exit(1);
}
if (!updated.includes('transform-origin:center top !important')) {
  console.error('Injected canonical transform-origin was not updated');
  process.exit(1);
}
fs.writeFileSync(file, updated, 'utf8');
console.log('Updated mobile-app.js transform-origin to center top');
