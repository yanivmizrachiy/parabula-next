import { ReactNode } from 'react';
import {
  Blank,
  PageLayout,
  RatioAnswer,
} from '../pages/PageLayout';
import '../../../teacher-intro-pages.css';

const CH = 'פתיחה · יחס ישר';

function Dot({ color }: { color: 'black' | 'red' | 'blue' | 'green' | 'empty' }) {
  const className = color === 'empty' ? 'teacher-dot teacher-dot--empty' : `teacher-dot teacher-dot--${color}`;
  return <span className={className} aria-hidden="true" />;
}

function DotRow({ colors, repeat = 1 }: { colors: Array<'black' | 'red' | 'blue' | 'green' | 'empty'>; repeat?: number }) {
  const values = Array.from({ length: repeat }, () => colors).flat();
  return (
    <div className="teacher-dot-row" aria-label="מחרוזת עיגולים">
      {values.map((color, index) => <Dot key={index} color={color} />)}
    </div>
  );
}

function TeacherBox({ children, tone = 'note' }: { children: ReactNode; tone?: 'note' | 'answer' | 'summary' }) {
  return <div className={`teacher-box teacher-box--${tone}`}>{children}</div>;
}

function TeacherQuestion({ number, children, className = '' }: { number: number; children: ReactNode; className?: string }) {
  return (
    <section className={`teacher-question ${className}`.trim()}>
      <div className="teacher-question-number">{number}</div>
      <div className="teacher-question-body">{children}</div>
    </section>
  );
}

