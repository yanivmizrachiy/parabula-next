// תשובות בנות־בדיקה ליחידה 4 — מקבילית וטרפז (עמודים 47–52).
// כל ערך מספרי נגזר מהקודקודים ב-derive ומאומת בבדיקות; אין מספר יד חופשית.

export const unit04Answers = [
  // ── עמוד 47 — ממלבן למקבילית ──────────────────────────────────
  { page: 47, id: 'p47-ABCD', kind: 'parallelogram',
    vertices: [[1, 2], [8, 2], [11, 7], [4, 7]], expect: {
      baseLength: 7, height: 5, area: 35,
      lineAB: 'y=2', lineDC: 'y=7', sameOnAB: 'Y', sameOnDC: 'Y'
    } },
  { page: 47, id: 'p47-DH', kind: 'value', expect: {
    H: '(4,2)', xConstant: true, parallelToYAxis: true,
    perpendicularToXAxis: true, isHeightToAB: true,
    ADisHeight: false, whyNotAD: 'AD נטויה ואינה מאונכת לבסיס'
  } },
  { page: 47, id: 'p47-vs-rectangle', kind: 'value', expect: {
    sameBaseSameHeight: true, areaPreserved: true, sideLengthsMayChange: true
  } },

  // ── עמוד 48 — השלמת קודקוד ────────────────────────────────────
  { page: 48, id: 'p48-complete', kind: 'parallelogram',
    vertices: [[2, 2], [9, 2], [12, 7], [5, 7]], expect: {
      baseLength: 7, height: 5, area: 35, C: '(12,7)',
      shiftRight: 7, ySame: true
    } },
  { page: 48, id: 'p48-orders', kind: 'value', expect: {
    // הקודקוד הרביעי תלוי בזוגות הסמוכים: sum של סמוכים פחות הנגדי.
    orderABD_fourth: '(12,7)',
    orderADB_fourth: '(6,-3)',
    orderBAD_fourth: '(-2,7)',
    samParallelogram: false
  } },
  { page: 48, id: 'p48-info', kind: 'value', expect: {
    threeOrdered: 'מספיק',
    threeUnordered: 'חסר — שלוש מקביליות אפשריות',
    twoOpposite: 'חסר',
    twoAdjacentPlusVector: 'מספיק'
  } },

  // ── עמוד 49 — שטח בשתי דרכים ─────────────────────────────────
  { page: 49, id: 'p49-decomposition', kind: 'value', expect: {
    baseTimesHeight: 35,
    centralRect: 20, sideTriangle: 7.5,
    decompositionSum: 35,
    boundingShearRect: 35
  } },
  { page: 49, id: 'p49-inverse', kind: 'value', expect: {
    heightForBase5: 7, exampleD: '(3,7)', infinitelyMany: true,
    whyNotAD: 'AD אינה מאונכת לבסיס — רק הגובה מודד את המרחק בין הבסיסים'
  } },
  { page: 49, id: 'p49-reshear', kind: 'value', expect: {
    exampleD: '(2,7)', exampleC: '(9,7)', areaUnchanged: 35,
    preserved: 'בסיס, גובה ושטח', changed: 'אורך הצלעות הנטויות'
  } },

  // ── עמוד 50 — טרפז: בסיסים וגובה ─────────────────────────────
  { page: 50, id: 'p50-ABCD', kind: 'trapezoid',
    vertices: [[1, 2], [10, 2], [8, 7], [3, 7]], expect: {
      baseBig: 9, baseSmall: 5, height: 5, area: 35,
      lineAB: 'y=2', lineDC: 'y=7'
    } },
  { page: 50, id: 'p50-claims', kind: 'value', expect: {
    basesParallelToX: true, DHperpendicularToX: true,
    DHxConstant: true, ADandBCareBases: false,
    heightIsYDiff: true,
    legAsHeightWhen: 'כאשר השוק מאונכת לבסיסים (טרפז ישר-זווית)'
  } },

  { page: 50, id: 'p50-tf', kind: 'value', expect: {
    twoParallelPairs: false,
    heightPerpToBoth: true, rightTrapezoidExists: true
  } },
  { page: 50, id: 'p50-build', kind: 'value', expect: {
    yConstant: 6, dcNotNine: true, exampleD: '(1,6)', solutions: 'אינסוף (כל D עם y=6 ו-DC≠9)'
  } },

  // ── עמוד 51 — שלוש דרכים לשטח ────────────────────────────────
  { page: 51, id: 'p51-threeWays', kind: 'value', expect: {
    methodFormula: 35,
    centralRect: 25, leftTriangle: 5, rightTriangle: 5, methodDecompose: 35,
    boundingRect: 45, cutTriangles: 10, methodSubtract: 35,
    divideBy2Reason: 'ממוצע שני הבסיסים כפול הגובה'
  } },

  { page: 51, id: 'p51-inverse', kind: 'value', expect: { missingHeight: 5 } },

  // ── עמוד 52 — היקף ומידע מספיק ───────────────────────────────
  { page: 52, id: 'p52-ABCD', kind: 'trapezoid',
    vertices: [[0, 1], [10, 1], [7, 5], [3, 5]], expect: {
      baseBig: 10, baseSmall: 4, height: 4, area: 28,
      legAD: 5, legBC: 5, perimeter: 24
    } },
  { page: 52, id: 'p52-info', kind: 'value', expect: {
    basesAndHeight_area: 'מספיק', basesAndHeight_perimeter: 'חסר — השוקיים',
    fourVertices_area: 'מספיק', fourVertices_perimeter: 'מספיק',
    areaAndBases_area: 'מספיק', areaAndBases_perimeter: 'חסר',
    basesOnly: 'חסר',
    isoscelesWithLeg: 'מספיק'
  } },
  { page: 52, id: 'p52-samePerimeterDiffers', kind: 'value', expect: {
    example1: 'A(0,1) B(10,1) C(7,5) D(3,5) — היקף 24',
    example2: 'A(0,1) B(10,1) C(9,5) D(5,5) — שוקיים שונות, היקף שונה',
    conclusion: 'שטח אינו קובע היקף'
  } }
];
