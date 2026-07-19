// תשובות בנות־בדיקה ליחידה 6 — צורות מורכבות (עמודים 59–64).
// כל ערך נגזר מהקודקודים ומאומת בבדיקות מול נוסחת השרוכים וסכומי הצלעות.

export const unit06Answers = [
  // ── עמוד 59 — סביבון כצורה מורכבת ─────────────────────────────
  // גוף (2,4)-(10,8), חוד (2,4),(10,4),(6,1), ידית (5,8)-(7,10).
  { page: 59, id: 'p59-parts', kind: 'value', expect: {
    bodyArea: 32, pointTriangleArea: 12, handleArea: 4, totalArea: 48
  } },
  { page: 59, id: 'p59-outline', kind: 'value', expect: {
    // קו המתאר: תשעה קודקודים; שני החודים 3-4-5.
    vertices: '(2,8) (5,8) (5,10) (7,10) (7,8) (10,8) (10,4) (6,1) (2,4)',
    horizontalSum: 8, verticalSum: 12, slantSum: 10,
    perimeter: 30, slantSide: 5,
    internalBodyTriangle: 8, internalBodyHandle: 2
  } },
  { page: 59, id: 'p59-subtract', kind: 'value', expect: {
    boundingRect: 72, cornerTriangles: 12, sideRects: 12, result: 48
  } },
  { page: 59, id: 'p59-error', kind: 'value', expect: {
    wrongPerimeter: 40, correctPerimeter: 30,
    mistake: 'הוסיף להיקף את שני הקטעים הפנימיים (8 ו-2) שאינם על שפת הצורה'
  } },
  { page: 59, id: 'p59-bounding', kind: 'value', expect: {
    boundingPerimeter: 34, spinnerPerimeter: 30, spinnerSmaller: true,
    reason: 'בכל צד של החוד, היתר 5 קצר מסכום הניצבים 3+4 — האלכסון מקצר את הדרך'
  } },

  // ── עמוד 60 — חיבור שטחים: חץ ─────────────────────────────────
  { page: 60, id: 'p60-parts', kind: 'value', expect: {
    rectArea: 28, headTriangleEach: 8, totalArea: 44,
    singleExpression: '7×4 + 4×4÷2 + 4×4÷2 = 44'
  } },
  { page: 60, id: 'p60-alt', kind: 'value', expect: {
    bigHeadTriangle: 16, altSum: 44, sameResult: true
  } },
  { page: 60, id: 'p60-thirdWay', kind: 'value', expect: {
    boundingRect: 88, cutRects: 28, cutTriangles: 16, result: 44
  } },
  { page: 60, id: 'p60-build40', kind: 'value', expect: {
    targetArea: 40, exampleParts: 'מלבן 4×7=28 ושני משולשים 6 — למשל 28+6+6'
  } },

  // ── עמוד 61 — חיסור שטחים וצורת L ─────────────────────────────
  { page: 61, id: 'p61-frame', kind: 'value', expect: {
    bigRect: 48, hole: 8, frameArea: 40
  } },
  { page: 61, id: 'p61-L', kind: 'rectilinear',
    vertices: [[1, 1], [9, 1], [9, 4], [5, 4], [5, 7], [1, 7]], expect: {
      area: 36, perimeter: 28
    } },
  { page: 61, id: 'p61-L-ways', kind: 'value', expect: {
    subtractWay: '48 − 12 = 36',
    splitHorizontal: '8×3 + 4×3 = 24 + 12 = 36',
    splitVertical: '4×6 + 4×3 = 24 + 12 = 36',
    allEqual: true
  } },
  { page: 61, id: 'p61-L-bounding', kind: 'value', expect: {
    boundingPerimeter: 28, equalToL: true,
    reason: 'צורת L היא מצולע מדרגות עם מדרגה אחת — הזזת שתי הצלעות הפנימיות אל הדופן משחזרת את המלבן החוסם'
  } },
  { page: 61, id: 'p61-build30', kind: 'value', expect: {
    targetArea: 30, example: 'מלבן חוסם 6×6=36 פחות מפרץ 2×3=6'
  } },
  { page: 61, id: 'p61-missing', kind: 'value', expect: {
    neededCoordinate: 'שיעור ה-X של קודקוד המפרץ הפנימי',
    reason: 'בלעדיו אי אפשר לדעת את רוחב המלבן החסר'
  } },

  // ── עמוד 62 — היקף צורה מורכבת: מדרגות ────────────────────────
  { page: 62, id: 'p62-stairs', kind: 'rectilinear',
    vertices: [[0, 0], [10, 0], [10, 3], [6, 3], [6, 6], [3, 6], [3, 8], [0, 8]], expect: {
      area: 54, perimeter: 36
    } },
  { page: 62, id: 'p62-insight', kind: 'value', expect: {
    boundingRectPerimeter: 36, equalToStairs: true,
    reason: 'הזזת כל מדרגה אופקית מעלה וכל מדרגה אנכית הצידה משחזרת את המלבן החוסם'
  } },
  { page: 62, id: 'p62-areaParts', kind: 'value', expect: {
    bottomRect: 30, middleRect: 18, topRect: 6, total: 54
  } },
  { page: 62, id: 'p62-error', kind: 'value', expect: {
    areaAndPerimeterIndependent: true,
    explanation: 'השטח נמדד במשבצות וההיקף באורך הגבול; אין נוסחה המקשרת ביניהם'
  } },
  { page: 62, id: 'p62-build', kind: 'value', expect: {
    fixedPerimeter: 30, areaDeterminedInAdvance: false,
    reason: 'ההיקף נקבע מהמלבן החוסם 9×6, אך השטח תלוי בגודל המדרגות שנחתכות'
  } },

  // ── עמוד 63 — שטח מול היקף ────────────────────────────────────
  { page: 63, id: 'p63-rectA', kind: 'rectangle',
    corners: [[0, 0], [4, 6]], expect: { width: 4, height: 6, area: 24, perimeter: 20 } },
  { page: 63, id: 'p63-rectB', kind: 'rectangle',
    corners: [[0, 8], [12, 10]], expect: { width: 12, height: 2, area: 24, perimeter: 28 } },
  { page: 63, id: 'p63-LC', kind: 'rectilinear',
    vertices: [[6, 0], [12, 0], [12, 3], [9, 3], [9, 5], [6, 5]], expect: {
      area: 24, perimeter: 22
    } },
  { page: 63, id: 'p63-order', kind: 'value', expect: {
    orderByPerimeter: 'מלבן 4×6 (20) < צורת L (22) < מלבן 2×12 (28)',
    thinShapesRule: 'ככל שהצורה ארוכה ודקה יותר, ההיקף גדל בעוד השטח נשמר'
  } },
  { page: 63, id: 'p63-LD', kind: 'rectilinear',
    vertices: [[0, 0], [8, 0], [8, 2], [2, 2], [2, 6], [0, 6]], expect: {
      area: 24, perimeter: 28
    } },
  { page: 63, id: 'p63-pair', kind: 'value', expect: {
    sameAreaSamePerimeterPossible: true,
    pair: 'מלבן 2×12 וצורת ה-L — לשניהם שטח 24 והיקף 28',
    whyNotCongruent: 'האחד מלבן והשני בעל שישה קודקודים — אינם חופפים'
  } },
  { page: 63, id: 'p63-Lperim24', kind: 'rectilinear',
    vertices: [[0, 0], [7, 0], [7, 2], [2, 2], [2, 5], [0, 5]], expect: {
      area: 20, perimeter: 24
    } },

  // ── עמוד 64 — מבדק מרובעים וצורות מורכבות ─────────────────────
  { page: 64, id: 'p64-parallelogram', kind: 'parallelogram',
    vertices: [[1, 1], [6, 1], [8, 4], [3, 4]], expect: {
      baseLength: 5, height: 3, area: 15, S: '(3,4)'
    } },
  { page: 64, id: 'p64-trapezoid', kind: 'trapezoid',
    vertices: [[0, 6], [9, 6], [6, 10], [3, 10]], expect: {
      baseBig: 9, baseSmall: 3, height: 4, area: 24,
      legAD: 5, legBC: 5, perimeter: 22
    } },
  { page: 64, id: 'p64-kite', kind: 'kite',
    vertices: [[5, 0], [8, 3], [5, 10], [2, 3]], expect: {
      diagonalAC: 10, diagonalBD: 6, area: 30
    } },
  { page: 64, id: 'p64-composite', kind: 'value', expect: {
    rectPart: 18, roofTriangle: 6, sumWay: 24,
    boundingRect: 30, cutTriangles: 6, subtractWay: 24, equal: true
  } },
  { page: 64, id: 'p64-inverse', kind: 'value', expect: {
    rectArea: 18, givenSide: 3, missingSide: 6
  } }
];
