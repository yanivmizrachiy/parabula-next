// תשובות בנות־בדיקה ליחידה 8 — חקר, הנמקה ומבדק סיום (עמודים 71–75).
// כל ערך נגזר מהקודקודים או מנימוק ספירתי הנבדק בבדיקות.

export const unit08Answers = [
  // ── עמוד 71 — טענות ודוגמאות נגדיות ───────────────────────────
  { page: 71, id: 'p71-claims', kind: 'value', expect: {
    equalAreaEqualPerimeter: 'שגוי',
    equalPerimeterEqualArea: 'שגוי',
    translationKeepsArea: 'נכון תמיד',
    sameXDistanceIsYDiff: 'נכון תמיד',
    crossesYimpliesParallelX: 'נכון בתנאי — לקטעים מקבילי-צירים בלבד: קטע המקביל לציר Y אינו יכול לחצות אותו, ולכן החוצה חייב להיות מקביל לציר X; קטע אלכסוני כללי מפריך את הטענה',
    sameBaseSameHeightTriangles: 'נכון תמיד'
  } },
  { page: 71, id: 'p71-counter1', kind: 'value', expect: {
    shapeA: 'מלבן 4×6', shapeB: 'מלבן 2×12',
    areaBoth: 24, perimeterA: 20, perimeterB: 28
  } },
  { page: 71, id: 'p71-counter2', kind: 'value', expect: {
    shapeA: 'ריבוע 6×6', shapeB: 'מלבן 2×10',
    perimeterBoth: 24, areaA: 36, areaB: 20
  } },

  // ── עמוד 72 — מצאו את כל האפשרויות ────────────────────────────
  { page: 72, id: 'p72-rect48', kind: 'value', expect: {
    pairs: '1×48, 2×24, 3×16, 4×12, 6×8', pairCount: 5,
    method: 'עוברים על כל המחלקים של 48 בסדר עולה עד שהזוגות מתהפכים'
  } },
  { page: 72, id: 'p72-lineC', kind: 'value', expect: {
    base: 6, height: 5, areaForAnyC: 15, count: 'אינסוף',
    secondLine: 'y=-4',
    reason: 'כל נקודה על y=6 שומרת על אותו גובה מעל הבסיס שעל y=1'
  } },
  { page: 72, id: 'p72-perim28', kind: 'value', expect: {
    sumOfSides: 14, pairCount: 7, includesSquare: '7×7',
    finite: true
  } },
  { page: 72, id: 'p72-fourth', kind: 'value', expect: {
    howToTell: 'הנקודות עצמן מכריעות: חולקות שיעור — סמוכות; נבדלות בשני השיעורים — נגדיות',
    ifOpposite: 'מלבן יחיד',
    ifAdjacent: 'אינסוף מלבנים — אורך הצלע הניצבת חופשי, משני צידי הצלע המשותפת',
    conclusion: 'המצב לעולם אינו עמום: קודקודים נגדיים קובעים מלבן יחיד, וסמוכים משאירים אינסוף'
  } },

  // ── עמוד 73 — משימת תכנון פתוחה ───────────────────────────────
  { page: 73, id: 'p73-yard', kind: 'trapezoid',
    vertices: [[-2, -4], [6, -4], [4, 0], [-2, 0]], expect: {
      baseBig: 8, baseSmall: 6, height: 4, area: 28
    } },
  { page: 73, id: 'p73-example', kind: 'value', expect: {
    classroom: 24, yard: 28, shade: 6, total: 58,
    inRange: true, rangeMin: 40, rangeMax: 60,
    classroomPerimeter: 20, perimeterCap: 30, underCap: true,
    crossesAxis: 'החצר חוצה את ציר ה-Y — הישר x=0 עובר בתוכה; צלעה העליונה מונחת על ציר ה-X',
    originOnBoundary: true
  } },

  // ── עמוד 74 — משימה מסכמת גדולה ───────────────────────────────
  { page: 74, id: 'p74-school', kind: 'rectangle',
    corners: [[-4, 1], [2, 5]], expect: { width: 6, height: 4, area: 24, perimeter: 20 } },
  { page: 74, id: 'p74-park', kind: 'triangleArea',
    vertices: [[3, 1], [9, 1], [5, 5]], base: [0, 1], expect: {
      baseLength: 6, height: 4, baseAxis: 'x', area: 12
    } },
  { page: 74, id: 'p74-pool', kind: 'trapezoid',
    vertices: [[-5, -5], [1, -5], [-1, -2], [-5, -2]], expect: {
      baseBig: 6, baseSmall: 4, height: 3, area: 15
    } },
  { page: 74, id: 'p74-missingD', kind: 'value', expect: {
    D: '(-4,5)', reason: 'שיעור ה-X של A ושיעור ה-Y של C'
  } },
  { page: 74, id: 'p74-extraInfo', kind: 'value', expect: {
    surplus: 'צבע הגג', needed: 'שיעורי הקודקודים'
  } },
  { page: 74, id: 'p74-error', kind: 'value', expect: {
    wrongPerimeter: 10, correctPerimeter: 20,
    mistake: 'חיבר רוחב וגובה אך שכח להכפיל ב-2'
  } },
  { page: 74, id: 'p74-path', kind: 'segment', a: [-1, -2], b: [-1, 1],
    expect: { length: 3, axis: 'y', equation: 'x=-1', crossesX: true, split: [2, 1] } },
  { page: 74, id: 'p74-open', kind: 'value', expect: {
    newLotArea: 12, count: 'אינסוף',
    reason: 'אפשר לבחור מידות שונות (1×12, 2×6, 3×4) וכל מיקום פנוי במפה'
  } },

  // ── עמוד 75 — מבחן מסכם ───────────────────────────────────────
  { page: 75, id: 'p75-segment', kind: 'segment', a: [-3, 5], b: [4, 5],
    expect: { length: 7, axis: 'x', equation: 'y=5' } },
  { page: 75, id: 'p75-rect', kind: 'rectangle',
    corners: [[1, -2], [6, 3]], expect: { width: 5, height: 5, area: 25, perimeter: 20 } },
  { page: 75, id: 'p75-triangle', kind: 'triangle',
    vertices: [[0, 0], [6, 0], [0, 4]], expect: { legs: [4, 6], area: 12 } },
  { page: 75, id: 'p75-kite', kind: 'kite',
    vertices: [[9, 0], [11, 2], [9, 6], [7, 2]], expect: {
      diagonalAC: 6, diagonalBD: 4, area: 12
    } },
  { page: 75, id: 'p75-L', kind: 'rectilinear',
    vertices: [[0, 0], [5, 0], [5, 2], [2, 2], [2, 4], [0, 4]], expect: {
      area: 14, perimeter: 18
    } },
  { page: 75, id: 'p75-equalNumbers', kind: 'value', expect: {
    example1: 'ריבוע 4×4 — שטח 16 והיקף 16',
    example2: 'מלבן 3×6 — שטח 18 והיקף 18',
    caveat: 'המספרים שווים אך היחידות שונות — יחידות שטח מול יחידות אורך'
  } }
];
