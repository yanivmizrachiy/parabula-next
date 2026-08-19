import { PageLayout, Question, SubQuestion, Blank, WorksheetTable, Checkbox, Frac, AnswerLine, QSep, WorkArea, FinalAnswer, RatioAnswer } from './PageLayout';

const CH = 'פרק 1 – יסודות היחס';

function Circle({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill={filled ? '#000' : '#fff'} stroke="#000" strokeWidth="2" />
    </svg>
  );
}

// ── Page 1: Q1+Q2+Q5 ──
export function Ch1Page1() {
  return (
    <PageLayout pageNumber={1} chapter={CH}>
      <Question>
        <p>סמנו את האיור שבו היחס בין מספר העיגולים השחורים לבין מספר העיגולים הלבנים הוא 2 : 1 .</p>
      </Question>
      <div className="circles-grid">
        <div className="circle-option">
          <div className="circles-box">
            <div className="circles-row"><Circle filled /><Circle /><Circle /></div>
            <div className="circles-row"><Circle filled /><Circle filled /><Circle filled /></div>
            <div className="circles-row"><Circle filled /><Circle filled /><Circle filled /></div>
          </div>
          <Checkbox />
        </div>
        <div className="circle-option">
          <div className="circles-box">
            <div className="circles-row"><Circle filled /><Circle /><Circle /></div>
            <div className="circles-row"><Circle filled /><Circle filled /><Circle /></div>
            <div className="circles-row"><Circle filled /><Circle filled /><Circle /></div>
          </div>
          <Checkbox />
        </div>
        <div className="circle-option">
          <div className="circles-box">
            <div className="circles-row"><Circle filled /><Circle filled /><Circle /></div>
            <div className="circles-row"><Circle filled /><Circle filled /><Circle /></div>
            <div className="circles-row"><Circle filled /><Circle filled /><Circle /></div>
          </div>
          <Checkbox />
        </div>
        <div className="circle-option">
          <div className="circles-box">
            <div className="circles-row"><Circle filled /><Circle /><Circle /></div>
            <div className="circles-row"><Circle /><Circle /><Circle /></div>
            <div className="circles-row"><Circle filled /><Circle /><Circle /></div>
          </div>
          <Checkbox />
        </div>
      </div>

      <QSep />

      <Question>
        <p>היחס בין מספר העיגולים השחורים למספר העיגולים הלבנים הוא 3 :2.</p>
        <p>ציירו שתי אפשרויות שונות המתאימות לנתונים :</p>
      </Question>
      <div className="drawing-box"><p className="drawing-label">אפשרות א' :</p></div>
      <div className="drawing-box"><p className="drawing-label">אפשרות ב' :</p></div>
      <p><strong>השלימו</strong> : על כל <Blank /> עיגולים שחורים צריך לצייר <Blank /> עיגולים לבנים.</p>
      <p>מספר העיגולים השחורים חייב להתחלק ב - <Blank /> .</p>
      <p>מספר העיגולים הלבנים חייב להיות מספר שמתחלק ב- <Blank /> .</p>
      <p>מספר העיגולים הכולל הוא מספר שמתחלק ב - <Blank /> .</p>

      <QSep />

      <Question>
        <SubQuestion label="א.">
          <p>צבעו משבצות כך שעל כל משבצת לבנה יהיו 4 משבצות שחורות</p>
          <div className="grid-5x1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid-cell" />
            ))}
          </div>
        </SubQuestion>
        <SubQuestion label="ב."><p>מה היחס בין מספר המשבצות השחורות למספר המשבצות הלבנות?</p></SubQuestion>
        <SubQuestion label="ג."><p><strong>השלימו</strong> : מספר המשבצות השחורות גדול פי <Blank /> ממספר המשבצות הלבנות.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>אלי שיחק עם חבריו בגולות אדומות וגולות לבנות.</p>
        <SubQuestion label="א."><p>בתום המשחק מספר הגולות האדומות של אלי <strong>גָדַל פי 2</strong> וגם מספר הגולות הלבנות גָדַל פי 2 . האם היחס בין מספר הגולות האדומות למספר הלבנות השתנה? <Blank /></p></SubQuestion>
        <SubQuestion label="ב."><p>לרפי <strong>נוספו</strong> 2 גולות אדומות וגם 2 גולות לבנות, והיחס לא השתנה. מהו היחס שהיה לרפי לפני המשחק? <Blank /></p></SubQuestion>
      </Question>
    </PageLayout>
  );
}

