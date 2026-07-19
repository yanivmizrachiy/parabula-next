// תשובות בנות־בדיקה לעמודים 37–38.

export const pages37to38Answers = [
  { page: 37, id: 'p37-ABC', kind: 'triangle', vertices: [[2, 2], [10, 2], [2, 8]], expect: { legs: [6, 8], area: 24 } },
  { page: 37, id: 'p37-DEF', kind: 'triangle', vertices: [[-10, -8], [-2, -8], [-10, -2]], expect: { legs: [6, 8], area: 24 } },
  { page: 37, id: 'p37-area18-options', kind: 'value', expect: { legPairs: [[1, 36], [2, 18], [3, 12], [4, 9], [6, 6]] } },
  { page: 37, id: 'p37-quadrant3-example', kind: 'triangle', vertices: [[-9, -7], [-1, -7], [-9, -1]], expect: { legs: [6, 8], area: 24 } },
  { page: 37, id: 'p37-conclusion', kind: 'value', expect: { congruent: true, locationChangesArea: false } },
  { page: 37, id: 'p37-plan-shift', kind: 'value', expect: { exampleTranslation: [11, 8], criterion: 'כל שיעורי X ו־Y לאחר ההזזה חיוביים' } },

  { page: 38, id: 'p38-original', kind: 'triangle', vertices: [[-4, 2], [6, 2], [-4, 8]], expect: { legs: [6, 10], area: 30 } },
  { page: 38, id: 'p38-shifted', kind: 'triangle', vertices: [[1, -3], [11, -3], [1, 3]], expect: { legs: [6, 10], area: 30 } },
  { page: 38, id: 'p38-shift-data', kind: 'value', expect: {
    translation: [5, -5],
    points: ["A'(1,-3)", "B'(11,-3)", "C'(1,3)"],
    crosses: ['ציר X'],
    doesNotCross: ['ציר Y']
  } },
  { page: 38, id: 'p38-first-quadrant', kind: 'triangle', vertices: [[1, 8], [11, 8], [1, 14]], expect: { legs: [6, 10], area: 30 } },
  { page: 38, id: 'p38-claims', kind: 'value', expect: { a: false, b: true, c: false, d: true } }
];
