import {
  PageLayout,
  Question,
  SubQuestion,
  Frac,
  RatioAnswer,
  AnswerLine,
  WorkArea,
  CalculationResponse,
  MultipleChoice,
  Checkbox,
  QSep,
} from '../pages/PageLayout';
import '../../../curriculum-pages.css';

// ─────────────────────────────────────────────────────────────────────────────
// שאלות מתוך תוכנית הלימודים — התחום המספרי לכיתה ח׳, נושא "יחס, פרופורציה וקנה
// מידה" (משרד החינוך, numerical_7_8.pdf, עמ' 48–52, שאלות 1–15).
// כל שאלה הועתקה בנאמנות מן המקור. מרחב המענה נבנה לפי §4.6 (דרך + תשובה סופית).
// ─────────────────────────────────────────────────────────────────────────────

const CH = '8 · שאלות מתוך תוכנית הלימודים';
const TOPIC = 'שאלות מתוך תוכנית הלימודים';

// שורת חרוזים ריקים לצביעה (שאלה 1). הלומד צובע ומוחק את המיותרים.
function BeadRow({ count = 24 }: { count?: number }) {
  const r = 9;
  const gap = 24;
  const width = gap * count;
  return (
    <div className="svg-center curriculum-bead-row">
      <svg viewBox={`0 0 ${width} 24`} width="100%" height="26" role="img" aria-label="מחרוזת חרוזים ריקים לצביעה">
        {Array.from({ length: count }, (_, i) => (
          <circle key={i} cx={gap * i + gap / 2} cy={12} r={r} fill="#fff" stroke="#1f2a44" strokeWidth={1.4} />
        ))}
      </svg>
    </div>
  );
}

// מלבן + משולש שווה־שוקיים בצורת בית (שאלה 14). צלעות: משולש 2x, 2x, בסיס 3x; מלבן x, 3x.
function HouseFigure() {
  return (
    <div className="svg-center curriculum-figure">
      <svg viewBox="0 0 240 175" width="240" height="175" role="img" aria-label="מלבן ומשולש שווה־שוקיים, שוקיים 2x ובסיס 3x">
        {/* מלבן */}
        <rect x="30" y="95" width="180" height="60" fill="#fff" stroke="#1f2a44" strokeWidth={1.6} />
        {/* גג משולש שווה־שוקיים — שוקיים 2x מדויקות מול בסיס 3x */}
        <path d="M30 95 L120 15.6 L210 95" fill="#fff" stroke="#1f2a44" strokeWidth={1.6} strokeLinejoin="round" />
        {/* סימני שוויון שוקיים */}
        <line x1="70" y1="52" x2="78" y2="60" stroke="#1f2a44" strokeWidth={1.2} />
        <line x1="162" y1="60" x2="170" y2="52" stroke="#1f2a44" strokeWidth={1.2} />
        {/* תוויות מידה */}
        <text className="fig-label" x="58" y="52" textAnchor="middle">2x</text>
        <text className="fig-label" x="182" y="52" textAnchor="middle">2x</text>
        <text className="fig-label" x="220" y="128" textAnchor="start">x</text>
        <text className="fig-label" x="120" y="170" textAnchor="middle">3x</text>
      </svg>
    </div>
  );
}

