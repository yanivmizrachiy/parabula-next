// עמודים 37–38 — העמקות שהועברו מעמודים צפופים במקום למחוק תוכן.

import { createGrid } from '../coordinate-svg.mjs';
import { task, subs, choices, lines, expr, table, figure, cols, pt, ltr } from '../render.mjs';
import enrichment from './unit-03-enrichment.mjs';
import page36 from './unit-03-page36.mjs';

const UNIT = 'יחידה 3 — שטחי משולשים במערכת הצירים';
const SHORT = '<span class="wline wline-short"></span>';

function comparisonGrid() {
  const g = createGrid({ xMin: -11, xMax: 11, yMin: -10, yMax: 10, unit: 9 }).grid().axes({ labelEvery: 2 });
  g.polygon([[2, 2], [10, 2], [2, 8]]);
  g.point(2, 2, 'A', { dx: -5, dy: 11 });
  g.point(10, 2, 'B', { dx: 5, dy: 11 });
  g.point(2, 8, 'C', { dx: -5, dy: -6 });
  g.polygon([[-10, -8], [-2, -8], [-10, -2]], { cls: 'cg-poly cg-dashed', fill: false });
  g.point(-10, -8, 'D', { dx: -5, dy: 11 });
  g.point(-2, -8, 'E', { dx: 5, dy: 11 });
  g.point(-10, -2, 'F', { dx: -5, dy: -6 });
  return g;
}

function translationGrid() {
  const g = createGrid({ xMin: -8, xMax: 12, yMin: -7, yMax: 10, unit: 9 }).grid().axes({ labelEvery: 2 });
  g.polygon([[-4, 2], [6, 2], [-4, 8]]);
  g.point(-4, 2, 'A', { dx: -5, dy: 11 });
  g.point(6, 2, 'B', { dx: 5, dy: 11 });
  g.point(-4, 8, 'C', { dx: -5, dy: -6 });
  g.polygon([[1, -3], [11, -3], [1, 3]], { cls: 'cg-poly cg-dashed', fill: false });
  g.point(1, -3, "A'", { dx: -5, dy: 11 });
  g.point(11, -3, "B'", { dx: 5, dy: 11 });
  g.point(1, 3, "C'", { dx: -5, dy: -6 });
  return g;
}

const page37 = {
  n: 37,
  unit: UNIT,
  title: 'בניית משולשים בעלי שטח נתון',
  blocks: [
    enrichment[33][1],
    enrichment[34][1],
    cols(
      task('השוו בין שני המשולשים המשורטטים:',
        table(['המשולש', 'בסיס', 'גובה', 'שטח', 'רביעים'], [
          [ltr('ABC')],
          [ltr('DEF')]
        ]),
        subs([
          `האם הם חופפים? ${SHORT}`,
          `האם מיקומם משנה את שטחם? ${SHORT}`
        ]),
        lines(2, { label: 'כתבו מסקנה:' })
      ),
      figure(comparisonGrid(), 'אותן מידות במיקומים שונים')
    )
  ]
};

const page38 = {
  n: 38,
  unit: UNIT,
  title: 'הזזה, חציית צירים ושימור שטח',
  blocks: [
    page36.blocks[3],
    cols(
      task(`המשולש ${pt('A', -4, 2)}, ${pt('B', 6, 2)}, ${pt('C', -4, 8)} הוזז חמש יחידות ימינה וחמש יחידות למטה:`,
        table(['קודקוד', 'X חדש', 'Y חדש'], [[ltr("A'")], [ltr("B'")], [ltr("C'")]]),
        expr(['_', '×', '_', '÷', '2', '=', '_'], { label: 'השטח לאחר ההזזה:' }),
        subs([
          `איזה ציר המשולש החדש חוצה? ${SHORT}`,
          `איזה ציר אינו נחצה? ${SHORT}`
        ])
      ),
      figure(translationGrid(), 'לפני ההזזה ואחריה')
    ),
    task('מבדק קצר — סמנו נכון או לא נכון והוסיפו תיקון לטענה שגויה:',
      table(['הטענה', 'נכון / לא נכון', 'תיקון או נימוק'], [
        ['הזזה משנה את שטח המשולש.'],
        ['הזזה יכולה לשנות את הצירים שהמשולש חוצה.'],
        ['אם כל השיעורים השתנו, גם אורכי הניצבים חייבים להשתנות.'],
        ['משולשים חופפים יכולים להימצא ברביעים שונים.']
      ])
    ),
    task('כתבו הוראת הזזה אחרת שתעביר את המשולש כולו לרביע הראשון:',
      lines(2, { label: 'הוראת ההזזה:' }),
      table(['קודקוד', 'X לאחר ההזזה', 'Y לאחר ההזזה'], [['A'], ['B'], ['C']]),
      lines(1, { label: 'בדיקת השטח:' })
    )
  ]
};

export default [page37, page38];
