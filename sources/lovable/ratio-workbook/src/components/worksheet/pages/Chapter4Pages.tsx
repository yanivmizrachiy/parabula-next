import { PageLayout, Question, SubQuestion, Blank, Frac, QSep, AnswerLine, WorkArea, FinalAnswer, CalculationResponse } from './PageLayout';

const CH = 'פרק 4 – שמירת יחס ושיעור ליחידה';

// ── Page 15: All Ch4 questions on a single page ──
export function Ch4Page1() {
  return (
    <PageLayout pageNumber={27} chapter={CH}>
      <div className="info-box">
        <p>"יחס", כמו שלמדנו, הוא כלי מתמטי המאפשר לנו להשוות בין שתי קבוצות של גדלים. כשמוסיפים, מחסירים, מכפילים או מחלקים – עלינו לבדוק: <strong>האם היחס נשמר?</strong></p>
      </div>

      <Question>
        <p>בצמיד 2 חרוזים אדומים ו- 7 חרוזים כחולים. הוסיפו לצמיד 3 חרוזים מכל צבע.</p>
        <SubQuestion label="א."><p>מה היחס בין מספר החרוזים האדומים למספר הכחולים בצמיד המקורי?</p></SubQuestion>
        <SubQuestion label="ב."><p>מה היחס החדש? האם הוא שווה ליחס בצמיד המקורי? הסבירו.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>במשרד עובדים 12 גברים ו- 8 נשים. למשרד התווספו 2 גברים ו- 2 נשים. האם היחס בין מספר הגברים למספר הנשים נשמר? הסבירו.</p>
      </Question>

      <QSep />

      <Question>
        <SubQuestion label="א."><p>באולם 25 מבוגרים ו- 20 בני נוער. הצטרפו 5 מבוגרים ו- 5 בני נוער. האם היחס נשמר? הסבירו.</p></SubQuestion>
        <SubQuestion label="ב."><p>באולם אחר 25 מבוגרים ו- 20 בני נוער. הצטרפו 5 מבוגרים ו- 4 בני נוער. האם היחס נשמר? הסבירו.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>נתון היחס <Frac num={3} den={7} /> . הוסיפו למונה 3 ולמכנה 3. האם היחס נשמר?</p>
      </Question>

      <QSep />

      <Question>
        <p>נתן היחס <Frac num={4} den={9} /> . הוסיפו למונה 12. כמה יש להוסיף למכנה כדי שהיחס לא ישתנה?</p>
      </Question>

      <QSep />

      <Question>
        <p>בכד של מיכל 17 כדורים לבנים ו- 34 כדורים כחולים. הציעו דרך להוסיף כדורים לבנים וכחולים כך שהיחס ביניהם יישמר.</p>
      </Question>

      <QSep />

      <Question>
        <p>נתון היחס <Frac num={14} den={18} /> . חסרו מהמונה 7. כמה יש לחסר מהמכנה כדי שהיחס לא ישתנה?</p>
      </Question>

      <QSep />

      <Question>
        <p>להכנת עוגיות קוקוס יש לערבב 2 חלבוני ביצה, 4 כפות סוכר ו-2 כוסות קוקוס טחון. השלימו :</p>
        <SubQuestion label="א."><p>אם בטעות הוכנסו 8 כפות סוכר, נדרש <Blank /> חלבוני ביצה ו-<Blank /> כוסות קוקוס טחון.</p></SubQuestion>
        <SubQuestion label="ב."><p>אם בטעות הוכנסו 3 חלבוני ביצה, נדרש <Blank /> כפות סוכר ו-<Blank /> כוסות קוקוס טחון.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בפינת חי 8 ארנבים, 4 שרקנים ו-20 כלבלבים.</p>
        <SubQuestion label="א."><p>חשבו את היחס בין מספר השרקנים לכלבלבים לארנבים בפינת החי.</p></SubQuestion>
        <SubQuestion label="ב.">
          <p>הקיפו את התשובה הנכונה :</p>
          <p>1) היחס <u>ישתנה / לא ישתנה</u> אם מספר בעלי החיים מכל סוג יגדל פי שלושה.</p>
          <p>2) היחס <u>ישתנה / לא ישתנה</u> אם מספר בעלי החיים מכל סוג יקטן ב-2.</p>
        </SubQuestion>
        <SubQuestion label="ג."><p>כדי שהיחס יהיה 1:3:6 יש להוסיף <Blank /> ארנבים ו<Blank /> כלבלבים.</p></SubQuestion>
      </Question>
    </PageLayout>
  );
}

