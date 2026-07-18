import {
  AnswerLine,
  Blank,
  Checkbox,
  Frac,
  PageLayout,
  QSep,
  Question,
  SubQuestion,
} from '../pages/PageLayout';

const CH = 'פרק 2 – חלוקה ביחס נתון';

function SpiceGraph() {
  return (
    <div className="graph-container compact">
      <svg viewBox="0 0 300 210" className="ratio-graph" role="img" aria-label="גרף יחס ישר בין קינמון לווניל ביחס שלוש לחמש">
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`v-${i}`} x1={30 + i * 22} y1={15} x2={30 + i * 22} y2={185} stroke="#e2e2e2" strokeWidth="0.6" />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`h-${i}`} x1={30} y1={185 - i * 20} x2={250} y2={185 - i * 20} stroke="#e2e2e2" strokeWidth="0.6" />
        ))}
        <line x1="30" y1="185" x2="260" y2="185" stroke="#1a1a1a" strokeWidth="1.6" />
        <line x1="30" y1="190" x2="30" y2="10" stroke="#1a1a1a" strokeWidth="1.6" />
        <polyline points="30,185 96,125 162,65 228,5" fill="none" stroke="#1e40af" strokeWidth="2" />
        <circle cx="96" cy="125" r="4" fill="#1e40af" />
        <circle cx="162" cy="65" r="4" fill="#1e40af" />
        <text x="145" y="204" textAnchor="middle">קינמון — גרמים</text>
        <text x="9" y="100" textAnchor="middle" transform="rotate(-90 9 100)">וניל — גרמים</text>
        <text x="96" y="198" textAnchor="middle">3</text>
        <text x="162" y="198" textAnchor="middle">6</text>
        <text x="22" y="128" textAnchor="middle">5</text>
        <text x="22" y="68" textAnchor="middle">10</text>
      </svg>
    </div>
  );
}

export function RatioPage11() {
  return (
    <PageLayout pageNumber={11} chapter={CH}>
      <Question>
        <p>ביום קיץ הגיעו לבית הספר יותר מ־65 תלמידים. היחס בין מספר התלמידים שנעלו נעלי ספורט למספר התלמידים שנעלו סנדלים היה 5 : 3.</p>
        <SubQuestion label="א."><p>הסבירו מדוע לא ייתכן שהגיעו 83 תלמידים.</p></SubQuestion>
        <SubQuestion label="ב."><p>כתבו אפשרות אחת למספר התלמידים שהגיעו.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>מחירם של סלט וכריך יחד הוא 40 ש״ח. היחס בין מחיר הסלט למחיר הכריך הוא 4 : 1.</p>
        <SubQuestion label="א."><p>חשבו את מחיר הסלט ואת מחיר הכריך.</p></SubQuestion>
        <SubQuestion label="ב."><p>דניאל קנה סלט וארבעה כריכים. מהו היחס בין מחיר הסלט לסכום הכולל ששילם?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>יוסי שילם במוסך 2,240 ש״ח. היחס בין שכר העבודה למחיר חלקי החילוף הוא 5 : 2.</p>
        <SubQuestion label="א."><p>מה היה שכר העבודה?</p></SubQuestion>
        <SubQuestion label="ב."><p>מה היה מחיר חלקי החילוף?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בכיתה ח׳1 יש 30 תלמידים ובכיתה ח׳2 יש 32 תלמידים. מחיר הטיול <strong>לכל תלמיד</strong> היה זהה, והעלות הכוללת לשתי הכיתות הייתה 2,480 ש״ח.</p>
        <SubQuestion label="א."><p>מה היה המחיר לתלמיד?</p></SubQuestion>
        <SubQuestion label="ב."><p>מה הייתה עלות הטיול לכל אחת מהכיתות?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בחנות תבלינים מכינים תערובת קינמון ווניל ביחס קבוע. הגרף מתאר את הקשר בין הכמויות.</p>
        <SpiceGraph />
        <SubQuestion label="א."><p>מהו היחס בין כמות הקינמון לכמות הווניל?</p></SubQuestion>
        <SubQuestion label="ב."><p>כמה גרם מכל תבלין יש בתערובת שמשקלה 560 גרם?</p></SubQuestion>
      </Question>
    </PageLayout>
  );
}

