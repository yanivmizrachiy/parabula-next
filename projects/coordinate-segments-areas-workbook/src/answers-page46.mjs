// תשובות בנות־בדיקה לעמוד 46.

export const page46Answers = [
  { page: 46, id: 'p46-ABC', kind: 'triangleArea', vertices: [[-2, 1], [8, 1], [3, 8]], base: [0, 1], expect: {
    baseLength: 10, height: 7, baseAxis: 'x', area: 35
  } },
  { page: 46, id: 'p46-ACM', kind: 'triangleArea', vertices: [[-2, 1], [3, 1], [3, 8]], base: [0, 1], expect: {
    baseLength: 5, height: 7, baseAxis: 'x', area: 17.5
  } },
  { page: 46, id: 'p46-BCM', kind: 'triangleArea', vertices: [[3, 1], [8, 1], [3, 8]], base: [0, 1], expect: {
    baseLength: 5, height: 7, baseAxis: 'x', area: 17.5
  } },
  { page: 46, id: 'p46-M', kind: 'value', expect: {
    M: '(3,1)',
    CMisHeight: true,
    MisMidpoint: true,
    CMisMedian: true
  } },

  { page: 46, id: 'p46-PQR', kind: 'triangleArea', vertices: [[0, 0], [10, 0], [7, 8]], base: [0, 1], expect: {
    baseLength: 10, height: 8, baseAxis: 'x', area: 40
  } },
  { page: 46, id: 'p46-PQR-solutions', kind: 'value', expect: {
    possibleY: [8, -8],
    xUnique: false,
    example: 'R(7,8)'
  } },

  { page: 46, id: 'p46-claims', kind: 'value', expect: {
    sameBaseSameHeightEqualArea: true,
    medianAlwaysPerpendicular: false,
    outsidePointSubareasGreater: true,
    translationPreservesArea: true,
    sameBaseOnlyEnough: false
  } },

  { page: 46, id: 'p46-ACN', kind: 'triangleArea', vertices: [[-2, 1], [2, 1], [3, 8]], base: [0, 1], expect: {
    baseLength: 4, height: 7, baseAxis: 'x', area: 14
  } },
  { page: 46, id: 'p46-BCN', kind: 'triangleArea', vertices: [[2, 1], [8, 1], [3, 8]], base: [0, 1], expect: {
    baseLength: 6, height: 7, baseAxis: 'x', area: 21
  } },
  { page: 46, id: 'p46-ratio', kind: 'value', expect: {
    N: '(2,1)',
    AN: 4,
    NB: 6,
    baseRatio: '2:3',
    areaRatio: '2:3'
  } }
];
