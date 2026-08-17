// תשובות בנות־בדיקה לעמוד 36.

export const page36Answers = [
  { page: 36, id: 'p36-original', kind: 'triangle', vertices: [[-5, 3], [7, 3], [-5, -2]], expect: { legs: [5, 12], area: 30 } },
  { page: 36, id: 'p36-shifted', kind: 'triangle', vertices: [[-1, 6], [11, 6], [-1, 1]], expect: { legs: [5, 12], area: 30 } },
  { page: 36, id: 'p36-shift', kind: 'value', expect: {
    points: ["A'(-1,6)", "B'(11,6)", "C'(-1,1)"],
    preserved: ['אורכי הצלעות', 'שטח המשולש', 'הזווית הישרה', 'הקבלה והמאונכות לצירים'],
    changed: ['שיעורי הקודקודים', 'מיקום ביחס לצירים']
  } },
  { page: 36, id: 'p36-one-axis-example', kind: 'triangle', vertices: [[2, 3], [14, 3], [2, -2]], expect: { legs: [5, 12], area: 30 } }
];
