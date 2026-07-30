/**
 * workbook-data.mjs — מקור התוכן של "מערכת משוואות בשני נעלמים".
 *
 * כל בלוק פדגוגי הוא רשימת מערכות (LaTeX של תוכן ה-cases, המפריד בין
 * המשוואות הוא "\\\\"). כל מערכת נפתרת ומאומתת בזמן הבנייה
 * (scripts/generate-two-variable-systems.mjs). הפריסה נגזרת מכמות הכתיבה
 * הנדרשת (CLAUDE.md §4.6): 'light' = 6 בעמוד בשני טורים; ככל שצריך לכתוב
 * יותר — פחות תרגילים בעמוד.
 *
 * layout: 'light' → 6/עמוד, 2 טורים · 'medium' → 4/עמוד · 'wide' → 3/עמוד
 *         · 'heavy' → 2/עמוד. instruction = ההנחיה שהתלמיד רואה.
 */

export const TOPIC = 'מערכת משוואות בשני נעלמים';
export const SUBTITLE = 'פתרו ע"י הצבה';

const S = (top, bottom) => `\\begin{cases} ${top} \\\\ ${bottom} \\end{cases}`;

export const SECTIONS = [
  {
    key: 'given-value',
    instruction: 'פתרו ע"י הצבה. נעלם אחד כבר נתון — הציבו אותו והמשיכו.',
    layout: 'light',
    systems: [
      S('x = 3', 'x + y = 8'),
      S('y = 4', '2x - y = 6'),
      S('x - y = 5', 'y = 2'),
      S('3x + y = 14', 'x = 4'),
      S('x + 2y = 12', 'y = 3'),
      S('5x - y = 9', 'x = 2'),
      S('y = 5', 'x + 3y = 18'),
      S('2x + y = 7', 'x = 1'),
      S('x = 6', 'x - 2y = 2'),
      S('4x - y = 15', 'y = 1'),
      S('y = 0', '3x + 2y = 12'),
      S('x + y = 9', 'x = 7'),
    ],
  },
  {
    key: 'isolated-expression',
    instruction: 'פתרו ע"י הצבה. נעלם אחד מבודד — הציבו את הביטוי במשוואה השנייה.',
    layout: 'light',
    systems: [
      S('y = x + 1', '2x + y = 10'),
      S('x = y - 2', 'x + 3y = 14'),
      S('y = 2x', 'x + y = 9'),
      S('x = 3y', 'x - y = 8'),
      S('y = x - 3', '2x - y = 11'),
      S('x = 2y + 1', '3x + y = 17'),
      S('y = x + 4', 'x + 2y = 20'),
      S('x = y + 5', '2x - 3y = 4'),
      S('y = 4x - 1', 'x + y = 9'),
      S('x = 5 - y', '3x + y = 13'),
      S('y = 2x - 3', '4x - y = 11'),
      S('x = 2y', '5x - 3y = 14'),
    ],
  },
  {
    key: 'isolate-first',
    instruction: 'פתרו ע"י הצבה. בודדו תחילה נעלם אחד מאחת המשוואות.',
    layout: 'medium',
    systems: [
      S('x + 3y = 7', '2x + y = 4'),
      S('2x + y = 10', 'x - y = 2'),
      S('x + y = 15', '3x - 2y = 5'),
      S('x - y = 1', '2x + 3y = 22'),
      S('3x + y = 15', 'x + 2y = 10'),
      S('x + 4y = 14', '2x - y = 1'),
      S('2x - y = 4', 'x + 3y = 16'),
      S('x + y = 8', '5x - 2y = 12'),
    ],
  },
  {
    key: 'brackets',
    instruction: 'פתרו ע"י הצבה. פתחו סוגריים וסדרו כל משוואה לפני ההצבה.',
    layout: 'wide',
    systems: [
      S('3(x - 2y) = 4(y + 2)', '16 = 3x - 2y'),
      S('2(y + 3) - (2x - 6) = -10', '3(y - 2x) + 42 = 8x + 3y'),
      S('2(2x - 1) + 3(y + 5) = 24', 'x - 4y = 17'),
      S('3(x + 8) + 5(3y - 5) = 90 - x', '7(x - 1) - 11 - y = -(10 - 3y)'),
      S('13 + 5y = 7 + 4x', '5 - x = 3y - 5'),
      S('5(4x + 6) - x = 2 - (3y + 1)', '4(8 - x) + 3(2y + 4) = 100 - 10y'),
    ],
  },
  {
    key: 'fractions',
    instruction: 'פתרו ע"י הצבה. הכפילו במכנה המשותף וסדרו לפני ההצבה.',
    layout: 'heavy',
    systems: [
      S('\\frac{x}{7} + \\frac{y}{2} = 2', 'x + 2y = 11'),
      S('\\frac{x - 3}{2} + \\frac{y}{4} = -3', '\\frac{y - 2}{3} + x = -5'),
      S('\\frac{x}{2} - \\frac{y}{3} = \\frac{5}{6}', '\\frac{x}{4} + \\frac{y}{2} = \\frac{7}{4}'),
      S('\\frac{y - x}{4} = \\frac{y - 1}{3}', '\\frac{y - x}{5} - y = x + 4'),
    ],
  },
];
