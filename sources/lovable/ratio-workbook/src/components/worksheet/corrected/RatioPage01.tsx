import { Blank, Checkbox, PageLayout, QSep, Question, SubQuestion } from '../pages/PageLayout';

const CH = 'פרק 1 – יסודות היחס';

function Diamond({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <polygon
        points="12,2 22,12 12,22 2,12"
        fill={filled ? '#000' : '#fff'}
        stroke="#000"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RatioPage01() {
  return (
    <PageLayout pageNumber={1} chapter={CH}>
      <Question>
        <p>סמנו את האיור שבו היחס בין מספר המעויינים השחורים לבין מספר המעויינים הלבנים הוא 2 : 1.</p>
      </Question>
      <div className="circles-grid" aria-label="ארבע אפשרויות של קבוצות מעויינים שחורים ולבנים">
        <div className="circle-option">
          <div className="circles-box">
            <div className="circles-row"><Diamond filled /><Diamond /><Diamond /></div>
            <div className="circles-row"><Diamond filled /><Diamond filled /><Diamond filled /></div>
            <div className="circles-row"><Diamond filled /><Diamond filled /><Diamond filled /></div>
          </div>
          <Checkbox label="4" />
        </div>
        <div className="circle-option">
          <div className="circles-box">
            <div className="circles-row"><Diamond filled /><Diamond /><Diamond /></div>
            <div className="circles-row"><Diamond filled /><Diamond filled /><Diamond /></div>
            <div className="circles-row"><Diamond filled /><Diamond filled /><Diamond /></div>
          </div>
          <Checkbox label="3" />
        </div>
        <div className="circle-option">
          <div className="circles-box">
            <div className="circles-row"><Diamond filled /><Diamond filled /><Diamond /></div>
            <div className="circles-row"><Diamond filled /><Diamond filled /><Diamond /></div>
            <div className="circles-row"><Diamond filled /><Diamond filled /><Diamond /></div>
          </div>
          <Checkbox label="2" />
        </div>
        <div className="circle-option">
          <div className="circles-box">
            <div className="circles-row"><Diamond filled /><Diamond /><Diamond /></div>
            <div className="circles-row"><Diamond /><Diamond /><Diamond /></div>
            <div className="circles-row"><Diamond filled /><Diamond /><Diamond /></div>
          </div>
          <Checkbox label="1" />
        </div>
      </div>

      <QSep />

      <Question>
        <p>היחס בין מספר העיגולים השחורים למספר העיגולים הלבנים הוא 3 : 2.</p>
        <p>ציירו שתי אפשרויות שונות המתאימות לנתונים:</p>
      </Question>
      <div className="drawing-box"><p className="drawing-label">אפשרות א׳:</p></div>
      <div className="drawing-box"><p className="drawing-label">אפשרות ב׳:</p></div>
      <p><strong>השלימו:</strong> על כל <Blank /> עיגולים שחורים צריך לצייר <Blank /> עיגולים לבנים.</p>
      <p>מספר העיגולים השחורים חייב להתחלק ב־<Blank />.</p>
      <p>מספר העיגולים הלבנים חייב להיות מספר שמתחלק ב־<Blank />.</p>
      <p>מספר העיגולים הכולל הוא מספר שמתחלק ב־<Blank />.</p>

      <QSep />

      <Question>
        <SubQuestion label="א.">
          <p>צבעו משבצות כך שעל כל משבצת לבנה יהיו 4 משבצות שחורות.</p>
          <div className="grid-5x1 mt-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="grid-cell" />
            ))}
          </div>
        </SubQuestion>
        <SubQuestion label="ב."><p>מה היחס בין מספר המשבצות השחורות למספר המשבצות הלבנות?</p></SubQuestion>
        <SubQuestion label="ג."><p><strong>השלימו:</strong> מספר המשבצות השחורות גדול פי <Blank /> ממספר המשבצות הלבנות.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>אלי שיחק עם חבריו בגולות אדומות וגולות לבנות.</p>
        <SubQuestion label="א."><p>בתום המשחק מספר הגולות האדומות של אלי <strong>גָדַל פי 2</strong> וגם מספר הגולות הלבנות גָדַל פי 2. האם היחס בין מספר הגולות האדומות למספר הלבנות השתנה? <Blank /></p></SubQuestion>
        <SubQuestion label="ב."><p>לרפי <strong>נוספו</strong> 2 גולות אדומות וגם 2 גולות לבנות, והיחס לא השתנה. מהו היחס שהיה לרפי לפני המשחק? <Blank /></p></SubQuestion>
      </Question>
    </PageLayout>
  );
}