function TeacherTable({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <table className={`teacher-table ${className}`.trim()}><tbody>{children}</tbody></table>;
}

function Answer({ children }: { children: ReactNode }) {
  // Teacher ("יחס · למורה") pages show the worked example / answer for the teacher's reference.
  // Ratios/numbers (e.g. "1 : 2") must read left-to-right; without dir="ltr" the RTL algorithm
  // flips them (so "1 : 2" would wrongly show as "2 : 1"). Hebrew answers keep the natural RTL.
  const text = typeof children === 'string' ? children.trim() : '';
  const isNumeric = text.length > 0 && /^[\d\s:.,/·×+\-()=x]+$/i.test(text);
  return <span className="teacher-answer" dir={isNumeric ? 'ltr' : undefined}>{children}</span>;
}

function SmallBlank() {
  return <span className="teacher-small-blank" aria-hidden="true" />;
}

function Fraction({ num, den }: { num: ReactNode; den: ReactNode }) {
  return (
    <span className="teacher-fraction" dir="ltr">
      <span>{num}</span><span className="teacher-fraction-line" /><span>{den}</span>
    </span>
  );
}

function Vessel({ kind }: { kind: 'glass' | 'bottle' | 'pitcher' | 'jug' }) {
  return (
    <div className={`teacher-vessel teacher-vessel--${kind}`} aria-label={`כלי ${kind}`}>
      <span className="teacher-vessel-inner" />
    </div>
  );
}

function EqualRatioCard({ topLeft, bottomLeft }: { topLeft?: string; bottomLeft?: string }) {
  return (
    <div className="equal-ratio-card" dir="ltr">
      <div className="equal-ratio-top"><span>{topLeft ?? ''}</span><span /></div>
      <div className="equal-ratio-bottom"><span>{bottomLeft ?? ''}</span><span>100</span></div>
    </div>
  );
}

export function TeacherIntroPage01() {
  return (
    <PageLayout pageNumber={1} chapter={CH} topic="יחס" className="teacher-intro-page">
      <div className="teacher-doc-meta">
        <span>שנה״ל תשפ״ז</span>
      </div>
      <div className="teacher-guide-title">הנחיות למורה — ד״ר יחיאל תנעמי ואיילת קריספין:</div>
      <h2 className="teacher-orange-title">יחס - מדוע עכשיו?</h2>
      <TeacherBox tone="note">
        מהווה מושג מרכזי בהמשך הלימודים בכיתה ח׳ במגוון נושאים: קנה מידה, קטעים
        פרופורציוניים, דמיון משולשים, שימוש של קו ישר, פונקציה קווית מהצורה y = mx,
        אחוזים, שכיחות יחסית והסתברות.
      </TeacherBox>
      <a
        className="teacher-curriculum-link"
        href="https://meyda.education.gov.il/files/Pop/0files/matmatika/Chativat-Beynayim/curriculum/updating/numerical_7_8.pdf"
        target="_blank"
        rel="noreferrer"
      >
        קישור לת״ל
      </a>
      <p className="teacher-focus"><strong>נתמקד ב:</strong> יחס ישר: מהות, סוגי יחסים, יחסים שווים ופעולות מותרות.</p>

      <TeacherQuestion number={1}>
        <p>לפניכם מדבקות של עיגולים שחורים ואדומים מסודרות בשורה.</p>
        <DotRow colors={['black', 'red', 'red']} repeat={4} />
        <div className="teacher-qa">
          <p>כמה מדבקות של עיגולים שחורים? <Answer>4</Answer></p>
          <p>כמה מדבקות של עיגולים אדומים? <Answer>8</Answer></p>
          <p>כמה מדבקות יש בסך הכל? <Answer>12</Answer></p>
          <p>מה אפשר לומר על הקשר בין המדבקות השחורות לאדומות? <Answer>על כל שתי מדבקות אדומות יש אחת שחורה ולהיפך.</Answer></p>
        </div>
        <TeacherBox tone="answer">
          <strong>אפשרי לשאול:</strong> איזה חלק מהוות המדבקות האדומות מכלל המדבקות?
          <span dir="ltr"> 8/12 </span> - שמונה מתוך 12, כנ״ל לגבי השחורות.
          <br />
          <strong>שימו לב:</strong> עדיין המילה יחס לא נכנסה. התלמיד יכול להסביר את הקשר בין
          המדבקות, אחרי השיח על הקשר אפשר להחליף את המילה "קשר" ל"יחס".
        </TeacherBox>
      </TeacherQuestion>

      <TeacherQuestion number={2}>
        <p>לפניכם מדבקות של עיגולים שחורים ואדומים מסודרות בשורה.</p>
        <DotRow colors={['black', 'black', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'black', 'red', 'black']} />
        <p>כמה מדבקות של עיגולים שחורים? <Answer>4</Answer></p>
        <p>כמה מדבקות של עיגולים אדומים? <Answer>8</Answer></p>
        <p>כמה מדבקות יש בסך הכל?</p>
        <p>מה אפשר לומר על הקשר בין המדבקות השחורות לאדומות?</p>
        <TeacherBox tone="answer">המטרה: שהתלמיד יבין שקשר קיים גם כשהאיברים לא מסודרים כמו בתרגיל 1.</TeacherBox>
      </TeacherQuestion>

      <TeacherQuestion number={3}>
        <p>מה דומה ומה שונה בין שורת העיגולים בסעיף הראשון לבין הסעיף השני?</p>
        <TeacherBox tone="answer">
          בשורה הראשונה רואים את המחזוריות, בדיוק על כמה מדבקות שחורות יש אדומות, הקשר בולט;
          בשנייה לא - צריך לסכום את מספר המדבקות ואז לראות את הקשר.
        </TeacherBox>
      </TeacherQuestion>
    </PageLayout>
  );
}

export function TeacherIntroPage02() {
  const green = ['8', '15', '9', '7', '10', '3', '12', '5', '2'];
  const blue = ['16', '30', '18', '14', '20', '6', '24', '10', '4'];
  return (
    <PageLayout pageNumber={2} chapter={CH} topic="יחס" className="teacher-intro-page">
      <TeacherQuestion number={4}>
        <p>לפניכם מדבקות כחולות וירוקות:</p>
        <div className="teacher-two-color-dots"><Dot color="blue" /><Dot color="green" /><Dot color="blue" /></div>
        <p>א) מה היחס בין מספר המדבקות הירוקות לכחולות? <Answer>1 : 2</Answer></p>
        <p>ב) אם יש לי 3 מדבקות ירוקות כמה מדבקות כחולות תהיינה לי? <Answer>6</Answer></p>
        <p>ג) השלימו את הטבלה:</p>
        <div className="teacher-ratio-table-wrap">
          <div className="teacher-row-label teacher-row-label--green">מספר המדבקות הירוקות</div>
          <div className="teacher-number-row">{green.map((v, i) => <span key={i} style={{ color: '#15803d', fontWeight: 700 }}>{v}</span>)}</div>
          <div className="teacher-row-label teacher-row-label--blue">מספר המדבקות הכחולות</div>
          <div className="teacher-number-row">{blue.map((v, i) => <span key={i} style={{ color: "#1d4ed8", fontWeight: 700 }}>{v}</span>)}</div>
        </div>
        <p>ד) האם ייתכן מצב שיש לי:</p>
        <ol className="teacher-numbered">
          <li>2 מדבקות ירוקות, 4 מדבקות כחולות? <Answer>כן</Answer></li>
          <li>6 מדבקות ירוקות, 13 מדבקות כחולות? <Answer>לא</Answer></li>
          <li>40 מדבקות ירוקות, 20 מדבקות כחולות? <Answer>לא</Answer></li>
          <li>3.5 מדבקות ירוקות, 7 מדבקות כחולות? <Answer>כן</Answer></li>
        </ol>
      </TeacherQuestion>
    </PageLayout>
  );
}