// ── Page 26 (NEW): האם היחס נשמר – העמקה (חבלים, צבעים, מתכון) ──
export function Ch4Page2() {
  return (
    <PageLayout pageNumber={28} chapter={CH}>
      <div className="info-box">
        <p>צמצום או הרחבה של יחס – אינם משנים אותו. <strong>הוספה</strong> או <strong>הפחתה</strong> של מספר קבוע משנות אותו לרוב.</p>
      </div>

      <Question>
        <p>היחס בין אורכי שני חבלים הוא 17 : 13 . באיזה מהמקרים הבאים <strong>יישמר</strong> אותו יחס? הסבירו.</p>
        <SubQuestion label="א."><p>מאריכים כל חבל ב - 5 ס"מ.   <Blank /></p></SubQuestion>
        <SubQuestion label="ב."><p>מקצרים כל חבל ב - 5 ס"מ.   <Blank /></p></SubQuestion>
        <SubQuestion label="ג."><p>מאריכים כל חבל פי 5 .   <Blank /></p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בכוס I  ערבבו 2 טיפות צבע כחול ו - 5 טיפות צבע צהוב.</p>
        <p>בכוס II ערבבו 3 טיפות צבע כחול ו - 7 טיפות צבע צהוב.</p>
        <p>באיזו כוס התקבל צבע ירוק <strong>כהה יותר</strong>? הסבירו על-ידי השוואת היחסים.</p>
        <WorkArea lines={2} label="השוואת היחסים:" />
        <WorkArea lines={2} label="הסבר :" />
      </Question>

      <QSep />

      <Question>
        <p>איילת מכינה עוגה לפי המתכון : 2 כוסות קמח , <Frac num={1} den={2} /> כוס שמן , 2 כוסות סוכר , <Frac num={1} den={2} /> כוס קקאו , 3 ביצים.</p>
        <SubQuestion label="א."><p>מהו היחס בין כמות הקמח לכמות השמן במתכון? <Blank /></p></SubQuestion>
        <SubQuestion label="ב."><p>איילת הכינה עוגה גדולה יותר, והשתמשה ב - 2 כוסות שמן. כמה כוסות קמח עליה להוסיף?</p></SubQuestion>
        <SubQuestion label="ג."><p>אילו רכיבים מופיעים במתכון ביחס 1 : 1 ?  ביחס 1 : 4 ?  ביחס 4 : 1 ?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>רותי בחרה גוון ורוד וערבבה 2 פחיות צבע אדום עם 7 פחיות צבע לבן ( כל פחית – 1 ליטר ). היא זקוקה ל - 27 ליטרים.</p>
        <SubQuestion label="א."><p>האם הכמות שערבבה רותי מספיקה? <Blank /></p></SubQuestion>
        <SubQuestion label="ב."><p>נועם הציע <strong>להגדיל</strong> את הכמות של כל צבע פי 3 . האם יתקבל אותו גוון? האם הכמות תספיק?</p></SubQuestion>
        <SubQuestion label="ג."><p>מירי הציעה <strong>להוסיף</strong> 9 פחיות אדום ו - 9 פחיות לבן. האם יישמר היחס? הסבירו.</p></SubQuestion>
      </Question>
    </PageLayout>
  );
}

