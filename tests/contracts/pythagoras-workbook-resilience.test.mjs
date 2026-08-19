import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const reader = fs.readFileSync('pythagoras-workbook.js', 'utf8');

function functionBody(name) {
  const start = reader.indexOf(`function ${name}`);
  assert.notEqual(start, -1, `missing function ${name}`);
  const next = reader.indexOf('\nfunction ', start + 1);
  return reader.slice(start, next === -1 ? reader.length : next);
}

test('כשל של עמוד בודד אינו מפיל את כל חוברת פיתגורס', () => {
  const loader = functionBody('loadSourcePage');
  assert.match(reader, /let failedPages = 0;/u);
  assert.match(loader, /failedPages \+= 1;/u);
  assert.match(loader, /return false;/u);
  assert.doesNotMatch(loader, /throw error/u);
  assert.match(loader, /role['"], ['"]alert/u);
  assert.match(reader, /failedPages > 0[\s\S]*דפים נטענו[\s\S]*נכשלו/u);
});

test('מצב העמוד וכתובת ה-URL נשארים מקור אחד גם בגלילה ידנית', () => {
  const navigation = functionBody('installNavigation');
  assert.match(reader, /function syncUrlPage/u);
  assert.match(reader, /function setActivePage/u);
  assert.match(reader, /history\.replaceState/u);
  assert.match(navigation, /setActivePage\(local, \{ syncUrl: true \}\)/u);
  assert.match(reader, /goToPage[\s\S]*setActivePage\(localNumber, \{ syncUrl: true \}\)/u);
});

test('הסקיילינג אינו מכריח רוחב מינימלי שיכול ליצור overflow במסך צר', () => {
  const scaling = functionBody('installResponsiveScaling');
  assert.match(scaling, /Math\.max\(1, Math\.min\(currentWidth - 8, 900\)\)/u);
  assert.doesNotMatch(scaling, /Math\.max\(280/u);
});