// מסילה ישרה עם שלוש לולאות A, B, C ותמונות תלויות (שאלה 15). AB = 160 ס"מ, BC = 240 ס"מ.
function RailFigure() {
  const frame = (cx: number) => (
    <g>
      <line x1={cx} y1={30} x2={cx} y2={52} stroke="#1f2a44" strokeWidth={1.2} />
      <rect x={cx - 22} y={52} width={44} height={34} fill="#fff" stroke="#1f2a44" strokeWidth={1.4} />
      <rect x={cx - 15} y={59} width={30} height={20} fill="#fff" stroke="#8aa0c8" strokeWidth={1} />
    </g>
  );
  return (
    <div className="svg-center curriculum-figure">
      <svg viewBox="0 0 400 110" width="100%" height="120" role="img" aria-label="מסילה ישרה עם שלוש לולאות A B C">
        {/* מסילה */}
        <line x1="20" y1="30" x2="380" y2="30" stroke="#1f2a44" strokeWidth={2} />
        {/* לולאות */}
        {[
          { cx: 60, label: 'A' },
          { cx: 172, label: 'B' },
          { cx: 340, label: 'C' },
        ].map((p) => (
          <g key={p.label}>
            <circle cx={p.cx} cy={30} r={4} fill="#fff" stroke="#1f2a44" strokeWidth={1.4} />
            <text className="fig-label" x={p.cx} y={20} textAnchor="middle">{p.label}</text>
          </g>
        ))}
        {frame(60)}
        {frame(172)}
        {frame(340)}
        {/* תוויות מרחק — AB:BC = 160:240 = 2:3 (B ממוקם כך שהיחס מדויק) */}
        <text className="fig-label" x="116" y="16" textAnchor="middle">160 ס"מ</text>
        <text className="fig-label" x="256" y="16" textAnchor="middle">240 ס"מ</text>
      </svg>
    </div>
  );
}

// ── עמוד 1 — שאלות 1–2 ──
export function CurriculumPage01() {
  return (
    <PageLayout pageNumber={57} chapter={CH} topic={TOPIC} className="curriculum-page">
      <Question>
        <SubQuestion label="א.">
          <p>צבעו את המחרוזת הבאה בצבעים אדום וכחול, כך שהיחס בין מספר החרוזים האדומים לכחולים יהיה 2 : 3 (מחקו את החרוזים המיותרים).</p>
          <BeadRow count={24} />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>לאחר שהוצאתם החרוזים המיותרים, מהי ההסתברות לבחור באופן אקראי חרוז אדום?</p>
          <AnswerLine label="הסתברות:" />
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בשבט של הצופים יש 2 מדריכים לכל 10 חניכים.</p>
        <SubQuestion label="א."><p>מהו היחס בין מספר המדריכים לבין מספר החניכים?</p><RatioAnswer /></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין מספר החניכים לבין מספר המדריכים?</p><RatioAnswer /></SubQuestion>
        <SubQuestion label="ג."><p>בוחרים באקראי מישהו משבט הצופים. מה ההסתברות שנבחר חניך?</p><AnswerLine label="הסתברות:" /></SubQuestion>
      </Question>
    </PageLayout>
  );
}

// ── עמוד 2 — שאלות 3–4 ──
export function CurriculumPage02() {
  return (
    <PageLayout pageNumber={58} chapter={CH} topic={TOPIC} className="curriculum-page">
      <Question>
        <p>חילקו 18 כדורי משחק לשתי קבוצות של ילדים ביחס של 5 : 4. כל ילד קיבל כדור אחד. כמה כדורים קיבל כל ילד?</p>
        <CalculationResponse lines={3} />
      </Question>

      <QSep />

      <Question>
        <p>חילקו 56 גולות בין אורי ודן ביחס של 5 : 2. אילו מההיגדים הבאים מתאימים לבעיה? סמנו.</p>
        <div className="statement-list">
          <div className="statement-row"><Checkbox /><p>על כל 2 גולות שיש לאורי, יש לדן 5 גולות.</p></div>
          <div className="statement-row"><Checkbox /><p>לאורי <Frac num={2} den={5} /> מסך כל הגולות שיש לשניהם.</p></div>
          <div className="statement-row"><Checkbox /><p>אורי יקבל <Frac num={2} den={7} /> מהגולות, ודן יקבל <Frac num={5} den={7} /> מהגולות.</p></div>
          <div className="statement-row"><Checkbox /><p>מכל 7 גולות שמחולקות ביחס המבוקש, לאורי יש 2 גולות ולדן יש 5 גולות.</p></div>
          <div className="statement-row"><Checkbox /><p>מכל 7 גולות שמחולקות ביחס המבוקש, לדן יש 2 גולות ולאורי יש 5 גולות.</p></div>
          <div className="statement-row"><Checkbox /><p>היחס בין מספר הגולות של אורי לבין מספר הגולות של דן הוא 10 : 4.</p></div>
        </div>
      </Question>
    </PageLayout>
  );
}

