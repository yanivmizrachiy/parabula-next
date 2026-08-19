import {
  AnswerLine,
  Blank,
  CalculationResponse,
  Checkbox,
  FinalAnswer,
  Frac,
  PageLayout,
  QSep,
  Question,
  RatioAnswer,
  SubQuestion,
  WorkArea,
  WorksheetTable,
} from '../pages/PageLayout';

const CH = 'פרק 1 – יסודות היחס';

function FlowerPot() {
  const flowers = [
    { x: 35, y: 24, fill: '#1e40af' },
    { x: 70, y: 18, fill: '#1e40af' },
    { x: 105, y: 24, fill: '#1e40af' },
    { x: 140, y: 18, fill: '#1e40af' },
    { x: 175, y: 24, fill: '#1e40af' },
    { x: 210, y: 18, fill: '#1e40af' },
    { x: 55, y: 60, fill: '#b91c1c' },
    { x: 100, y: 56, fill: '#b91c1c' },
    { x: 150, y: 58, fill: '#b91c1c' },
    { x: 195, y: 56, fill: '#b91c1c' },
  ];
  return (
    <div className="svg-center svg-center--tight">
      <svg viewBox="0 0 250 115" width="310" height="120" role="img" aria-label="עציץ ובו ארבעה פרחים אדומים ושישה פרחים כחולים">
        {flowers.map((flower, index) => (
          <g key={index}>
            <line x1={flower.x} y1={flower.y + 10} x2={125} y2={96} stroke="#4b5563" strokeWidth="1" />
            <circle cx={flower.x} cy={flower.y} r="10" fill={flower.fill} stroke="#172554" strokeWidth="1" />
            <circle cx={flower.x} cy={flower.y} r="3" fill="#fff" />
          </g>
        ))}
        <path d="M70 82 H180 L165 108 H85 Z" fill="#eef2ff" stroke="#172554" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export function RatioPage02() {
  return (
    <PageLayout pageNumber={2} chapter={CH}>
      <Question>
        <p>בעציץ שלפניכם יש <strong>4 פרחים אדומים</strong> ו־<strong>6 פרחים כחולים</strong>. סמנו את כל ההיגדים המתאימים.</p>
        <FlowerPot />
        <div className="checkbox-list">
          <span><Checkbox /> על כל 2 פרחים אדומים יש 3 פרחים כחולים.</span>
          <span><Checkbox /> על כל 3 פרחים אדומים יש 2 פרחים כחולים.</span>
          <span><Checkbox /> היחס בין מספר הפרחים האדומים למספר הפרחים הכחולים הוא 4 : 6.</span>
          <span><Checkbox /> <Frac num={4} den={10} /> מהפרחים בעציץ הם אדומים.</span>
          <span><Checkbox /> <Frac num={4} den={6} /> מכל הפרחים בעציץ הם אדומים.</span>
        </div>
      </Question>

      <QSep />

      <Question>
        <p className="text-center"><strong>היחס בין מספר הבנים למספר הבנות בכיתה ח׳2 הוא 5 : 3.</strong></p>
        <p>סמנו ליד כל היגד אם הוא נכון, לא נכון או שאי־אפשר לקבוע אם הוא נכון.</p>
      </Question>
      <WorksheetTable
        className="wt-ltr"
        headers={['אי־אפשר לקבוע', 'לא נכון', 'נכון', 'היגד', '']}
        rows={[
          [<Checkbox />, <Checkbox />, <Checkbox />, 'על כל 5 בנים יש 3 בנות.', 'א.'],
          [<Checkbox />, <Checkbox />, <Checkbox />, 'מספר הבנים הוא כפולה של 5.', 'ב.'],
          [<Checkbox />, <Checkbox />, <Checkbox />, 'מספר הבנות הוא כפולה של 3.', 'ג.'],
          [<Checkbox />, <Checkbox />, <Checkbox />, 'מספר התלמידים הכולל הוא כפולה של 8.', 'ד.'],
          [<Checkbox />, <Checkbox />, <Checkbox />, 'מספר הבנים גדול ממספר הבנות.', 'ה.'],
          [<Checkbox />, <Checkbox />, <Checkbox />, 'בכיתה יש בדיוק 32 תלמידים.', 'ו.'],
          [<Checkbox />, <Checkbox />, <Checkbox />, <><Frac num={3} den={8} /> מהתלמידים הן בנות.</>, 'ז.'],
          [<Checkbox />, <Checkbox />, <Checkbox />, 'מספר הבנות גדול פי 2 ממספר הבנים.', 'ח.'],
        ]}
      />
    </PageLayout>
  );
}

export function RatioPage04() {
  return (
    <PageLayout pageNumber={4} chapter={CH}>
      <Question>
        <p>בין אורי ודן חילקו 56 גולות ביחס של 5 : 2. ידוע שאורי קיבל את החלק הגדול. אילו היגדים מתאימים?</p>
        <SubQuestion label="א."><p>אורי קיבל <Frac num={5} den={7} /> מהגולות ודן קיבל <Frac num={2} den={7} /> מהגולות.</p></SubQuestion>
        <SubQuestion label="ב."><p>מכל 7 גולות קיבל אורי 5 גולות ודן 2 גולות.</p></SubQuestion>
        <SubQuestion label="ג."><p>אורי קיבל 40 גולות ודן קיבל 16 גולות.</p></SubQuestion>
        <SubQuestion label="ד."><p>היחס בין מספר הגולות של אורי למספר הגולות של דן הוא גם 10 : 4.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>היחס בין מספר הכדורים הכחולים למספר הכדורים הלבנים הוא 10 : 3.</p>
        <p><strong>השלימו:</strong> על כל <Blank /> כדורים כחולים יש <Blank /> כדורים לבנים.</p>
        <p>אם יש <strong>20 כדורים כחולים</strong>, יש <Blank /> כדורים לבנים.</p>
      </Question>

      <QSep />

      <Question>
        <p>היחס בין מספר כוסות התרכיז למספר כוסות המים הוא 3 : 2. יש 12 כוסות מים.</p>
        <p>כמה כוסות תרכיז יש במיכל?</p>
        <AnswerLine />
      </Question>

      <QSep />

      <Question>
        <p>לצביעת חדרים השתמשו בצבע ירוק ובצבע לבן. לכל 7 פחים ירוקים הוסיפו 3 פחים לבנים.</p>
        <p>אם השתמשו ב־21 פחים ירוקים, בכמה פחים לבנים השתמשו?</p>
      </Question>

      <QSep />

      <Question>
        <p>היחס בין מספר התפוחים הירוקים למספר התפוחים האדומים הוא 7 : 3. השלימו כך שהיחס יישמר.</p>
        <div className="ratio-items row-wrap">
          <span>א. 28 : <Blank /></span>
          <span>ב. 35 : <Blank /></span>
          <span>ג. <Blank /> : 9</span>
          <span>ד. <Blank /> : 6</span>
        </div>
      </Question>

      <QSep />

      <Question>
        <p>בקנקני שתייה היחס בין מספר כוסות התרכיז למספר כוסות המים הוא 7 : 2.</p>
        <p>השתמשו ב־35 כוסות תרכיז. כמה כוסות מים הוסיפו, וכמה כוסות משקה הכינו בסך הכול?</p>
        <div className="calculation-response">
          <WorkArea lines={3} />
          <FinalAnswer label="כוסות מים:" unit="כוסות" />
          <FinalAnswer label="סך הכול:" unit="כוסות" />
        </div>
      </Question>
    </PageLayout>
  );
}

export function RatioPage05() {
  return (
    <PageLayout pageNumber={5} chapter={CH}>
      <Question>
        <SubQuestion label="א."><p>היחס בין גיל האב לגיל הבן במשפחת תמיר הוא 6 : 1. האב בן 42. בן כמה הבן?</p></SubQuestion>
        <SubQuestion label="ב."><p>במשפחת סביון מתקיים אותו יחס. יונתן בן 6. בן כמה אביו?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>היחס בין מספר בקבוקי השתייה המוגזת למספר הבקבוקים הכולל הוא 6 : 11.</p>
        <p>הוזמנו 18 בקבוקי שתייה מוגזת. כמה בקבוקים הוזמנו בסך הכול?</p>
      </Question>

      <QSep />

      <Question>
        <p>היחס בין מספר התלמידים מ״דקלים״ למספר התלמידים מ״ברושים״ בכיתה של אורי הוא 2 : 3.</p>
        <p>באיזו כיתה לומד אורי?</p>
        <div className="options-grid-2col gap-sm">
          <span>ז׳1: 18 מדקלים ו־15 מברושים</span>
          <span>ז׳2: 18 מדקלים ו־27 מברושים</span>
          <span>ז׳3: 18 מדקלים ו־18 מברושים</span>
          <span>ז׳4: 12 מדקלים ו־12 מברושים</span>
        </div>
      </Question>

      <QSep />

      <Question>
        <p>היחס בין מספר הבנות למספר הבנים בכיתה הוא 4 : 3.</p>
        <SubQuestion label="א."><p>היחס בין מספר הבנות למספר תלמידי הכיתה הוא <Blank />.</p></SubQuestion>
        <SubQuestion label="ב."><p>היחס בין מספר תלמידי הכיתה למספר הבנים הוא <Blank />.</p></SubQuestion>
        <SubQuestion label="ג."><p>אם יש 12 בנות, יש <Blank /> בנים.</p></SubQuestion>
        <SubQuestion label="ד."><p>אם יש 12 בנים, יש בסך הכול <Blank /> תלמידים.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בקייטנה 63 משתתפים. היחס בין מספר הבנים למספר הבנות הוא 2 : 1. הקיפו את ההיגדים הנכונים.</p>
        <SubQuestion label="א."><p>בקייטנה יש יותר בנים מבנות.</p></SubQuestion>
        <SubQuestion label="ב."><p>בקייטנה יש 42 בנים.</p></SubQuestion>
        <SubQuestion label="ג."><p>מספר הבנים גדול ממספר הבנות ב־21.</p></SubQuestion>
        <SubQuestion label="ד."><p>היחס בין מספר המשתתפים הכולל למספר הבנים הוא 3 : 2.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בתמיסת דשן היחס בין כמות החנקן לשאר החומרים הוא 13 : 4.</p>
        <p>כמה גרם חנקן יש בבקבוק המכיל 1,360 גרם תמיסה?</p>
        <CalculationResponse lines={3} unit="גרם" />
      </Question>
    </PageLayout>
  );
}

export function RatioPage06() {
  return (
    <PageLayout pageNumber={6} chapter={CH}>
      <Question>
        <p>בכיתה ח׳1 היחס בין מספר הבנים למספר הבנות הוא 4 : 3.</p>
        <SubQuestion label="א."><p>אם מספר הבנות הוא 15, מה מספר הבנים?</p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין מספר הבנים לכלל התלמידים?</p></SubQuestion>
        <SubQuestion label="ג."><p>האם ייתכן שבכיתה אחרת בעלת אותו יחס יש 14 בנות? הסבירו.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בכד א׳ היחס בין לבנים לאדומים הוא 3 : 1. בכד ב׳ היחס בין לבנים לאדומים הוא 2 : 3.</p>
        <SubQuestion label="א."><p>האם ייתכן שבכד א׳ יש 7 כדורים לבנים? הסבירו.</p></SubQuestion>
        <SubQuestion label="ב."><p>האם ייתכן שבכד ב׳ יש 8 כדורים לבנים? הסבירו.</p></SubQuestion>
        <SubQuestion label="ג."><p>ידוע שבכל כד יש 12 כדורים אדומים. חשבו את מספר הכדורים הלבנים בכל כד.</p></SubQuestion>
        <SubQuestion label="ד."><p>מהו היחס בין מספר הכדורים הכולל בכד א׳ למספר הכדורים הכולל בכד ב׳?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>דן נבחן ב־33 מבחנים. היחס בין מספר ההצלחות למספר הכישלונות שלו הוא 10 : 1.</p>
        <SubQuestion label="א."><p>בכמה מבחנים הצליח דן ובכמה נכשל?</p></SubQuestion>
        <SubQuestion label="ב."><p>רונן נבחן ב־32 מבחנים. היחס בין מספר ההצלחות למספר הכישלונות שלו הוא 7 : 1. למי היו יותר כישלונות ובכמה?</p></SubQuestion>
      </Question>
    </PageLayout>
  );
}

function PenCases() {
  return (
    <div className="svg-center svg-center--tight">
      <svg viewBox="0 0 340 104" width="380" height="116" role="img" aria-label="שני קלמרים ביחס שבע לשתיים: קלמר א׳ 7 עטים, קלמר ב׳ 2 עטים">
        <rect x="18" y="14" width="196" height="48" rx="14" fill="#eef2ff" stroke="#172554" strokeWidth="1.5" />
        <rect x="238" y="14" width="84" height="48" rx="14" fill="#f8fafc" stroke="#172554" strokeWidth="1.5" />
        <text x="116" y="86" textAnchor="middle">קלמר א׳ — 7 עטים</text>
        <text x="280" y="86" textAnchor="middle">קלמר ב׳ — 2 עטים</text>
      </svg>
    </div>
  );
}

export function RatioPage07() {
  return (
    <PageLayout pageNumber={7} chapter={CH}>
      <Question>
        <p>בסרטוט יש 4 מלבנים מקווקווים ו־3 מלבנים שאינם מקווקווים. מהו היחס בין מספר המלבנים המקווקווים למספר המלבנים האחרים?</p>
        <div className="svg-center svg-center--tight">
          <svg viewBox="0 0 360 52" width="330" height="48" role="img" aria-label="ארבעה מלבנים מקווקווים ושלושה מלבנים במסגרת מלאה" shapeRendering="geometricPrecision">
            {[0, 1, 2, 3].map((i) => (
              <rect key={`d${i}`} x={12 + i * 46} y="11" width="38" height="30" rx="2" fill="#eef2ff" stroke="#172554" strokeWidth="1.6" strokeDasharray="5 3" />
            ))}
            {[0, 1, 2].map((i) => (
              <rect key={`s${i}`} x={12 + (4 + i) * 46} y="11" width="38" height="30" rx="2" fill="#fff" stroke="#172554" strokeWidth="1.8" />
            ))}
          </svg>
        </div>
        <RatioAnswer label="היחס:" />
      </Question>

      <QSep />

      <Question>
        <p>במחרוזת יש 6 חרוזים שחורים ו־4 חרוזים לבנים.</p>
        <SubQuestion label="א."><p>מהו היחס בין מספר החרוזים השחורים למספר החרוזים הלבנים?</p></SubQuestion>
        <SubQuestion label="ב.">
          <p>ציירו מחרוזת נוספת שבה אותו יחס, ובה לפחות 15 חרוזים.</p>
          <div className="drawing-box min-h-60"><p className="drawing-label">המחרוזת שלי:</p></div>
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בזר פרחים יש 12 פרחים אדומים ו־6 פרחים לבנים.</p>
        <SubQuestion label="א."><p>מהו היחס בין מספר הפרחים הלבנים למספר הפרחים האדומים?</p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין מספר הפרחים האדומים למספר הפרחים הכולל?</p></SubQuestion>
        <SubQuestion label="ג."><p>מהו היחס בין מספר הפרחים הלבנים למספר הפרחים הכולל?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>היחס בין מספר העטים בקלמר א׳ למספר העטים בקלמר ב׳ הוא 7 : 2.</p>
        <PenCases />
        <SubQuestion label="א."><p>אם בקלמר ב׳ יש 6 עטים, כמה עטים יש בקלמר א׳?</p></SubQuestion>
        <SubQuestion label="ב."><p>אם בקלמר א׳ יש 28 עטים, כמה עטים יש בקלמר ב׳?</p></SubQuestion>
        <SubQuestion label="ג."><p>בשני הקלמרים יחד יש 36 עטים. כמה עטים יש בכל קלמר?</p></SubQuestion>
      </Question>
    </PageLayout>
  );
}