// ── Page 2: Q6+Q3 table ──
export function Ch1Page2() {
  return (
    <PageLayout pageNumber={2} chapter={CH}>
      <Question>
        <p>סמנו את ההיגדים המתאימים :</p>
        <div className="flower-options">
          <div className="flower-opt"><span className="opt-label">א.</span><p>על כל 2 פרחים אדומים יש 3 פרחים כחולים</p></div>
          <div className="flower-opt"><span className="opt-label">ב.</span><p>על כל 3 פרחים אדומים יש 2 פרחים כחולים</p></div>
          <div className="flower-opt"><span className="opt-label">ג.</span><p><Frac num={4} den={6} /> מהפרחים בעציץ הם אדומים</p></div>
          <div className="flower-opt"><span className="opt-label">ד.</span><p>היחס בין מספר הפרחים האדומים לכחולים הוא 4 : 6</p></div>
          <div className="flower-opt"><span className="opt-label">ה.</span><p><Frac num={4} den={10} /> מהפרחים בעציץ הם אדומים</p></div>
        </div>
      </Question>

      <QSep />

      <Question>
        <p className="text-center"><strong>היחס בין מספר הבנים למספר הבנות בכיתה ח'2 הוא  5 : 3</strong></p>
        <p>סמנו ליד כל היגד אם הוא נכון, לא נכון או אי אפשר לקבוע אם הוא נכון או לא נכון.</p>
      </Question>
      <WorksheetTable
        headers={['אי אפשר לקבוע', 'לא נכון', 'נכון', 'היגד', '']}
        rows={[
          [<Checkbox />, <Checkbox />, <Checkbox />, 'על כל 3 בנים יש 5 בנות', 'א.'],
          [<Checkbox />, <Checkbox />, <Checkbox />, 'מספר הבנות חייב להתחלק ב – 3', 'ב.'],
          [<Checkbox />, <Checkbox />, <Checkbox />, 'מספר הילדים בכיתה מתחלק ב - 8', 'ג.'],
          [<Checkbox />, <Checkbox />, <Checkbox />, 'על כל 5 בנים יש 3 בנות', 'ד.'],
          [<Checkbox />, <Checkbox />, <Checkbox />, 'היחס בין הבנות לבנים הוא 3 :5', 'ה.'],
          [<Checkbox />, <Checkbox />, <Checkbox />, 'אפשר לדעת בוודאות כמה ילדים בכיתה', 'ו.'],
          [<Checkbox />, <Checkbox />, <Checkbox />, 'מספר הבנים בכיתה הוא 9', 'ז.'],
          [<Checkbox />, <Checkbox />, <Checkbox />, 'מספר הבנים בכיתה הוא 10', 'ח.'],
          [<Checkbox />, <Checkbox />, <Checkbox />, 'בחוג דרמה 15 בנים ובנות', 'ט.'],
          [<Checkbox />, <Checkbox />, <Checkbox />, 'בחוג דרמה 8 בנים ובנות', 'י.'],
          [<Checkbox />, <Checkbox />, <Checkbox />, <><Frac num={3} den={8} /> מהמשתתפים בחוג לדרמה הם בנים</>, 'יא.'],
          [<Checkbox />, <Checkbox />, <Checkbox />, <>מספר הבנות בחוג דרמה הוא פי 2 ממספר הבנים</>, 'יב.'],
        ]}
      />
    </PageLayout>
  );
}

