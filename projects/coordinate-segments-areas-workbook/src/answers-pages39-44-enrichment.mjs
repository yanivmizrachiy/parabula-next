// תשובות להעמקה המדודה בעמודים 39–45.

export const pages39to44EnrichmentAnswers = [
  { page: 39, id: 'p39-students', kind: 'value', expect: {
    Itay: false,
    Lior: true,
    correction: 'הבסיס והגובה נשמרים, אך שתי הצלעות האחרות עשויות להשתנות'
  } },

  { page: 40, id: 'p40-methods', kind: 'value', expect: {
    subtractionCalculations: 4,
    directCalculations: 1,
    subtractionUsefulWhen: 'הבסיס או הגובה אינם נראים ישירות אך הצורה החוסמת פשוטה'
  } },

  { page: 41, id: 'p41-S', kind: 'pointTriangle', triangle: [[0, 0], [8, 0], [0, 6]], point: [3, 1], expect: {
    classification: 'בתוך', mainArea: 24, subAreaSum: 24
  } },
  { page: 41, id: 'p41-area-test-rule', kind: 'value', expect: {
    inside: 'סכום שלושת שטחי המשנה שווה לשטח המשולש, וכל שלושת השטחים חיוביים',
    boundary: 'הסכום שווה לשטח המשולש ואחד משטחי המשנה הוא אפס',
    outside: 'סכום שטחי המשנה גדול משטח המשולש'
  } },

  { page: 42, id: 'p42-conditions', kind: 'value', expect: {
    y6: 'בלתי אפשרי; הגובה 3 ולכן השטח 12',
    y8: 'אפשרי; כל נקודה על y=8',
    x5Quadrant4: 'אפשרי ויחיד: (5,-2)',
    contradictoryCondition: 'C על y=6'
  } },
  { page: 42, id: 'p42-x5-q4', kind: 'triangleArea', vertices: [[2, 3], [10, 3], [5, -2]], base: [0, 1], expect: {
    baseLength: 8, height: 5, baseAxis: 'x', area: 20
  } },

  { page: 43, id: 'p43-ABT', kind: 'triangleArea', vertices: [[1, 2], [9, 2], [0, 8]], base: [0, 1], expect: {
    baseLength: 8, height: 6, baseAxis: 'x', area: 24
  } },
  { page: 43, id: 'p43-ABU', kind: 'triangleArea', vertices: [[1, 2], [9, 2], [4, -4]], base: [0, 1], expect: {
    baseLength: 8, height: 6, baseAxis: 'x', area: 24
  } },
  { page: 43, id: 'p43-sufficient-conditions', kind: 'value', expect: {
    sameBaseSameHeight: true,
    sameBaseOnly: false,
    sameHeightOnly: false,
    sameBaseParallelVertexLine: true,
    sameSideRequired: false
  } },

  { page: 44, id: 'p44-reverse-median', kind: 'value', expect: {
    relation: 'AN=NB',
    segmentName: 'תיכון',
    reason: 'לשני המשולשים גובה משותף ובסיסים שווים'
  } },

  { page: 45, id: 'p45-median-general', kind: 'value', expect: {
    possible: true,
    explanation: 'תיכון מוגדר באמצעות אמצע הצלע ואינו דורש משולש ישר זווית'
  } }
];