export function TeacherIntroPage03() {
  const rows: Array<Array<'black' | 'red'>> = [
    ['black', 'red', 'red', 'black', 'red', 'red', 'black', 'red', 'red'],
    ['black', 'red', 'red', 'red', 'black', 'red', 'red', 'red', 'black', 'red', 'red', 'red'],
    ['black', 'black', 'red', 'red', 'black', 'black', 'red', 'red', 'red', 'black', 'black', 'red', 'red', 'red'],
    ['black', 'black', 'red', 'red', 'black', 'black', 'red', 'red', 'black', 'black', 'red'],
    ['black', 'black', 'red', 'red', 'red', 'red'],
  ];
  return (
    <PageLayout pageNumber={3} chapter={CH} topic="יחס" className="teacher-intro-page">
      <TeacherBox tone="summary">
        <h2>סיכום: <span>יחס</span></h2>
        <ul>
          <li><strong>יחס</strong> הוא מנה בין שני מספרים חיוביים.</li>
          <li>את היחס ניתן לייצג באמצעות מילים או בכתיב מתמטי.</li>
          <li>דוגמה לייצוג מילולי: היחס בין <span className="red-text">3</span> ל־<span className="blue-text">5</span>.</li>
          <li>יחס בכתיב מילולי כותבים וקוראים מימין לשמאל.</li>
          <li>דוגמה לייצוג בכתיב מתמטי: <span dir="ltr">3 : 5</span> או <Fraction num={3} den={5} />.</li>
          <li>יחס בכתיב מתמטי כותבים וקוראים משמאל לימין.</li>
          <li>כאשר מתרגמים יחס מייצוג מילולי לייצוג מתמטי, יש להקפיד על מקום האיברים.</li>
          <li>יחס הוא דרך להשוואה בין שני גדלים או כמויות.</li>
        </ul>
      </TeacherBox>

      <TeacherQuestion number={5}>
        <p>כתבו את היחס בין מספר העיגולים השחורים לאדומים במחרוזות הבאות:</p>
        <div className="teacher-necklace-table">
          {rows.map((colors, index) => (
            <div className="teacher-necklace-row" key={index}>
              <span className="teacher-letter">{String.fromCharCode(1488 + index)}</span>
              <DotRow colors={colors} />
              <span className="teacher-ratio-write" dir="ltr">● : 🔴 = <SmallBlank /> : <SmallBlank /></span>
            </div>
          ))}
          <div className="teacher-necklace-row">
            <span className="teacher-letter">ו</span>
            <p>שרטטו עיגולים כרצונכם כך שהיחס בין העיגולים השחורים לאדומים יהיה כמו בסעיף ב.</p>
            <span className="teacher-ratio-write" dir="ltr">● : 🔴 = <SmallBlank /> : <SmallBlank /></span>
          </div>
        </div>
      </TeacherQuestion>
    </PageLayout>
  );
}