export function RatioPage13() {
  return (
    <PageLayout pageNumber={13} chapter={CH}>
      <Question>
        <p>שטחו של מלבן הוא 48 סמ״ר. היחס בין אורכי צלעותיו הוא 3 : 1.</p>
        <SubQuestion label="א."><p>חשבו את אורכי צלעות המלבן.</p></SubQuestion>
        <SubQuestion label="ב."><p>חשבו את היקף המלבן.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>היחס בין מספר הכדורים בשקים א׳, ב׳ ו־ג׳ הוא 3 : 5 : 2.</p>
        <SubQuestion label="א."><p>בשק ב׳ יש 5 כדורים. כמה כדורים יש בסך הכול?</p></SubQuestion>
        <SubQuestion label="ב."><p>בכל השקים יחד יש 70 כדורים. כמה כדורים יש בכל שק?</p></SubQuestion>
        <SubQuestion label="ג."><p>האם ייתכן שבכל השקים יחד יהיו 72 כדורים? נמקו.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בכיתה 24 תלמידים. היחס בין מספר הבנים למספר הבנות הוא 5 : 3.</p>
        <SubQuestion label="א."><p>כמה בנים וכמה בנות בכיתה?</p></SubQuestion>
        <SubQuestion label="ב."><p>כמה <strong>בנות</strong> צריך לצרף לכיתה כדי שהיחס בין מספר הבנים למספר הבנות יהיה 1 : 1?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>זווית אחת במשולש היא 120°. היחס בין שתי הזוויות האחרות הוא 1 : 5.</p>
        <p>חשבו את גודלן של שתי הזוויות האחרות.</p>
        <AnswerLine label="פתרון:" />
      </Question>
    </PageLayout>
  );
}

export function RatioPage16() {
  return (
    <PageLayout pageNumber={16} chapter={CH}>
      <Question>
        <p>בקבוצת מחקר לכל פרופסור מסייעים 5 סטודנטים. היחס בין מספר הפרופסורים למספר הסטודנטים הוא 1 : 5.</p>
        <SubQuestion label="א."><p>בקבוצה 30 אנשי מחקר. כמה מהם פרופסורים וכמה סטודנטים?</p></SubQuestion>
        <SubQuestion label="ב."><p>לכנס יצאו 18 אנשי מחקר באותו יחס. כמה פרופסורים וכמה סטודנטים יצאו?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>להכנת סלט פירות משתמשים ב־3 תפוזים, 2 בננות ותפוח אחד.</p>
        <SubQuestion label="א."><p>נועה השתמשה ב־9 תפוזים. כמה בננות וכמה תפוחים עליה להוסיף?</p></SubQuestion>
        <SubQuestion label="ב."><p>לשרית יש 2 בננות. כמה תפוזים וכמה תפוחים דרושים כדי לשמור על היחס?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>יוני ודני חילקו 40 גולות ביחס 3 : 5. בחרו את המשפטים הנכונים.</p>
        <div className="checkbox-list">
          <span><Checkbox /> ליוני 15 גולות ולדני 25 גולות.</span>
          <span><Checkbox /> ליוני <Frac num={3} den={8} /> מכל הגולות.</span>
          <span><Checkbox /> לדני <Frac num={5} den={8} /> מכל הגולות.</span>
          <span><Checkbox /> ההפרש בין מספר הגולות שלהם הוא 10.</span>
        </div>
      </Question>

      <QSep />

      <Question>
        <p>טל קנה 3 כרטיסי הגרלה ואורי קנה 4. אם יזכו, יחלקו את הפרס ביחס למספר הכרטיסים.</p>
        <SubQuestion label="א."><p>איזה חלק מהפרס יקבל כל אחד?</p></SubQuestion>
        <SubQuestion label="ב."><p>אם יזכו ב־70 ש״ח, כמה יקבל כל אחד?</p></SubQuestion>
        <SubQuestion label="ג."><p>אם יזכו ב־x ש״ח, כתבו ביטוי אלגברי לסכום שיקבל כל אחד.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בחנות הוכרז מבצע: „קנו 3 ספרים — הזול ביותר חינם”. יפה בחרה ספרים במחירים 57 ו־33 ש״ח, ונעמה בחרה ספר במחיר 45 ש״ח.</p>
        <SubQuestion label="א."><p>כמה כסף חסכו יחד?</p></SubQuestion>
        <SubQuestion label="ב."><p>חלקו את החיסכון ביניהן ביחס לסכומי הקנייה שלהן לפני המבצע.</p></SubQuestion>
        <AnswerLine label="פתרון:" />
      </Question>
    </PageLayout>
  );
}
