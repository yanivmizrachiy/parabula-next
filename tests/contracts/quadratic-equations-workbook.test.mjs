import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  exerciseCount,
  pageCount,
  pages,
  sections,
  sourceExerciseCount,
} from '../../sources/quadratic-equations/workbook-data.mjs';

const root = process.cwd();

test('quadratic workbook doubles the mapped source exactly', () => {
  assert.equal(sections.length, 16);
  assert.equal(sourceExerciseCount, 123);
  assert.equal(exerciseCount, sourceExerciseCount * 2);
  assert.equal(exerciseCount, 246);
  assert.equal(pageCount, 50);
  assert.equal(pages.length, 50);
});

test('every section is uniquely generated and difficulty never decreases', () => {
  const equations = [];
  for (const section of sections) {
    assert.equal(section.exercises.length, section.sourceCount * 2, `section ${section.number}`);
    assert.deepEqual([...new Set(section.exercises.map(exercise => exercise.level))], [1, 2, 3, 4], `section ${section.number}: all four stages`);
    for (let index = 0; index < section.exercises.length; index += 1) {
      const exercise = section.exercises[index];
      assert.ok(exercise.equation.trim(), `${exercise.id}: equation`);
      assert.ok(exercise.answer.trim(), `${exercise.id}: answer`);
      assert.ok(exercise.method.trim(), `${exercise.id}: method`);
      if (index > 0) {
        assert.ok(exercise.level >= section.exercises[index - 1].level, `${exercise.id}: difficulty regressed`);
      }
      equations.push(exercise.equation.replaceAll(/\s+/gu, ''));
    }
  }
  assert.equal(new Set(equations).size, equations.length, 'all 246 equations must be unique');
});

test('rational-equation sections always include a domain restriction', () => {
  for (const section of sections.filter(candidate => candidate.number >= 12)) {
    for (const exercise of section.exercises) {
      assert.ok(exercise.restriction.includes('\\ne'), `${exercise.id}: missing domain restriction`);
    }
  }
});

test('the opening page starts with simple ax^2=c equations', () => {
  const openingPage = pages[0];
  assert.equal(openingPage.globalNumber, 31);
  assert.equal(openingPage.exercises.length, 6);
  assert.ok(openingPage.title.includes('(b=0)'));
  assert.ok(openingPage.exercises.some(exercise => exercise.equation === '2x^2=162'));
  assert.ok(openingPage.exercises.some(exercise => exercise.equation === '5x^2=125'));
  for (const exercise of openingPage.exercises) {
    assert.match(exercise.equation, /^\d+x\^2=\d+$/u, `${exercise.id}: expected ax^2=c`);
  }
});

test('generated canonical pages match the data model', () => {
  let renderedExercises = 0;
  for (const page of pages) {
    const file = `עמוד-${page.globalNumber}.html`;
    const cssFile = `styles/pages/עמוד-${page.globalNumber}.css`;
    assert.ok(fs.existsSync(path.join(root, file)), `${file}: missing`);
    assert.ok(fs.existsSync(path.join(root, cssFile)), `${cssFile}: missing`);
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, new RegExp(`page-${page.globalNumber}\\b`), `${file}: page class`);
    assert.ok(html.includes('quadratic-page'), `${file}: topic scope`);
    assert.ok(html.includes('styles/topics/quadratic-equations.css'), `${file}: shared topic CSS`);
    assert.ok(html.includes(cssFile.replaceAll('\\', '/')), `${file}: page CSS`);
    assert.ok(html.includes(`data-local-page="${page.localNumber}"`), `${file}: local page`);
    const cards = html.match(/class="exercise-card"/gu) ?? [];
    assert.equal(cards.length, page.exercises.length, `${file}: exercise count`);
    renderedExercises += cards.length;
  }
  assert.equal(renderedExercises, 246);
});

test('quadratic pages never expose the internal difficulty scale as demo UI', () => {
  const forbiddenUi = [
    'learning-band',
    'stage-copy',
    'exercise-range',
    'progress-track',
    'progress-step',
    'רמת התרגול',
  ];
  for (const page of pages) {
    const file = `עמוד-${page.globalNumber}.html`;
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    for (const token of forbiddenUi) {
      assert.ok(!html.includes(token), `${file}: forbidden difficulty UI token ${token}`);
    }
  }
});

test('quadratic exercises never render per-card method headings', () => {
  for (const page of pages) {
    const file = `עמוד-${page.globalNumber}.html`;
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.ok(!html.includes('method-chip'), `${file}: per-exercise method heading`);
  }
  for (const file of [
    'scripts/generate-quadratic-equations-workbook.mjs',
    'styles/topics/quadratic-equations.css',
  ]) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    assert.ok(!source.includes('method-chip'), `${file}: obsolete method-chip source`);
  }
});

test('topics metadata exposes the complete workbook in pedagogical order', () => {
  const metadata = JSON.parse(fs.readFileSync(path.join(root, 'meta', 'topics.json'), 'utf8'));
  const topic = metadata.topics.find(candidate => candidate.name === 'משוואות ריבועיות');
  assert.ok(topic, 'quadratic topic missing');
  assert.equal(topic.count, 50);
  assert.deepEqual(topic.pages.map(page => page.number), pages.map(page => page.globalNumber));
  assert.deepEqual(topic.pages.map(page => page.h1), pages.map(page => page.title));
});