export function TeacherIntroPage04() {
  return (
    <PageLayout pageNumber={4} chapter={CH} topic="יחס" className="teacher-intro-page">
      <TeacherQuestion number={6}>
        <p>צבעו את המחרוזת הבאה בצבעים אדום וכחול, כך שהיחס בין מספר החרוזים האדומים לכחולים יהיה <strong dir="ltr">2 : 3</strong> (מחקו את החרוזים המיותרים).</p>
        <DotRow colors={Array(22).fill('empty') as 'empty'[]} />
        <TeacherBox tone="answer">
          מומלץ לתת לתלמידים דף עם העיגולים/לוח מחיק/מדבקות כך שאפשרי להרים את הדפים בכיתה
          ולראות מגוון תשובות ולדבר עליהן.
        </TeacherBox>
      </TeacherQuestion>

      <TeacherQuestion number={7}>
        <p>צבעו את המחרוזת הבאה בשני צבעים לבחירתכם ביחס שאתם בוחרים.</p>
        <DotRow colors={Array(22).fill('empty') as 'empty'[]} />
        <p>כתבו את היחס בכתיב מתמטי: <span className="teacher-long-line" /></p>
        <TeacherBox tone="answer">
          מומלץ לתת לתלמידים דף עם העיגולים/לוח מחיק/מדבקות כך שאפשרי להרים את הדפים בכיתה
          ולראות מגוון תשובות ולדבר עליהן.
        </TeacherBox>
      </TeacherQuestion>

      <TeacherQuestion number={8}>
        <p>השלימו:</p>
        <div className="teacher-equation-grid" dir="ltr">
          <span>3 : <SmallBlank /> = 1 : 2</span>
          <span>2 : 5 = <SmallBlank /> : 20</span>
          <span>2 : 6 = 4 : <SmallBlank /></span>
          <span>2 : 3 = 6 : <SmallBlank /></span>
          <span>2 : 5 = 20 : <SmallBlank /></span>
          <span>3 : 12 = <SmallBlank /> : <SmallBlank /></span>
        </div>
      </TeacherQuestion>

      <TeacherQuestion number={9}>
        <p>כתבו כל יחס כמנה וכשבר:</p>
        <div className="teacher-two-col">
          <div><span>יחס של 2 ל־3</span><div className="teacher-big-ratio" dir="ltr">2 : 3 = <Fraction num={<SmallBlank />} den={<SmallBlank />} /></div></div>
          <div><span>יחס של 3 ל־7</span><div className="teacher-big-ratio" dir="ltr"><SmallBlank /> : <SmallBlank /> = <Fraction num={<SmallBlank />} den={<SmallBlank />} /></div></div>
        </div>
      </TeacherQuestion>

      <TeacherQuestion number={10}>
        <p>השלימו:</p>
        <div className="teacher-equation-grid teacher-equation-grid--3" dir="ltr">
          <span>1 : 2 = <Fraction num={1} den={<SmallBlank />} /></span>
          <span>3 : <SmallBlank /> = <Fraction num={3} den={5} /></span>
          <span>2 : 7 = <Fraction num={<SmallBlank />} den={7} /></span>
        </div>
      </TeacherQuestion>

    </PageLayout>
  );
}

