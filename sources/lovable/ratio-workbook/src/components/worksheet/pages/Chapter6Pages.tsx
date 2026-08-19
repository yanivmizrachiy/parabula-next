import { PageLayout, Question, SubQuestion, Blank, Frac, AnswerLine, CalculationResponse, QSep } from './PageLayout';

const CH = 'פרק 6 – פרופורציה';
const TOPIC = 'יחס ופרופורציה';

// ── Page Ch6Page1: זיהוי פרופורציה ופתרון משוואות – Q15, Q18, Q19 ──
export function Ch6Page1() {
  return (
    <PageLayout pageNumber={30} chapter={CH} topic={TOPIC}>
      <div className="info-box">
        <p><strong>פרופורציה</strong> היא <strong>שוויון בין שני יחסים</strong>. כדי לבדוק אם מתקיימת פרופורציה בין <Frac num="a" den="b" /> לבין <Frac num="c" den="d" /> בודקים אם <strong>a · d = b · c</strong> .</p>
      </div>

      <Question>
        <p>בכל סעיף בדקו אם מתקיימת פרופורציה. אם כן, רשמו " = " בין שני היחסים, ואם לא – רשמו " ≠ ".</p>
        <div className="options-grid-2col gap-md">
          <span>(א) <Frac num={16} den={18} /> <Blank /> <Frac num={8} den={9} /></span>
          <span>(ב) <Frac num={39} den={10} /> <Blank /> <Frac num={13} den={5} /></span>
          <span>(ג) <Frac num="7x" den={98} /> <Blank /> <Frac num="x" den={14} /></span>
          <span>(ד) <Frac num={6} den={8} /> <Blank /> <Frac num={36} den={64} /></span>
          <span>(ה) <Frac num={10} den={6} /> <Blank /> <Frac num={2.5} den={1.5} /></span>
        </div>
      </Question>

      <QSep />

      <Question>
        <p>היחס בין 7 ל-9 שווה ליחס בין x ל-45 . מהו ערכו של x ?</p>
        <CalculationResponse lines={2} />
      </Question>

      <QSep />

      <Question>
        <p>בכל סעיף נתונה פרופורציה. חשבו את ערכו של x .</p>
        <div className="options-grid-2col gap-lg">
          <div><span>(א) <Frac num="x" den={8} /> = <Frac num={4} den={32} /></span><CalculationResponse lines={2} /></div>
          <div><span>(ב) <Frac num={35} den="x" /> = <Frac num={210} den={60} /></span><CalculationResponse lines={2} /></div>
          <div><span>(ג) <Frac num={20} den={35} /> = <Frac num="x" den={7} /></span><CalculationResponse lines={2} /></div>
          <div><span>(ד) <Frac num="x+2" den={3} /> = <Frac num={11} den={3} /></span><CalculationResponse lines={2} /></div>
          <div><span>(ה) <Frac num="x−1" den="x+1" /> = <Frac num={5} den={6} /></span><CalculationResponse lines={3} /></div>
          <div><span>(ו) <Frac num="3−x" den={5} /> = <Frac num="x+19" den={6} /></span><CalculationResponse lines={3} /></div>
        </div>
      </Question>
    </PageLayout>
  );
}

