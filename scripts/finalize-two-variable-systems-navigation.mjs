import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function replaceExactlyOrKeep(file, from, to) {
  const full = path.join(root, file);
  const source = fs.readFileSync(full, 'utf8');
  const fromCount = source.split(from).length - 1;
  const toCount = source.split(to).length - 1;

  if (fromCount === 1 && toCount === 0) {
    fs.writeFileSync(full, source.replace(from, to), 'utf8');
    return;
  }

  if (fromCount === 0 && toCount === 1) {
    return;
  }

  throw new Error(`${file}: invalid navigation state (source=${fromCount}, target=${toCount})`);
}

// Undo the provisional placement made by the intake generator.
replaceExactlyOrKeep(
  'עמוד-195.html',
  '<div class="nav-side"><a class="nav-link" href="עמוד-601.html">הבא</a></div>',
  '<div class="nav-side"><a class="nav-link" href="עמוד-320.html">הבא</a></div>',
);
replaceExactlyOrKeep(
  'עמוד-320.html',
  '<div class="nav-side"><a class="nav-link" href="עמוד-608.html">הקודם</a></div>',
  '<div class="nav-side"><a class="nav-link" href="עמוד-195.html">הקודם</a></div>',
);

// Insert the new topic at its canonical position in the global reading order.
replaceExactlyOrKeep(
  'עמוד-573.html',
  '<div class="nav-side"><a class="nav-link" href="עמוד-531.html">הבא</a></div>',
  '<div class="nav-side"><a class="nav-link" href="עמוד-601.html">הבא</a></div>',
);
replaceExactlyOrKeep(
  'עמוד-601.html',
  '<div class="nav-side"><a class="nav-link" href="עמוד-195.html">הקודם</a></div>',
  '<div class="nav-side"><a class="nav-link" href="עמוד-573.html">הקודם</a></div>',
);
replaceExactlyOrKeep(
  'עמוד-608.html',
  '<div class="nav-side"><a class="nav-link" href="עמוד-320.html">הבא</a></div>',
  '<div class="nav-side"><a class="nav-link" href="עמוד-531.html">הבא</a></div>',
);
replaceExactlyOrKeep(
  'עמוד-531.html',
  '<div class="nav-side"><a class="nav-link" href="עמוד-573.html">הקודם</a></div>',
  '<div class="nav-side"><a class="nav-link" href="עמוד-608.html">הקודם</a></div>',
);

console.log('[OK] רצף הניווט תקין: עמוד-573 → עמוד-601..608 → עמוד-531');