// ── Page 34 (NEW): יחס בין גדלים מסוגים שונים – יחידות מידה ──
export function Ch4Page3() {
  const TOPIC2 = 'יחס ויחידות מידה';
  return (
    <PageLayout pageNumber={34} chapter={CH} topic={TOPIC2}>
      <div className="info-box">
        <p>יחס בין גדלים <strong>מאותו סוג</strong> אינו משתנה כשמשנים יחידות מידה. יחס בין גדלים <strong>מסוגים שונים</strong> ( כגון <strong>מחיר ליחידה</strong> או <strong>מהירות</strong> ) נמדד <strong>ביחידות</strong> ( ש"ח ל - 100 גרם , ק"מ לליטר וכו' ) .</p>
      </div>

      <Question>
        <p>יוסי עורך נסיעות מבחן. מכונית "סעו - נא" צרכה <strong>18 ליטר</strong> דלק ב - <strong>207 ק"מ</strong> . מכונית "הנוסעים" צרכה <strong>14 ליטר</strong> ב - <strong>175 ק"מ</strong> .</p>
        <SubQuestion label="א.">
          <p>כמה ק"מ נוסעת כל מכונית לליטר אחד?</p>
          <WorkArea lines={2} />
          <FinalAnswer label="סעו-נא :" unit='ק"מ' />
          <FinalAnswer label="הנוסעים :" unit='ק"מ' />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>כמה ק"מ תעבור כל מכונית ב - 25 ליטרים?</p>
          <WorkArea lines={2} />
          <FinalAnswer label="סעו-נא :" unit='ק"מ' />
          <FinalAnswer label="הנוסעים :" unit='ק"מ' />
        </SubQuestion>
        <SubQuestion label="ג.">
          <p>כמה דלק תצרוך כל אחת בנסיעה של 150 ק"מ?</p>
          <WorkArea lines={2} />
          <FinalAnswer label="סעו-נא :" unit="ליטר" />
          <FinalAnswer label="הנוסעים :" unit="ליטר" />
        </SubQuestion>
        <SubQuestion label="ד."><p>איזו מכונית חסכונית יותר? <Blank /></p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>נתונים המוצרים הבאים. <strong>קִבעו</strong> איזה מהם הוא, <strong>באופן יחסי</strong>, היקר ביותר. <span className="text-muted-foreground">( 1 ליטר = 1,000 מ"ל )</span></p>
        <SubQuestion label="א.">
          <p>פחית שתייה : 250 מ"ל , 5 ש"ח</p>
          <WorkArea lines={2} />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>קרם גוף : 200 מ"ל , 42 ש"ח</p>
          <WorkArea lines={2} />
        </SubQuestion>
        <SubQuestion label="ג.">
          <p>בקבוק בושם : 50 מ"ל , 120 ש"ח</p>
          <WorkArea lines={2} />
        </SubQuestion>
        <SubQuestion label="ד.">
          <p>דיו למדפסת : 42 מ"ל , 118 ש"ח</p>
          <WorkArea lines={2} />
        </SubQuestion>
        <SubQuestion label="ה.">
          <p>טיפות עיניים : 15 מ"ל , 23 ש"ח</p>
          <WorkArea lines={2} />
        </SubQuestion>
        <AnswerLine label="היקר ביותר ליחידת נפח :" />
      </Question>

      <QSep />

      <Question>
        <p>בקבוק מכיל <strong>150 גרם</strong> סירופ שוקולד ובו <strong>450 קלוריות</strong> .</p>
        <SubQuestion label="א.">
          <p>כמה קלוריות בבקבוק של 500 גרם סירופ?</p>
          <CalculationResponse lines={3} unit="קלוריות" />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>כמה סירופ יש לצרוך כדי לצבור 1,000 קלוריות?</p>
          <CalculationResponse lines={3} unit="גרם" />
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>יהודית עבדה בספרייה <strong>20 שעות</strong> והשתכרה <strong>360 ש"ח</strong> . מרים הדריכה בקייטנה <strong>12 שעות</strong> והרוויחה <strong>216 ש"ח</strong> . האם השכר לשעת עבודה שווה?</p>
        <WorkArea lines={3} label="פתרון :" />
        <FinalAnswer />
      </Question>

      <QSep />

      <Question>
        <p>בסופרמרקט מוכרים עוגיות בשתי אריזות : <strong>אריזה משפחתית</strong> – 480 גרם ב - 7.20 ש"ח , <strong>אריזה רגילה</strong> – 200 גרם ב - 3.20 ש"ח . איזו אריזה חסכונית יותר? <span className="text-muted-foreground">( השוו מחיר ל - 100 גרם )</span></p>
      </Question>
    </PageLayout>
  );
}
