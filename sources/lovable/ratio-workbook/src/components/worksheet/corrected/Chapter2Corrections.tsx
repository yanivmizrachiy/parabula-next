import {
  Blank,
  Checkbox,
  FinalAnswer,
  Frac,
  PageLayout,
  QSep,
  Question,
  RatioAnswer,
  SubQuestion,
  WorkArea,
} from '../pages/PageLayout';

const CH = 'פרק 2 – חלוקה ביחס נתון';

function SpiceGraph() {
  // Direct-proportion graph, קינמון : וניל = 3 : 5. Drawn large and clear: labelled axes,
  // arrowheads, tick numbers and dashed guide-lines to the marked points. Every coordinate is
  // derived from the scale so the marked points sit exactly on the line (§4.3).
  const ox = 54, oy = 244;            // origin
  const sx = 68 / 3;                  // px per gram of cinnamon (68px = 3 grams)
  const sy = 52 / 5;                  // px per gram of vanilla (52px = 5 grams)
  const X = (g: number) => ox + g * sx;
  const Y = (g: number) => oy - g * sy;
  const marks = [3, 6, 9];            // cinnamon values → vanilla = g·5/3
  const yTitleY = (oy + Y(20)) / 2;
  return (
    <div className="graph-container">
      <svg viewBox="0 0 356 300" role="img" aria-label="גרף יחס ישר: היחס בין כמות הקינמון (ציר אופקי) לכמות הווניל (ציר אנכי) הוא 3 : 5" shapeRendering="geometricPrecision" style={{ width: '520px', maxWidth: '100%', height: 'auto' }}>
        {[3, 6, 9, 12].map((g) => (
          <line key={`vx${g}`} x1={X(g)} y1={Y(20)} x2={X(g)} y2={oy} stroke="#e6eaf1" strokeWidth="1" />
        ))}
        {[5, 10, 15, 20].map((g) => (
          <line key={`hy${g}`} x1={ox} y1={Y(g)} x2={X(12)} y2={Y(g)} stroke="#e6eaf1" strokeWidth="1" />
        ))}
        {/* צירים עם ראשי חץ */}
        <line x1={ox} y1={oy} x2={X(12) + 16} y2={oy} stroke="#1f2a44" strokeWidth="2" />
        <line x1={ox} y1={oy} x2={ox} y2={Y(20) - 16} stroke="#1f2a44" strokeWidth="2" />
        <polygon points={`${X(12) + 16},${oy} ${X(12) + 8},${oy - 4} ${X(12) + 8},${oy + 4}`} fill="#1f2a44" />
        <polygon points={`${ox},${Y(20) - 16} ${ox - 4},${Y(20) - 8} ${ox + 4},${Y(20) - 8}`} fill="#1f2a44" />
        {/* קו הפרופורציה */}
        <line x1={ox} y1={oy} x2={X(12)} y2={Y(20)} stroke="#1e40af" strokeWidth="2.4" />
        {/* נקודות מסומנות + קווי עזר מקווקווים */}
        {marks.map((g) => {
          const v = (g * 5) / 3;
          return (
            <g key={g}>
              <line x1={X(g)} y1={oy} x2={X(g)} y2={Y(v)} stroke="#9aa9c7" strokeWidth="1" strokeDasharray="3 3" />
              <line x1={ox} y1={Y(v)} x2={X(g)} y2={Y(v)} stroke="#9aa9c7" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx={X(g)} cy={Y(v)} r="4.2" fill="#1e40af" />
            </g>
          );
        })}
        {/* מספרי הצירים */}
        <text x={ox - 9} y={oy + 5} fontSize="12" textAnchor="end" direction="ltr">0</text>
        {[3, 6, 9, 12].map((g) => (
          <text key={`tx${g}`} x={X(g)} y={oy + 19} fontSize="12" textAnchor="middle" direction="ltr">{g}</text>
        ))}
        {[5, 10, 15, 20].map((g) => (
          <text key={`ty${g}`} x={ox - 9} y={Y(g) + 4} fontSize="12" textAnchor="end" direction="ltr">{g}</text>
        ))}
        {/* כותרות הצירים — מה מייצג כל ציר */}
        <text x={(ox + X(12)) / 2} y={oy + 42} fontSize="17" textAnchor="middle" fontWeight="bold">קינמון (גרמים)</text>
        <text x="20" y={yTitleY} fontSize="17" textAnchor="middle" fontWeight="bold" transform={`rotate(-90 20 ${yTitleY})`}>וניל (גרמים)</text>
      </svg>
    </div>
  );
}