// ── עמוד 3 — שאלות 5–6 ──
export function CurriculumPage03() {
  return (
    <PageLayout pageNumber={59} chapter={CH} topic={TOPIC} className="curriculum-page">
      <Question>
        <p>שותף אחד השקיע בעסקה 2,000 ש"ח וחברו השקיע 3,000 ש"ח. הוסכם שהרווח יחולק ביניהם לפי יחס ההשקעות. איך יחלקו ביניהם רווח של 1,200 ש"ח?</p>
        <CalculationResponse lines={4} />
      </Question>

      <QSep />

      <Question>
        <p>שלושה חברים יצאו לטיול, ובאחת ההפסקות התכוונו לאכול. האחד הוציא מתרמילו 4 כריכים, השני 6 כריכים אך השלישי, התברר, שכח את הכריכים בבית. הוחלט כי 10 הכריכים יחולקו שווה בשווה. כשסיימו לאכול, הוציא החבר השלישי 25 ₪ כדי לכסות את חלקו בהוצאות הארוחה.</p>
        <SubQuestion label="א."><p>מהו היחס בין כמויות הכריכים שהביאו שלושת החברים?</p><AnswerLine /></SubQuestion>
        <SubQuestion label="ב."><p>סוכם, שכספו של החבר השלישי יחולק בין שני החברים האחרים באותו יחס כמו יחס בין מספר הכריכים שקיבל מכל אחד מהם. באיזה יחס יחלקו ביניהם שני החברים את הכסף, ומהו הסכום שיקבל כל אחד מהם?</p><CalculationResponse lines={3} /></SubQuestion>
      </Question>
    </PageLayout>
  );
}

// ── עמוד 4 — שאלות 7–8 ──
export function CurriculumPage04() {
  return (
    <PageLayout pageNumber={60} chapter={CH} topic={TOPIC} className="curriculum-page">
      <Question>
        <p>ביום קיץ הגיעו לבית הספר יותר מ־65 תלמידים מכיתות ח. חלקם נעלו נעלי ספורט והיתר נעלו סנדלים. היחס בין מספר התלמידים שנעלו נעלי ספורט ובין מספר התלמידים שנעלו סנדלים היה 3 : 5.</p>
        <SubQuestion label="א."><p>הסבירו מדוע לא ייתכן שבאותו יום הגיעו לבית הספר 83 תלמידים מכיתות ח.</p><WorkArea lines={2} label="נימוק:" /></SubQuestion>
        <SubQuestion label="ב."><p>כתבו אפשרות אחת למספר התלמידים מכיתות ח שהגיעו באותו יום לבית הספר.</p><AnswerLine /></SubQuestion>
        <SubQuestion label="ג."><p>בהתייחס לאפשרות שרשמתם בסעיף הקודם, בוחרים תלמיד באופן אקראי. מהי ההסתברות שהתלמיד שנבחר נעל סנדלים? מהי ההסתברות שהתלמיד שנבחר נעל נעלי ספורט?</p><AnswerLine label="סנדלים:" /><AnswerLine label="נעלי ספורט:" /></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>היקף מלבן הוא 40 ס"מ. היחס בין צלעותיו הוא 3 : 5. מהם אורכי הצלעות של המלבן?</p>
        <CalculationResponse lines={3} unit={'ס"מ'} />
      </Question>
    </PageLayout>
  );
}

// ── עמוד 5 — שאלות 9, 10, 12 (קישוריות לגאומטריה) ──
export function CurriculumPage05() {
  return (
    <PageLayout pageNumber={61} chapter={CH} topic={TOPIC} className="curriculum-page">
      <Question>
        <p>היחס בין אורכי הניצבים במשולש ישר זווית הוא 3 : 5. מאריכים כל צלע פי 2. האם משתנה היחס בין אורכי הניצבים? אם לא — מדוע? אם כן, כתבו את היחס החדש.</p>
        <WorkArea lines={3} label="נימוק:" />
      </Question>

      <QSep />

      <Question>
        <p>אורכי הניצבים במשולש ישר זווית הם 6 ס"מ ו־8 ס"מ.</p>
        <SubQuestion label="א."><p>מהו היחס בין הניצבים?</p><RatioAnswer /></SubQuestion>
        <SubQuestion label="ב."><p>מאריכים כל ניצב ב־2 ס"מ. האם משתנה היחס בין אורכי הניצבים? אם לא — מדוע? אם כן, רשמו את היחס החדש.</p><WorkArea lines={2} label="נימוק:" /></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>נתון ריבוע שאורך צלעו b ס"מ. האריכו כל אחת מצלעות הריבוע פי 3. מה היחס בין שטח הריבוע החדש לבין שטח הריבוע המקורי?</p>
        <CalculationResponse lines={3} answerType="ratio" />
      </Question>
    </PageLayout>
  );
}

