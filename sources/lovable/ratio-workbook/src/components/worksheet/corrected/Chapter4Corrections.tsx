import { Blank, CalculationResponse, Frac, PageLayout, QSep, Question, SubQuestion } from '../pages/PageLayout';

const CH = 'פרק 4 – האם היחס נשמר?';

export function RatioPage27() {
  return (
    <PageLayout pageNumber={27} chapter={CH}>
      <div className="info-box">
        <p>כפל או חילוק של כל איברי היחס באותו מספר חיובי שומרים על היחס. הוספה או הפחתה של אותו מספר אינן שומרות עליו בדרך כלל.</p>
      </div>

      <Question>
        <p>בצמיד 2 חרוזים אדומים ו־7 כחולים. הוסיפו 3 חרוזים מכל צבע.</p>
        <SubQuestion label="א."><p>מה היה היחס המקורי?</p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס החדש? האם היחס נשמר?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>במשרד 12 גברים ו־8 נשים. נוספו 2 גברים ו־2 נשים. האם היחס נשמר? הסבירו.</p>
      </Question>

      <QSep />

      <Question>
        <SubQuestion label="א."><p>באולם 25 מבוגרים ו־20 בני נוער. הצטרפו 5 מבוגרים ו־5 בני נוער. האם היחס נשמר?</p></SubQuestion>
        <SubQuestion label="ב."><p>באולם אחר הצטרפו 5 מבוגרים ו־4 בני נוער. האם היחס נשמר?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>נתון היחס <Frac num={3} den={7} />. הוסיפו 3 למונה ולמכנה. האם התקבל יחס שווה?</p>
      </Question>

      <QSep />

      <Question>
        <p>נתון היחס <Frac num={4} den={9} />. הוסיפו 12 למונה. כמה יש להוסיף למכנה כדי לשמור על היחס?</p>
        <CalculationResponse lines={3} />
      </Question>

      <QSep />

      <Question>
        <p>בכד 17 כדורים לבנים ו־34 כחולים. הציעו שתי דרכים שונות להוסיף כדורים כך שהיחס יישמר.</p>
      </Question>

      <QSep />

      <Question>
        <p>נתון היחס <Frac num={14} den={18} />. חסרו 7 מהמונה. כמה יש לחסר מהמכנה כדי לשמור על היחס?</p>
        <CalculationResponse lines={3} />
      </Question>

      <QSep />

      <Question>
        <p>לעוגיות מערבבים 2 חלבוני ביצה, 4 כפות סוכר ו־2 כוסות קוקוס.</p>
        <SubQuestion label="א."><p>אם משתמשים ב־8 כפות סוכר, דרושים <Blank /> חלבונים ו־<Blank /> כוסות קוקוס.</p></SubQuestion>
        <SubQuestion label="ב."><p>אם משתמשים ב־3 חלבונים, דרושות <Blank /> כפות סוכר ו־<Blank /> כוסות קוקוס.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בפינת חי 8 ארנבים, 4 שרקנים ו־20 כלבלבים.</p>
        <SubQuestion label="א."><p>מהו היחס המצומצם שרקנים : כלבלבים : ארנבים?</p></SubQuestion>
        <SubQuestion label="ב."><p>האם היחס נשמר אם מכפילים את מספר בעלי החיים מכל סוג פי 3?</p></SubQuestion>
        <SubQuestion label="ג."><p>כמה ארנבים וכמה כלבלבים יש להוסיף כדי לקבל יחס שרקנים : כלבלבים : ארנבים = 1 : 6 : 3?</p></SubQuestion>
      </Question>
    </PageLayout>
  );
}