// ── Page Ch6Page2: יישומי פרופורציה – Q16, Q17, Q20, Q21, Q22, Q23, Q24 ──
export function Ch6Page2() {
  return (
    <PageLayout pageNumber={31} chapter={CH} topic={TOPIC}>
      <Question>
        <p>3 ארטיקים עולים 21.6 שקלים. מהו מחירם של 5 ארטיקים?</p>
        <CalculationResponse lines={2} unit={'ש"ח'} />
      </Question>

      <QSep />

      <Question>
        <p>מכונית עוברת מרחק של 210 ק"מ ב-3 שעות. איזה מרחק תעבור המכונית ב-5 שעות, אם היא שומרת על מהירות קבועה?</p>
        <CalculationResponse lines={2} unit={'ק"מ'} />
      </Question>

      <QSep />

      <Question>
        <p><strong>בזר א'</strong> יש 14 פרחים לבנים ו-18 פרחים צהובים. <strong>בזר ב'</strong> יש 42 פרחים לבנים ו-54 פרחים צהובים.</p>
        <p>האם מתקיימת פרופורציה בין מספר הפרחים הלבנים לבין מספר הפרחים הצהובים בשני הזרים? נמקו.</p>
      </Question>

      <QSep />

      <Question>
        <p>במלבן היחס בין אורכי הצלעות הסמוכות הוא 9 : 2 . אורך הצלע הקצרה הוא 7 ס"מ.</p>
        <SubQuestion label="א."><p>מהו אורך הצלע הארוכה?</p><CalculationResponse lines={2} unit={'ס"מ'} /></SubQuestion>
        <SubQuestion label="ב."><p>חשבו את היקף המלבן.</p><CalculationResponse lines={2} unit={'ס"מ'} /></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בסל א' ערבבו 24 תפוזים עם 18 תפוחים. בסל ב' ערבבו 4 תפוזים עם מספר מסוים של תפוחים.</p>
        <p>מה מספר התפוחים בסל ב', אם ידוע שמתקיימת פרופורציה בין מספר התפוחים למספר התפוזים בשני הסלים?</p>
        <CalculationResponse lines={2} />
      </Question>

      <QSep />

      <Question>
        <p>בכיתה ח'1 היחס בין מספר הבנים למספר הבנות הוא 4 : 5 .</p>
        <SubQuestion label="א."><p>אם מספר הבנות הוא 20, מהו מספר הבנים בכיתה? רשמו משוואת פרופורציה מתאימה ופתרו אותה.</p><CalculationResponse lines={3} /></SubQuestion>
        <SubQuestion label="ב."><p>מהו מספר התלמידים בכיתה?</p></SubQuestion>
        <SubQuestion label="ג."><p>מהו היחס בין מספר הבנים בכיתה לכלל התלמידים?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>מחירם של 6 מסטיקים הוא 13.8 ש"ח.</p>
        <SubQuestion label="א."><p>מהו מחירם של 7 מסטיקים?</p><CalculationResponse lines={2} unit={'ש"ח'} /></SubQuestion>
        <SubQuestion label="ב."><p>מחירם של 6 מסטיקים הוזל ב-3.6 ש"ח. מהו מחירם של 7 מסטיקים כעת?</p><CalculationResponse lines={3} unit={'ש"ח'} /></SubQuestion>
      </Question>
    </PageLayout>
  );
}