// ── עמוד 6 — שאלות 11, 13 ──
export function CurriculumPage06() {
  return (
    <PageLayout pageNumber={62} chapter={CH} topic={TOPIC} className="curriculum-page">
      <Question>
        <p>נתון מלבן שאורכו 3a בס"מ ורוחבו 2a בס"מ.</p>
        <SubQuestion label="א."><p>מה היחס בין רוחב המלבן לאורכו?</p><RatioAnswer /></SubQuestion>
        <SubQuestion label="ב."><p>הביעו בעזרת a את שטח המלבן.</p><AnswerLine /></SubQuestion>
        <SubQuestion label="ג."><p>הכפילו את רוחב המלבן פי 2, וכך נוצר מלבן חדש. מה היחס בין רוחב המלבן החדש לאורכו?</p><RatioAnswer /></SubQuestion>
        <SubQuestion label="ד."><p>מה היחס בין שטח המלבן החדש לשטח המלבן המקורי?</p><CalculationResponse lines={2} answerType="ratio" /></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>היחס בין שני הניצבים של משולש ישר זווית הוא 3 : 5. ידוע שהשטח של המשולש הוא 30 סמ"ר. חשבו את אורכו של הניצב הארוך מבין שני הניצבים.</p>
        <CalculationResponse lines={4} unit={'ס"מ'} />
      </Question>
    </PageLayout>
  );
}

// ── עמוד 7 — שאלות 14–15 (עם שרטוטים) ──
export function CurriculumPage07() {
  return (
    <PageLayout pageNumber={63} chapter={CH} topic={TOPIC} className="curriculum-page">
      <Question>
        <p>לפניכם מלבן ומשולש שווה שוקיים. x מייצג את אורך אחת מצלעות המלבן. היעזרו בנתונים שבסרטוט, וסמנו את היחס בין היקף המלבן להיקף המשולש.</p>
        <HouseFigure />
        <MultipleChoice
          options={[
            { label: 'א.', value: '8 : 7' },
            { label: 'ב.', value: '5 : 4' },
            { label: 'ג.', value: '1 : 2' },
            { label: 'ד.', value: '1 : 1' },
          ]}
        />
        <WorkArea lines={2}  />
      </Question>

      <QSep />

      <Question>
        <p>לפניכם שרטוט של מסילה ישרה לתליית תמונות. על המסילה תלויות שלוש לולאות המסומנות בנקודות A, B, C. המרחקים בין AB, BC ובין הלולאות נתונים בשרטוט.</p>
        <RailFigure />
        <SubQuestion label="א."><p>מהו היחס בין אורך AB לבין אורך BC? כתבו את תשובתכם כיחס מצומצם.</p><RatioAnswer /></SubQuestion>
        <SubQuestion label="ב.">
          <p>הזיזו את לולאה B ב־60 ס"מ על המסילה לכיוון לולאה A. מהו היחס בין אורך AB לבין אורך BC לאחר ההזזה?</p>
          <MultipleChoice
            options={[
              { label: 'i.', value: '1 : 2' },
              { label: 'ii.', value: '1 : 3' },
              { label: 'iii.', value: '1 : 4' },
              { label: 'iv.', value: '1 : 6' },
            ]}
          />
        </SubQuestion>
        <SubQuestion label="ג."><p>על־סמך הנתונים בשרטוט כתבו בכמה ס"מ צריך להזיז את לולאה B על המסילה ממקומה המקורי לכיוון לולאה C כדי שהיחס בין AB ובין BC יהיה 1 : 1.</p><CalculationResponse lines={3} unit={'ס"מ'} /></SubQuestion>
      </Question>
    </PageLayout>
  );
}
