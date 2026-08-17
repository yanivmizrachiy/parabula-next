// תשובות בנות־בדיקה ליחידה 5 — הדלתון במערכת הצירים (עמודים 53–58).
// כל ערך מספרי נגזר מהקודקודים ב-derive ומאומת בבדיקות; אין מספר יד חופשית.
// שטח דלתון = מחצית מכפלת האלכסונים, ונבדק הלוך-חזור מול נוסחת השרוכים.

export const unit05Answers = [
  // ── עמוד 53 — דלתון ואלכסונים ─────────────────────────────────
  { page: 53, id: 'p53-ABCD', kind: 'kite',
    vertices: [[6, 1], [9, 4], [6, 9], [3, 4]], expect: {
      diagonalAC: 8, diagonalBD: 6, area: 24,
      lineAC: 'x=6', lineBD: 'y=4', cross: '(6,4)'
    } },
  { page: 53, id: 'p53-bisection', kind: 'value', expect: {
    MB: 3, MD: 3, MA: 3, MC: 5,
    bisectedDiagonal: 'BD', notBisected: 'AC'
  } },
  { page: 53, id: 'p53-legs', kind: 'value', expect: {
    legsAB: '3,3', legsAD: '3,3', legsCB: '3,5', legsCD: '3,5',
    conclusion: 'AB = AD וכן CB = CD — שני זוגות של צלעות סמוכות שוות'
  } },
  { page: 53, id: 'p53-claims', kind: 'value', expect: {
    ACparallelToY: true, BDparallelToX: true,
    diagonalsPerpendicular: true, bothBisectEachOther: false,
    adjacentPairsEqual: true,
    ABequalsADbyLegs: 'בשני המשולשים הניצבים הם 3 ו-3'
  } },

  // ── עמוד 54 — המלבן החוסם ─────────────────────────────────────
  { page: 54, id: 'p54-ABCD', kind: 'kite',
    vertices: [[1, 4], [4, 7], [11, 4], [4, 1]], expect: {
      diagonalAC: 10, diagonalBD: 6, area: 30,
      boundingWidth: 10, boundingHeight: 6, boundingArea: 60, halfBounding: 30
    } },
  { page: 54, id: 'p54-why-half', kind: 'value', expect: {
    reason: 'כל צלע של הדלתון היא אלכסון של מלבן קטן וחוצה אותו לשני משולשים חופפים',
    formulaMatchesBounding: true
  } },
  { page: 54, id: 'p54-page53-check', kind: 'value', expect: { page53Area: 24 } },
  { page: 54, id: 'p54-EFGH', kind: 'kite',
    vertices: [[4, 1], [6, 3], [4, 7], [2, 3]], expect: {
      diagonalAC: 6, diagonalBD: 4, area: 12,
      boundingWidth: 4, boundingHeight: 6, boundingArea: 24, halfBounding: 12
    } },
  { page: 54, id: 'p54-error', kind: 'value', expect: {
    claimed: 60, correct: 30, mistake: 'כפל את האלכסונים אך שכח לחלק ב-2'
  } },

  // ── עמוד 55 — פירוק למשולשים ──────────────────────────────────
  { page: 55, id: 'p55-ABCD', kind: 'kite',
    vertices: [[4, -2], [7, 1], [4, 7], [1, 1]], expect: {
      diagonalAC: 9, diagonalBD: 6, area: 27, crossesXAxisAt: '(4,0)'
    } },
  { page: 55, id: 'p55-fourTriangles', kind: 'value', expect: {
    lowerTriangle: 4.5, upperTriangle: 9, sumFour: 27
  } },
  { page: 55, id: 'p55-twoTriangles', kind: 'value', expect: {
    belowBD: 9, aboveBD: 18, sum: 27, formulaCheck: 27
  } },
  { page: 55, id: 'p55-inverse', kind: 'value', expect: {
    lowerPart: 2, upperPart: 5, diagonalAC: 7, area: 21
  } },

  // ── עמוד 56 — בנייה ושאלה הפוכה ───────────────────────────────
  { page: 56, id: 'p56-build24', kind: 'value', expect: {
    diagonalProduct: 48,
    exampleVertices: 'A(2,4) C(10,4) B(6,7) D(6,1)'
  } },
  { page: 56, id: 'p56-options', kind: 'value', expect: {
    pairFor6: 8, pairFor4: 12, pairFor2: 24, productEachRow: 48
  } },
  { page: 56, id: 'p56-inverse21', kind: 'value', expect: { missingDiagonal: 7 } },
  { page: 56, id: 'p56-whoIsRight', kind: 'value', expect: {
    right: 'עומר', example: 'אלכסונים 4 ו-12 נותנים גם הם שטח 24'
  } },
  { page: 56, id: 'p56-howMany', kind: 'value', expect: {
    count: 'אינסוף',
    reason: 'הזזת נקודת המפגש לאורך האלכסון משנה את הצלעות אך לא את השטח'
  } },
  { page: 56, id: 'p56-twoKites', kind: 'value', expect: {
    sameArea: true, areaEach: 24,
    difference: 'מיקום נקודת המפגש על האלכסון — ולכן אורכי הצלעות'
  } },

  // ── עמוד 57 — היקף, והמעוין כדלתון מיוחד ─────────────────────
  { page: 57, id: 'p57-rhombus', kind: 'kite',
    vertices: [[6, 0], [9, 4], [6, 8], [3, 4]], expect: {
      diagonalAC: 8, diagonalBD: 6, area: 24, side: 5, perimeter: 20,
      isRhombus: true
    } },
  { page: 57, id: 'p57-sameDiagonals', kind: 'kite',
    vertices: [[6, 0], [9, 2], [6, 8], [3, 2]], expect: {
      diagonalAC: 8, diagonalBD: 6, area: 24, samePerimeterAsRhombus: false
    } },
  { page: 57, id: 'p57-tf', kind: 'value', expect: {
    sameDiagonalsSameArea: true, sameDiagonalsSamePerimeter: false,
    everyRhombusIsKite: true, everyKiteIsRhombus: false,
    oneDiagonalAlwaysBisected: true
  } },

  // ── עמוד 58 — סביבון ומבדק מסכם ───────────────────────────────
  { page: 58, id: 'p58-body', kind: 'kite',
    vertices: [[6, 0], [9, 4], [6, 8], [3, 4]], expect: {
      area: 24, perimeter: 20
    } },
  { page: 58, id: 'p58-dreidel', kind: 'value', expect: {
    rhombusArea: 24, squareArea: 4, totalArea: 28,
    rhombusPerimeter: 20, squarePerimeter: 8, totalPerimeter: 28,
    squareBottomCounts: true,
    why: 'המגע בין הריבוע למעוין הוא בנקודה אחת בלבד, לא בצלע משותפת'
  } },
  { page: 58, id: 'p58-notKite', kind: 'value', expect: {
    legsAB: '3,4', legsBC: '5,4', legsCD: '5,3', legsDA: '3,3',
    sideAB: 5, adjacentEqualPairs: false, isKite: false,
    areaByDiagonals: 28,
    whyFormulaWorks: 'די באלכסונים מאונכים הנחתכים כדי שהשטח יהיה מחצית מכפלתם'
  } },
  { page: 58, id: 'p58-summary', kind: 'value', expect: {
    definingProperty: 'שני זוגות של צלעות סמוכות שוות',
    alwaysTrue: 'האלכסונים מאונכים; השטח מחצית מכפלת האלכסונים',
    notAlways: 'כל הצלעות שוות — נכון רק במעוין'
  } }
];