export function RatioPage11() {
  return (
    <PageLayout pageNumber={11} chapter={CH} className="ratio-page-11">
      <Question>
        <p>ביום קיץ הגיעו לבית הספר יותר מ־65 תלמידים. היחס בין מספר התלמידים שנעלו נעלי ספורט למספר התלמידים שנעלו סנדלים היה 5 : 3.</p>
        <SubQuestion label="א.">
          <p>הסבירו מדוע לא ייתכן שהגיעו 83 תלמידים.</p>
          <WorkArea label="נימוק:" lines={2} />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>כתבו אפשרות אחת למספר התלמידים שהגיעו.</p>
          <FinalAnswer />
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>מחירם של סלט וכריך יחד הוא 40 ש״ח. היחס בין מחיר הסלט למחיר הכריך הוא 4 : 1.</p>
        <SubQuestion label="א.">
          <p>חשבו את מחיר הסלט ואת מחיר הכריך.</p>
          <WorkArea lines={3} />
          <FinalAnswer label="סלט:" unit="ש״ח" />
          <FinalAnswer label="כריך:" unit="ש״ח" />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>דניאל קנה סלט וארבעה כריכים. מהו היחס בין מחיר הסלט לסכום הכולל ששילם?</p>
          <RatioAnswer />
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>יוסי שילם במוסך 2,240 ש״ח. היחס בין שכר העבודה למחיר חלקי החילוף הוא 5 : 2.</p>
        <SubQuestion label="א.">
          <p>מה היה שכר העבודה?</p>
          <WorkArea lines={3} />
          <FinalAnswer unit="ש״ח" />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>מה היה מחיר חלקי החילוף?</p>
          <WorkArea lines={3} />
          <FinalAnswer unit="ש״ח" />
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בכיתה ח׳1 יש 30 תלמידים ובכיתה ח׳2 יש 32 תלמידים. מחיר הטיול <strong>לכל תלמיד</strong> היה זהה, והעלות הכוללת לשתי הכיתות הייתה 2,480 ש״ח.</p>
        <SubQuestion label="א.">
          <p>מה היה המחיר לתלמיד?</p>
          <WorkArea lines={3} />
          <FinalAnswer unit="ש״ח" />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>מה הייתה עלות הטיול לכל אחת מהכיתות?</p>
          <WorkArea lines={3} />
          <FinalAnswer label="ח׳1:" unit="ש״ח" />
          <FinalAnswer label="ח׳2:" unit="ש״ח" />
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בחנות תבלינים מכינים תערובת קינמון ווניל ביחס קבוע. הגרף מתאר את הקשר בין הכמויות.</p>
        <SpiceGraph />
        <SubQuestion label="א.">
          <p>מהו היחס בין כמות הקינמון לכמות הווניל?</p>
          <RatioAnswer />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>כמה גרם מכל תבלין יש בתערובת שמשקלה 560 גרם?</p>
          <WorkArea lines={3} />
          <FinalAnswer label="קינמון:" unit="גרם" />
          <FinalAnswer label="וניל:" unit="גרם" />
        </SubQuestion>
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
        <div className="response-set">
          <WorkArea lines={3} />
          <FinalAnswer label="זווית ראשונה:" unit="°" />
          <FinalAnswer label="זווית שנייה:" unit="°" />
        </div>
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
        <SubQuestion label="א.">
          <p>כמה כסף חסכו יחד?</p>
          <WorkArea lines={3} />
          <FinalAnswer label="חיסכון:" unit="ש״ח" />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>חלקו את החיסכון ביניהן ביחס לסכומי הקנייה שלהן לפני המבצע.</p>
          <WorkArea lines={3} />
          <FinalAnswer label="יפה:" unit="ש״ח" />
          <FinalAnswer label="נעמה:" unit="ש״ח" />
        </SubQuestion>
      </Question>
    </PageLayout>
  );
}