// ── Page 3: Q4 table + Q salad ──
export function Ch1Page3() {
  return (
    <PageLayout pageNumber={3} chapter={CH}>
      <Question>
        <p>היחס בין מספר הבוגרים לבין מספר הצעירים במקהלת "זמיר" הוא 2 : 3 .</p>
        <p>סמנו ליד כל היגד אם הוא נכון, לא נכון או שאי-אפשר לקבוע אם הוא נכון או לא נכון.</p>
      </Question>
      <WorksheetTable
        className="wt-ltr"
        headers={['אי-אפשר לקבוע', 'לא נכון', 'נכון', 'היגד', '']}
        rows={[
          [<Checkbox />, <Checkbox />, <Checkbox />, 'מספר המשתתפים הכולל מתחלק ב - 5', '.1'],
          [<Checkbox />, <Checkbox />, <Checkbox />, 'מספר הבוגרים גדול פי 1.5 ממספר הצעירים.', '.2'],
          [<Checkbox />, <Checkbox />, <Checkbox />, 'במקהלה יש 3 בוגרים ו- 2 צעירים.', '.3'],
          [<Checkbox />, <Checkbox />, <Checkbox />, 'במקהלה יש בסך-הכול 12 משתתפים.', '.4'],
          [<Checkbox />, <Checkbox />, <Checkbox />, <>מספר הצעירים הוא <Frac num={2} den={5} /> מסך כל המשתתפים.</>, '.5'],
        ]}
      />

      <QSep />

      <Question>
        <p>החומרים למתכון לסלט הם: 3 כוסות מקרוני, 3 כוסות תפוזים חתוכים, 2 כוסות תפוחי עץ, 1 כוס רוטב.</p>
        <SubQuestion label="א."><p>מה היחס בין כמות כוסות המקרוני לכמות כוסות התפוזים?</p></SubQuestion>
        <SubQuestion label="ב."><p>מה היחס בין כמות כוסות תפוחי העץ לכמות כוסות התפוזים?</p></SubQuestion>
        <SubQuestion label="ג."><p>מה היחס בין כמות כוסות הרוטב לכמות הכוללת של הסלט?</p></SubQuestion>
        <SubQuestion label="ד."><p>איזה חלק של הסלט מהוות כוסות הרוטב?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p><strong>היחס בין מספר המבוגרים שיצאו לטיול למספר הילדים הוא 5:1</strong></p>
        <SubQuestion label="א."><p>האם ניתן לדעת מהנתונים כמה תלמידים יצאו לטיול? <Blank /></p></SubQuestion>
        <SubQuestion label="ב."><p><strong>השלימו</strong> : מספר התלמידים בטיול הוא מספר שמתחלק ב - <Blank /> .</p></SubQuestion>
        <SubQuestion label="ג."><p>האם ניתן לדעת מה המספר הכולל של היוצאים לטיול? <Blank /></p></SubQuestion>
        <SubQuestion label="ד."><p><strong>השלימו</strong> : מספר היוצאים הכולל הוא מספר שמתחלק ב - <Blank /> .</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>היחס במבחן בין מספר השאלות באלגברה למספר השאלות בגיאומטריה הוא 1 : 2.</p>
        <p>במבחן 12 שאלות באלגברה. האם ניתן לדעת מה מספר השאלות בגיאומטריה? אם כן, מהו?</p>
      </Question>

      <QSep />

      <Question>
        <p>היחס בין מספר השאלות באלגברה למספר השאלות בגיאומטריה הוא 3 : 2.</p>
        <p><strong>האם ניתן לדעת כמה שאלות היו במבחן?</strong> אם כן, מהו?</p>
      </Question>
    </PageLayout>
  );
}

