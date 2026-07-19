// נתוני תשובות בני־בדיקה אוטומטית.
//
// כל רשומה מצהירה על הגאומטריה שממנה נגזרת התשובה, כך שהבדיקות
// יכולות לחשב מחדש כל ערך מהנקודות עצמן ולא לסמוך על מספר שנכתב ביד.
// `kind` קובע כיצד `expect` מאומת:
//   segment   — אורך קטע המקביל לציר בין a ל־b
//   rectangle — מידות, שטח והיקף ממלבן שצלעותיו מקבילות לצירים
//   line      — משוואת הישר העובר בשתי הנקודות
//   value     — ערך שאינו נגזר מגאומטריה (נבדק רק לעקביות טיפוס)

export const answers = [
  // ---- עמוד 1 ----
  { page: 1, id: 'p1-line-x4', kind: 'line', through: [[4, 0], [4, 3]], expect: { equation: 'x=4', parallelTo: 'y', perpendicularTo: 'x' } },
  { page: 1, id: 'p1-y6-on', kind: 'value', expect: { onLine: ['(8,6)'], notOnLine: ['(6,8)'] } },
  { page: 1, id: 'p1-odd-a', kind: 'value', expect: { odd: 'מאונך לציר Y', reason: 'הישר x=3 מאונך לציר X, לא לציר Y' } },
  { page: 1, id: 'p1-odd-b', kind: 'value', expect: { odd: 'מקביל לציר Y', reason: 'הישר y=5 מקביל לציר X' } },

  // ---- עמוד 2 ----
  { page: 2, id: 'p2-line-AB', kind: 'line', through: [[3, 2], [3, 8]], expect: { equation: 'x=3', parallelTo: 'y', perpendicularTo: 'x' } },
  { page: 2, id: 'p2-classify', kind: 'value', expect: { 'C(3,20)': 'על הישר בלבד', 'D(3,5)': 'על הקטע', 'E(5,3)': 'לא על הישר' } },
  { page: 2, id: 'p2-sort-PQ', kind: 'value', expect: { onSegment: ['(5,7)', '(8,7)'], onLineOnly: ['(12,7)', '(-3,7)'], offLine: ['(2,4)', '(7,8)'] } },
  { page: 2, id: 'p2-claims', kind: 'value', expect: { a: true, b: false, c: true, d: false } },

  // ---- עמוד 3 ----
  { page: 3, id: 'p3-on-axes', kind: 'value', expect: { onX: ['A(5,0)', 'C(0,0)', 'D(-4,0)'], onY: ['B(0,7)', 'C(0,0)', 'E(0,-6)'], both: 'C(0,0)' } },
  { page: 3, id: 'p3-y0-claims', kind: 'value', expect: { correct: ['שיעור Y זהה', 'Y קבוע', 'מקביל לציר X', 'מאונך לציר Y', 'מתלכד עם ציר X', 'כל נקודה עליו מהצורה (x,0)'] } },
  { page: 3, id: 'p3-same-line', kind: 'value', expect: { a: true, b: true, c: false, d: true } },

  // ---- עמוד 4 ----
  { page: 4, id: 'p4-AB', kind: 'segment', a: [2, 3], b: [8, 3], expect: { length: 6, axis: 'x', equation: 'y=3' } },
  { page: 4, id: 'p4-t1', kind: 'segment', a: [2, 5], b: [9, 5], expect: { length: 7, axis: 'x', equation: 'y=5' } },
  { page: 4, id: 'p4-t2', kind: 'segment', a: [4, 1], b: [4, 8], expect: { length: 7, axis: 'y', equation: 'x=4' } },
  { page: 4, id: 'p4-t3', kind: 'segment', a: [3, 7], b: [11, 7], expect: { length: 8, axis: 'x', equation: 'y=7' } },
  { page: 4, id: 'p4-t4', kind: 'segment', a: [6, 2], b: [6, 10], expect: { length: 8, axis: 'y', equation: 'x=6' } },
  { page: 4, id: 'p4-nodraw-a', kind: 'segment', a: [3, 6], b: [11, 6], expect: { length: 8, axis: 'x', equation: 'y=6' } },
  { page: 4, id: 'p4-nodraw-b', kind: 'segment', a: [8, 2], b: [8, 9], expect: { length: 7, axis: 'y', equation: 'x=8' } },
  { page: 4, id: 'p4-nodraw-c', kind: 'segment', a: [4, 0], b: [15, 0], expect: { length: 11, axis: 'x', equation: 'y=0' } },
  { page: 4, id: 'p4-nodraw-d', kind: 'segment', a: [0, 3], b: [0, 12], expect: { length: 9, axis: 'y', equation: 'x=0' } },
  { page: 4, id: 'p4-inverse-B', kind: 'value', expect: { solutions: ['(7,5)'], rejected: '(-1,5) — שיעור שלילי, מחוץ לתחום החיובי' } },
  { page: 4, id: 'p4-inverse-D', kind: 'value', expect: { solutions: ['(6,7)'], alsoValid: '(6,-3) נפסלת כי אינה חיובית' } },

  // ---- עמוד 5 ----
  { page: 5, id: 'p5-horizontal', kind: 'value', expect: { solutions: ['(2,5)', '(8,5)'] } },
  { page: 5, id: 'p5-vertical', kind: 'value', expect: { solutions: ['(5,1)', '(5,9)'] } },
  { page: 5, id: 'p5-sufficiency', kind: 'value', expect: { a: 'חסר', b: 'מספיק', c: 'חסר', d: 'מספיק' } },
  { page: 5, id: 'p5-who', kind: 'segment', a: [3, 8], b: [12, 8], expect: { length: 9, axis: 'x', equation: 'y=8' } },

  // ---- עמוד 6 ----
  { page: 6, id: 'p6-a', kind: 'segment', a: [0, 0], b: [7, 0], expect: { length: 7, axis: 'x', equation: 'y=0' } },
  { page: 6, id: 'p6-b', kind: 'segment', a: [0, 2], b: [0, 9], expect: { length: 7, axis: 'y', equation: 'x=0' } },
  { page: 6, id: 'p6-c', kind: 'segment', a: [3, 0], b: [11, 0], expect: { length: 8, axis: 'x', equation: 'y=0' } },
  { page: 6, id: 'p6-d', kind: 'segment', a: [0, 4], b: [0, 12], expect: { length: 8, axis: 'y', equation: 'x=0' } },
  { page: 6, id: 'p6-AB', kind: 'segment', a: [2, 5], b: [8, 5], expect: { length: 6, axis: 'x', equation: 'y=5' } },
  { page: 6, id: 'p6-OA', kind: 'value', expect: { solutions: ['(5,0)', '(-5,0)'] } },
  { page: 6, id: 'p6-OB', kind: 'value', expect: { solutions: ['(0,4)', '(0,-4)'] } },

  // ---- עמוד 7 ----
  { page: 7, id: 'p7-a', kind: 'segment', a: [-8, 3], b: [-2, 3], expect: { length: 6, axis: 'x', equation: 'y=3' } },
  { page: 7, id: 'p7-b', kind: 'segment', a: [-4, -6], b: [-9, -6], expect: { length: 5, axis: 'x', equation: 'y=-6' } },
  { page: 7, id: 'p7-c', kind: 'segment', a: [-12, 5], b: [-7, 5], expect: { length: 5, axis: 'x', equation: 'y=5' } },
  { page: 7, id: 'p7-AB', kind: 'segment', a: [-9, -3], b: [-4, -3], expect: { length: 5, axis: 'x', equation: 'y=-3' } },
  { page: 7, id: 'p7-CD', kind: 'segment', a: [-6, -11], b: [-6, -5], expect: { length: 6, axis: 'y', equation: 'x=-6' } },
  { page: 7, id: 'p7-EF', kind: 'segment', a: [-13, -7], b: [-3, -7], expect: { length: 10, axis: 'x', equation: 'y=-7' } },
  { page: 7, id: 'p7-PQ', kind: 'segment', a: [-10, -4], b: [-3, -4], expect: { length: 7, axis: 'x', equation: 'y=-4' } },
  { page: 7, id: 'p7-missing-B', kind: 'value', expect: { solutions: ['(-14,4)', '(-4,4)'], note: 'שתי האפשרויות משמאל לציר Y' } },
  { page: 7, id: 'p7-missing-D', kind: 'value', expect: { solutions: ['(-6,-15)', '(-6,-7)'], note: 'שתי האפשרויות מתחת לציר X' } },

  // ---- עמוד 8 ----
  { page: 8, id: 'p8-AB', kind: 'segment', a: [-6, 4], b: [3, 4], expect: { length: 9, axis: 'x', equation: 'y=4', crossesY: true, crossingPoint: '(0,4)', split: [6, 3] } },
  { page: 8, id: 'p8-CD', kind: 'segment', a: [-4, 7], b: [8, 7], expect: { length: 12, axis: 'x', equation: 'y=7', crossesY: true, crossingPoint: '(0,7)' } },
  { page: 8, id: 'p8-EF', kind: 'segment', a: [-11, -2], b: [5, -2], expect: { length: 16, axis: 'x', equation: 'y=-2', crossesY: true, crossingPoint: '(0,-2)' } },
  { page: 8, id: 'p8-GH', kind: 'segment', a: [-3, -9], b: [12, -9], expect: { length: 15, axis: 'x', equation: 'y=-9', crossesY: true, crossingPoint: '(0,-9)' } },
  { page: 8, id: 'p8-status', kind: 'value', expect: { a: 'כולו משמאל לציר Y', b: 'חוצה', c: 'מתחיל על הציר', d: 'מסתיים על הציר' } },
  { page: 8, id: 'p8-missing-a', kind: 'value', expect: { solutions: ['(8,6)'], note: 'הפתרון (-18,6) אינו חוצה את ציר Y' } },
  { page: 8, id: 'p8-missing-b', kind: 'value', expect: { solutions: ['(-6,-3)'], note: 'הפתרון (14,-3) אינו חוצה את ציר Y' } },
  { page: 8, id: 'p8-missing-c', kind: 'value', expect: { possible: false, reason: 'שני הקצוות היו נשארים משמאל לציר Y' } },

  // ---- עמוד 9 ----
  { page: 9, id: 'p9-AB', kind: 'segment', a: [5, -8], b: [5, 3], expect: { length: 11, axis: 'y', equation: 'x=5', crossesX: true, crossingPoint: '(5,0)', split: [8, 3] } },
  { page: 9, id: 'p9-CD', kind: 'segment', a: [-4, -7], b: [-4, 5], expect: { length: 12, axis: 'y', equation: 'x=-4', crossesX: true, crossingPoint: '(-4,0)', split: [7, 5] } },
  { page: 9, id: 'p9-EF', kind: 'segment', a: [8, -3], b: [8, 9], expect: { length: 12, axis: 'y', equation: 'x=8', crossesX: true, crossingPoint: '(8,0)', split: [3, 9] } },
  { page: 9, id: 'p9-GH', kind: 'segment', a: [2, -11], b: [2, 4], expect: { length: 15, axis: 'y', equation: 'x=2', crossesX: true, crossingPoint: '(2,0)', split: [11, 4] } },
  { page: 9, id: 'p9-PQ', kind: 'segment', a: [-3, -6], b: [-3, 8], expect: { length: 14, axis: 'y', equation: 'x=-3' } },
  { page: 9, id: 'p9-sufficiency', kind: 'value', expect: { a: 'לא מספיק', b: 'לא מספיק', c: 'מספיק', d: 'לא מספיק' } },

  // ---- עמוד 10 ----
  { page: 10, id: 'p10-parallel-x', kind: 'value', expect: { solutions: ['(4,4)', '(-10,4)'], count: 2 } },
  { page: 10, id: 'p10-parallel-y', kind: 'value', expect: { solutions: ['(-3,11)', '(-3,-3)'], count: 2 } },
  { page: 10, id: 'p10-cross-y', kind: 'value', expect: { count: 'אינסוף', condition: 'כל B בעלת שיעור Y=4 ושיעור X חיובי' } },
  { page: 10, id: 'p10-cross-x', kind: 'value', expect: { count: 'אינסוף', condition: 'כל B בעלת שיעור X=-3 ושיעור Y שלילי' } },
  { page: 10, id: 'p10-always', kind: 'value', expect: { a: true, b: true, c: true, d: false } },

  // ---- עמוד 11 ----
  { page: 11, id: 'p11-robot', kind: 'value', expect: { direction: 'אופקי, מקביל לציר X', end: '(4,5)', crossing: '(0,5)', before: 7, after: 4 } },
  { page: 11, id: 'p11-robot-alt', kind: 'value', expect: { end: '(-18,5)', reason: 'תנועה שמאלה אינה מגיעה לצד הימני של ציר Y' } },
  { page: 11, id: 'p11-drone', kind: 'segment', a: [-4, -6], b: [-4, 9], expect: { length: 15, axis: 'y', equation: 'x=-4', crossesX: true, crossingPoint: '(-4,0)' } },

  // ---- עמוד 12 ----
  { page: 12, id: 'p12-AB', kind: 'segment', a: [4, 2], b: [4, 9], expect: { length: 7, axis: 'y', equation: 'x=4' } },
  { page: 12, id: 'p12-not-on-y3', kind: 'value', expect: { answer: '(3,2)' } },
  { page: 12, id: 'p12-axes', kind: 'value', expect: { xAxis: 'y=0', yAxis: 'x=0' } },
  { page: 12, id: 'p12-short', kind: 'value', expect: { perpToY: 'ציר Y', sameX: 'x=a' } },
  { page: 12, id: 'p12-length', kind: 'segment', a: [3, 8], b: [12, 8], expect: { length: 9, axis: 'x', equation: 'y=8' } },
  { page: 12, id: 'p12-CD', kind: 'segment', a: [6, 1], b: [6, 10], expect: { length: 9, axis: 'y', equation: 'x=6' } },
  { page: 12, id: 'p12-open', kind: 'value', expect: { example: ['(2,3)', '(10,3)'], unique: false, reason: 'כל קטע אופקי באורך 8 מעל ציר X מקיים את התנאים' } },

  // ---- עמוד 13 ----
  { page: 13, id: 'p13-AB', kind: 'segment', a: [-5, 4], b: [3, 4], expect: { length: 8, axis: 'x', equation: 'y=4', crossesY: true, crossingPoint: '(0,4)' } },
  { page: 13, id: 'p13-BC', kind: 'segment', a: [3, 4], b: [3, -2], expect: { length: 6, axis: 'y', equation: 'x=3', crossesX: true, crossingPoint: '(3,0)' } },
  { page: 13, id: 'p13-D', kind: 'value', expect: { point: '(-5,-2)' } },
  { page: 13, id: 'p13-rect', kind: 'rectangle', corners: [[-5, -2], [3, 4]], expect: { width: 8, height: 6, area: 48, perimeter: 28 } },
  { page: 13, id: 'p13-shift', kind: 'rectangle', corners: [[-1, -2], [7, 4]], expect: { width: 8, height: 6, area: 48, perimeter: 28 } },

  // ---- עמוד 14 ----
  { page: 14, id: 'p14-ABCD', kind: 'rectangle', corners: [[2, 2], [8, 6]], expect: { width: 6, height: 4, area: 24, perimeter: 20 } },
  { page: 14, id: 'p14-groups', kind: 'value', expect: { a: true, b: false, c: true, d: false } },

  // ---- עמוד 15 ----
  { page: 15, id: 'p15-ABCD', kind: 'rectangle', corners: [[2, 3], [10, 8]], expect: { width: 8, height: 5, area: 40, perimeter: 26 } },
  { page: 15, id: 'p15-table-1', kind: 'rectangle', corners: [[1, 2], [7, 9]], expect: { width: 6, height: 7, area: 42, perimeter: 26 } },
  { page: 15, id: 'p15-table-2', kind: 'rectangle', corners: [[3, 4], [12, 6]], expect: { width: 9, height: 2, area: 18, perimeter: 22 } },
  { page: 15, id: 'p15-table-3', kind: 'rectangle', corners: [[0, 0], [5, 8]], expect: { width: 5, height: 8, area: 40, perimeter: 26 } },

  // ---- עמוד 16 ----
  { page: 16, id: 'p16-grid', kind: 'rectangle', corners: [[1, 1], [8, 5]], expect: { width: 7, height: 4, area: 28, perimeter: 22 } },
  { page: 16, id: 'p16-24-a', kind: 'rectangle', corners: [[0, 0], [2, 12]], expect: { width: 2, height: 12, area: 24, perimeter: 28 } },
  { page: 16, id: 'p16-24-b', kind: 'rectangle', corners: [[0, 0], [3, 8]], expect: { width: 3, height: 8, area: 24, perimeter: 22 } },
  { page: 16, id: 'p16-24-c', kind: 'rectangle', corners: [[0, 0], [4, 6]], expect: { width: 4, height: 6, area: 24, perimeter: 20 } },
  { page: 16, id: 'p16-24-d', kind: 'rectangle', corners: [[0, 0], [1, 24]], expect: { width: 1, height: 24, area: 24, perimeter: 50 } },

  // ---- עמוד 17 ----
  { page: 17, id: 'p17-robot', kind: 'rectangle', corners: [[2, 2], [9, 6]], expect: { width: 7, height: 4, area: 28, perimeter: 22 } },
  { page: 17, id: 'p17-same-area-a', kind: 'rectangle', corners: [[0, 0], [4, 6]], expect: { width: 4, height: 6, area: 24, perimeter: 20 } },
  { page: 17, id: 'p17-same-area-b', kind: 'rectangle', corners: [[0, 0], [2, 12]], expect: { width: 2, height: 12, area: 24, perimeter: 28 } },
  { page: 17, id: 'p17-per20-a', kind: 'rectangle', corners: [[0, 0], [3, 7]], expect: { width: 3, height: 7, area: 21, perimeter: 20 } },
  { page: 17, id: 'p17-per20-b', kind: 'rectangle', corners: [[0, 0], [5, 5]], expect: { width: 5, height: 5, area: 25, perimeter: 20 } },

  // ---- עמוד 18 ----
  { page: 18, id: 'p18-D', kind: 'value', expect: { point: '(2,7)' } },
  { page: 18, id: 'p18-rect1', kind: 'rectangle', corners: [[2, 3], [9, 7]], expect: { width: 7, height: 4, area: 28, perimeter: 22 } },
  { page: 18, id: 'p18-S', kind: 'value', expect: { point: '(11,2)' } },
  { page: 18, id: 'p18-rect2', kind: 'rectangle', corners: [[4, 2], [11, 8]], expect: { width: 7, height: 6, area: 42, perimeter: 26 } },
  { page: 18, id: 'p18-missing-1', kind: 'value', expect: { point: '(1,5)' } },
  { page: 18, id: 'p18-missing-2', kind: 'value', expect: { point: '(-7,9)', quadrant: 'רביע שני' } },
  { page: 18, id: 'p18-missing-3', kind: 'value', expect: { point: '(10,-4)', note: 'המלבן חוצה את ציר X' } },

  // ---- עמוד 19 ----
  { page: 19, id: 'p19-opposite', kind: 'value', expect: { b: '(8,2)', d: '(2,7)' } },
  { page: 19, id: 'p19-rect', kind: 'rectangle', corners: [[2, 2], [8, 7]], expect: { width: 6, height: 5, area: 30, perimeter: 22 } },
  { page: 19, id: 'p19-adjacent', kind: 'value', expect: { count: 'אינסוף', reason: 'כל בחירת רוחב חיובי נותנת מלבן אחר', unique: 'נתון אורך הצלע השנייה וכיוונה' } },
  { page: 19, id: 'p19-sufficiency', kind: 'value', expect: { a: 'מספיק — שני פתרונות', b: 'מספיק — פתרון אחד', c: 'מספיק — ארבעה פתרונות', d: 'חסר — אינסוף' } },

  // ---- עמוד 20 ----
  { page: 20, id: 'p20-ABCD', kind: 'rectangle', corners: [[0, 0], [8, 5]], expect: { width: 8, height: 5, area: 40, perimeter: 26 } },
  { page: 20, id: 'p20-lines', kind: 'value', expect: { AB: 'y=0', BC: 'x=8', CD: 'y=5', AD: 'x=0' } },
  { page: 20, id: 'p20-both-axes', kind: 'value', expect: { possible: true, corner: '(0,0)' } },
  { page: 20, id: 'p20-above', kind: 'value', expect: { necessarily: false, counterexample: '(0,0),(5,0),(5,-3),(0,-3)' } },

  // ---- עמוד 21 ----
  { page: 21, id: 'p21-ABCD', kind: 'rectangle', corners: [[-10, -8], [-3, -2]], expect: { width: 7, height: 6, area: 42, perimeter: 26 } },
  { page: 21, id: 'p21-mirror', kind: 'rectangle', corners: [[3, 2], [10, 8]], expect: { width: 7, height: 6, area: 42, perimeter: 26 } },
  { page: 21, id: 'p21-error', kind: 'value', expect: { wrong: '-10-(-3)=-7', correct: '-3-(-10)=7', rule: 'אורך הוא הערך המוחלט של ההפרש' } },

  // ---- עמוד 22 ----
  { page: 22, id: 'p22-ABCD', kind: 'rectangle', corners: [[-4, 2], [6, 7]], expect: { width: 10, height: 5, area: 50, perimeter: 30 } },
  { page: 22, id: 'p22-cross', kind: 'value', expect: { axis: 'ציר Y', split: [4, 6], sides: 2 } },
  { page: 22, id: 'p22-PQRS', kind: 'rectangle', corners: [[3, -5], [8, 4]], expect: { width: 5, height: 9, area: 45, perimeter: 28 } },
  { page: 22, id: 'p22-PQRS-cross', kind: 'value', expect: { axis: 'ציר X', points: ['(3,0)', '(8,0)'] } },
  { page: 22, id: 'p22-build', kind: 'rectangle', corners: [[-3, 2], [5, 7]], expect: { width: 8, height: 5, area: 40, perimeter: 26 } },

  // ---- עמוד 23 ----
  { page: 23, id: 'p23-ABCD', kind: 'rectangle', corners: [[-5, -3], [4, 6]], expect: { width: 9, height: 9, area: 81, perimeter: 36 } },
  { page: 23, id: 'p23-crossings', kind: 'value', expect: { onX: ['(-5,0)', '(4,0)'], onY: ['(0,-3)', '(0,6)'], origin: 'בתוך המלבן' } },
  { page: 23, id: 'p23-condition', kind: 'value', expect: { condition: 'xשמאלי<0<xימני וגם yתחתון<0<yעליון' } },
  { page: 23, id: 'p23-on-edge', kind: 'rectangle', corners: [[-4, 0], [5, 7]], expect: { width: 9, height: 7, area: 63, perimeter: 32 } },

  // ---- עמוד 24 ----
  { page: 24, id: 'p24-base', kind: 'rectangle', corners: [[-2, 1], [5, 6]], expect: { width: 7, height: 5, area: 35, perimeter: 24 } },
  { page: 24, id: 'p24-right4', kind: 'rectangle', corners: [[2, 1], [9, 6]], expect: { width: 7, height: 5, area: 35, perimeter: 24 } },
  { page: 24, id: 'p24-down3', kind: 'rectangle', corners: [[-2, -2], [5, 3]], expect: { width: 7, height: 5, area: 35, perimeter: 24 } },
  { page: 24, id: 'p24-left6up2', kind: 'rectangle', corners: [[-8, 3], [-1, 8]], expect: { width: 7, height: 5, area: 35, perimeter: 24 } },

  // ---- עמוד 25 ----
  { page: 25, id: 'p25-area36', kind: 'rectangle', corners: [[0, 0], [9, 4]], expect: { width: 9, height: 4, area: 36, perimeter: 26 } },
  { page: 25, id: 'p25-per30', kind: 'rectangle', corners: [[0, 0], [9, 6]], expect: { width: 9, height: 6, area: 54, perimeter: 30 } },
  { page: 25, id: 'p25-pairs-1', kind: 'rectangle', corners: [[0, 0], [1, 24]], expect: { width: 1, height: 24, area: 24, perimeter: 50 } },
  { page: 25, id: 'p25-pairs-2', kind: 'rectangle', corners: [[0, 0], [2, 12]], expect: { width: 2, height: 12, area: 24, perimeter: 28 } },
  { page: 25, id: 'p25-pairs-3', kind: 'rectangle', corners: [[0, 0], [3, 8]], expect: { width: 3, height: 8, area: 24, perimeter: 22 } },
  { page: 25, id: 'p25-pairs-4', kind: 'rectangle', corners: [[0, 0], [4, 6]], expect: { width: 4, height: 6, area: 24, perimeter: 20 } },
  { page: 25, id: 'p25-min-perimeter', kind: 'value', expect: { answer: '4 על 6', reason: 'ככל שהמלבן קרוב יותר לריבוע, ההיקף קטן יותר בשטח נתון' } }
];

/** מילון המושגים המחייב — נבדק מול research/source-map.md §7. */
export const glossary = [
  'שיעור X זהה',
  'שיעור Y זהה',
  'X קבוע',
  'Y קבוע',
  'ישר מקביל לציר X',
  'ישר מקביל לציר Y',
  'ישר מאונך לציר X',
  'ישר מאונך לציר Y',
  'הישר x=a',
  'הישר y=b',
  'ציר X מתלכד עם y=0',
  'ציר Y מתלכד עם x=0'
];
