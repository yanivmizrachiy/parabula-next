// תשובות בנות־בדיקה ליחידה 7 — אוריינות: תכנון ומדידה (עמודים 65–70).
// כל ערך נגזר מהקודקודים ומאומת בבדיקות; מחירים הם נתוני משימה מוצהרים.

export const unit07Answers = [
  // ── עמוד 65 — תכנון גינה ──────────────────────────────────────
  { page: 65, id: 'p65-grass', kind: 'rectangle',
    corners: [[1, 1], [7, 5]], expect: { width: 6, height: 4, area: 24, perimeter: 20 } },
  { page: 65, id: 'p65-bed', kind: 'triangle',
    vertices: [[8, 1], [12, 1], [8, 4]], expect: { legs: [3, 4], area: 6 } },
  { page: 65, id: 'p65-path', kind: 'rectangle',
    corners: [[1, 6], [11, 7]], expect: { width: 10, height: 1, area: 10, perimeter: 22 } },
  { page: 65, id: 'p65-fence', kind: 'value', expect: {
    plotWidth: 12, plotHeight: 8, fenceLength: 40, plotArea: 96, freeArea: 56,
    noFenceNeeded: 'כל גבולות הדשא, השביל והערוגה — הם קווים פנימיים בתוך המגרש'
  } },
  { page: 65, id: 'p65-alt', kind: 'value', expect: {
    sameGrass: 24, idea: 'מגרש חוסם קטן יותר, למשל 10×7, מקטין את הגדר מ-40 ל-34',
    altFence: 34
  } },

  // ── עמוד 66 — מגרש פעילות ─────────────────────────────────────
  { page: 66, id: 'p66-trap', kind: 'trapezoid',
    vertices: [[8, 0], [14, 0], [11, 4], [8, 4]], expect: {
      baseBig: 6, baseSmall: 3, height: 4, area: 18, legAD: 4, legBC: 5, perimeter: 18
    } },
  { page: 66, id: 'p66-rect', kind: 'rectangle',
    corners: [[0, 0], [8, 4]], expect: { width: 8, height: 4, area: 32, perimeter: 24 } },
  { page: 66, id: 'p66-field', kind: 'value', expect: {
    totalArea: 50, outlinePerimeter: 34, gate: 2, fencedLength: 32
  } },
  { page: 66, id: 'p66-costs', kind: 'value', expect: {
    pavingPerM2: 10, pavingCost: 500,
    fencePerM: 15, fenceCost: 480, totalCost: 980
  } },
  { page: 66, id: 'p66-compare', kind: 'value', expect: {
    altShape: 'מלבן 10×5', altArea: 50, altPerimeter: 30, altFenced: 28, altFenceCost: 420,
    cheaper: 'ההצעה המלבנית', savings: 60,
    reason: 'אותו שטח בצורה קומפקטית יותר — היקף קטן יותר, ולכן פחות גדר'
  } },
  { page: 66, id: 'p66-budget', kind: 'value', expect: {
    budget: 1000, originalTotal: 980, altTotal: 920, bothFit: true
  } },

  // ── עמוד 67 — מסלול רובוט ─────────────────────────────────────
  { page: 67, id: 'p67-SA', kind: 'segment', a: [-4, 2], b: [3, 2],
    expect: { length: 7, axis: 'x', equation: 'y=2', crossesY: true, split: [4, 3] } },
  { page: 67, id: 'p67-AB', kind: 'segment', a: [3, 2], b: [3, -3],
    expect: { length: 5, axis: 'y', equation: 'x=3', crossesX: true, split: [2, 3] } },
  { page: 67, id: 'p67-BC', kind: 'segment', a: [3, -3], b: [-2, -3],
    expect: { length: 5, axis: 'x', equation: 'y=-3', crossesY: true, split: [3, 2] } },
  { page: 67, id: 'p67-AM', kind: 'segment', a: [3, 2], b: [3, 5],
    expect: { length: 3, axis: 'y', equation: 'x=3' } },
  { page: 67, id: 'p67-SE', kind: 'segment', a: [-4, 2], b: [-4, -3],
    expect: { length: 5, axis: 'y', equation: 'x=-4', crossesX: true, split: [2, 3] } },
  { page: 67, id: 'p67-EC', kind: 'segment', a: [-4, -3], b: [-2, -3],
    expect: { length: 2, axis: 'x', equation: 'y=-3' } },
  { page: 67, id: 'p67-routes', kind: 'value', expect: {
    directRoute: 17, altRoute: 17, withExtraStation: 23,
    shortest: 17, extraStation: 'M(3,5)',
    whyNoDistanceFormula: 'כל הקטעים מקבילים לצירים — האורך הוא הפרש שיעורים'
  } },
  { page: 67, id: 'p67-return', kind: 'value', expect: {
    horizontalPart: 2, verticalPart: 5, shortestReturn: 7,
    manyRoutes: 'כל מסלול שאינו חוזר על עצמו עובר בסך הכול 2 שמאלה ו-5 למעלה — האורך זהה'
  } },

  // ── עמוד 68 — מפה וקנה מידה ───────────────────────────────────
  { page: 68, id: 'p68-building', kind: 'rectangle',
    corners: [[1, 1], [5, 4]], expect: { width: 4, height: 3, area: 12, perimeter: 14 } },
  { page: 68, id: 'p68-court', kind: 'rectangle',
    corners: [[6, 3], [11, 7]], expect: { width: 5, height: 4, area: 20, perimeter: 18 } },
  { page: 68, id: 'p68-pathSeg', kind: 'segment', a: [5, 2], b: [11, 2],
    expect: { length: 6, axis: 'x', equation: 'y=2' } },
  { page: 68, id: 'p68-real', kind: 'value', expect: {
    unitMeters: 10, buildingWidthM: 40, buildingHeightM: 30, buildingAreaM2: 1200,
    buildingPerimeterM: 140, courtAreaM2: 2000, pathLengthM: 60,
    lengthFactor: 10, areaFactor: 100
  } },
  { page: 68, id: 'p68-distort', kind: 'value', expect: {
    problem: 'קנה מידה שונה בציר X ובציר Y מעוות את הצורה',
    consequence: 'ריבוע נראה מלבן, והשטח המחושב מהמראה שגוי — לכן קנה המידה חייב להיות אחיד'
  } },

  // ── עמוד 69 — מידע נדרש, מיותר או חסר ─────────────────────────
  { page: 69, id: 'p69-garden', kind: 'rectangle',
    corners: [[2, 1], [9, 6]], expect: { width: 7, height: 5, area: 35, perimeter: 24 } },
  { page: 69, id: 'p69-sort', kind: 'value', expect: {
    needed: 'שיעורי הקודקודים והמחיר למ"ר',
    surplus: 'הצבע, שם הגן, וגם אורך הצלע — כי הוא נגזר מהשיעורים',
    cost: 420
  } },
  { page: 69, id: 'p69-missing', kind: 'value', expect: {
    base: 6, missing: 'שיעור ה-Y של הקודקוד השלישי (הגובה)',
    withHeight4: 12
  } },
  { page: 69, id: 'p69-contradiction', kind: 'value', expect: {
    statedLength: 6, derivedLength: 7,
    fix: 'לתקן את הנתון המילולי ל-7, או להזיז את B ל-(8,1)'
  } },

  // ── עמוד 70 — מי צודק? ────────────────────────────────────────
  { page: 70, id: 'p70-trap', kind: 'trapezoid',
    vertices: [[1, 1], [11, 1], [8, 5], [4, 5]], expect: {
      baseBig: 10, baseSmall: 4, height: 4, area: 28, legAD: 5, legBC: 5, perimeter: 24
    } },
  { page: 70, id: 'p70-ways', kind: 'value', expect: {
    wayDecompose: 28, midRect: 16, sideTriangleEach: 6,
    wayBounding: 28, boundingRect: 40, cutTriangles: 12,
    wayFormula: 28, allValid: true
  } },
  { page: 70, id: 'p70-error', kind: 'value', expect: {
    wrongResult: 56, mistake: 'שכחה לחלק ב-2 בנוסחת הטרפז'
  } },
  { page: 70, id: 'p70-fourth', kind: 'value', expect: {
    exists: true, description: 'אלכסון מ-A ל-C מפרק לשני משולשים',
    lowerTriangle: 20, upperTriangle: 8, sum: 28
  } }
];