// ── Page 4: Q11-Q14 ──
export function Ch1Page4() {
  return (
    <PageLayout pageNumber={4} chapter={CH}>
      <Question>
        <p>בין אורי ודן חילקו 56 גולות ביחס של 5 : 2. אילו היגדים מהבאים מתאימים לבעיה?</p>
        <SubQuestion label="א."><p>על כל 2 גולות שיש לאורי יש לדן 5 גולות.</p></SubQuestion>
        <SubQuestion label="ב."><p>לאורי <Frac num={2} den={5} /> מסך-כל הגולות שיש לשניהם.</p></SubQuestion>
        <SubQuestion label="ג."><p>אורי יקבל <Frac num={2} den={7} /> מהגולות, ודן יקבל <Frac num={5} den={7} /> מהגולות.</p></SubQuestion>
        <SubQuestion label="ד."><p>מכל 7 גולות יש לאורי 2 גולות, ולדן - 5 גולות.</p></SubQuestion>
        <SubQuestion label="ה."><p>מכל 7 גולות יש לדן 2 גולות, ולאורי - 5 גולות.</p></SubQuestion>
        <SubQuestion label="ו."><p>היחס בין מספר הגולות של אורי לבין מספר הגולות של דן הוא 10 : 4.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>היחס בין מספר הכדורים הכחולים לבין מספר הכדורים הלבנים הוא 10 :3.</p>
        <p><strong>השלימו</strong> : על כל <Blank /> כדורים כחולים יש <Blank /> כדורים לבנים.</p>
        <p>אם יש 15 כדורים כחולים אז יש <Blank /> כדורים לבנים.</p>
      </Question>

      <QSep />

      <Question>
        <p><strong>היחס בין מספר כוסות התרכיז במיכל למספר כוסות המים הוא 3 : 2. יש 12 כוסות מים.</strong></p>
        <p><strong>כמה כוסות תרכיז יש במיכל?</strong></p>
      </Question>

      <QSep />

      <Question>
        <p>לצביעת חדרי הכיתות בבית הספר "החורש" השתמשו בצבע ירוק וצבע לבן.</p>
        <p>לכל 7 פחים של צבע ירוק הוסיפו 3 פחים של צבע לבן.</p>
        <p>בתום הצביעה התברר שהשתמשו ב- 21 פחים של צבע ירוק. בכמה פחים של צבע לבן השתמשו?</p>
      </Question>

      <QSep />

      <Question>
        <p>היחס בין מספר התפוחים הירוקים למספר התפוחים האדומים הוא 7 : 3. השלימו מספרים כך שהיחס יישמר.</p>
        <div className="ratio-items row-wrap">
          <span>א. <strong>28</strong> : <Blank /></span>
          <span>ב. <strong>35</strong> : <Blank /></span>
          <span>ג. <Blank /> : 9</span>
          <span>ד. <Blank /> : 6</span>
        </div>
      </Question>

      <QSep />

      <Question>
        <p>היחס בין מספר כוסות התרכיז למספר כוסות המים בקנקני השתייה במסעדה הוא 7 : 2.</p>
        <p>בסוף יום העבודה ספרו ומצאו שהשתמשו להכנת קנקני השתייה ב- 36 כוסות של תרכיז.</p>
        <p>כמה כוסות שתייה הכינו בסך הכל באותו יום?</p>
      </Question>
    </PageLayout>
  );
}