// ── Page Ch6Page3: יחס ישר – מתכון, לביבות, היקף ריבוע, מיון יחסים ──
export function Ch6Page3() {
  return (
    <PageLayout pageNumber={32} chapter={CH} topic={TOPIC}>
      <div className="info-box">
        <p><strong>יחס ישר</strong> : שני גדלים חיוביים שהיחס ביניהם <strong>קבוע</strong>. הייצוג האלגברי : <strong>y = m·x</strong> , והגרף הוא קו ישר העובר בראשית הצירים.</p>
      </div>

      <Question>
        <p>אימא של דני מכינה מיץ פטל לפי המתכון : <strong>כוס תרכיז ל - 5 כוסות מים</strong>.</p>
        <SubQuestion label="א."><p>מהו היחס בין מספר כוסות התרכיז למספר כוסות המים? <Blank /></p></SubQuestion>
        <SubQuestion label="ב."><p>בני משתמש ב - 4 כוסות תרכיז. כמה כוסות מים עליו להוסיף?</p></SubQuestion>
        <SubQuestion label="ג."><p>בכד גדול 15 כוסות מים. כמה כוסות תרכיז יש להוסיף לפי המתכון?</p></SubQuestion>
        <SubQuestion label="ד."><p>יפה הכינה מיץ מ - x כוסות תרכיז (x &gt; 0) . כתבו <strong>ביטוי אלגברי</strong> למספר כוסות המים.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>להכנת לביבות מערבבים <strong>כוס קמח אחת</strong> עם <strong>2 גביעי יוגורט</strong>.</p>
        <SubQuestion label="א."><p>מהו היחס בין מספר כוסות הקמח למספר גביעי היוגורט? <Blank /></p></SubQuestion>
        <SubQuestion label="ב."><p>מכינים בלילה מ - 4 כוסות קמח. כמה גביעי יוגורט דרושים?</p></SubQuestion>
        <SubQuestion label="ג."><p>מהו הייצוג האלגברי של הישר המתאר את היחס בין מספר כוסות הקמח למספר גביעי היוגורט?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>מהו היחס בין <strong>אורך צלע ריבוע</strong> לבין <strong>היקפו</strong>?</p>
        <SubQuestion label="א."><p>כתבו את היחס המצומצם. <Blank /></p></SubQuestion>
        <SubQuestion label="ב."><p>כתבו את הייצוג האלגברי של הישר (y = היקף, x = אורך הצלע).</p></SubQuestion>
        <SubQuestion label="ג."><p>מהו אורך הצלע של ריבוע שהיקפו 14 ס"מ?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p><strong>מיינו</strong> לקבוצות שבהן אותו יחס. כתבו את היחס המצומצם של כל קבוצה.</p>
        <div className="options-grid-2col gap-sm center">
          <span>1 : 2</span>
          <span>5 : 2</span>
          <span>50 : 20</span>
          <span>20 : 50</span>
          <span>2 : 5</span>
          <span>15 : 6</span>
          <span>15 : 30</span>
          <span>9 : 18</span>
          <span>25 : 10</span>
          <span>10 : 4</span>
        </div>
        <AnswerLine label="קבוצות :" />
      </Question>
    </PageLayout>
  );
}

// ── Page 35 (NEW): פרופורציות – חישובים והסקה ──
export function Ch6Page4() {
  return (
    <PageLayout pageNumber={35} chapter={CH} topic={TOPIC}>
      <Question>
        <p>בכל סעיף בִדקו אם מתקיימת פרופורציה. נמקו.</p>
        <SubQuestion label="א."><p>באולם רקפת 35 שולחנות ו - 350 כיסאות ; באולם כלנית 40 שולחנות ו - 400 כיסאות.</p></SubQuestion>
        <SubQuestion label="ב."><p>בקלמר של דינה 12 טושים ו - 3 עפרונות ; בקלמר של מירי 8 טושים ו - 2 עפרונות.</p></SubQuestion>
        <SubQuestion label="ג."><p>בקייטנה אחת 24 חניכים ו - 3 מדריכים ; בקייטנה השנייה 30 חניכים ו - 5 מדריכים.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>גדי ודני משחקים בגולות. לגדי 15 כחולות ו - 6 אדומות ; לדני 10 כחולות ו - 4 אדומות.</p>
        <SubQuestion label="א."><p>מהו היחס בין הכחולות לאדומות אצל כל ילד?</p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין מספרי הגולות האדומות של גדי ודני?</p></SubQuestion>
        <SubQuestion label="ג."><p>מהו היחס בין מספרי הגולות הכחולות של גדי ודני?</p></SubQuestion>
        <SubQuestion label="ד."><p>האם מצאתם פרופורציה בין הגולות? אם כן – כּ ִתבו אותה.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>במשפחת פרץ : אבא בן 42 , אימא בת 39 , עדינה בת 14 ונעמי בת 13 .</p>
        <SubQuestion label="א."><p>סַפרו במילים מה מתארת הפרופורציה <Frac num={42} den={39} /> = <Frac num={14} den={13} /> .</p></SubQuestion>
        <SubQuestion label="ב."><p>סַפרו במילים מה מתארת הפרופורציה <Frac num={42} den={14} /> = <Frac num={39} den={13} /> .</p></SubQuestion>
        <SubQuestion label="ג."><p>כּ ִתבו פרופורציות נוספות בין הגילים במשפחת פרץ.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>הדרים ונטעים יישובים שכנים. ב <strong>הדרים</strong> 600 משפחות וב <strong>נטעים</strong> 1,000 משפחות. עלות תיקון כביש הגישה היא <strong>400,000 ש"ח</strong> , והחלוקה ביחס למספר המשפחות.</p>
        <SubQuestion label="א."><p>כמה ישלם כל יישוב?</p></SubQuestion>
        <SubQuestion label="ב.">
          <p>חַשבו את ערכו של <strong>x</strong> בכל אחת מהדרכים :</p>
          <p>דרך I :  1000x + 600x = 400000</p>
          <p>דרך II :  5x + 3x = 400000</p>
          <p>דרך III :  <Frac num={600} den={1600} /> = <Frac num="x" den={400000} /></p>
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>מגדלי דגים בריכה : הֶעלו ברשת <strong>100 דגים</strong> , סימנו אותם בתווית אדומה והחזירו לבריכה. אחר - כך דגו <strong>80 דגים</strong> , מתוכם <strong>4</strong> סומנו. כּ ִתבו <strong>אומדן</strong> למספר הדגים בבריכה. הסבירו.</p>
        <AnswerLine label="אומדן ונימוק :" />
      </Question>
    </PageLayout>
  );
}