export function TeacherIntroPage05() {
  const prompts = ['היחס בין 4 ל־7', 'היחס בין 7 ל־9', 'היחס בין 100 ל־25', 'היחס בין 200 ל־500', 'היחס בין 50 ל־250', 'היחס בין 0.5 ל־1'];
  return (
    <PageLayout pageNumber={5} chapter={CH} topic="יחס" className="teacher-intro-page">
      <TeacherQuestion number={11}>
        <p>השלימו:</p>
        <div className="teacher-equation-grid teacher-equation-grid--3 teacher-top-exercises" dir="ltr">
          <span>2 : 3 = <Fraction num={6} den={<SmallBlank />} /></span>
          <span><Fraction num={2} den={5} /> = <Fraction num={20} den={<SmallBlank />} /></span>
          <span><Fraction num={3} den={12} /> = <Fraction num={<SmallBlank />} den={4} /></span>
        </div>
      </TeacherQuestion>

      <TeacherQuestion number={12}>
        <p>כתבו את היחסים הבאים בכתיבה מתמטית: שני מספרים והסימן ":" ביניהם:</p>
        <div className="teacher-prompt-grid">
          {prompts.map((prompt, i) => (
            <div key={prompt}>
              <strong>{i === 0 ? 'דוגמה: ' : ''}{prompt}</strong>
              <div className="teacher-writing-cell">{i === 0 ? <span dir="ltr">4 : 7</span> : null}</div>
            </div>
          ))}
        </div>
      </TeacherQuestion>

      <TeacherQuestion number={13}>
        <p>כתבו במילים את כל אחד מהיחסים הבאים:</p>
        <div className="teacher-equation-grid teacher-equation-grid--3">
          <span dir="ltr">5 : 9 <Answer>היחס בין תשע לחמש</Answer></span>
          <span dir="ltr">4 : 7 <Answer>היחס בין שבע לארבע</Answer></span>
          <span dir="ltr">3 : 2 <Answer>היחס בין שתיים לשלוש</Answer></span>
        </div>
      </TeacherQuestion>

      <TeacherQuestion number={14}>
        <p>למה מתכוונים כשאומרים:</p>
        <TeacherTable>
          <tr><th>א</th><td>היחס בין מספר התלמידים למספר המורים בבית הספר הוא 25 ל־1.</td><td><Answer>על כל מורה אחד יש 25 תלמידים או על כל 25 תלמידים יש מורה אחד.</Answer></td></tr>
          <tr><th>ב</th><td>היחס בין מספר הרופאים למספר התושבים בישראל הוא: <span dir="ltr">10 : 3,000</span>.</td><td /></tr>
          <tr><th>ג</th><td>היחס בין מספר הפקחים למספר הרחובות בעיר תל אביב הוא <span dir="ltr">2 : 7</span>.</td><td /></tr>
        </TeacherTable>
      </TeacherQuestion>

      <TeacherQuestion number={15}>
        <p>מה היחס בין צלע הריבוע להיקף הריבוע?</p>
      </TeacherQuestion>

      <TeacherQuestion number={16}>
        <p>אימו של אלעד ביקשה ממנו שיקנה במכולת 5 ארטיקים משני צבעים, 3 ירוקים ו־2 כחולים.</p>
        <div className="teacher-popsicles" aria-label="שלושה ארטיקים ירוקים ושני ארטיקים כחולים">
          <span className="pop pop--green" /><span className="pop pop--blue" /><span className="pop pop--green" /><span className="pop pop--green" /><span className="pop pop--blue" />
        </div>
        <TeacherTable>
          <tr><th>א</th><td>מה היחס בין מספר הארטיקים הכחולים</td><td>לירוקים?</td></tr>
        </TeacherTable>
      </TeacherQuestion>
    </PageLayout>
  );
}

export function TeacherIntroPage06() {
  return (
    <PageLayout pageNumber={6} chapter={CH} topic="יחס" className="teacher-intro-page">
      <TeacherQuestion number={16}>
        <TeacherTable>
          <tr><th>ב</th><td>מה היחס בין מספר הארטיקים הירוקים לכחולים?</td><td /></tr>
          <tr><th>ג</th><td>מה היחס בין מספר הארטיקים הכחולים לכל הארטיקים?</td><td /></tr>
          <tr><th>ד</th><td>מה היחס בין מספר הארטיקים הירוקים לכל הארטיקים?</td><td /></tr>
          <tr><th>ה</th><td>איזה חלק מהארטיקים הם כחולים?</td><td /></tr>
        </TeacherTable>
        <p>השלימו:</p>
        <TeacherTable>
          <tr><th>א</th><td>יש יחסים המציגים את היחס בין חלק לחלק (סעיפים: ________)</td></tr>
          <tr><th>ב</th><td>יש יחסים המציגים את היחס בין חלק לשלם (סעיפים: ________)</td></tr>
        </TeacherTable>
        <TeacherBox tone="answer">הערה: ניתן לדלג על שאלה זו במידה ושזרתם שאלות דומות בתרגילים הקודמים.</TeacherBox>
      </TeacherQuestion>

      <TeacherQuestion number={17}>
        <p>היחס בין מספר החרוזים הורודים למספר החרוזים הסגולים במחרוזת הוא <span dir="ltr">1 : 3</span>. כתבו ליד כל היגד נכון/לא נכון.</p>
        <TeacherTable>
          <tr><th>א</th><td>ניתן לסדר את החרוזים בקבוצות של 4 חרוזים, כך שבכל קבוצה יש חרוז אחד ורוד.</td><td>נכון/לא נכון</td></tr>
          <tr><th>ב</th><td><Fraction num={1} den={3} /> מהחרוזים הם ורודים</td><td>נכון/לא נכון</td></tr>
          <tr><th>ג</th><td>היחס בין מספר החרוזים הורודים לסך כל החרוזים במחרוזת הוא <span dir="ltr">1 : 4</span></td><td>נכון/לא נכון</td></tr>
          <tr><th>ד</th><td><Fraction num={3} den={4} /> מהחרוזים הם סגולים</td><td>נכון/לא נכון</td></tr>
          <tr><th>ה</th><td>מספר החרוזים הסגולים גדול פי 3 ממספר החרוזים הורודים</td><td>נכון/לא נכון</td></tr>
        </TeacherTable>
      </TeacherQuestion>

      <TeacherQuestion number={18}>
        <p>בשיעור חנ״ג חולקו 10 כדורים לשתי קבוצות תלמידים, קבוצה א׳ וקבוצה ב׳ ביחס של <span dir="ltr">3 : 2</span>. כמה כדורים תקבל כל קבוצה? איזו פעולה כדאי לבצע ליחס <span dir="ltr">3 : 2</span> כדי לקבל את התשובה באופן מידי?</p>
      </TeacherQuestion>

      <TeacherBox tone="answer">אפשרי לדלג על התרגילים הבאים ו/או לשזור את הרעיון בתרגילים הקודמים.</TeacherBox>

      <TeacherQuestion number={19}>
        <div className="lemonade-ratio" dir="rtl"><span>מים</span><b>5</b><span>תרכיז</span><b>2</b></div>
        <p>להכנת לימונדה יש לערבב תרכיז לימון ומים ביחס של <span dir="ltr">2 : 5</span>.</p>
        <p>האם בכל גודל של כלי בו נכין את הלימונדה נקבל טעם זהה? על מה עלינו לשמור כדי שהטעם יישמר?</p>
      </TeacherQuestion>
    </PageLayout>
  );
}