// ── Page 5: Q17-Q22 ──
export function Ch1Page5() {
  return (
    <PageLayout pageNumber={5} chapter={CH}>
      <Question>
        <SubQuestion label="א."><p>היחס היום בין גיל האב לגיל הבן במשפחת תמיר הוא 1 : 6. האב בן 42. בן כמה הבן?</p></SubQuestion>
        <SubQuestion label="ב."><p>במשפחת סביון היחס היום בין הגילים של האב דוד ובנו יונתן הוא כמו במשפחת תמיר. יונתן בן 6. בן כמה אביו?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>לאירוע הוזמנו בקבוקי שתייה. היחס בין מספר בקבוקי השתייה המוגזת והמספר הכולל של בקבוקי השתייה הוא 11 : 6.</p>
        <p>לאירוע הוזמנו 18 בקבוקי שתייה מוגזת. כמה בקבוקי שתייה הוזמנו לאירוע בסך הכל?</p>
      </Question>

      <QSep />

      <Question>
        <p>בבית הספר האזורי לומדים תלמידים משני יישובים: "דקלים" ו"ברושים".</p>
        <p>בכיתה של אורי היחס בין מספר התלמידים מ"דקלים" למספר התלמידים מ"ברושים" הוא 2 : 3.</p>
        <p>בכיתה ז<sub>1</sub>: 18 תלמידים מדקלים ו- 15 תלמידים מברושים. | בכיתה ז<sub>2</sub>: 18 מדקלים ו- 12 מברושים. | בכיתה ז<sub>3</sub>: 18 מדקלים ו- 18 מברושים.</p>
        <p>באיזו כיתה לומד אורי?</p>
      </Question>

      <QSep />

      <Question>
        <p>היחס בין מספר הבנות לבין מספר הבנים בכיתה הוא 4 :3. השלימו :</p>
        <SubQuestion label="א."><p>היחס בין מספר הבנות לבין מספר תלמידי הכיתה הוא <Blank /> .</p></SubQuestion>
        <SubQuestion label="ב."><p>היחס בין מספר תלמידי הכיתה לבין מספר הבנים הוא <Blank /> .</p></SubQuestion>
        <SubQuestion label="ג."><p>אם יש 9 בנות בכיתה אז יש <Blank /> בנים בכיתה.</p></SubQuestion>
        <SubQuestion label="ד."><p>אם יש 16 בנים בכיתה אז יש בכיתה סך הכל <Blank /> תלמידים.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בקייטנה 63 משתתפים. היחס בין מספר הבנים לבין מספר הבנות הוא 2 :1. הקיפו את ההיגד/ים הנכונים :</p>
        <SubQuestion label="א."><p>בקייטנה יש יותר בנות.</p></SubQuestion>
        <SubQuestion label="ב."><p>בקייטנה יש 42 בנים.</p></SubQuestion>
        <SubQuestion label="ג."><p>מספר הבנות גדול ממספר הבנים ב-21.</p></SubQuestion>
        <SubQuestion label="ד."><p>היחס בין מספר המשתתפים הכולל לבין מספר הבנים הוא 3 :1.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בתמיסת דשן של "הכל לחקלאי" היחס בין כמות החנקן לשאר החומרים הוא 13 : 4.</p>
        <p>כמה גרם חנקן יש בבקבוק המכיל 1,360 גרם תמיסת דשן?</p>
      </Question>
    </PageLayout>
  );
}

// ── Page 6 (NEW): שאלות הסקה והשוואת יחסים ──
export function Ch1Page6() {
  return (
    <PageLayout pageNumber={6} chapter={CH}>
      <Question>
        <p>בכיתה ח'1 היחס בין מספר הבנים למספר הבנות הוא 4 : 3 .</p>
        <SubQuestion label="א."><p>אם מספר הבנות בכיתה ח'1 הוא 16 , מה מספר הבנים?</p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין מספר הבנים לכלל התלמידים בכיתה?</p></SubQuestion>
        <SubQuestion label="ג."><p>גם בכיתה ח'2 היחס בין מספר הבנים למספר הבנות הוא 4 : 3 . האם ייתכן שמספר הבנות בכיתה ח'2 הוא 14 ? הסבירו.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בכד <strong>א'</strong> היחס בין מספר הכדורים הלבנים למספר הכדורים האדומים הוא 3 : 1 .</p>
        <p>בכד <strong>ב'</strong> היחס בין מספר הכדורים הלבנים למספר הכדורים האדומים הוא 2 : 3 .</p>
        <SubQuestion label="א."><p>האם ייתכן שבכד א' יש 7 כדורים לבנים? הסבירו.</p></SubQuestion>
        <SubQuestion label="ב."><p>האם ייתכן שבכד ב' יש 7 כדורים לבנים? הסבירו.</p></SubQuestion>
        <SubQuestion label="ג."><p>האם ייתכן שבכד ב' יש כדור אדום אחד? הסבירו.</p></SubQuestion>
        <SubQuestion label="ד.">
          <p>ידוע שבכל כד יש 12 כדורים אדומים.</p>
          <p>(i) מהו היחס בין מספר הכדורים הלבנים בכד א' לבין מספר הכדורים הלבנים בכד ב'?</p>
          <p>(ii) מהו היחס בין מספר הכדורים בכד א' לבין מספר הכדורים בכד ב'?</p>
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>דן נבחן במשך השנה ב-33 מבחנים. היחס בין מספר ההצלחות למספר הכישלונות שלו הוא 10 : 1 .</p>
        <SubQuestion label="א."><p>בכמה מבחנים הצליח דן?</p></SubQuestion>
        <SubQuestion label="ב.">
          <p>רונן נבחן במשך השנה רק ב-32 מבחנים. היחס בין מספר הכישלונות למספר ההצלחות שלו הוא 7 : 1 . בחרו באפשרות הנכונה ונמקו תשובתכם.</p>
          <p>(i) לדן ולרונן אותו מספר כישלונות.</p>
          <p>(ii) לדן מספר כישלונות גדול יותר מאשר לרונן.</p>
          <p>(iii) לדן מספר כישלונות קטן יותר מאשר לרונן.</p>
        </SubQuestion>
      </Question>
    </PageLayout>
  );
}

