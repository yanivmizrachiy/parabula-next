import {
  AnswerLine,
  Blank,
  CalculationResponse,
  Checkbox,
  Frac,
  PageLayout,
  QSep,
  Question,
  RatioAnswer,
  SubQuestion,
  WorksheetTable,
} from '../pages/PageLayout';

const CH = 'פרק 3 – כתיבה, צמצום והשוואת יחסים';

function TilingModel() {
  const cells = Array.from({ length: 10 }, (_, index) => index < 4);
  return (
    <div className="svg-center svg-center--tight">
      <svg viewBox="0 0 250 55" width="310" height="68" role="img" aria-label="דגם ריצוף ובו ארבעה אריחים כחולים ושישה לבנים">
        {cells.map((blue, index) => (
          <rect key={index} x={5 + index * 24} y="8" width="22" height="38" fill={blue ? '#1e40af' : '#fff'} stroke="#172554" strokeWidth="1" />
        ))}
      </svg>
    </div>
  );
}

function NecklaceModel({ red, blue }: { red: number; blue: number }) {
  return (
    <svg viewBox={`0 0 ${(red + blue) * 18 + 6} 24`} width={(red + blue) * 18 + 6} height="24" aria-hidden="true">
      {Array.from({ length: red }).map((_, index) => (
        <circle key={`r-${index}`} cx={12 + index * 18} cy="12" r="7" fill="#b91c1c" stroke="#172554" strokeWidth="1" />
      ))}
      {Array.from({ length: blue }).map((_, index) => (
        <circle key={`b-${index}`} cx={12 + (red + index) * 18} cy="12" r="7" fill="#1e40af" stroke="#172554" strokeWidth="1" />
      ))}
    </svg>
  );
}

