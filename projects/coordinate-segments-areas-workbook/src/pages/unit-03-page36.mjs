// עמוד 36 — המשך חכם לעמוד 35 במקום שבירת PDF מקרית.

import { createGrid } from '../coordinate-svg.mjs';
import { task, subs, choices, lines, expr, table, figure, cols, pt, ltr } from '../render.mjs';
import enrichment from './unit-03-enrichment.mjs';

const UNIT = 'יחידה 3 — שטחי משולשים במערכת הצירים';
const SHORT = '<span class="wline wline-short"></span>';

function shiftGrid() {
  const g = createGrid({ xMin: -7, xMax: 12, yMin: -4, yMax: 11, unit: 10 }).grid().axes();
  g.polygon([[-5, 3], [7, 3], [-5, -2]], { cls: 'cg-poly cg-dashed', fill: false });
  g.point(-5, 3, 'A', { dx: -5, dy: -6 });
  g.point(7, 3, 'B', { dx: 5, dy: -6 });
  g.point(-5, -2, 'C', { dx: -5, dy: 11 });
  g.polygon([[-1, 6], [11, 6], [-1, 1]]);
  g.point(-1, 6, "A'", { dx: -5, dy: -6 });
  g.point(11, 6, "B'", { dx: 5, dy: -6 });
  g.point(-1, 1, "C'", { dx: -5, dy: 11 });
  return g;
}

const page36 = {
  n: 36,
  unit: UNIT,
  title: 'שימור שטח ושינוי תנאי חצייה',
  blocks: [
    enrichment[35][1],
    cols(
      task(`הזיזו את המשולש ${pt('A', -5, 3)}, ${pt('B', 7, 3)}, ${pt('C', -5, -2)} ארבע יחידות ימינה ושלוש יחידות למעלה:`,
        table(['קודקוד', 'X חדש', 'Y חדש'], [[ltr("A'")], [ltr("B'")], [ltr("C'")]]),
        expr(['_', '×', '_', '÷', '2', '=', '_'], { label: 'שטח לאחר ההזזה:' }),
        subs([
          `האם אורכי הניצבים השתנו? ${SHORT}`,
          `האם חציית הצירים השתנתה? ${SHORT}`
        ])
      ),
      figure(shiftGrid(), 'המשולש המקורי והמשולש לאחר ההזזה')
    ),
    task('סמנו את כל הגדלים שנשמרים בכל הזזה:',
      choices([
        'אורכי הצלעות',
        'שטח המשולש',
        'מיקום ביחס לצירים',
        'שיעורי הקודקודים',
        'הזווית הישרה',
        'הקבלה והמאונכות לצירים'
      ]),
      lines(3, { label: 'הסבירו מדוע שטח יכול להישמר אף שכל השיעורים השתנו:' })
    ),
    task('חברו כלל מסכם משלכם:',
      lines(2, { label: 'בהזזה משתנה...' }),
      lines(2, { label: 'בהזזה נשמר...' })
    )
  ]
};

export default page36;
