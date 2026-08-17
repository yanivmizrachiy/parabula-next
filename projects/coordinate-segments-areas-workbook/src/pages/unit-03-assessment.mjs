// עמוד 46 — מבדק משולשים מסכם.
// משימות שהועברו מעמודים צפופים נוסחו מחדש באופן עצמאי ומלא.

import { createGrid } from '../coordinate-svg.mjs';
import { task, subs, choices, lines, expr, exprPoint, table, figure, cols, pt, ltr } from '../render.mjs';

const UNIT = 'יחידה 3 — שטחי משולשים במערכת הצירים';
const SHORT = '<span class="wline wline-short"></span>';

function assessmentGrid() {
  const g = createGrid({ xMin: -3, xMax: 11, yMin: -3, yMax: 10, unit: 12 }).grid().axes();
  g.polygon([[-2, 1], [8, 1], [3, 8]]);
  g.point(-2, 1, 'A', { dx: -5, dy: 11 });
  g.point(8, 1, 'B', { dx: 5, dy: 11 });
  g.point(3, 8, 'C', { dx: 0, dy: -7 });
  g.point(3, 1, 'M', { dx: 0, dy: 12 });
  g.segment([3, 8], [3, 1], { dashed: true });
  return g;
}

const page46 = {
  n: 46,
  unit: UNIT,
  title: 'מבדק מסכם — שטחי משולשים',
  blocks: [
    cols(
      task(`נתונות ${pt('A', -2, 1)}, ${pt('B', 8, 1)}, ${pt('C', 3, 8)}:`,
        expr(['_', '−', '_', '=', '_'], { label: 'אורך AB:' }),
        expr(['_', '−', '_', '=', '_'], { label: 'הגובה אל AB:' }),
        expr(['_', '×', '_', '÷', '2', '=', '_'], { label: 'שטח ABC:' }),
        subs([
          `האם CM הוא גם גובה? ${SHORT}`,
          `האם M אמצע AB? ${SHORT}`
        ])
      ),
      figure(assessmentGrid(), 'משולש במערכת הצירים')
    ),
    task(`נתונות ${pt('P', 0, 0)} ו־${pt('Q', 10, 0)}. מצאו נקודה R נוספת כך ששטח PQR יהיה ${ltr('40')}:`,
      exprPoint('R ='),
      subs([
        `הגובה הדרוש: ${SHORT}`,
        `האם שיעור X של R יחיד? ${SHORT}`
      ]),
      lines(2, { label: 'בדיקת השטח והסבר:' })
    ),
    task('בחרו את כל הטענות הנכונות:',
      choices([
        'משולשים בעלי אותו בסיס ואותו גובה שווי שטח.',
        'תיכון חייב להיות מאונך לצלע.',
        'נקודה מחוץ למשולש יוצרת סכום שטחי משנה גדול משטח המשולש.',
        'הזזה שומרת על שטח המשולש.',
        'אותו בסיס בלבד מבטיח שטח שווה.'
      ]),
      lines(2, { label: 'בחרו טענה שגויה אחת ותקנו אותה:' })
    ),
    task('שאלה הפוכה — סמנו נקודה N על AB כך ש־AN:NB יהיה 2:3:',
      expr(['AN', ':', 'NB', '=', '2', ':', '3'], { label: 'היחס:' }),
      table(['הקטע', 'האורך', 'שטח המשולש שמעליו'], [[ltr('AN')], [ltr('NB')]]),
      lines(2, { label: 'הסבירו מדוע יחס השטחים שווה ליחס הבסיסים:' })
    )
  ]
};

export default page46;
