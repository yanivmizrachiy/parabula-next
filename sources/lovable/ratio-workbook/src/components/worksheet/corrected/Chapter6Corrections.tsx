import {
  CalculationResponse,
  FinalAnswer,
  Frac,
  PageLayout,
  QSep,
  Question,
  SubQuestion,
  WorkArea,
} from '../pages/PageLayout';

const CH = 'פרק 6 – פרופורציה';
const TOPIC = 'יחס ופרופורציה';

export function RatioPage35() {
  return (
    <PageLayout pageNumber={35} chapter={CH} topic={TOPIC} className="ratio-page-35">
      <Question>
        <p>בכל סעיף בדקו אם מתקיימת פרופורציה ונמקו.</p>
        <SubQuestion label="א.">
          <p>באולם רקפת 35 שולחנות ו־350 כיסאות; באולם כלנית 40 שולחנות ו־400 כיסאות.</p>
          <WorkArea label="נימוק:" lines={2} />
          <FinalAnswer />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>בקלמר של דינה 12 טושים ו־3 עפרונות; בקלמר של מירי 8 טושים ו־2 עפרונות.</p>
          <WorkArea label="נימוק:" lines={2} />
          <FinalAnswer />
        </SubQuestion>
        <SubQuestion label="ג.">
          <p>בקייטנה אחת 24 חניכים ו־3 מדריכים; בקייטנה אחרת 30 חניכים ו־5 מדריכים.</p>
          <WorkArea label="נימוק:" lines={2} />
          <FinalAnswer />
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>לגדי 15 גולות כחולות ו־6 אדומות; לדני 10 כחולות ו־4 אדומות.</p>
        <SubQuestion label="א.">
          <p>מהו היחס כחולות : אדומות אצל כל ילד?</p>
          <FinalAnswer type="ratio" />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>מהו היחס בין מספרי הגולות האדומות של גדי ודני?</p>
          <FinalAnswer type="ratio" />
        </SubQuestion>
        <SubQuestion label="ג.">
          <p>מהו היחס בין מספרי הגולות הכחולות של גדי ודני?</p>
          <FinalAnswer type="ratio" />
        </SubQuestion>
        <SubQuestion label="ד.">
          <p>כתבו פרופורציה נכונה המתארת את הנתונים.</p>
          <WorkArea lines={2} />
          <FinalAnswer />
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>במשפחת פרץ: אבא בן 42, אימא בת 39, עדינה בת 14 ונעמי בת 13.</p>
        <SubQuestion label="א.">
          <p>הסבירו במילים את הפרופורציה <Frac num={42} den={39} /> = <Frac num={14} den={13} />.</p>
          <WorkArea label="נימוק:" lines={2} />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>הסבירו במילים את הפרופורציה <Frac num={42} den={14} /> = <Frac num={39} den={13} />.</p>
          <WorkArea label="נימוק:" lines={2} />
        </SubQuestion>
        <SubQuestion label="ג.">
          <p>כתבו פרופורציה נוספת בין הגילים.</p>
          <FinalAnswer />
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בהדרים 600 משפחות ובנטעים 1,000 משפחות. עלות תיקון הכביש היא 400,000 ש״ח, והיא מתחלקת ביחס למספר המשפחות.</p>
        <SubQuestion label="א."><p>כמה ישלם כל יישוב?</p></SubQuestion>
        <SubQuestion label="ב."><p>שלוש דרכי פתרון שונות משתמשות במשתנים בעלי משמעות שונה:</p></SubQuestion>
        <div className="info-box">
          <p><strong>דרך I:</strong> ‏u הוא המחיר למשפחה: ‏1000u + 600u = 400000.</p>
          <p><strong>דרך II:</strong> ‏v הוא ערכו של חלק אחד ביחס 5 : 3: ‏5v + 3v = 400000.</p>
          <p><strong>דרך III:</strong> ‏w הוא הסכום שמשלמת הדרים: <Frac num={600} den={1600} /> = <Frac num="w" den={400000} />.</p>
        </div>
        <p>פתרו בכל דרך והסבירו מה מייצג המשתנה.</p>
        <div className="response-set ratio-page-35-response ratio-page-35-response--methods">
          <WorkArea label="שלוש דרכי פתרון והסבר:" lines={4} />
          <FinalAnswer label="הדרים:" unit="ש״ח" />
          <FinalAnswer label="נטעים:" unit="ש״ח" />
        </div>
      </Question>

      <QSep />

      <Question>
        <p>בבריכת דגים סימנו 100 דגים והחזירו אותם. במדגם נוסף של 80 דגים נמצאו 4 מסומנים.</p>
        <p>כתבו אומדן למספר הדגים בבריכה והסבירו את הפרופורציה שבה השתמשתם.</p>
        <CalculationResponse lines={2} unit="דגים" />
      </Question>
    </PageLayout>
  );
}