// ── Page 7 (NEW): זיהוי יחס בקבוצות וציורים – Q1, Q3, Q6, Q9, Q10 ──
export function Ch1Page7() {
  return (
    <PageLayout pageNumber={7} chapter={CH}>
      <Question>
        <p>בסרטוט שלפניכם מלבנים מקווקווים ומלבנים שאינם מקווקווים. מהו היחס בין מספר המלבנים המקווקווים לבין מספר המלבנים שאינם מקווקווים?</p>
        <div className="svg-center">
          <svg viewBox="0 0 280 60" width="260" height="56">
            <defs>
              <pattern id="dots1" patternUnits="userSpaceOnUse" width="6" height="6">
                <circle cx="3" cy="3" r="1" fill="#000" />
              </pattern>
            </defs>
            {[
              { x: 10, dotted: true }, { x: 50, dotted: true }, { x: 90, dotted: true },
              { x: 130, dotted: false }, { x: 170, dotted: false },
              { x: 210, dotted: true }, { x: 250, dotted: false },
            ].map((r, i) => (
              <rect key={i} x={r.x} y={10} width={32} height={40} fill={r.dotted ? 'url(#dots1)' : '#fff'} stroke="#000" strokeWidth="1.2" />
            ))}
          </svg>
        </div>
        <AnswerLine label="היחס :" />
      </Question>

      <QSep />

      <Question>
        <SubQuestion label="א.">
          <p>מצאו לגבי כל סרטוט מהו היחס בין מספר המשולשים הצבועים למספר המשולשים שאינם צבועים.</p>
          <div className="triangle-grid">
            {[
              { label: '(i)', filled: [false,false,false,false,false,false,false,false,true,true] },
              { label: '(ii)', filled: [false,true,false,true,false,false,false] },
              { label: '(iii)', filled: [false,false,false,false,false,false,true,true,true] },
              { label: '(iv)', filled: [false,false,false,true,true] },
            ].map((row, i) => {
              const w = row.filled.length * 16;
              return (
                <div key={i} className="triangle-grid__row">
                  <span className="row-label">{row.label}</span>
                  <svg viewBox={`0 0 ${w} 16`} width={w} height={16}>
                    {row.filled.map((f, j) => (
                      <polygon key={j} points={`${j*16+8},2 ${j*16+15},14 ${j*16+1},14`} fill={f ? '#000' : '#fff'} stroke="#000" strokeWidth="1" />
                    ))}
                  </svg>
                  <span className="txt-sm">היחס: <span className="inline-blank w-50" /></span>
                </div>
              );
            })}
          </div>
        </SubQuestion>
        <SubQuestion label="ב."><p>באילו מהסעיפים מתקבל אותו יחס בין מספר המשולשים הצבועים לבין מספר המשולשים שאינם צבועים?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בציור שלפניכם מתוארת מחרוזת.</p>
        <div className="svg-center svg-center--tight">
          <svg viewBox="0 0 240 18" width="230" height="16">
            {[1,0,1,1,0,1,1,0,1,0].map((f, i) => (
              <circle key={i} cx={12 + i * 24} cy={9} r={7} fill={f ? '#000' : '#fff'} stroke="#000" strokeWidth="1" />
            ))}
          </svg>
        </div>
        <SubQuestion label="א."><p>מהו היחס בין מספר החרוזים הצבועים לבין מספר החרוזים שאינם צבועים?</p></SubQuestion>
        <SubQuestion label="ב.">
          <p>ציירו שתי מחרוזות נוספות כך שיישמר היחס בין מספר החרוזים הצבועים לבין מספר החרוזים שאינם צבועים.</p>
          <div className="drawing-box min-h-40"><p className="drawing-label">מחרוזת 1 :</p></div>
          <div className="drawing-box min-h-40"><p className="drawing-label">מחרוזת 2 :</p></div>
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בזר פרחים יש 12 פרחים אדומים ו-6 פרחים לבנים.</p>
        <SubQuestion label="א."><p>מהו היחס בין מספר הפרחים הלבנים לבין מספר הפרחים האדומים?</p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין מספר הפרחים האדומים למספר הפרחים בזר?</p></SubQuestion>
        <SubQuestion label="ג."><p>מהו היחס בין מספר הפרחים הלבנים למספר הפרחים בזר?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>היחס בין מספר העטים בקלמר א' לבין מספר העטים בקלמר ב' הוא 7 : 2 .</p>
        <SubQuestion label="א."><p>אם מספר העטים בקלמר ב' הוא 21, מהו מספר העטים בקלמר א'?</p></SubQuestion>
        <SubQuestion label="ב."><p>אם מספר העטים בקלמר א' הוא 10, מהו מספר העטים בקלמר ב'?</p></SubQuestion>
        <SubQuestion label="ג."><p>בשני הקלמרים יחד יש 36 עטים. מהו מספר העטים בכל קלמר?</p></SubQuestion>
      </Question>
    </PageLayout>
  );
}

