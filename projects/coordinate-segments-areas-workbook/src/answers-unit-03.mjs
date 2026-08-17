// תשובות בנות־בדיקה לעמודים 26–35.
// triangle נשמר כשלושה קודקודים; הבדיקות מחשבות מחדש שטח ואורכי ניצבים.

export const unit03Answers = [
  // ---- עמוד 26 ----
  { page: 26, id: 'p26-classify', kind: 'value', expect: {
    a: 'מספיק', b: 'חסר', c: 'מספיק', d: 'סותר', e: 'מיותר'
  } },
  { page: 26, id: 'p26-ABCD', kind: 'rectangle', corners: [[2, 3], [9, 8]], expect: { width: 7, height: 5, area: 35, perimeter: 24 } },
  { page: 26, id: 'p26-D', kind: 'value', expect: { point: '(2,8)', areaGivenNecessary: false } },

  // ---- עמוד 27 ----
  { page: 27, id: 'p27-1x36', kind: 'rectangle', corners: [[0, 0], [1, 36]], expect: { width: 1, height: 36, area: 36, perimeter: 74 } },
  { page: 27, id: 'p27-2x18', kind: 'rectangle', corners: [[0, 0], [2, 18]], expect: { width: 2, height: 18, area: 36, perimeter: 40 } },
  { page: 27, id: 'p27-3x12', kind: 'rectangle', corners: [[0, 0], [3, 12]], expect: { width: 3, height: 12, area: 36, perimeter: 30 } },
  { page: 27, id: 'p27-4x9', kind: 'rectangle', corners: [[0, 0], [4, 9]], expect: { width: 4, height: 9, area: 36, perimeter: 26 } },
  { page: 27, id: 'p27-6x6', kind: 'rectangle', corners: [[0, 0], [6, 6]], expect: { width: 6, height: 6, area: 36, perimeter: 24 } },
  { page: 27, id: 'p27-conclusion', kind: 'value', expect: { minimumPerimeter: 24, rectangle: '6 על 6', equalAreaImpliesEqualPerimeter: false } },

  // ---- עמוד 28 ----
  { page: 28, id: 'p28-11x1', kind: 'rectangle', corners: [[0, 0], [11, 1]], expect: { width: 11, height: 1, area: 11, perimeter: 24 } },
  { page: 28, id: 'p28-10x2', kind: 'rectangle', corners: [[0, 0], [10, 2]], expect: { width: 10, height: 2, area: 20, perimeter: 24 } },
  { page: 28, id: 'p28-9x3', kind: 'rectangle', corners: [[0, 0], [9, 3]], expect: { width: 9, height: 3, area: 27, perimeter: 24 } },
  { page: 28, id: 'p28-8x4', kind: 'rectangle', corners: [[0, 0], [8, 4]], expect: { width: 8, height: 4, area: 32, perimeter: 24 } },
  { page: 28, id: 'p28-7x5', kind: 'rectangle', corners: [[0, 0], [7, 5]], expect: { width: 7, height: 5, area: 35, perimeter: 24 } },
  { page: 28, id: 'p28-6x6', kind: 'rectangle', corners: [[0, 0], [6, 6]], expect: { width: 6, height: 6, area: 36, perimeter: 24 } },
  { page: 28, id: 'p28-conclusion', kind: 'value', expect: { maximumArea: 36, minimumArea: 11, equalPerimeterImpliesEqualArea: false } },

  // ---- עמוד 29 ----
  { page: 29, id: 'p29-ABCD', kind: 'rectangle', corners: [[-3, -2], [5, 4]], expect: { width: 8, height: 6, area: 48, perimeter: 28 } },
  { page: 29, id: 'p29-D', kind: 'value', expect: { point: '(-3,4)', crosses: ['ציר X', 'ציר Y'], perpendicularToX: ['BC', 'AD'] } },
  { page: 29, id: 'p29-who', kind: 'value', expect: { Ori: true, Noa: true, Ron: false, correction: '8×6=48' } },
  { page: 29, id: 'p29-other', kind: 'rectangle', corners: [[0, 0], [12, 4]], expect: { width: 12, height: 4, area: 48, perimeter: 32 } },

  // ---- עמוד 30 ----
  { page: 30, id: 'p30-half-rectangle', kind: 'triangle', vertices: [[1, 1], [9, 1], [9, 7]], expect: { legs: [6, 8], area: 24 } },
  { page: 30, id: 'p30-formula', kind: 'value', expect: { correct: 'בסיס×גובה÷2', rectangleArea: 48, triangleArea: 24 } },

  // ---- עמוד 31 ----
  { page: 31, id: 'p31-ABC', kind: 'triangle', vertices: [[2, 2], [9, 2], [2, 7]], expect: { legs: [5, 7], area: 17.5 } },
  { page: 31, id: 'p31-AB', kind: 'segment', a: [2, 2], b: [9, 2], expect: { length: 7, axis: 'x', equation: 'y=2' } },
  { page: 31, id: 'p31-AC', kind: 'segment', a: [2, 2], b: [2, 7], expect: { length: 5, axis: 'y', equation: 'x=2' } },

  // ---- עמוד 32 ----
  { page: 32, id: 'p32-ABC', kind: 'triangle', vertices: [[3, 1], [3, 8], [9, 1]], expect: { legs: [6, 7], area: 21 } },
  { page: 32, id: 'p32-height', kind: 'value', expect: { whenBaseAC: 'AB', reason: 'AB מאונך ל־AC' } },

  // ---- עמוד 33 ----
  { page: 33, id: 'p33-OAB', kind: 'triangle', vertices: [[0, 0], [8, 0], [0, 5]], expect: { legs: [5, 8], area: 20 } },
  { page: 33, id: 'p33-example-a', kind: 'triangle', vertices: [[0, 0], [6, 0], [0, 4]], expect: { legs: [4, 6], area: 12 } },
  { page: 33, id: 'p33-example-b', kind: 'triangle', vertices: [[0, 0], [8, 0], [0, 3]], expect: { legs: [3, 8], area: 12 } },

  // ---- עמוד 34 ----
  { page: 34, id: 'p34-ABC', kind: 'triangle', vertices: [[-9, -8], [-3, -8], [-9, -2]], expect: { legs: [6, 6], area: 18 } },
  { page: 34, id: 'p34-error', kind: 'value', expect: { wrong: '-8-(-2)=-6', correct: '-2-(-8)=6', rule: 'אורך הוא ערך מוחלט של הפרש השיעורים המשתנים' } },
  { page: 34, id: 'p34-positive-copy', kind: 'triangle', vertices: [[2, 2], [8, 2], [2, 8]], expect: { legs: [6, 6], area: 18 } },

  // ---- עמוד 35 ----
  { page: 35, id: 'p35-ABC', kind: 'triangle', vertices: [[-5, 3], [7, 3], [-5, -2]], expect: { legs: [5, 12], area: 30 } },
  { page: 35, id: 'p35-crossings', kind: 'value', expect: { onY: '(0,3)', onX: '(-5,0)', baseSplit: [5, 7] } },
  { page: 35, id: 'p35-build', kind: 'triangle', vertices: [[-4, 2], [6, 2], [-4, 8]], expect: { legs: [6, 10], area: 30 } },
  { page: 35, id: 'p35-shift', kind: 'value', expect: { changesArea: false, reason: 'אורכי הבסיס והגובה נשמרים בהזזה' } }
];