function PopulationChart() {
  const years = [
    { label: '1955', values: [35, 60, 5] },
    { label: '2006', values: [28, 62, 10] },
  ];
  const colors = ['#1e40af', '#b08838', '#9ca3af'];
  const y = (value: number) => 135 - value * 1.7;
  const legend = ['צעירים', 'בוגרים', 'קשישים'];
  return (
    <div className="bar-chart-container compact">
      <svg viewBox="0 0 360 160" className="bar-chart" role="img" aria-label="התפלגות צעירים בוגרים וקשישים בשנים 1955 ו־2006">
        {[0, 10, 20, 30, 40, 50, 60, 70].map((value) => (
          <g key={value}>
            <line x1="35" y1={y(value)} x2="345" y2={y(value)} stroke="#e2e2e2" strokeWidth="0.5" />
            <text x="29" y={y(value) + 3} textAnchor="end" direction="ltr">{value}%</text>
          </g>
        ))}
        {years.map((year, yearIndex) => (
          <g key={year.label}>
            {year.values.map((value, itemIndex) => {
              const x = 65 + yearIndex * 160 + itemIndex * 36;
              return (
                <g key={itemIndex}>
                  <rect x={x} y={y(value)} width="26" height={135 - y(value)} fill={colors[itemIndex]} stroke="#172554" strokeWidth="0.5" />
                  <text x={x + 13} y={y(value) - 3} textAnchor="middle" direction="ltr">{value}%</text>
                </g>
              );
            })}
            <text x={101 + yearIndex * 160} y="153" textAnchor="middle" direction="ltr">{year.label}</text>
          </g>
        ))}
      </svg>
      {/* legend BELOW the plot with colour swatches — never overlaps the bars, and shows which
          colour is which age group (the old top text-legend had no swatches). */}
      <div className="bar-chart-legend">
        {legend.map((label, i) => (
          <span key={label} className="bar-chart-legend-item">
            <span className="bar-chart-swatch" style={{ background: colors[i] }} />{label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function RatioPage18() {
  return (
    <PageLayout pageNumber={18} chapter={CH} className="ratio-page-18">
      <Question>
        <p>בדגם הריצוף יש 6 אריחים לבנים ו־4 אריחים כחולים. מהו היחס בין מספר האריחים הלבנים למספר האריחים הכחולים?</p>
        <TilingModel />
        <div className="options-row"><span>א. 3 : 2</span><span>ב. 3 : 5</span><span>ג. 2 : 5</span><span>ד. 2 : 3</span></div>
      </Question>

      <QSep />

      <Question>
        <p>במחרוזת יש 4 חרוזים אדומים ו־6 חרוזים כחולים.</p>
        <div className="svg-center svg-center--tight"><NecklaceModel red={4} blue={6} /></div>
        <SubQuestion label="א."><p>מהו היחס בין האדומים לכחולים? <RatioAnswer inline /></p></SubQuestion>
        <SubQuestion label="ב."><p>באיזו מחרוזת נשמר אותו יחס? <Blank /></p></SubQuestion>
        <div className="svg-figure-row">
          <div className="svg-cell"><span>1</span><NecklaceModel red={6} blue={9} /></div>
          <div className="svg-cell"><span>2</span><NecklaceModel red={6} blue={8} /></div>
          <div className="svg-cell"><span>3</span><NecklaceModel red={8} blue={10} /></div>
        </div>
        <SubQuestion label="ג."><p>במחרוזת של רותם 16 חרוזים אדומים באותו יחס. כמה חרוזים כחולים יש?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>במשפחת ארז 5 בנות ובן אחד.</p>
        <SubQuestion label="א."><p>מהו היחס בין מספר הבנות למספר הילדים? <RatioAnswer inline /></p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין מספר הבנים למספר הילדים? <RatioAnswer inline /></p></SubQuestion>
        <SubQuestion label="ג."><p>איזה חלק מהילדים הן בנות? <Blank /></p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>צמצמו: 8 : 24, 20 : 100, 48 : 6, 18 : 3.</p>
        <AnswerLine label="תשובות:" />
      </Question>

      <QSep />

      <Question>
        <p>באוטובוס 8 מבוגרים ו־6 ילדים. כתבו יחס מצומצם.</p>
        <SubQuestion label="א."><p>מבוגרים : ילדים <RatioAnswer inline /></p></SubQuestion>
        <SubQuestion label="ב."><p>ילדים : מבוגרים <RatioAnswer inline /></p></SubQuestion>
        <SubQuestion label="ג."><p>ילדים : כלל הנוסעים <RatioAnswer inline /></p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>התרשים מתאר את התפלגות האוכלוסייה בשנים 1955 ו־2006.</p>
        <PopulationChart />
        <WorksheetTable
          className="wt-ltr"
          headers={['לא נכונה', 'נכונה', 'טענה']}
          rows={[
            [<Checkbox />, <Checkbox />, 'אחוז הבוגרים בשנת 1955 היה 60%.'],
            [<Checkbox />, <Checkbox />, 'אחוז הקשישים גדל פי 2.'],
            [<Checkbox />, <Checkbox />, 'בשנת 2006 היחס בין צעירים לקשישים היה 14 : 5.'],
          ]}
        />
      </Question>
    </PageLayout>
  );
}

export function RatioPage19() {
  return (
    <PageLayout pageNumber={19} chapter={CH}>
      <Question>
        <p>בשכבת ח׳ יש 130 תלמידים, ו־30 מהם מגיעים באופניים. מהו היחס המצומצם בין מספר הרוכבים למספר התלמידים בשכבה?</p>
        <AnswerLine />
      </Question>

      <QSep />

      <Question>
        <p>סמנו את היחס השווה ל־7 : 3.</p>
        <div className="ratio-options">
          <div><Checkbox /> 6 : 10</div>
          <div><Checkbox /> 21 : 9</div>
          <div><Checkbox /> 21 : 35</div>
          <div><Checkbox /> 30 : 40</div>
        </div>
      </Question>

      <QSep />

      <Question>
        <p>רן קיבל 300 קולות ונעמה 500. מהו היחס המצומצם בין הקולות של רן לקולות של נעמה?</p>
        <div className="options-row"><span>5 : 8</span><span>2 : 5</span><span>3 : 8</span><span>3 : 5</span></div>
      </Question>

      <QSep />

      <Question>
        <p>היום אלעד בן שנתיים ואביו בן 32.</p>
        <WorksheetTable
          headers={['מועד', 'גיל אלעד', 'גיל האב', 'אלעד : אב']}
          rows={[
            ['היום', '', '', ''],
            ['בעוד 4 שנים', '', '', ''],
          ]}
        />
      </Question>

      <QSep />

      <Question>
        <p>12 תלמידים הצביעו בעד תלבושת אחידה ו־27 נגד. מהו היחס המצומצם בין בעד לנגד?</p>
        <div className="options-row"><span>1 : 15</span><span>15 : 27</span><span>4 : 9</span><span>12 : 39</span></div>
      </Question>

      <QSep />

      <Question>
        <p>30% ממשתתפי חוג מחשבים הם בנים.</p>
        <SubQuestion label="א."><p>מהו היחס בין מספר הבנים למספר הבנות?</p></SubQuestion>
        <SubQuestion label="ב."><p>איזה חלק ממשתתפי החוג הן בנות?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בכוס 2 יש 400 מ״ל מיץ. היחס בין הכמות בכוס 1 לכמות בכוס 2 הוא 1 : 4.</p>
        <SubQuestion label="א.">
          <p>כמה מ״ל יש בכוס 1?</p>
          <CalculationResponse lines={2} unit="מ״ל" />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>מעבירים 50 מ״ל מכוס 2 לכוס 1. איזה אחוז מכלל המיץ נשאר בכוס 2?</p>
          <CalculationResponse lines={3} unit="%" />
        </SubQuestion>
      </Question>
    </PageLayout>
  );
}

function NumberLineModel() {
  const points = [
    { label: 'A', value: 0 },
    { label: 'B', value: 2 },
    { label: 'C', value: 5 },
    { label: 'D', value: 8 },
    { label: 'E', value: 10 },
    { label: 'F', value: 14 },
    { label: 'G', value: 16 },
  ];
  return (
    <div className="number-line-container compact">
      <svg viewBox="0 0 370 62" className="number-line-svg" role="img" aria-label="ציר מספרים עם הנקודות A עד G">
        <line x1="20" y1="31" x2="350" y2="31" stroke="#1a1a1a" strokeWidth="1.8" />
        {points.map((point) => {
          const x = 25 + point.value * 20;
          return (
            <g key={point.label}>
              <circle cx={x} cy="31" r="3" fill="#172554" />
              <text x={x} y="20" textAnchor="middle">{point.label}</text>
              <text x={x} y="49" textAnchor="middle">{point.value}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function RailModel() {
  return (
    <div className="svg-center svg-center--tight">
      <svg viewBox="0 0 340 70" width="360" height="76" role="img" aria-label="מסילה עם לולאות A B C ומרחקים 160 ו־240 סנטימטרים">
        <line x1="20" y1="30" x2="320" y2="30" stroke="#1a1a1a" strokeWidth="2" />
        {[{ x: 35, label: 'A' }, { x: 145, label: 'B' }, { x: 310, label: 'C' }].map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy="30" r="4" fill="#172554" />
            <text x={point.x} y="18" textAnchor="middle">{point.label}</text>
          </g>
        ))}
        <text x="90" y="55" textAnchor="middle">160 ס״מ</text>
        <text x="228" y="55" textAnchor="middle">240 ס״מ</text>
      </svg>
    </div>
  );
}

export function RatioPage20() {
  return (
    <PageLayout pageNumber={20} chapter={CH}>
      <Question>
        <p>על ציר המספרים מסומנות הנקודות A–G. חשבו יחסים בין אורכי קטעים.</p>
        <NumberLineModel />
        <div className="options-grid-2col gap-sm">
          <span>א. AB : BC = <Blank /></span>
          <span>ב. BC : CD = <Blank /></span>
          <span>ג. AF : FG = <Blank /></span>
          <span>ד. BD : DF = <Blank /></span>
          <span>ה. AC : AG = <Blank /></span>
          <span>ו. הקטע הסמוך הארוך ביותר : הקצר ביותר = <Blank /></span>
        </div>
      </Question>

      <QSep />

      <Question>
        <p>בתערובת תבלינים יש 6 גרם קינמון על כל 10 גרם וניל. מהו היחס המצומצם בין קינמון לווניל?</p>
        <div className="options-row"><span>3 : 5</span><span>3 : 7</span><span>2 : 5</span><span>2 : 7</span></div>
      </Question>

      <QSep />

      <Question>
        <p>על מסילה תלויות לולאות A, B ו־C. המרחקים הם AB=160 ס״מ ו־BC=240 ס״מ.</p>
        <RailModel />
        <SubQuestion label="א."><p>מהו היחס המצומצם AB : BC?</p></SubQuestion>
        <SubQuestion label="ב."><p>מזיזים את B ב־60 ס״מ לכיוון A. מהו היחס החדש AB : BC?</p></SubQuestion>
        <SubQuestion label="ג."><p>בכמה צריך להזיז את B לכיוון C כדי לקבל יחס 1 : 1?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>הקיפו את היחס השווה ל־3 : 5, כאשר המשתנה שונה מאפס.</p>
        <div className="options-row"><span>3a : 5a</span><span>5b : 6b</span><span>30 : 24</span><span>15a : 9a</span></div>
      </Question>

      <QSep />

      <Question>
        <p>בכיתה ח׳3 יש 20 בנים ו־10 בנות. בכיתה ח׳4 יש 15 בנים ו־5 בנות. מחצית מהבנים בח׳3 עוברים לח׳4.</p>
        <p>מהו היחס בין מספר הבנות למספר הבנים בח׳4 לאחר המעבר?</p>
        <div className="options-row"><span>2 : 5</span><span>1 : 5</span><span>5 : 30</span><span>5 : 15</span></div>
      </Question>
    </PageLayout>
  );
}

function BagsModel() {
  const bags = [
    { label: 'א׳', colors: [0, 1, 0, 0, 0] },
    { label: 'ב׳', colors: [0, 1, 0, 1, 0] },
    { label: 'ג׳', colors: [0, 1, 1, 1, 0] },
  ];
  return (
    <div className="bags-illustration compact">
      <svg viewBox="0 0 330 75" className="bags-svg" role="img" aria-label="שלוש שקיות ובהן כדורים שחורים ולבנים">
        {bags.map((bag, bagIndex) => (
          <g key={bag.label} transform={`translate(${15 + bagIndex * 110}, 0)`}>
            <text x="45" y="12" textAnchor="middle">{bag.label}</text>
            <rect x="5" y="17" width="80" height="52" rx="8" fill="#fff" stroke="#172554" strokeWidth="1.2" />
            {bag.colors.map((black, index) => (
              <circle key={index} cx={22 + (index % 3) * 22} cy={34 + Math.floor(index / 3) * 22} r="7" fill={black ? '#1a1a1a' : '#fff'} stroke="#1a1a1a" strokeWidth="1" />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}

function EqualTriangleGrid() {
  const filled = [true, true, true, false, false, false, false, false];
  return (
    <div className="svg-center svg-center--tight">
      <svg viewBox="0 0 220 90" width="250" height="100" role="img" aria-label="משולש המחולק לשמונה משולשים שווי שטח, שלושה אפורים וחמישה לבנים">
        {filled.map((isFilled, index) => {
          const row = index < 4 ? 0 : 1;
          const col = index % 4;
          const x = 15 + col * 48;
          const y = 10 + row * 38;
          return <polygon key={index} points={`${x},${y + 30} ${x + 22},${y} ${x + 44},${y + 30}`} fill={isFilled ? '#9ca3af' : '#fff'} stroke="#172554" strokeWidth="1" />;
        })}
      </svg>
    </div>
  );
}

export function RatioPage21() {
  return (
    <PageLayout pageNumber={21} chapter={CH}>
      <Question>
        <p>בשקיות א׳, ב׳ ו־ג׳ יש כדורים שחורים ולבנים.</p>
        <BagsModel />
        <SubQuestion label="א."><p>אם מעבירים את תכולת ג׳ לא׳, מהו היחס בין לבנים לשחורים?</p></SubQuestion>
        <SubQuestion label="ב."><p>אם מאחדים את שלוש השקיות, מהו היחס בין מספר הכדורים הכולל למספר הכדורים השחורים?</p></SubQuestion>
        <div className="options-row"><span>5 : 2</span><span>1 : 4</span><span>3 : 1</span><span>1 : 3</span></div>
      </Question>

      <QSep />

      <Question>
        <p>המשולשים הקטנים בסרטוט שווי שטח.</p>
        <EqualTriangleGrid />
        <SubQuestion label="א."><p>מהו היחס בין השטח האפור לשטח הלבן?</p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין השטח הלבן לשטח הכולל?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>מירב לקחה לעצמה <Frac num={3} den={7} /> מהחטיפים ואת השאר נתנה לענת.</p>
        <SubQuestion label="א."><p>איזה חלק נתנה לענת?</p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין החטיפים של מירב לחטיפים של ענת?</p></SubQuestion>
        <SubQuestion label="ג."><p>מהו היחס בין החטיפים של ענת למספר החטיפים הכולל?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בהצגה 600 צופים: 500 ילדים והיתר הורים.</p>
        <SubQuestion label="א."><p>מהו היחס בין מספר ההורים למספר הילדים?</p></SubQuestion>
        <SubQuestion label="ב."><p>חצי מההורים ו־200 ילדים עזבו. מהו היחס בין מספר הילדים למספר הצופים שנותרו?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בסיר 5 גזרים, 10 מלפפונים ו־20 עגבניות.</p>
        <SubQuestion label="א."><p>כתבו את היחס המצומצם בין הכמויות.</p></SubQuestion>
        <SubQuestion label="ב."><p>מה יקרה ליחס אם נכפיל את כל הכמויות פי 2?</p></SubQuestion>
      </Question>
    </PageLayout>
  );
}

function WindowModel() {
  return (
    <div className="svg-center svg-center--tight">
      <svg viewBox="0 0 180 180" width="175" height="175" role="img" aria-label="חלון ריבועי שמונה על שמונה, ריבוע מרכזי ארבע על ארבע וארבעה ריבועי פינה שתיים על שתיים">
        <rect x="10" y="10" width="160" height="160" fill="#fff" stroke="#172554" strokeWidth="2" />
        {[[10, 10], [130, 10], [10, 130], [130, 130]].map(([x, y], index) => (
          <rect key={index} x={x} y={y} width="40" height="40" fill="#9ca3af" stroke="#172554" strokeWidth="1" />
        ))}
        <rect x="50" y="50" width="80" height="80" fill="url(#windowDots)" stroke="#172554" strokeWidth="1.5" />
        <defs><pattern id="windowDots" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.4" fill="#1e40af" /></pattern></defs>
        <line x1="50" y1="10" x2="50" y2="170" stroke="#e2e2e2" />
        <line x1="130" y1="10" x2="130" y2="170" stroke="#e2e2e2" />
        <line x1="10" y1="50" x2="170" y2="50" stroke="#e2e2e2" />
        <line x1="10" y1="130" x2="170" y2="130" stroke="#e2e2e2" />
      </svg>
    </div>
  );
}

function RectangleEModel() {
  return (
    <div className="svg-center svg-center--tight">
      <svg viewBox="0 0 260 150" width="300" height="170" role="img" aria-label="מלבן ABCD ברוחב 12 ובגובה 8, הנקודה E על AB כך ש־AE שווה 8 ו־EB שווה 4">
        <rect x="20" y="20" width="216" height="108" fill="#fff" stroke="#172554" strokeWidth="1.8" />
        <line x1="164" y1="20" x2="236" y2="128" stroke="#1e40af" strokeWidth="1.4" />
        <line x1="164" y1="20" x2="20" y2="128" stroke="#1e40af" strokeWidth="1.4" />
        <text x="12" y="18">A</text><text x="240" y="18">B</text><text x="240" y="143">C</text><text x="10" y="143">D</text><text x="160" y="15">E</text>
        <text x="92" y="15" textAnchor="middle">8</text><text x="200" y="15" textAnchor="middle">4</text><text x="246" y="78">8</text>
      </svg>
    </div>
  );
}

export function RatioPage22() {
  return (
    <PageLayout pageNumber={22} chapter={CH} className="ratio-page-22">
      <Question>
        <p>במלבן שאורכו 16 ורוחבו 2 מסורטט משולש שבסיסו 6 וגובהו 2. חשבו את היחס בין שטח המשולש לשטח המלבן.</p>
        <SubQuestion label="א."><p>שטח המשולש: <Blank /></p></SubQuestion>
        <SubQuestion label="ב."><p>שטח המלבן: <Blank /></p></SubQuestion>
        <SubQuestion label="ג."><p>היחס המצומצם: <Blank /></p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>במלבן שאורכו 14 ורוחבו 6 מסורטט משולש שבסיסו 7 וגובהו 6.</p>
        <SubQuestion label="א."><p>מהו היחס בין שטח המשולש לשטח המלבן? <RatioAnswer inline /></p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין שטח המשולש לשטח הלבן שנותר? <RatioAnswer inline /></p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>החלון הוא ריבוע שצלעו 8 ס״מ. הריבוע המנוקד במרכז הוא בעל צלע 4 ס״מ, ובכל פינה ריבוע אפור שצלעו 2 ס״מ.</p>
        <WindowModel />
        <div className="options-grid-2col gap-sm">
          <span>א. מנוקד : חלון כולו = <Blank /></span>
          <span>ב. מנוקד : אפור = <Blank /></span>
          <span>ג. היקף מנוקד : היקף חלון = <Blank /></span>
          <span>ד. לבן : כל השטח שאינו מנוקד = <Blank /></span>
        </div>
      </Question>

      <QSep />

      <Question>
        <p>במלבן ABCD: ‏AB=12,‏ AD=8, והנקודה E על AB כך ש־AE=8 ו־EB=4.</p>
        <RectangleEModel />
        <SubQuestion label="א."><p>מהו היחס בין שטח △BCE לשטח △CDE? <RatioAnswer inline /></p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין שטח המלבן לשטח △CDE? <RatioAnswer inline /></p></SubQuestion>
        <SubQuestion label="ג."><p>מהו היחס בין שטח המרובע AECD לשטח △BCE? <RatioAnswer inline /></p></SubQuestion>
      </Question>
    </PageLayout>
  );
}

function AngleCard({ label, alpha, beta }: { label: string; alpha: number; beta: number }) {
  // Two adjacent angles sharing a vertex: α from the horizontal base ray, β above it. Every ray
  // is generated from exact trig so the drawn degrees equal the labels (§4.3 measured accuracy).
  const V = { x: 28, y: 62 };
  const R = 44;
  const rad = (d: number) => (d * Math.PI) / 180;
  const ray = (deg: number) => ({ x: V.x + R * Math.cos(rad(deg)), y: V.y - R * Math.sin(rad(deg)) });
  const at = (deg: number, r: number) => ({ x: V.x + r * Math.cos(rad(deg)), y: V.y - r * Math.sin(rad(deg)) });
  const base = ray(0);
  const mid = ray(alpha);
  const top = ray(alpha + beta);
  const aS = at(0, 14), aE = at(alpha, 14);
  const bS = at(alpha, 20), bE = at(alpha + beta, 20);
  const aL = at(alpha / 2, 25), bL = at(alpha + beta / 2, 31);
  return (
    <div className="svg-cell">
      <span>{label}</span>
      <svg viewBox="0 0 110 80" width="130" height="95" role="img" aria-label={`שתי זוויות צמודות בעלות קדקוד משותף: אלפא ${alpha} מעלות ובטא ${beta} מעלות`} shapeRendering="geometricPrecision">
        <line x1={V.x} y1={V.y} x2={base.x.toFixed(2)} y2={base.y.toFixed(2)} stroke="#172554" strokeWidth="1.8" />
        <line x1={V.x} y1={V.y} x2={mid.x.toFixed(2)} y2={mid.y.toFixed(2)} stroke="#172554" strokeWidth="1.8" />
        <line x1={V.x} y1={V.y} x2={top.x.toFixed(2)} y2={top.y.toFixed(2)} stroke="#172554" strokeWidth="1.8" />
        <path d={`M ${aS.x.toFixed(2)} ${aS.y.toFixed(2)} A 14 14 0 0 0 ${aE.x.toFixed(2)} ${aE.y.toFixed(2)}`} fill="none" stroke="#1e40af" strokeWidth="1.4" />
        <path d={`M ${bS.x.toFixed(2)} ${bS.y.toFixed(2)} A 20 20 0 0 0 ${bE.x.toFixed(2)} ${bE.y.toFixed(2)}`} fill="none" stroke="#1e40af" strokeWidth="1.4" />
        <text x={aL.x.toFixed(2)} y={(aL.y + 3).toFixed(2)} textAnchor="middle" direction="ltr">α={alpha}°</text>
        <text x={bL.x.toFixed(2)} y={(bL.y + 3).toFixed(2)} textAnchor="middle" direction="ltr">β={beta}°</text>
      </svg>
      <span className="txt-xs">α : β = <span className="inline-blank w-40" /></span>
    </div>
  );
}

function Bracelet({ black, white }: { black: number; white: number }) {
  return (
    <svg viewBox={`0 0 ${(black + white) * 15 + 5} 20`} width={(black + white) * 15 + 5} height="20" aria-hidden="true">
      {Array.from({ length: black + white }).map((_, index) => (
        <circle key={index} cx={10 + index * 15} cy="10" r="6" fill={index < black ? '#1a1a1a' : '#fff'} stroke="#1a1a1a" strokeWidth="1" />
      ))}
    </svg>
  );
}

export function RatioPage23() {
  return (
    <PageLayout pageNumber={23} chapter={CH}>
      <Question>
        <p>במערך של 14 משבצות, 2 צבועות ו־12 לבנות.</p>
        <SubQuestion label="א."><p>מהו היחס המצומצם בין הצבועות ללבנות?</p></SubQuestion>
        <SubQuestion label="ב."><p>אם נצבע משבצת נוספת, כמה משבצות לבנות צריך להוסיף כדי לשמור על היחס?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>חשבו את היחס α : β בכל סרטוט. מידות הזוויות נתונות במפורש.</p>
        <div className="svg-figure-row">
          <AngleCard label="א" alpha={30} beta={60} />
          <AngleCard label="ב" alpha={60} beta={30} />
          <AngleCard label="ג" alpha={45} beta={45} />
          <AngleCard label="ד" alpha={40} beta={80} />
        </div>
        <p>באילו סעיפים מתקבלים יחסים שווים?</p>
      </Question>

      <QSep />

      <Question>
        <p>קרן ונורית הכינו מחרוזות.</p>
        <div className="bracelet-row">
          <div className="bracelet-line"><span className="bracelet-name">קרן:</span><Bracelet black={8} white={12} /><span className="txt-xs">8 שחורים, 12 לבנים</span></div>
          <div className="bracelet-line"><span className="bracelet-name">נורית:</span><Bracelet black={6} white={9} /><span className="txt-xs">6 שחורים, 9 לבנים</span></div>
        </div>
        <SubQuestion label="א."><p>האם היחס בין שחורים ללבנים זהה בשתי המחרוזות? הסבירו.</p></SubQuestion>
        <SubQuestion label="ב.">
          <p>ציירו מחרוזת נוספת באותו יחס ובה לפחות 25 חרוזים.</p>
          <div className="drawing-box min-h-60"><p className="drawing-label">המחרוזת שלי:</p></div>
        </SubQuestion>
      </Question>
    </PageLayout>
  );
}

export function RatioPage26() {
  return (
    <PageLayout pageNumber={26} chapter={CH}>
      <Question>
        <p>המלבן מחולק לארבעה חלקים שווים. <strong>הרבע הימני</strong> צבוע בכחול.</p>
        <div className="svg-center">
          <svg viewBox="0 0 200 60" width="240" height="72" role="img" aria-label="מלבן המחולק לארבעה רבעים, הרבע הימני כחול">
            <rect x="2" y="2" width="196" height="56" fill="#fff" stroke="#172554" strokeWidth="1.5" />
            <rect x="149" y="2" width="49" height="56" fill="#cfe3ff" stroke="#172554" strokeWidth="1" />
            {[51, 100, 149].map((x) => <line key={x} x1={x} y1="2" x2={x} y2="58" stroke="#172554" strokeWidth="0.8" />)}
          </svg>
        </div>
        <SubQuestion label="א."><p>איזה חלק מן המלבן כחול?</p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין השטח הכחול לשטח הלבן?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>במלבן מסורטט משולש שבסיסו כל הצלע התחתונה וגובהו שווה לגובה המלבן.</p>
        <SubQuestion label="א."><p>איזה חלק מן המלבן תופס המשולש?</p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין שטח המשולש לשטח שנותר?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>במלבן צבוע משולש שבסיסו מחצית מאורך המלבן וגובהו שווה לגובה המלבן.</p>
        <SubQuestion label="א."><p>איזה חלק משטח המלבן צבוע?</p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין השטח הצבוע לשטח הלבן?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>למלבן ולמשולש בסיסים שווים. היחס בין גובה המלבן לגובה המשולש הוא 1 : 2.</p>
        <p>מהו היחס בין שטח המלבן לשטח המשולש? הסבירו.</p>
        <AnswerLine label="הסבר:" />
      </Question>
    </PageLayout>
  );
}