// ── Page 38 (NEW): פרופורציה ביישומי חיים – תושבים, סדרנים, אומדן ──
export function Ch6Page5() {
  return (
    <PageLayout pageNumber={38} chapter={CH} topic={TOPIC}>
      <div className="info-box">
        <p>במצבים רבים בחיים מתקיים <strong>יחס קבוע</strong> בין שני גדלים – מספר עובדים לכמות לקוחות, כמות מוצר למחיר, מספר משתתפים לחומרי גלם וכד'. במקרים אלה אפשר להיעזר ב<strong>פרופורציה</strong> כדי לחשב גודל חסר.</p>
      </div>

      <Question>
        <p>היחס בין מספר החברות בקיבוץ למספר החברים הוא <strong>8 : 7</strong> .</p>
        <SubQuestion label="א."><p>אם מספר החברים בקיבוץ הוא <strong>224</strong> , כמה חברות יש בו?</p><CalculationResponse lines={2} /></SubQuestion>
        <SubQuestion label="ב."><p>מהו מספר החברים והחברות יחד?</p><CalculationResponse lines={2} /></SubQuestion>
        <SubQuestion label="ג."><p>איזה חלק מכלל החברים והחברות הם החברות?</p><CalculationResponse lines={2} /></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>באולם תיאטרון <strong>1,500 מושבים</strong> ובו מועסקים <strong>5 סדרנים</strong> לשמירה על הסדר.</p>
        <SubQuestion label="א."><p>כמה סדרנים נחוצים לאולם שבו <strong>900 מושבים</strong> ?</p><CalculationResponse lines={2} /></SubQuestion>
        <SubQuestion label="ב."><p>כמה סדרנים נחוצים לאולם שבו <strong>2,400 מושבים</strong> ?</p><CalculationResponse lines={2} /></SubQuestion>
        <SubQuestion label="ג."><p>רִשמו פרופורציה מתאימה לסעיף (א).</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בכל סעיף קבעו אם מתקיימת פרופורציה ונמקו.</p>
        <SubQuestion label="א."><p>3 פועלים סללו <strong>15 מ'</strong> מדרכה ביום ; 5 פועלים סללו <strong>25 מ'</strong> ביום.</p></SubQuestion>
        <SubQuestion label="ב."><p>4 ק"ג עגבניות עולים <strong>20 ש"ח</strong> ; 7 ק"ג עגבניות עולים <strong>32 ש"ח</strong> .</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בחווה <strong>9 פרות</strong> אוכלות <strong>72 ק"ג</strong> מספוא ביום. כמה ק"ג מספוא יידרשו ל - <strong>12 פרות</strong> ביום? רִשמו פרופורציה ופִתרו.</p>
        <CalculationResponse lines={3} unit={'ק"ג'} />
      </Question>
    </PageLayout>
  );
}
