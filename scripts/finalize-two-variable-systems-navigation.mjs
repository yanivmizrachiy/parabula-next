import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function replaceExactly(file, from, to) {
  const full = path.join(root, file);
  const source = fs.readFileSync(full, 'utf8');
  const count = source.split(from).length - 1;
  if (count !== 1) {
    throw new Error(`${file}: expected exactly one navigation anchor, found ${count}`);
  }
  fs.writeFileSync(full, source.replace(from, to), 'utf8');
}

// Undo the provisional placement made by the intake generator.
replaceExactly(
  'עמוד-195.html',
  '<div class="nav-side"><a class="nav-link" href="עמוד-601.html">הבא</a></div>',
  '<div class="nav-side"><a class="nav-link" href="עמוד-320.html">הבא</a></div>',
);
replaceExactly(
  'עמוד-320.html',
  '<div class="nav-side"><a class="nav-link" href="עמוד-608.html">הקודם</a></div>',
  '<div class="nav-side"><a class="nav-link" href="עמוד-195.html">הקודם</a></div>',
);

// Insert the new topic at its canonical position in the global reading order.
replaceExactly(
  'עמוד-573.html',
  '<div class="nav-side"><a class="nav-link" href="עמוד-531.html">הבא</a></div>',
  '<div class="nav-side"><a class="nav-link" href="עמוד-601.html">הבא</a></div>',
);
replaceExactly(
  'עמוד-601.html',
  '<div class="nav-side"><a class="nav-link" href="עמוד-195.html">הקודם</a></div>',
  '<div class="nav-side"><a class="nav-link" href="עמוד-573.html">הקודם</a></div>',
);
replaceExactly(
  'עמוד-608.html',
  '<div class="nav-side"><a class="nav-link" href="עמוד-320.html">הבא</a></div>',
  '<div class="nav-side"><a class="nav-link" href="עמוד-531.html">הבא</a></div>',
);
replaceExactly(
  'עמוד-531.html',
  '<div class="nav-side"><a class="nav-link" href="עמוד-573.html">הקודם</a></div>',
  '<div class="nav-side"><a class="nav-link" href="עמוד-608.html">הקודם</a></div>',
);

console.log('[OK] רצף הניווט עודכן: עמוד-573 → עמוד-601..608 → עמוד-531');
