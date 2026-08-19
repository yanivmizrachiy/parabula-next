import {
  Blank,
  Checkbox,
  PageLayout,
  QSep,
  Question,
  RatioAnswer,
  SubQuestion,
  WorkArea,
  WorksheetTable,
} from '../pages/PageLayout';

const CH = 'פרק 1 – יסודות היחס';

function Diamond({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      shapeRendering="geometricPrecision"
    >
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
    <PageLayout pageNumber={1} chapter={CH} className="ratio-page-1">
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
          <Checkbox />
        </div>
        <div className="circle-option">
          <div className="circles-box">
            <div className="circles-row"><Diamond filled /><Diamond /><Diamond /></div>
            <div className="circles-row"><Diamond filled /><Diamond filled /><Diamond /></div>
            <div className="circles-row"><Diamond filled /><Diamond filled /><Diamond /></div>
          </div>
          <Checkbox />
        </div>
        <div className="circle-option">
          <div className="circles-box">
            <div className="circles-row"><Diamond filled /><Diamond filled /><Diamond /></div>
            <div className="circles-row"><Diamond filled /><Diamond filled /><Diamond /></div>
            <div className="circles-row"><Diamond filled /><Diamond filled /><Diamond /></div>
          </div>
          <Checkbox />
        </div>
        <div className="circle-option">
          <div className="circles-box">
            <div className="circles-row"><Diamond filled /><Diamond /><Diamond /></div>
            <div className="circles-row"><Diamond /><Diamond /><Diamond /></div>
            <div className="circles-row"><Diamond filled /><Diamond /><Diamond /></div>
          </div>
          <Checkbox />
        </div>
      </div>
      <WorkArea lines={2} label="הסבירו את בחירתכם:" />

      <QSep />

      <Question>
        <p>היחס בין מספר העיגולים השחורים למספר העיגולים הלבנים הוא 3 : 2.</p>
        <p>ציירו שתי אפשרויות שונות המתאימות לנתונים:</p>
        <div className="drawing-box"><p className="drawing-label">אפשרות א׳:</p></div>
        <div className="drawing-box"><p className="drawing-label">אפשרות ב׳:</p></div>
      </Question>
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
        <SubQuestion label="ב.">
          <p>מה היחס בין מספר המשבצות השחורות למספר המשבצות הלבנות? <RatioAnswer inline /></p>
        </SubQuestion>
        <SubQuestion label="ג."><p><strong>השלימו:</strong> מספר המשבצות השחורות גדול פי <Blank /> ממספר המשבצות הלבנות.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>אלי שיחק עם חבריו בגולות אדומות וגולות לבנות.</p>
        <SubQuestion label="א."><p>בתום המשחק מספר הגולות האדומות של אלי <strong>גָדַל פי 2</strong> וגם מספר הגולות הלבנות גָדַל פי 2. האם היחס בין מספר הגולות האדומות למספר הלבנות השתנה? <Blank /></p></SubQuestion>
        <SubQuestion label="ב.">
          <p>לרפי <strong>נוספו</strong> 2 גולות אדומות וגם 2 גולות לבנות, והיחס לא השתנה. מהו היחס שהיה לרפי לפני המשחק? <RatioAnswer inline /></p>
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p><strong>הרחבת היחס 3 : 2</strong></p>
        <p>השלימו את הטבלה כך שבכל שורה יישמר היחס בין מספר העיגולים השחורים למספר העיגולים הלבנים.</p>
        <WorksheetTable
          className="wt-ltr"
          headers={['מספר העיגולים הכולל', 'עיגולים לבנים', 'עיגולים שחורים']}
          rows={[
            ['5', '2', '3'],
            ['10', '4', '6'],
            [<Blank />, '6', <Blank />],
            ['25', <Blank />, <Blank />],
          ]}
        />
        <SubQuestion label="א."><p>מהו גורם ההרחבה מן השורה הראשונה אל השורה הרביעית? <Blank /></p></SubQuestion>
        <SubQuestion label="ב."><p>כתבו אפשרות נוספת שבה היחס הוא 3 : 2 ומספר העיגולים הכולל גדול מ־25.</p></SubQuestion>
        <RatioAnswer label="אפשרות נוספת:" />
        <SubQuestion label="ג.">
          <p>בקבוצה יש 6 עיגולים שחורים ו־4 עיגולים לבנים. הוסיפו 3 שחורים ו־2 לבנים. האם היחס נשמר? הסבירו.</p>
          <WorkArea lines={2} className="ratio-page-1-inline-explanation" />
        </SubQuestion>
        <SubQuestion label="ד.">
          <p>לקבוצה המקורית הוסיפו 2 עיגולים מכל צבע. האם היחס נשמר? נמקו באמצעות יחס מצומצם.</p>
          <WorkArea lines={2} className="ratio-page-1-inline-explanation" />
        </SubQuestion>
      </Question>
    </PageLayout>
  );
}