// ── Page 8 (NEW): השלמת יחסים שווים וזוגות מספרים ──
export function Ch1Page8() {
  return (
    <PageLayout pageNumber={8} chapter={CH}>
      <div className="info-box">
        <p>זוג יחסים נחשב <strong>שווה</strong> אם השברים המייצגים אותם זהים לאחר צמצום או הרחבה. למשל : 1 : 2 = 3 : 6 .</p>
      </div>

      <Question>
        <p>מצאו את <strong>המספר החסר</strong> בכל סעיף.</p>
        <div className="options-grid-2col gap-md" style={{ rowGap: '16px', columnGap: '26px' }}>
          <span>1 : 2  =  <Blank /> : 3</span>
          <span><Frac num={2} den={3} /> = <Frac num={6} den="□" /></span>
          <span>20 : <Blank />  =  2 : 5</span>
          <span><Frac num={2} den={5} /> = <Frac num={20} den="□" /></span>
          <span>3 : <Blank />  =  2 : 6</span>
          <span><Frac num={3} den={12} /> = <Frac num="□" den={8} /></span>
        </div>
      </Question>

      <QSep />

      <Question>
        <p>באילו מהיחסים הבאים היחס שווה ל - 2 : 5  ? <strong>הקיפו</strong> את היחסים המתאימים.</p>
        <div className="options-grid-2col gap-sm center">
          <span>10 : 25</span>
          <span><Frac num={12} den={36} /></span>
          <span><Frac num={5} den={2} /></span>
          <span>100 : 250</span>
          <span>20 : 50</span>
          <span>21 : 51</span>
          <span>12 : 15</span>
          <span><Frac num={50} den={125} /></span>
        </div>
      </Question>

      <QSep />

      <Question>
        <p>בכל סעיף, מצאו <strong>אם אפשר</strong> :</p>
        <SubQuestion label="א."><p>שני מספרים <strong>זוגיים</strong> שהיחס ביניהם הוא 1 : 3 . <Blank /></p></SubQuestion>
        <SubQuestion label="ב."><p>שני מספרים <strong>אי-זוגיים</strong> שהיחס ביניהם הוא 1 : 3 . <Blank /></p></SubQuestion>
        <SubQuestion label="ג."><p>שני מספרים <strong>אי-זוגיים</strong> שהיחס ביניהם הוא 2 : 3 . <Blank /></p></SubQuestion>
        <SubQuestion label="ד."><p>שני מספרים שסכומם 20 והיחס ביניהם הוא 2 : 3 . <Blank /></p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>על המדף 8 ספרים ו - 12 חוברות. כתבו <strong>שני יחסים</strong> מתאימים, ופרטו מה מייצג כל יחס. הביעו כל יחס גם כיחס מצומצם.</p>
        <AnswerLine label="יחס 1 :" />
        <AnswerLine label="יחס 2 :" />
      </Question>
    </PageLayout>
  );
}