export function TeacherIntroPage07() {
  const vessels: Array<'jug' | 'pitcher' | 'bottle' | 'glass'> = ['jug', 'pitcher', 'bottle', 'glass'];
  return (
    <PageLayout pageNumber={7} chapter={CH} topic="יחס" className="teacher-intro-page">
      <TeacherQuestion number={19}>
        <p>הציעו כמויות של תרכיז ומים לכל כלי:</p>
        <div className="vessel-grid">
          {vessels.map((kind) => (
            <div className="vessel-card" key={kind}>
              <Vessel kind={kind} />
              <div className="vessel-ratio-line"><span>היחס</span><RatioAnswer inline /></div>
              <div className="vessel-mini-table">
                <span>תרכיז</span><span>מים</span><span>סה״כ</span>
                <Blank /><Blank /><Blank />
              </div>
            </div>
          ))}
        </div>
        <p className="teacher-center">איך ניתן להגיע ליחסים שווים?</p>
        <TeacherBox tone="summary">
          <ul>
            <li><strong>יחסים שווים</strong> הם יחסים המתקבלים על ידי צמצום או הרחבה.</li>
            <li><strong>יחס מצומצם</strong> הוא יחס המוצג באמצעות שני מספרים טבעיים שאין להם מחלק משותף (שונה מ־1).</li>
          </ul>
        </TeacherBox>
      </TeacherQuestion>

      <TeacherQuestion number={20}>
        <div className="teacher-fractions-row" dir="ltr">
          <Fraction num={14} den={21} /><Fraction num={5} den={3} /><Fraction num={10} den={5} /><Fraction num={10} den={15} />
          <Fraction num={9} den={5} /><Fraction num={3} den={18} /><Fraction num={18} den={12} /><Fraction num={7} den={14} />
        </div>
        <TeacherTable>
          <tr><th>א</th><td>אילו יחסים הם יחסים מצומצמים?</td><td /></tr>
          <tr><th>ב</th><td>צמצמו יחסים שאינם מצומצמים</td><td /></tr>
          <tr><th>ג</th><td>אילו יחסים הם יחסים שווים?</td><td /></tr>
        </TeacherTable>
      </TeacherQuestion>
    </PageLayout>
  );
}

export function TeacherIntroPage08() {
  const cards = [
    { topLeft: '1', bottomLeft: '2' },
    {}, {}, {},
    { topLeft: '2', bottomLeft: '5' },
    {}, {}, {},
    { topLeft: '25', bottomLeft: '4' },
    {}, {}, {},
  ];
  return (
    <PageLayout pageNumber={8} chapter={CH} topic="יחס" className="teacher-intro-page">
      <TeacherQuestion number={21}>
        <h2 className="teacher-final-title">כתבו יחסים שווים</h2>
        <div className="equal-ratio-grid">
          {cards.map((card, index) => <EqualRatioCard key={index} topLeft={card.topLeft} bottomLeft={card.bottomLeft} />)}
        </div>
      </TeacherQuestion>
    </PageLayout>
  );
}
