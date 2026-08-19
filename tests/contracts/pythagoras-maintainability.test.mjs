import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=(file)=>fs.readFileSync(file,'utf8');

test('עמוד 1 שומר את הגדרת 90° המפורשת ואינו מחזיר אותה לשדה השלמה',()=>{
  const html=read('עמוד-634.html');
  const note=html.match(/<div class="foundation-note">([\s\S]*?)<\/div>/u)?.[1]??'';
  assert.match(note,/\\\(90\^\\circ\\\)/u);
  assert.doesNotMatch(note,/foundation-fill|השלימו את מספר המעלות/u);
});

test('עמוד 3 משתמש ברכיבים סמנטיים מקומיים לתוויות ולתיבות',()=>{
  const html=read('עמוד-636.html');
  const css=read('styles/pages/עמוד-636.css');
  assert.ok((html.match(/pyt-vertex-label/gu)||[]).length>=12,'תוויות הקודקודים חייבות להשתמש במחלקה הסמנטית');
  assert.ok((html.match(/pyt-blank-leg/gu)||[]).length>=8,'תיבות הניצבים חייבות להשתמש במחלקה הייעודית');
  assert.match(css,/\.page-636 \.pyt-vertex-label\s*\{/u);
  assert.match(css,/\.page-636 \.pyt-blank-leg\s*\{/u);
  assert.match(css,/\.page-636 \.pyt-blank\s*\{[^}]*height:\s*26px/usu);
  assert.match(css,/\.page-636 \.pyt-blank\s*\{[^}]*box-shadow:\s*none/usu);
  assert.doesNotMatch(css,/(?:^|\n)\s*\.pyt-(?:blank|vertex-label)\s*\{/u,'כיוונון עמודי חייב להישאר scoped לעמוד 636');
});

test('תוויות הקודקודים בעמוד 3 נשארות בתוך גבולות ה-SVG',()=>{
  const html=read('עמוד-636.html');
  for(const svg of html.matchAll(/<svg class="foundation-svg" viewBox="0 0 ([\d.]+) ([\d.]+)"[\s\S]*?<\/svg>/gu)){
    const width=Number(svg[1]),height=Number(svg[2]),body=svg[0];
    for(const label of body.matchAll(/<text class="pt pyt-vertex-label" x="([\d.]+)" y="([\d.]+)"/gu)){
      const x=Number(label[1]),y=Number(label[2]);
      assert.ok(x>=8&&x<=width-8,`תווית קודקוד חורגת אופקית: x=${x}, width=${width}`);
      assert.ok(y>=14&&y<=height-5,`תווית קודקוד חורגת אנכית: y=${y}, height=${height}`);
    }
  }
  assert.doesNotMatch(html,/class="pt pyt-vertex-label"[^>]*y="150"/u,'אסור להחזיר את U מחוץ ל-viewBox');
});

test('Service Worker מכבד cache-busting של build ולא מחזיר CSS ישן לפני החדש',()=>{
  const sw=read('sw.js');
  assert.match(sw,/const version = url\.searchParams\.get\('v'\)/u,'normalizedRequest חייב לשמור את v');
  assert.match(sw,/if \(version\) url\.searchParams\.set\('v', version\)/u,'מפתח הקאש חייב לכלול את גרסת ה-build');
  assert.match(sw,/await self\.skipWaiting\(\)/u,'Service Worker חדש חייב להיכנס לפעולה מיד');
  assert.match(sw,/const isVersionedStatic = isStaticAsset && url\.searchParams\.has\('v'\)/u);
  assert.match(sw,/isNavigation \|\| isVersionedStatic[\s\S]*?\? networkFirst\(request\)/u,'נכס סטטי עם v חייב להיות network-first');
});