// ── Page 36 (NEW): יישומי יחס – משולש, חיסכון, מלבן, כיתה ──
export function Ch1Page9() {
  return (
    <PageLayout pageNumber={36} chapter={CH}>
      <div className="info-box">
        <p>יחס מבטא את הקשר בין שני גדלים. אפשר להיעזר בו לחישוב חלקים מתוך שלם, לבדיקת שוויון בין כמויות ולפתרון בעיות מילוליות.</p>
      </div>

      <Question>
        <p>היקפו של משולש שווה - שוקיים הוא <strong>45 ס"מ</strong> . אורך השוק <strong>גדול פי 4</strong> מאורך הבסיס.</p>
        <SubQuestion label="א.">
          <p>מהו אורך הבסיס?</p>
          <WorkArea lines={3} />
          <FinalAnswer label="בסיס:" unit="ס״מ" />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>מהו אורך כל שוק?</p>
          <WorkArea lines={3} />
          <FinalAnswer label="שוק:" unit="ס״מ" />
        </SubQuestion>
        <SubQuestion label="ג.">
          <p>מהו היחס בין אורך הבסיס לאורך השוק?</p>
          <RatioAnswer />
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>ירון מקבל דמי כיס. על כל <strong>8 ש"ח</strong> שהוא מבזבז – הוא חוסך <strong>24 ש"ח</strong> .</p>
        <SubQuestion label="א.">
          <p>מהו היחס בין הסכום שירון חוסך לבין הסכום שהוא מבזבז?</p>
          <RatioAnswer />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>איזה חלק מדמי הכיס הוא חוסך?</p>
          <WorkArea lines={3} />
          <FinalAnswer />
        </SubQuestion>
        <SubQuestion label="ג.">
          <p>אם ירון קיבל <strong>96 ש"ח</strong> , כמה כסף חסך?</p>
          <WorkArea lines={3} />
          <FinalAnswer unit="ש״ח" />
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>אורכו של מלבן <strong>24 ס"מ</strong> ורוחבו <strong>6 ס"מ</strong> .</p>
        <SubQuestion label="א."><p>מהו היחס בין האורך לרוחב? <Blank /></p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין הרוחב להיקף? <Blank /></p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בכיתה <strong>30 תלמידים</strong> , מתוכם <strong>12 בנים</strong> .</p>
        <SubQuestion label="א."><p>מהו היחס בין מספר הבנים למספר הבנות? <Blank /></p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין מספר הבנים לכלל התלמידים בכיתה? <Blank /></p></SubQuestion>
      </Question>
    </PageLayout>
  );
}
