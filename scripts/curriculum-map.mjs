// scripts/curriculum-map.mjs
// עץ תכנית הלימודים למתמטיקה בחטיבת הביניים, ושיוך כל דף עבודה קיים לצומת עלה.
//
// זהו קובץ נתונים בלבד — אין בו כללי עבודה. כללי העבודה נמצאים אך ורק ב־CLAUDE.md.
//
// שני מבנים מיוצאים:
//   CURRICULUM — העץ הקנוני. כל צומת קיים גם כשאין לו דפי עבודה ("בית ריק").
//   PAGE_ASSIGNMENTS — שיוך מספר דף → מזהה צומת עלה. אין ספירות כאן; המונים נגזרים בזמן ריצה.
//
// שיוך נקבע לפי התוכן המתמטי בפועל של הדף (כותרת פרק, כותרת משנה וגוף השאלות),
// ולא לפי ניחוש. דף חדש שאינו מופיע כאן מפיל את הבנייה במכוון, כדי שהשיוך יהיה מפורש.

/** @typedef {{id: string, name: string, extension?: boolean, children?: Node[]}} Node */

/** @type {Node[]} */
export const CURRICULUM = [
  {
    id: 'g7',
    name: "כיתה ז'",
    children: [
      {
        id: 'g7.num',
        name: 'תחום מספרי',
        children: [
          {
            id: 'g7.num.ops',
            name: 'פעולות החשבון וחוקיהן, חזקות ושורשים ריבועיים',
            children: [
              { id: 'g7.num.ops.order', name: 'סדר פעולות החשבון' },
              {
                id: 'g7.num.ops.powers',
                name: 'חזקות ושורשים',
                children: [
                  { id: 'g7.num.ops.powers.natural', name: 'חזקות עם מעריך טבעי' },
                  { id: 'g7.num.ops.powers.sqrt', name: 'שורש ריבועי' },
                ],
              },
            ],
          },
          {
            id: 'g7.num.directed',
            name: 'מספרים מכוונים',
            children: [
              {
                id: 'g7.num.directed.intro',
                name: 'היכרות ופעולות במספרים מכוונים',
                children: [
                  { id: 'g7.num.directed.intro.signs', name: 'מספרים שליליים, חיוביים ואפס' },
                  { id: 'g7.num.directed.intro.numberLine', name: 'הצגת מספרים שליליים על ציר המספרים' },
                  { id: 'g7.num.directed.intro.order', name: 'סדר על ציר המספרים' },
                  { id: 'g7.num.directed.intro.opposite', name: 'מספרים נגדיים' },
                  { id: 'g7.num.directed.intro.fourOps', name: 'ארבע פעולות חשבון במספרים מכוונים' },
                  { id: 'g7.num.directed.intro.powers', name: 'חזקות עם מעריך טבעי ובסיס שהוא מספר מכוון' },
                ],
              },
              { id: 'g7.num.directed.axesFirst', name: 'מערכת צירים - רביע ראשון בלבד' },
              { id: 'g7.num.directed.axesAll', name: 'מערכת צירים - כל הרביעים' },
              { id: 'g7.num.directed.algebra', name: 'שילוב התחום האלגברי בלימוד מספרים מכוונים' },
            ],
          },
        ],
      },
      {
        id: 'g7.alg',
        name: 'תחום אלגברי',
        children: [
          {
            id: 'g7.alg.expressions',
            name: 'משתנים, ביטויים אלגבריים והכללה של תופעות מספריות',
            children: [
              { id: 'g7.alg.expressions.variables', name: 'משתנים וביטויים אלגבריים' },
              { id: 'g7.alg.expressions.substitution', name: 'הצבת מספרים בביטויים אלגבריים' },
              { id: 'g7.alg.expressions.equality', name: 'שוויון בין ביטויים אלגבריים' },
              { id: 'g7.alg.expressions.collect', name: 'כינוס איברים דומים' },
            ],
          },
          {
            id: 'g7.alg.equations',
            name: 'פתרון משוואות ושאלות מילוליות',
            children: [
              {
                id: 'g7.alg.equations.solving',
                name: 'משוואות ופתרונן',
                children: [
                  { id: 'g7.alg.equations.solving.linear1', name: 'פתרון משוואות ממעלה ראשונה בנעלם אחד' },
                ],
              },
              {
                id: 'g7.alg.equations.word',
                name: 'שאלות מילוליות',
                children: [
                  {
                    id: 'g7.alg.equations.word.linear1',
                    name: 'שאלות מילוליות שניתנות לפתרון באמצעות משוואות ממעלה ראשונה בנעלם אחד',
                  },
                ],
              },
            ],
          },
          {
            id: 'g7.alg.functions',
            name: 'מבוא לפונקציות',
            children: [
              {
                id: 'g7.alg.functions.graphs',
                name: 'גרפים',
                children: [
                  { id: 'g7.alg.functions.graphs.useful', name: 'גרפים שימושיים - קריאה ושרטוט' },
                ],
              },
              {
                id: 'g7.alg.functions.functions',
                name: 'פונקציות',
                children: [
                  { id: 'g7.alg.functions.functions.intro', name: 'מבוא לפונקציות' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'g7.geo',
        name: 'תחום גאומטרי',
        children: [
          {
            id: 'g7.geo.quads',
            name: 'מרובעים, תלת-ממד וישרים',
            children: [
              {
                id: 'g7.geo.quads.rectSquare',
                name: 'מלבן וריבוע',
                children: [
                  { id: 'g7.geo.quads.rectSquare.rectangle', name: 'מלבן ותכונותיו' },
                  { id: 'g7.geo.quads.rectSquare.square', name: 'ריבוע ותכונותיו' },
                  {
                    id: 'g7.geo.quads.rectSquare.perimeterArea',
                    name: 'היקף ושטח (היקף מלבן, שטח מלבן, היקף ושטח ריבוע)',
                  },
                ],
              },
              {
                id: 'g7.geo.quads.lines',
                name: 'ישרים',
                children: [
                  { id: 'g7.geo.quads.lines.perpendicular', name: 'ניצבות של ישרים' },
                  { id: 'g7.geo.quads.lines.parallel', name: 'ישרים מקבילים' },
                ],
              },
              { id: 'g7.geo.quads.congruent', name: 'צורות חופפות' },
              { id: 'g7.geo.quads.solids', name: 'גופים תלת-ממדיים: תיבה וקובייה' },
            ],
          },
          {
            id: 'g7.geo.areas',
            name: 'שטחים של מצולעים',
            children: [
              { id: 'g7.geo.areas.triangles', name: 'שטחי משולשים' },
              { id: 'g7.geo.areas.parallelograms', name: 'שטחי מקביליות' },
              { id: 'g7.geo.areas.trapezoids', name: 'שטחי טרפזים' },
              { id: 'g7.geo.areas.general', name: 'שטחים של מצולעים כלליים' },
            ],
          },
          {
            id: 'g7.geo.circle',
            name: 'מעגל ועיגול',
            children: [
              { id: 'g7.geo.circle.perimeterArea', name: 'מעגל ועיגול: היקף ושטח' },
            ],
          },
          { id: 'g7.geo.pythagoras', name: 'משפט פיתגורס' },
          {
            id: 'g7.geo.angles',
            name: 'זוויות',
            children: [
              { id: 'g7.geo.angles.concept', name: 'מושג הזווית' },
              { id: 'g7.geo.angles.measuring', name: 'מדידת זוויות' },
              { id: 'g7.geo.angles.comparing', name: 'זוויות שוות והשוואת זוויות' },
              { id: 'g7.geo.angles.sumDiff', name: 'סכום והפרש של זוויות' },
              { id: 'g7.geo.angles.bisector', name: 'חוצה זווית' },
              { id: 'g7.geo.angles.adjacent', name: 'סכום זוויות צמודות 180°' },
              { id: 'g7.geo.angles.vertical', name: 'זוויות קודקודיות שוות זו לזו' },
              { id: 'g7.geo.angles.parallel', name: 'זוויות בין ישרים מקבילים' },
            ],
          },
        ],
      },
      {
        id: 'g7.extra',
        name: 'נושאים נוספים',
        extension: true,
        children: [
          { id: 'g7.extra.prism', name: 'מנסרה משולשת ישרה', extension: true },
          { id: 'g7.extra.summary', name: 'שאלות סיכום — גאומטריה כיתה ז', extension: true },
        ],
      },
    ],
  },
  {
    id: 'g8',
    name: "כיתה ח'",
    children: [
      {
        id: 'g8.alg',
        name: 'תחום אלגברי',
        children: [
          {
            id: 'g8.alg.linear',
            name: 'הפונקציה הקווית',
            children: [
              { id: 'g8.alg.linear.representations', name: 'ייצוגים שונים של פונקציה קווית (גרף, טבלה, משוואה)' },
              { id: 'g8.alg.linear.slope', name: 'שיפוע של פונקציה קווית' },
              { id: 'g8.alg.linear.intercepts', name: 'חיתוך עם הצירים של ישר' },
              { id: 'g8.alg.linear.axisParallel', name: 'ישרים מקבילים לצירים' },
              { id: 'g8.alg.linear.findEquation', name: 'מציאת משוואת ישר (לפי שיפוע ונקודה, או שתי נקודות)' },
              { id: 'g8.alg.linear.parallelCoincident', name: 'ישרים מקבילים ומתלכדים' },
              { id: 'g8.alg.linear.intersection', name: 'חיתוך בין שני ישרים' },
              { id: 'g8.alg.linear.inequalities', name: 'אי-שוויונות בין ישרים' },
            ],
          },
          {
            id: 'g8.alg.systems',
            name: 'מערכת משוואות ליניאריות',
            children: [
              { id: 'g8.alg.systems.graphic', name: 'פתרון גרפי של מערכת משוואות' },
              { id: 'g8.alg.systems.substitution', name: 'שיטת ההצבה' },
              { id: 'g8.alg.systems.elimination', name: 'שיטת השוואת המקדמים' },
              { id: 'g8.alg.systems.word', name: 'שאלות מילוליות הנפתרות באמצעות מערכת משוואות' },
            ],
          },
          {
            id: 'g8.alg.technique',
            name: 'טכניקה אלגברית ואי-שוויונות',
            children: [
              { id: 'g8.alg.technique.distribution', name: 'חוק הפילוג המורחב ופתיחת סוגריים' },
              { id: 'g8.alg.technique.factoring', name: 'פירוק לגורמים (הוצאת גורם משותף)' },
              { id: 'g8.alg.technique.fractions', name: 'פתרון משוואות עם שברים (מכנה מספרי ומכנה אלגברי)' },
              { id: 'g8.alg.technique.inequalities', name: 'פתרון אי-שוויונות ממעלה ראשונה' },
            ],
          },
        ],
      },
      {
        id: 'g8.geo',
        name: 'תחום גאומטרי',
        children: [
          { id: 'g8.geo.congruentTriangles', name: 'משולשים חופפים' },
          { id: 'g8.geo.isosceles', name: 'משולש שווה שוקיים ומשולש שווה צלעות' },
          {
            id: 'g8.geo.polygons',
            name: 'מצולעים',
            children: [
              { id: 'g8.geo.polygons.interiorSum', name: 'סכום זוויות פנימיות במצולע' },
              { id: 'g8.geo.polygons.explore', name: 'חקר מצולעים ותכונותיהם (אלכסונים, זוויות חיצוניות)' },
            ],
          },
        ],
      },
      {
        id: 'g8.numstat',
        name: 'תחום מספרי וסטטיסטיקה',
        children: [
          { id: 'g8.numstat.ratio', name: 'יחס, פרופורציה, קנה מידה ואחוזים' },
          { id: 'g8.numstat.statistics', name: 'סטטיסטיקה' },
        ],
      },
      {
        id: 'g8.extra',
        name: 'נושאים נוספים',
        extension: true,
        children: [
          { id: 'g8.extra.cylinderCone', name: 'גליל וחרוט', extension: true },
          { id: 'g8.extra.median', name: 'תיכון במשולש', extension: true },
        ],
      },
    ],
  },
  {
    id: 'g9',
    name: "כיתה ט'",
    children: [
      {
        id: 'g9.alg',
        name: 'תחום אלגברי',
        children: [
          {
            id: 'g9.alg.parabola',
            name: 'הפונקציה הריבועית (פרבולה)',
            children: [
              { id: 'g9.alg.parabola.intro', name: 'היכרות עם הפרבולה, קודקוד הפרבולה וציר סימטריה' },
              { id: 'g9.alg.parabola.intercepts', name: 'מציאת נקודות חיתוך עם הצירים (אפסים)' },
              { id: 'g9.alg.parabola.behavior', name: 'תחומי עלייה, ירידה, חיוביות ושליליות' },
              { id: 'g9.alg.parabola.shifts', name: 'הזזות של פרבולות (אנכיות ואופקיות)' },
            ],
          },
          {
            id: 'g9.alg.quadratic',
            name: 'משוואות ריבועיות וטכניקה אלגברית',
            children: [
              { id: 'g9.alg.quadratic.incomplete', name: 'פתרון משוואות ריבועיות חסרות (b=0, c=0)' },
              { id: 'g9.alg.quadratic.formula', name: 'פתרון משוואה ריבועית באמצעות נוסחת השורשים' },
              { id: 'g9.alg.quadratic.factoring', name: 'פתרון משוואות על ידי פירוק טרינום וכפל מקוצר' },
              { id: 'g9.alg.quadratic.powerLaws', name: 'חוקי חזקות עם מעריך שלם (חיובי, שלילי ואפס)' },
              { id: 'g9.alg.quadratic.scientific', name: 'כתיב מדעי של מספרים גדולים וקטנים מאוד' },
            ],
          },
          { id: 'g9.alg.systemsWord', name: 'מערכות משוואות ושאלות מילוליות' },
        ],
      },
      {
        id: 'g9.geo',
        name: 'תחום גאומטרי',
        children: [
          { id: 'g9.geo.similarTriangles', name: 'משולשים דומים' },
          {
            id: 'g9.geo.quadFamily',
            name: 'משפחת המרובעים',
            children: [
              { id: 'g9.geo.quadFamily.parallelogram', name: 'מקבילית' },
              { id: 'g9.geo.quadFamily.rectangle', name: 'מלבן' },
              { id: 'g9.geo.quadFamily.rhombus', name: 'מעוין' },
              { id: 'g9.geo.quadFamily.square', name: 'ריבוע' },
              { id: 'g9.geo.quadFamily.kite', name: 'דלתון' },
              { id: 'g9.geo.quadFamily.trapezoid', name: 'טרפז' },
              { id: 'g9.geo.quadFamily.midsegment', name: 'קטע אמצעים במשולש ובטרפז' },
            ],
          },
        ],
      },
      {
        id: 'g9.prob',
        name: 'הסתברות',
        children: [
          { id: 'g9.prob.probability', name: 'הסתברות' },
        ],
      },
    ],
  },
];

/**
 * שיוך דפים לצמתי עלה. המפתח הוא מזהה הצומת; הערך הוא רשימת מספרי דפים.
 * טווח נכתב כמחרוזת 'a-b' (כולל שני הקצוות); דף בודד נכתב כמספר.
 */
export const PAGE_ASSIGNMENTS = {
  // ── כיתה ז' · תחום מספרי ───────────────────────────────────────────
  'g7.num.directed.axesFirst': ['268-271'],
  'g7.num.directed.axesAll': [360, 361, '398-401'],

  // ── כיתה ז' · תחום אלגברי ──────────────────────────────────────────
  'g7.alg.expressions.variables': ['1-2', '7-8', '99-102', 107, 390, 391],
  'g7.alg.expressions.substitution': ['103-106'],
  'g7.alg.expressions.equality': [108, 109],
  'g7.alg.expressions.collect': [110, 111],
  'g7.alg.equations.solving.linear1': ['42-81', 95, 112, 113, 116, 117],
  'g7.alg.equations.word.linear1': [114, 115, 118, 119],
  'g7.alg.functions.graphs.useful': ['120-129', 134, 135],
  'g7.alg.functions.functions.intro': ['130-133'],

  // ── כיתה ז' · תחום גאומטרי ─────────────────────────────────────────
  'g7.geo.quads.rectSquare.square': [336],
  'g7.geo.quads.rectSquare.perimeterArea': [353, 355, 386, 387, 389],
  'g7.geo.quads.congruent': ['222-223', '349-352'],
  'g7.geo.quads.solids': ['365-374'],
  'g7.geo.areas.triangles': ['357-359'],
  'g7.geo.areas.parallelograms': [381, 384, 385, 388],
  'g7.geo.areas.trapezoids': [382, 383],
  'g7.geo.areas.general': [354, 356, '362-364'],
  'g7.geo.circle.perimeterArea': ['196-204'],
  'g7.geo.pythagoras': ['9-30', 41, '375-380'],
  'g7.geo.angles.concept': [320, 322, 327],
  'g7.geo.angles.measuring': ['323-326', 328, 329],
  'g7.geo.angles.comparing': [321],
  'g7.geo.angles.sumDiff': ['333-335'],
  'g7.geo.angles.bisector': ['330-332'],
  'g7.geo.angles.adjacent': [337, 339],
  'g7.geo.angles.vertical': [338],
  'g7.geo.angles.parallel': ['211-213'],
  'g7.extra.prism': [392, 393],
  'g7.extra.summary': [394],

  // ── כיתה ח' · תחום אלגברי ──────────────────────────────────────────
  'g8.alg.linear.representations': [
    '96-98', 136, '139-146', 164, 165, 177, 178, 180,
    '395-397', '402-410', '455-470',
  ],
  'g8.alg.linear.slope': ['147-163', 173, 174, '411-422', 454],
  'g8.alg.linear.intercepts': [167, 169, 170, '423-431'],
  'g8.alg.linear.axisParallel': ['438-440'],
  'g8.alg.linear.findEquation': [166, 168, 171, 175, 176, '441-450'],
  'g8.alg.linear.parallelCoincident': [172, '432-437'],
  'g8.alg.linear.intersection': [137, 179, 181, '451-453'],
  'g8.alg.linear.inequalities': [138],
  'g8.alg.systems.graphic': ['190-194'],
  'g8.alg.systems.elimination': [195],
  'g8.alg.technique.distribution': [37, 38],
  'g8.alg.technique.fractions': ['82-94'],
  'g8.alg.technique.inequalities': ['186-189'],

  // ── כיתה ח' · תחום גאומטרי ─────────────────────────────────────────
  'g8.geo.congruentTriangles': ['224-226'],
  'g8.geo.isosceles': [340, 341],
  'g8.geo.polygons.interiorSum': [214, 215, '342-347'],
  'g8.geo.polygons.explore': [216, 217, 348],

  // ── כיתה ח' · תחום מספרי וסטטיסטיקה ────────────────────────────────
  'g8.numstat.ratio': ['182-185', '272-319'],
  'g8.numstat.statistics': ['231-256', '261-267'],
  'g8.extra.cylinderCone': ['205-210'],
  'g8.extra.median': ['218-221'],

  // ── כיתה ט' ────────────────────────────────────────────────────────
  'g9.alg.parabola.intro': ['3-6'],
  'g9.alg.quadratic.incomplete': ['31-36', '471-478'],
  'g9.alg.quadratic.formula': ['479-482', '493-508'],
  'g9.alg.quadratic.factoring': ['483-492', '509-514'],
  'g9.geo.similarTriangles': ['227-230'],
  'g9.geo.quadFamily.parallelogram': [39, 40],
  'g9.prob.probability': ['257-260'],
};

/** מרחיב טווחים ('9-30') ומספרים בודדים לרשימת מספרים שטוחה. */
export function expandPages(entries) {
  const out = [];
  for (const entry of entries) {
    if (typeof entry === 'number') {
      out.push(entry);
      continue;
    }
    const match = /^(\d+)-(\d+)$/.exec(String(entry));
    if (!match) throw new Error(`טווח דפים לא תקין: ${entry}`);
    const from = Number(match[1]);
    const to = Number(match[2]);
    if (to < from) throw new Error(`טווח דפים הפוך: ${entry}`);
    for (let n = from; n <= to; n += 1) out.push(n);
  }
  return out;
}

/** מחזיר מפה שטוחה: מספר דף → מזהה צומת. נכשל על שיוך כפול. */
export function buildPageIndex() {
  const index = new Map();
  for (const [nodeId, entries] of Object.entries(PAGE_ASSIGNMENTS)) {
    for (const number of expandPages(entries)) {
      if (index.has(number)) {
        throw new Error(`דף ${number} משויך פעמיים: ${index.get(number)} וגם ${nodeId}`);
      }
      index.set(number, nodeId);
    }
  }
  return index;
}

/** עובר על העץ לעומק ומחזיר כל צומת יחד עם שרשרת האבות שלו. */
export function walkCurriculum(nodes = CURRICULUM, ancestors = []) {
  const out = [];
  for (const node of nodes) {
    const path = [...ancestors, node];
    out.push({ node, ancestors, path });
    if (node.children?.length) out.push(...walkCurriculum(node.children, path));
  }
  return out;
}
