// תשובות בנות־בדיקה לעמודים 39–45.

export const pages39to45Answers = [
  // ---- עמוד 39 ----
  { page: 39, id: 'p39-rectangle', kind: 'rectangle', corners: [[1, 1], [9, 7]], expect: { width: 8, height: 6, area: 48, perimeter: 28 } },
  { page: 39, id: 'p39-ABC', kind: 'triangleArea', vertices: [[1, 1], [9, 1], [9, 7]], base: [0, 1], expect: { baseLength: 8, height: 6, baseAxis: 'x', area: 24 } },
  { page: 39, id: 'p39-ACD', kind: 'triangleArea', vertices: [[1, 1], [9, 7], [1, 7]], base: [1, 2], expect: { baseLength: 8, height: 6, baseAxis: 'x', area: 24 } },
  { page: 39, id: 'p39-ABP', kind: 'triangleArea', vertices: [[1, 1], [9, 1], [3, 7]], base: [0, 1], expect: { baseLength: 8, height: 6, baseAxis: 'x', area: 24 } },
  { page: 39, id: 'p39-ABQ', kind: 'triangleArea', vertices: [[1, 1], [9, 1], [6, 7]], base: [0, 1], expect: { baseLength: 8, height: 6, baseAxis: 'x', area: 24 } },
  { page: 39, id: 'p39-conclusion', kind: 'value', expect: { sameBaseSameHeight: true, alwaysCongruent: false, equalArea: true } },

  // ---- עמוד 40 ----
  { page: 40, id: 'p40-rectangle', kind: 'rectangle', corners: [[0, 0], [10, 8]], expect: { width: 10, height: 8, area: 80, perimeter: 36 } },
  { page: 40, id: 'p40-left-outer', kind: 'triangle', vertices: [[0, 0], [4, 8], [0, 8]], expect: { legs: [4, 8], area: 16 } },
  { page: 40, id: 'p40-right-outer', kind: 'triangle', vertices: [[10, 0], [10, 8], [4, 8]], expect: { legs: [6, 8], area: 24 } },
  { page: 40, id: 'p40-ABC', kind: 'triangleArea', vertices: [[0, 0], [10, 0], [4, 8]], base: [0, 1], expect: { baseLength: 10, height: 8, baseAxis: 'x', area: 40 } },
  { page: 40, id: 'p40-subtraction', kind: 'value', expect: { rectangleArea: 80, outerAreas: [16, 24], triangleArea: 40, correctStudents: ['נועם', 'יובל'] } },

  // ---- עמוד 41 ----
  { page: 41, id: 'p41-main', kind: 'triangle', vertices: [[0, 0], [8, 0], [0, 6]], expect: { legs: [6, 8], area: 24 } },
  { page: 41, id: 'p41-P', kind: 'pointTriangle', triangle: [[0, 0], [8, 0], [0, 6]], point: [2, 2], expect: { classification: 'בתוך', mainArea: 24, subAreaSum: 24 } },
  { page: 41, id: 'p41-Q', kind: 'pointTriangle', triangle: [[0, 0], [8, 0], [0, 6]], point: [4, 3], expect: { classification: 'על', mainArea: 24, subAreaSum: 24 } },
  { page: 41, id: 'p41-R', kind: 'pointTriangle', triangle: [[0, 0], [8, 0], [0, 6]], point: [6, 3], expect: { classification: 'מחוץ', mainArea: 24, subAreaSum: 36 } },
  { page: 41, id: 'p41-examples', kind: 'value', expect: { inside: '(1,1)', boundary: '(2,0)', outsideInsideBoundingRectangle: '(7,5)' } },

  // ---- עמוד 42 ----
  { page: 42, id: 'p42-base', kind: 'segment', a: [2, 3], b: [10, 3], expect: { length: 8, axis: 'x', equation: 'y=3' } },
  { page: 42, id: 'p42-C1', kind: 'triangleArea', vertices: [[2, 3], [10, 3], [5, 8]], base: [0, 1], expect: { baseLength: 8, height: 5, baseAxis: 'x', area: 20 } },
  { page: 42, id: 'p42-C2', kind: 'triangleArea', vertices: [[2, 3], [10, 3], [7, -2]], base: [0, 1], expect: { baseLength: 8, height: 5, baseAxis: 'x', area: 20 } },
  { page: 42, id: 'p42-solutions', kind: 'value', expect: { possibleY: [8, -2], xRestriction: 'כל מספר', x5Quadrant1: '(5,8)', y8Solutions: 'אינסוף', onYAxis: ['(0,8)', '(0,-2)'], quadrant4BelowX: 'אינסוף' } },

  // ---- עמוד 43 ----
  { page: 43, id: 'p43-AB', kind: 'segment', a: [1, 2], b: [9, 2], expect: { length: 8, axis: 'x', equation: 'y=2' } },
  { page: 43, id: 'p43-ABP', kind: 'triangleArea', vertices: [[1, 2], [9, 2], [2, 8]], base: [0, 1], expect: { baseLength: 8, height: 6, baseAxis: 'x', area: 24 } },
  { page: 43, id: 'p43-ABQ', kind: 'triangleArea', vertices: [[1, 2], [9, 2], [5, 8]], base: [0, 1], expect: { baseLength: 8, height: 6, baseAxis: 'x', area: 24 } },
  { page: 43, id: 'p43-ABR', kind: 'triangleArea', vertices: [[1, 2], [9, 2], [11, 8]], base: [0, 1], expect: { baseLength: 8, height: 6, baseAxis: 'x', area: 24 } },
  { page: 43, id: 'p43-S', kind: 'triangleArea', vertices: [[1, 2], [9, 2], [-3, 8]], base: [0, 1], expect: { baseLength: 8, height: 6, baseAxis: 'x', area: 24 } },
  { page: 43, id: 'p43-claims', kind: 'value', expect: { equalAreas: true, alwaysCongruent: false, sameHeight: true, movingOnParallelLinePreservesArea: true } },

  // ---- עמוד 44 ----
  { page: 44, id: 'p44-ABC', kind: 'triangleArea', vertices: [[1, 1], [9, 1], [4, 7]], base: [0, 1], expect: { baseLength: 8, height: 6, baseAxis: 'x', area: 24 } },
  { page: 44, id: 'p44-ACM', kind: 'triangleArea', vertices: [[1, 1], [5, 1], [4, 7]], base: [0, 1], expect: { baseLength: 4, height: 6, baseAxis: 'x', area: 12 } },
  { page: 44, id: 'p44-BCM', kind: 'triangleArea', vertices: [[5, 1], [9, 1], [4, 7]], base: [0, 1], expect: { baseLength: 4, height: 6, baseAxis: 'x', area: 12 } },
  { page: 44, id: 'p44-median', kind: 'value', expect: { AM: 4, MB: 4, equalAreas: true, medianMustBePerpendicular: false } },

  // ---- עמוד 45 ----
  { page: 45, id: 'p45-ABC', kind: 'triangleArea', vertices: [[1, 1], [10, 1], [3, 7]], base: [0, 1], expect: { baseLength: 9, height: 6, baseAxis: 'x', area: 27 } },
  { page: 45, id: 'p45-ACD', kind: 'triangleArea', vertices: [[1, 1], [4, 1], [3, 7]], base: [0, 1], expect: { baseLength: 3, height: 6, baseAxis: 'x', area: 9 } },
  { page: 45, id: 'p45-BCD', kind: 'triangleArea', vertices: [[4, 1], [10, 1], [3, 7]], base: [0, 1], expect: { baseLength: 6, height: 6, baseAxis: 'x', area: 18 } },
  { page: 45, id: 'p45-ratio', kind: 'value', expect: { AD: 3, DB: 6, baseRatio: '1:2', areaRatio: '1:2' } },
  { page: 45, id: 'p45-reverse', kind: 'value', expect: { areaRatio: '3:5', baseRatio: '3:5', AB: 16, AD: 6, DB: 10 } },
  { page: 45, id: 'p45-example-1to3', kind: 'triangleArea', vertices: [[0, 0], [12, 0], [2, 6]], base: [0, 1], expect: { baseLength: 12, height: 6, baseAxis: 'x', area: 36 } }
];
