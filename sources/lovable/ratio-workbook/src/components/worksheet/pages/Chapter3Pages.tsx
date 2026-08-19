import { PageLayout, Question, SubQuestion, Blank, WorksheetTable, Checkbox, Frac, AnswerLine, QSep } from './PageLayout';

const CH = 'פרק 3 – כתיבה, צמצום והשוואה';

// ── Page 8: Q1-Q6 ──
export function Ch3Page1() {
  return (
    <PageLayout pageNumber={18} chapter={CH}>
      <Question>
        <p>לפניכם דגם של ריצוף. מה היחס בין מספר האריחים הלבנים למספר האריחים הכחולים?</p>
        <div className="options-row">
          <span>א. 3 : 2</span><span>ב. 3 : 5</span><span>ג. 2 : 5</span><span>ד. 5 : 3</span><span>ה. 2 : 3</span>
        </div>
      </Question>

      <QSep />

      <Question>
        <p>מכינים מחרוזות מחרוזים.</p>
        <SubQuestion label="א."><p>מה היחס בין מספר החרוזים האדומים למספר החרוזים הכחולים?</p></SubQuestion>
        <SubQuestion label="ב."><p>באיזו מבין המחרוזות הבאות היחס בין מספר החרוזים האדומים למספר החרוזים הכחולים הוא כמו היחס במחרוזת שבסעיף א ?</p></SubQuestion>
        <SubQuestion label="ג."><p>במחרוזת של רותם 16 חרוזים אדומים. היחס בין מספר החרוזים הכחולים לאדומים במחרוזת שלה, הוא כמו במחרוזת שבסעיף א. כמה חרוזים כחולים במחרוזת של רותם?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>במשפחת ארז 5 בנות ובן אחד.</p>
        <SubQuestion label="א."><p>מה היחס בין מספר הבנות למספר הילדים במשפחה?</p></SubQuestion>
        <SubQuestion label="ב."><p>מה היחס בין מספר הבנים למספר הילדים במשפחה?</p></SubQuestion>
        <SubQuestion label="ג."><p>איזה חלק מהילדים במשפחת ארז מהוות הבנות?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>צמצמו את היחסים הבאים ככל האפשר:</p>
        <div className="options-grid-2col">
          <span>(א) 8 : 24</span><span>(ג) 48 : 6</span>
          <span>(ב) 20 : 100</span><span>(ד) 18 : 3</span>
        </div>
      </Question>

      <QSep />

      <Question>
        <p>באוטובוס 8 מבוגרים ו- 6 ילדים.</p>
        <SubQuestion label="א."><p>מה היחס בין מספר המבוגרים למספר הילדים באוטובוס? כתבו יחס מצומצם.</p></SubQuestion>
        <SubQuestion label="ב."><p>מה היחס בין מספר הילדים למספר המבוגרים באוטובוס? כתבו יחס מצומצם.</p></SubQuestion>
        <SubQuestion label="ג."><p>מה היחס בין מספר הילדים למספר הכולל של הנוסעים באוטובוס? כתבו יחס מצומצם.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בכתבה שהתפרסמה בעיתון תוארה התפלגות התושבים במדינת ישראל לפי קבוצות גיל בשנים 1955 ו-2006.</p>
        <div className="bar-chart-container compact">
          <svg viewBox="0 0 350 150" className="bar-chart">
            <line x1="50" y1="10" x2="50" y2="130" stroke="#000" strokeWidth="1" />
            <line x1="50" y1="130" x2="320" y2="130" stroke="#000" strokeWidth="1" />
            <text x="45" y="128" textAnchor="end" fontSize="7">0</text>
            <text x="45" y="112" textAnchor="end" fontSize="7">10</text>
            <text x="45" y="96" textAnchor="end" fontSize="7">20</text>
            <text x="45" y="80" textAnchor="end" fontSize="7">30</text>
            <text x="45" y="64" textAnchor="end" fontSize="7">40</text>
            <text x="45" y="48" textAnchor="end" fontSize="7">50</text>
            <text x="45" y="32" textAnchor="end" fontSize="7">60</text>
            <text x="45" y="16" textAnchor="end" fontSize="7">70</text>
            <rect x="70" y="77" width="22" height="53" fill="#555" />
            <text x="81" y="73" textAnchor="middle" fontSize="7">36%</text>
            <rect x="96" y="82" width="22" height="48" fill="#ccc" />
            <text x="107" y="78" textAnchor="middle" fontSize="7">28%</text>
            <rect x="150" y="28" width="22" height="102" fill="#555" />
            <text x="161" y="24" textAnchor="middle" fontSize="7">59%</text>
            <rect x="176" y="23" width="22" height="107" fill="#ccc" />
            <text x="187" y="19" textAnchor="middle" fontSize="7">62%</text>
            <rect x="230" y="122" width="22" height="8" fill="#555" />
            <text x="241" y="119" textAnchor="middle" fontSize="7">5%</text>
            <rect x="256" y="114" width="22" height="16" fill="#ccc" />
            <text x="267" y="111" textAnchor="middle" fontSize="7">10%</text>
            <text x="90" y="143" textAnchor="middle" fontSize="8">צעירים</text>
            <text x="170" y="143" textAnchor="middle" fontSize="8">בוגרים</text>
            <text x="250" y="143" textAnchor="middle" fontSize="8">קשישים</text>
            <rect x="260" y="8" width="8" height="8" fill="#555" />
            <text x="256" y="15" textAnchor="end" fontSize="7">1955</text>
            <rect x="260" y="18" width="8" height="8" fill="#ccc" />
            <text x="256" y="25" textAnchor="end" fontSize="7">2006</text>
          </svg>
        </div>
        <p>סמנו ליד כל טענה אם היא נכונה או לא נכונה.</p>
        <WorksheetTable
          headers={['לא נכונה', 'נכונה', 'טענה', '']}
          rows={[
            [<Checkbox />, <Checkbox />, 'אחוז הבוגרים בשנת 1955 היה גדול מ- 60%', '.1'],
            [<Checkbox />, <Checkbox />, 'אחוז הקשישים באוכלוסייה גדל פי 2 משנת 1955 ועד שנת 2006.', '.2'],
            [<Checkbox />, <Checkbox />, 'בשנת 2006 היה היחס בין אחוז הצעירים לבין אחוז הקשישים 14 : 5 .', '.3'],
            [<Checkbox />, <Checkbox />, 'בשנת 1955 היה אחוז הצעירים גדול פי 3 מאחוז הקשישים.', '.4'],
          ]}
        />
      </Question>
    </PageLayout>
  );
}

// ── Page 9: Q7-Q13 ──
export function Ch3Page2() {
  return (
    <PageLayout pageNumber={19} chapter={CH}>
      <Question>
        <p>בשכבת כיתה ח' יש 130 תלמידים. 30 תלמידים מביניהם מגיעים לבית הספר רכובים על אופניים.</p>
        <p>מה היחס בין מספר התלמידים המגיעים רכובים על אופניים למספר התלמידים בשכבה?</p>
        <AnswerLine />
      </Question>

      <QSep />

      <Question>
        <p>סמנו את היחס השווה ליחס 7 : 3 .</p>
        <div className="ratio-options">
          <div><Checkbox /> 6 : 10</div>
          <div><Checkbox /> 9 : 21</div>
          <div><Checkbox /> 21 : 35</div>
          <div><Checkbox /> 30 : 40</div>
        </div>
      </Question>

      <QSep />

      <Question>
        <p>בבחירות למועצת תלמידים קיבל רן 300 קולות ונעמה קיבלה 500 קולות.</p>
        <p>מה היחס בין מספר הקולות שקיבל רן למספר הקולות שקיבלה נעמה?</p>
        <div className="ratio-options">
          <div><Checkbox /> 5 : 8</div>
          <div><Checkbox /> 2 : 5</div>
          <div><Checkbox /> 3 : 8</div>
          <div><Checkbox /> 3 : 5</div>
        </div>
      </Question>

      <QSep />

      <Question>
        <p><strong>היום</strong> אלעד בן שנתיים ואביו בן 32. הַשלימו את החסר בטבלה שלפניכם.</p>
        <WorksheetTable
          headers={['היחס בין הגיל של אלעד לגיל של אביו', 'הגיל של אביו', 'הגיל של אלעד', '']}
          rows={[
            ['', '', '', <strong>היום</strong>],
            ['', '', '', <strong>בעוד 4 שנים</strong>],
          ]}
        />
      </Question>

      <QSep />

      <Question>
        <p>בכיתה ח1 בבית הספר "עלומים" נערך סקר. 12 תלמידים השיבו שהם בעד תלבושת אחידה, ו- 27 תלמידים השיבו שהם נגד.</p>
        <p>מה היחס בין מספר התלמידים שהצביעו <strong>בעד</strong> למספר התלמידים שהצביעו נגד?</p>
        <div className="ratio-options">
          <div><Checkbox /> 1 : 15</div>
          <div><Checkbox /> <Frac num={15} den={27} /></div>
          <div><Checkbox /> 4 : 9</div>
          <div><Checkbox /> <Frac num={12} den={39} /></div>
        </div>
      </Question>

      <QSep />

      <Question>
        <p>במרכז הקהילתי "תקווה" מתקיים חוג מחשבים. 30% מבין התלמידים המשתתפים בחוג הם בנים.</p>
        <SubQuestion label="א.">
          <p>מהו היחס בין מספר <strong>הבנים</strong> למספר <strong>הבנות</strong> בחוג המחשבים?</p>
          <div className="ratio-options">
            <div><Checkbox /> 7 : 10</div>
            <div><Checkbox /> 3 : 7</div>
            <div><Checkbox /> 1 : 7</div>
            <div><Checkbox /> 1 : 3</div>
          </div>
        </SubQuestion>
        <SubQuestion label="ב."><p>איזה <strong>חלק</strong> מילדי החוג מהוות הבנות? <Blank /> .</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>(*) נתונות שתי כוסות מיץ. בכוס 2 יש 400 מ"ל מיץ. היחס בין כמות המיץ בכוס 1 לבין כמות המיץ בכוס 2 הוא 1:4.</p>
        <SubQuestion label="א.">
          <p>בכוס 1 יש : (1) 100 מ"ל  (2) 1,600 מ"ל  (3) 200 מ"ל  (4) 250 מ"ל</p>
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>מעבירים 50 מ"ל מכוס 2 לכוס 1. לאחר ההעברה, בכוס 2 יש : (1) 30%  (2) 70%  (3) 87.5%  (4) 35%  מכמות המיץ בשתי הכוסות יחד.</p>
        </SubQuestion>
      </Question>
    </PageLayout>
  );
}

// ── Page 10: Q14-Q16 (number line + ratios + rail) ──
export function Ch3Page3() {
  return (
    <PageLayout pageNumber={20} chapter={CH}>
      <Question>
        <p>לפניכם ציר מספרים עם נקודות מסומנות.</p>
        <div className="number-line-container compact">
          <svg viewBox="0 0 350 50" className="number-line-svg">
            <line x1="20" y1="25" x2="330" y2="25" stroke="#000" strokeWidth="2" />
            <polygon points="330,20 340,25 330,30" fill="#000" />
            <circle cx="50" cy="25" r="3" fill="#000" /><text x="50" y="17" textAnchor="middle" fontSize="9">A</text>
            <circle cx="120" cy="25" r="3" fill="#000" /><text x="120" y="17" textAnchor="middle" fontSize="9">B</text>
            <circle cx="180" cy="25" r="3" fill="#000" /><text x="180" y="40" textAnchor="middle" fontSize="9">C</text>
            <circle cx="220" cy="25" r="3" fill="#000" /><text x="220" y="17" textAnchor="middle" fontSize="9">D</text>
            <circle cx="300" cy="25" r="3" fill="#000" /><text x="300" y="17" textAnchor="middle" fontSize="9">E</text>
            <circle cx="330" cy="25" r="3" fill="#000" /><text x="315" y="40" textAnchor="middle" fontSize="9">F</text>
          </svg>
        </div>
        <p>כתבו את היחס בין הקטעים הבאים:</p>
        <SubQuestion label="1)"><p>BG ליחס של CV מהו <Blank /></p></SubQuestion>
        <SubQuestion label="2)"><p>CV ליחס של DB מהו <Blank /></p></SubQuestion>
        <SubQuestion label="3)"><p>FB ליחס של AV מהו <Blank /></p></SubQuestion>
        <SubQuestion label="4)"><p>DB ליחס של CB מהו <Blank /></p></SubQuestion>
        <SubQuestion label="5)"><p>DB ליחס של CV מהו <Blank /></p></SubQuestion>
        <SubQuestion label="א."><p>מה היחס בין הקטע הארוך ביותר לקצר ביותר. כתבו יחס מצומצם.</p></SubQuestion>
        <SubQuestion label="ב."><p>אם FB ליחס של CV מהו <Blank /></p></SubQuestion>
        <SubQuestion label="ג."><p>BG ליחס של AV מה שווים <Blank /></p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בחנות תבלינים מוכרים תערובת משני תבלינים קינמון ווניל ביחס קבוע.</p>
        <SubQuestion label="א."><p>מהו היחס בין הקינמון לוניל בתערובת?</p></SubQuestion>
        <div className="ratio-options">
          <div><Checkbox /> 3 : 5</div>
          <div><Checkbox /> 3 : 7</div>
          <div><Checkbox /> 2 : 5</div>
          <div><Checkbox /> 2 : 7</div>
        </div>
      </Question>

      <QSep />

      <Question>
        <p>לפניכם סרטוט של מסילה ישרה לתליית תמונות. על המסילה תלויות שלוש לוּלָאות A, B, C.</p>
        <p>המרחקים AB=160 ס"מ, BC=240 ס"מ.</p>
        <SubQuestion label="א.">
          <p>מהו היחס בין AB ובין BC? <strong>כִּתבו יחס מצומצם.</strong></p>
          <AnswerLine />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>הֵזיזו את לולאה B ב- 60 ס"מ לכיוון A. מהו היחס בין AB ובין BC לאחר ההזזה?</p>
          <div className="ratio-options">
            <div><Checkbox /> 1 : 2</div>
            <div><Checkbox /> 1 : 3</div>
            <div><Checkbox /> 1 : 4</div>
            <div><Checkbox /> 1 : 6</div>
          </div>
        </SubQuestion>
        <SubQuestion label="ג."><p>בכמה ס"מ צריך להזיז את B לכיוון C כדי שהיחס AB:BC יהיה 1 : 1 ?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>הקיפו את היחס השווה ליחס 3 :5.</p>
        <div className="options-row">
          <span>א. 3a : 5a</span><span>ב. 5b : 6b</span><span>ג. 30 : 24</span><span>ד. 15a : 9a</span>
        </div>
      </Question>

      <QSep />

      <Question>
        <p>בכיתה ח' 3 לומדים 20 בנים ו-10 בנות. בכיתה ח' 4 לומדים 15 בנים ו-5 בנות.</p>
        <p>אם מחצית מהבנים בכיתה ח' 3 יעברו לכיתה ח' 4 אז היחס בין מספר הבנות לבין מספר הבנים בכיתה ח' 4 יהיה :</p>
        <div className="options-row">
          <span>א. 25: 5</span><span>ב. <Frac num={5} den={30} /></span><span>ג. <Frac num={25} den={30} /></span><span>ד. 1: 5</span>
        </div>
      </Question>
    </PageLayout>
  );
}

// ── Page 11: Q19-Q22 (bags + triangles + chocolate + show) ──
export function Ch3Page4() {
  return (
    <PageLayout pageNumber={21} chapter={CH}>
      <Question>
        <p>בשקיות א', ב' ו-ג' יש כדורים שחורים ולבנים.</p>
        <div className="bags-illustration compact">
          <svg viewBox="0 0 300 55" className="bags-svg">
            <g transform="translate(20, 0)">
              <text x="35" y="8" textAnchor="middle" fontSize="10">א'</text>
              <rect x="5" y="12" width="60" height="38" rx="4" fill="none" stroke="#000" strokeWidth="1.5" />
              <circle cx="20" cy="22" r="5" fill="#fff" stroke="#000" strokeWidth="1" />
              <circle cx="40" cy="22" r="5" fill="#000" />
              <circle cx="20" cy="38" r="5" fill="#fff" stroke="#000" strokeWidth="1" />
              <circle cx="40" cy="38" r="5" fill="#fff" stroke="#000" strokeWidth="1" />
              <circle cx="52" cy="38" r="5" fill="#fff" stroke="#000" strokeWidth="1" />
            </g>
            <g transform="translate(120, 0)">
              <text x="35" y="8" textAnchor="middle" fontSize="10">ב'</text>
              <rect x="5" y="12" width="60" height="38" rx="4" fill="none" stroke="#000" strokeWidth="1.5" />
              <circle cx="20" cy="22" r="5" fill="#fff" stroke="#000" strokeWidth="1" />
              <circle cx="40" cy="22" r="5" fill="#000" />
              <circle cx="20" cy="38" r="5" fill="#fff" stroke="#000" strokeWidth="1" />
              <circle cx="40" cy="38" r="5" fill="#000" />
              <circle cx="52" cy="38" r="5" fill="#fff" stroke="#000" strokeWidth="1" />
            </g>
            <g transform="translate(220, 0)">
              <text x="35" y="8" textAnchor="middle" fontSize="10">ג'</text>
              <rect x="5" y="12" width="60" height="38" rx="4" fill="none" stroke="#000" strokeWidth="1.5" />
              <circle cx="20" cy="22" r="5" fill="#fff" stroke="#000" strokeWidth="1" />
              <circle cx="40" cy="22" r="5" fill="#000" />
              <circle cx="20" cy="38" r="5" fill="#000" />
              <circle cx="40" cy="38" r="5" fill="#000" />
              <circle cx="52" cy="38" r="5" fill="#fff" stroke="#000" strokeWidth="1" />
            </g>
          </svg>
        </div>
        <SubQuestion label="א.">
          <p>1) אם תכולת שקית ג' תוכנס לשקית א', היחס בין הלבנים לשחורים יהיה <Blank /> .</p>
          <p>2) אם תכולת שקית א' תוכנס לשקית ב', היחס בין השחורים לכולל יהיה <Blank /> .</p>
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>כמאל רוקן את 3 השקיות לכיסו. היחס בין הכולל לשחורים הוא :</p>
          <div className="options-row"><span>(1) 6 : 18</span><span>(2) 1 : 4</span><span>(3) 3 : 1</span><span>(4) 1 : 3</span></div>
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>המשולש שלפניכם מחולק למשולשים קטנים הצבועים באפור ובלבן. לכל המשולשים הקטנים שטח שווה.</p>
        <SubQuestion label="א."><p>מה היחס בין השטח האפור לשטח הלבן?</p></SubQuestion>
        <SubQuestion label="ב."><p>מה היחס בין השטח הלבן לשטח המשולש הגדול?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>למירב חטיפי שוקולד. <Frac num={3} den={7} /> מההחטיפים היא לקחה לעצמה. את השאר נתנה לענת.</p>
        <SubQuestion label="א."><p>איזה חלק מההחטיפים היא נתנה לענת?</p></SubQuestion>
        <SubQuestion label="ב."><p>מה היחס בין מספר החטיפים שמירב לקחה לעצמה לבין מספר החטיפים שנתנה לענת?</p></SubQuestion>
        <SubQuestion label="ג."><p>מה היחס בין מספר החטיפים שנתנה לענת לבין מספר החטיפים הכולל?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בהצגה צופים 600 בני אדם, מתוכם 500 ילדים והיתר הורים.</p>
        <SubQuestion label="א.">
          <p>היחס בין מספר ההורים לבין מספר הילדים הוא :</p>
          <div className="options-row"><span>(1) 1:6</span><span>(2) 6:1</span><span>(3) 1:5</span><span>(4) 5:1</span></div>
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>בהפסקה עזבו חצי מההורים ו-200 ילדים. היחס בין מספר הילדים לצופים הכולל הוא :</p>
          <div className="options-row"><span>(1) 5:6</span><span>(2) 6:1</span><span>(3) 6:7</span><span>(4) 7:6</span></div>
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בסיר 5 גזרים, 10 מלפפונים ו-20 עגבניות.</p>
        <SubQuestion label="א."><p>השלימו : היחס בין כמות הגזרים לכמות המלפפונים ולכמות העגבניות הוא <Blank /> .</p></SubQuestion>
        <SubQuestion label="ב.">
          <p>הטבח הכפיל פי שניים את כל הכמויות. היחס הוא :</p>
          <div className="options-row"><span>(1) 4:2:1</span><span>(2) 2:8:4</span><span>(3) 40:20:10</span><span>(4) 1:2:4</span></div>
        </SubQuestion>
      </Question>
    </PageLayout>
  );
}

// ── Page 12: Q23-Q27 (geometry areas) ──
export function Ch3Page5() {
  return (
    <PageLayout pageNumber={22} chapter={CH}>
      <Question>
        <p><strong>(א)</strong> חשבו את היחס בין שטח המשולש הצבוע לשטח המלבן בכל אחד מהסעיפים.</p>
        <div className="geometry-figures compact">
          <div className="geo-item">
            <span className="geo-label">(i)</span>
            <svg viewBox="0 0 180 45" className="geo-mini">
              <rect x="5" y="5" width="160" height="35" fill="none" stroke="#000" strokeWidth="1.5" />
              <polygon points="100,5 5,40 100,40" fill="#999" stroke="#000" strokeWidth="1" />
              <text x="85" y="3" fontSize="8">16</text><text x="167" y="22" fontSize="8">2</text><text x="52" y="48" fontSize="8">6</text>
            </svg>
          </div>
          <div className="geo-item">
            <span className="geo-label">(ii)</span>
            <svg viewBox="0 0 100 45" className="geo-mini">
              <rect x="5" y="5" width="80" height="35" fill="none" stroke="#000" strokeWidth="1.5" />
              <polygon points="5,5 85,5 45,40" fill="#999" stroke="#000" strokeWidth="1" />
              <text x="42" y="3" fontSize="8">5</text><text x="0" y="22" fontSize="8">2</text><text x="42" y="48" fontSize="8">2</text>
            </svg>
          </div>
          <div className="geo-item">
            <span className="geo-label">(iii)</span>
            <svg viewBox="0 0 180 45" className="geo-mini">
              <rect x="5" y="5" width="160" height="35" fill="none" stroke="#000" strokeWidth="1.5" />
              <polygon points="5,5 70,5 5,40" fill="#999" stroke="#000" strokeWidth="1" />
              <text x="85" y="3" fontSize="8">12</text><text x="0" y="22" fontSize="8">2</text><text x="37" y="48" fontSize="8">5</text>
            </svg>
          </div>
        </div>
        <p><strong>(ב)</strong> האם מצאתם יחסים שווים בסעיף (א) ? רשמו היכן.</p>
      </Question>

      <QSep />

      <Question>
        <p>מהו היחס בין שטח המשולש הצבוע לשטח המלבן ?</p>
        <div className="geo-figure compact">
          <svg viewBox="0 0 200 65" className="geo-svg">
            <rect x="10" y="10" width="180" height="50" fill="none" stroke="#000" strokeWidth="1.5" />
            <polygon points="10,10 100,10 100,60" fill="#999" stroke="#000" strokeWidth="1" />
            <text x="50" y="7" fontSize="8">7</text><text x="165" y="7" fontSize="8">ב</text>
            <text x="3" y="38" fontSize="8">6</text><text x="95" y="70" fontSize="8">14</text>
          </svg>
        </div>
        <SubQuestion label="א."><p>מהו היחס בין שטח המשולש הצבוע לשטח המלבן ?</p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין שטח המשולש הצבוע לשטח הכולל של שני המשולשים הלבנים ?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>חלון מחולק ל-9 מרובעים. 4 ריבועים אפורים בקדקודים (צלע 2 ס"מ), ריבוע מנוקד במרכז (צלע 4 ס"מ).</p>
        <SubQuestion label="א."><p>חשבו את היחס בין השטח המנוקד לשטח החלון כולו.</p></SubQuestion>
        <SubQuestion label="ב."><p>חשבו את היחס בין השטח המנוקד לסכום שטחי הריבועים האפורים.</p></SubQuestion>
        <SubQuestion label="ג."><p><strong>השלימו</strong> : היחס בין היקף הריבוע המנוקד לבין היקף החלון כולו הוא <Blank /> .</p></SubQuestion>
        <SubQuestion label="ד.">
          <p>(*) היחס בין סכום שטחי המלבנים הלבנים לבין סך השטח שאינו מנוקד הוא :</p>
          <div className="options-row"><span>(1) 1:2</span><span>(2) 2:3</span><span>(3) 3:1</span><span>(4) 3:2</span></div>
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>במלבן ABCD נתון : BE=4 ס"מ, AD=AE=8 ס"מ.</p>
        <SubQuestion label="א.">
          <p>היחס בין שטח ΔBCE לשטח ΔCDE הוא :</p>
          <div className="options-row"><span>(1) 1:2</span><span>(2) 1:4</span><span>(3) 4:1</span><span>(4) 1:3</span></div>
        </SubQuestion>
        <SubQuestion label="ב."><p>היחס בין שטח המלבן לשטח ΔCDE הוא <Blank /> .</p></SubQuestion>
        <SubQuestion label="ג."><p>היחס בין שטח AECD לשטח ΔBCE הוא <Blank /> .</p></SubQuestion>
      </Question>
    </PageLayout>
  );
}

// ── Page 15 (NEW): זיהוי יחס מסרטוטים – משבצות, זוויות, מחרוזות ──
export function Ch3Page6() {
  return (
    <PageLayout pageNumber={23} chapter={CH}>
      <Question>
        <p><strong>(א)</strong> מהו היחס בין מספר המשבצות הצבועות למספר המשבצות שאינן צבועות?</p>
        <div className="svg-center svg-center--tight">
          <svg viewBox="0 0 280 80" width="260" height="70">
            {Array.from({ length: 7 }).map((_, c) => (
              <g key={c}>
                <rect x={10 + c * 38} y={10} width={38} height={30} fill={c === 2 ? '#888' : '#fff'} stroke="#000" strokeWidth="1" />
                <rect x={10 + c * 38} y={40} width={38} height={30} fill={c === 5 ? '#888' : '#fff'} stroke="#000" strokeWidth="1" />
              </g>
            ))}
          </svg>
        </div>
        <p><strong>(ב)</strong> אם נצבע 3 משבצות נוספות, כמה משבצות לבנות עלינו להוסיף כדי שיישמר היחס שחשבתם בסעיף (א)? הסבירו.</p>
      </Question>

      <QSep />

      <Question>
        <p><strong>(א)</strong> חשבו את היחס בין α ל-β בכל אחד מהסרטוטים הבאים.</p>
        <div className="svg-figure-row">
          <div className="geo-item">
            <span className="geo-label">(i)</span>
            <svg viewBox="0 0 70 70" width="60" height="60">
              <line x1="10" y1="60" x2="60" y2="60" stroke="#000" strokeWidth="1.5" />
              <line x1="10" y1="60" x2="55" y2="15" stroke="#000" strokeWidth="1.5" />
              <line x1="10" y1="60" x2="60" y2="40" stroke="#000" strokeWidth="1.5" />
              <text x="22" y="56" fontSize="9">α</text>
              <text x="32" y="44" fontSize="9">β</text>
            </svg>
          </div>
          <div className="geo-item">
            <span className="geo-label">(ii)</span>
            <svg viewBox="0 0 70 70" width="60" height="60">
              <line x1="10" y1="60" x2="60" y2="60" stroke="#000" strokeWidth="1.5" />
              <line x1="10" y1="60" x2="10" y2="10" stroke="#000" strokeWidth="1.5" />
              <line x1="10" y1="60" x2="55" y2="20" stroke="#000" strokeWidth="1.5" />
              <text x="20" y="55" fontSize="9">α</text>
              <text x="14" y="35" fontSize="9">β</text>
            </svg>
          </div>
          <div className="geo-item">
            <span className="geo-label">(iii)</span>
            <svg viewBox="0 0 80 70" width="70" height="60">
              <line x1="5" y1="60" x2="75" y2="60" stroke="#000" strokeWidth="1.5" />
              <line x1="40" y1="60" x2="40" y2="10" stroke="#000" strokeWidth="1.5" />
              <text x="28" y="56" fontSize="9">α</text>
              <text x="46" y="56" fontSize="9">β</text>
            </svg>
          </div>
          <div className="geo-item">
            <span className="geo-label">(iv)</span>
            <svg viewBox="0 0 80 70" width="70" height="60">
              <line x1="5" y1="60" x2="75" y2="60" stroke="#000" strokeWidth="1.5" />
              <line x1="40" y1="60" x2="65" y2="20" stroke="#000" strokeWidth="1.5" />
              <text x="28" y="56" fontSize="9">α</text>
              <text x="46" y="52" fontSize="9">β</text>
            </svg>
          </div>
        </div>
        <p><strong>(ב)</strong> אם מצאתם בסעיף (א) יחסים שווים, רשמו היכן.</p>
      </Question>

      <QSep />

      <Question>
        <p>קרן ונורית הכינו מחרוזות מחרוזים שחורים ולבנים.</p>
        <div className="bracelet-row">
          <div className="bracelet-line">
            <span className="bracelet-name">קרן:</span>
            <svg viewBox="0 0 240 18" width="240" height="16">
              {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
                <circle key={i} cx={10 + i * 20} cy={9} r={7}
                  fill={[0,1,4,5,8,9].includes(i) ? '#000' : '#fff'} stroke="#000" strokeWidth="1" />
              ))}
            </svg>
            <span className="txt-xs">(8 שחורים, 12 לבנים)</span>
          </div>
          <div className="bracelet-line">
            <span className="bracelet-name">נורית:</span>
            <svg viewBox="0 0 240 18" width="240" height="16">
              {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
                <circle key={i} cx={10 + i * 20} cy={9} r={7}
                  fill={[0,3,6,9].includes(i) ? '#000' : '#fff'} stroke="#000" strokeWidth="1" />
              ))}
            </svg>
            <span className="txt-xs">(12 שחורים, 17 לבנים)</span>
          </div>
        </div>
        <SubQuestion label="א."><p>האם בשתי המחרוזות היחס בין מספר החרוזים השחורים לבין מספר החרוזים הלבנים זהה? הסבירו.</p></SubQuestion>
        <SubQuestion label="ב."><p>סרטטו מחרוזת נוספת כך שיתקיים בה אותו היחס בין מספר החרוזים השחורים למספר החרוזים הלבנים, כמו במחרוזת של קרן.</p></SubQuestion>
        <div className="drawing-box min-h-40"><p className="drawing-label">המחרוזת שלי:</p></div>
      </Question>
    </PageLayout>
  );
}

// ── Page (NEW) Ch3Page7: חישוב יחס מסרטוטים גיאומטריים וצמצום – Q2, Q4, Q5 ──
export function Ch3Page7() {
  return (
    <PageLayout pageNumber={24} chapter={CH}>
      <Question>
        <p>התבוננו בסרטוט שלפניכם וענו על הסעיפים הבאים. במלבן: אורך 12, רוחב 4. המשולש המקווקו הוא חצי מהמלבן (בסיס 12, גובה 4).</p>
        <div className="svg-center svg-center--tight">
          <svg viewBox="0 0 200 80" width="190" height="76">
            <defs>
              <pattern id="hatch1" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="#000" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect x="10" y="10" width="180" height="60" fill="none" stroke="#000" strokeWidth="1.5" />
            <polygon points="10,10 190,10 10,70" fill="url(#hatch1)" stroke="#000" strokeWidth="1" />
            <text x="95" y="6" fontSize="9" textAnchor="middle">12</text>
            <text x="195" y="44" fontSize="9">4</text>
          </svg>
        </div>
        <SubQuestion label="א."><p>מהו שטח המלבן?</p></SubQuestion>
        <SubQuestion label="ב."><p>מהו שטח המשולש?</p></SubQuestion>
        <SubQuestion label="ג."><p>מהו היחס בין שטח המשולש לשטח המלבן?</p></SubQuestion>
        <SubQuestion label="ד.">
          <p>צורת רישום נוספת ליחס שמצאתם בסעיף (ג) היא:</p>
          <div className="ratio-options">
            <div><Checkbox /> 3 : 5</div>
            <div><Checkbox /> 1 : 2</div>
            <div><Checkbox /> 8 : 1</div>
            <div><Checkbox /> 4 : 12</div>
          </div>
          <p>בחרו באפשרות הנכונה ונמקו תשובתכם.</p>
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>כתבו את היחסים הבאים בצורה מצומצמת.</p>
        <div className="options-grid-2col">
          <span>(א) 18 : 45 = <Blank /></span>
          <span>(ב) 30 : 33 = <Blank /></span>
          <span>(ג) 12 : 96 = <Blank /></span>
          <span>(ד) 35 : 75 = <Blank /></span>
        </div>
      </Question>

      <QSep />

      <Question>
        <p>בכל אחד מהסרטוטים הבאים נתונות זוויות צמודות. רשמו מהו היחס בין גודל הזווית הנתונה לבין גודל הזווית α.</p>
        <div className="svg-figure-row">
          {[
            { label: '(א)', given: 20 },
            { label: '(ב)', given: 140 },
            { label: '(ג)', given: 90 },
            { label: '(ד)', given: 18 },
          ].map((d, i) => {
            // Two adjacent angles on a straight line: the given angle + α, with α = 180 − given.
            // The ray is generated from exact trig so each drawn angle equals its label (§4.3).
            const V = { x: 45, y: 46 };
            const R = 36;
            const rad = (deg: number) => (deg * Math.PI) / 180;
            const theta = 180 - d.given;
            const ray = { x: V.x + R * Math.cos(rad(theta)), y: V.y - R * Math.sin(rad(theta)) };
            const gP = { x: V.x + 23 * Math.cos(rad((theta + 180) / 2)), y: V.y - 23 * Math.sin(rad((theta + 180) / 2)) };
            const aP = { x: V.x + 21 * Math.cos(rad(theta / 2)), y: V.y - 21 * Math.sin(rad(theta / 2)) };
            return (
              <div key={i} className="svg-cell">
                <span className="geo-label">{d.label}</span>
                <svg viewBox="0 0 90 56" width="76" height="47" role="img" aria-label={`זווית נתונה ${d.given} מעלות וזווית אלפא צמודות על ישר`} shapeRendering="geometricPrecision">
                  <line x1="6" y1={V.y} x2="84" y2={V.y} stroke="#172554" strokeWidth="1.8" />
                  <line x1={V.x} y1={V.y} x2={ray.x.toFixed(2)} y2={ray.y.toFixed(2)} stroke="#172554" strokeWidth="1.8" />
                  <circle cx={V.x} cy={V.y} r="1.5" fill="#172554" />
                  <text x={gP.x.toFixed(2)} y={(gP.y + 3).toFixed(2)} fontSize="8" textAnchor="middle" direction="ltr">{d.given}°</text>
                  <text x={aP.x.toFixed(2)} y={(aP.y + 3).toFixed(2)} fontSize="8" textAnchor="middle">α</text>
                </svg>
                <span className="txt-xs">היחס : <span className="inline-blank w-40" /></span>
              </div>
            );
          })}
        </div>
      </Question>
    </PageLayout>
  );
}

// ── Page 24 (NEW): מהו היחס בסיפורים – אוטובוסים, הרכב כיתה, זוויות במשולש ──
export function Ch3Page8() {
  return (
    <PageLayout pageNumber={25} chapter={CH}>
      <Question>
        <p>חברת האוטובוסים מציעה כרטיסיות לנוסעים :</p>
        <p>• <strong>כרטיסיית נוער</strong> – 20 נסיעות במחיר של 10 נסיעות.</p>
        <p>• <strong>כרטיסיית מבוגרים</strong> – משלמים עבור 10 נסיעות ומקבלים אחת חינם.</p>
        <SubQuestion label="א."><p>מהו היחס בין מספר הניקובים בכרטיסייה לבין מספר הנסיעות שעליהן משלמים <strong>בכרטיסיית נוער</strong>?</p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין מספר הניקובים בכרטיסייה לבין מספר הנסיעות שעליהן משלמים <strong>בכרטיסיית מבוגרים</strong>?</p></SubQuestion>
        <SubQuestion label="ג."><p>מהו היחס בין מספר הניקובים בכרטיסיית הנוער לבין מספר הניקובים בכרטיסיית המבוגרים?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בכיתה 25 תלמידים, מתוכם 10 עולים חדשים.</p>
        <SubQuestion label="א."><p>מהו היחס בין מספר העולים למספר התלמידים בכיתה? <Blank /></p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין מספר ילידי הארץ למספר התלמידים בכיתה? <Blank /></p></SubQuestion>
        <SubQuestion label="ג."><p>מהו היחס בין מספר העולים למספר ילידי הארץ? <Blank /></p></SubQuestion>
        <SubQuestion label="ד."><p>בלהקה 3 זמרים ו - 7 נגנים. מהו היחס בין מספר הזמרים למספר חברי הלהקה? <Blank /></p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בכל סעיף, נתון משולש על-פי מידות זוויותיו. <strong>כתבו</strong> את היחס בין שלוש הזוויות, ואת היחס המצומצם.</p>
        <div className="figure-grid-3">
          {[
            { label: '(א)', a: 80, b: 60, c: 40 },
            { label: '(ב)', a: 30, b: 120, c: 30 },
            { label: '(ג)', a: 60, b: 30, c: 90 },
            { label: '(ד)', a: 60, b: 60, c: 60 },
            { label: '(ה)', a: 45, b: 45, c: 90 },
            { label: '(ו)', a: 72, b: 72, c: 36 },
          ].map((t, i) => {
            const rad = (d: number) => (d * Math.PI) / 180;
            const cot = (d: number) => Math.cos(rad(d)) / Math.sin(rad(d)); // a=apex, b=bottom-right, c=bottom-left
            const W = 1;
            const h = W / (cot(t.b) + cot(t.c));
            const Lx = 0, Rx = W, Tx = Lx + h * cot(t.c), Ty = h; // work space, y up
            const minX = Math.min(Lx, Rx, Tx), maxX = Math.max(Lx, Rx, Tx), maxY = h;
            const bw = maxX - minX, bh = maxY;
            const vbW = 120, vbH = 92, pad = 16;
            const s = Math.min((vbW - 2 * pad) / bw, (vbH - 2 * pad) / bh);
            const offX = (vbW - s * bw) / 2 - s * minX, offY = pad;
            const X = (x: number) => offX + s * (x - minX);
            const Y = (y: number) => offY + s * (maxY - y);
            const Lp = { x: X(Lx), y: Y(0) }, Rp = { x: X(Rx), y: Y(0) }, Tp = { x: X(Tx), y: Y(Ty) };
            const G = { x: (Lp.x + Rp.x + Tp.x) / 3, y: (Lp.y + Rp.y + Tp.y) / 3 };
            const lab = (p: { x: number; y: number }) => ({ x: p.x + (G.x - p.x) * 0.26, y: p.y + (G.y - p.y) * 0.26 });
            const aL = lab(Tp), bL = lab(Rp), cL = lab(Lp);
            return (
              <div key={i} className="cell">
                <div className="title">{t.label}</div>
                <svg viewBox="0 0 120 92" width="160" height="123" style={{ maxWidth: "100%" }} xmlns="http://www.w3.org/2000/svg" shapeRendering="geometricPrecision">
                  <polygon points={`${Tp.x.toFixed(1)},${Tp.y.toFixed(1)} ${Rp.x.toFixed(1)},${Rp.y.toFixed(1)} ${Lp.x.toFixed(1)},${Lp.y.toFixed(1)}`} fill="none" stroke="#1a1a1a" strokeWidth="1.6" strokeLinejoin="round" />
                  <text x={aL.x.toFixed(1)} y={(aL.y + 3).toFixed(1)} textAnchor="middle" fontSize="14" fill="#1a1a1a" direction="ltr">{t.a}°</text>
                  <text x={bL.x.toFixed(1)} y={(bL.y + 3).toFixed(1)} textAnchor="middle" fontSize="14" fill="#1a1a1a" direction="ltr">{t.b}°</text>
                  <text x={cL.x.toFixed(1)} y={(cL.y + 3).toFixed(1)} textAnchor="middle" fontSize="14" fill="#1a1a1a" direction="ltr">{t.c}°</text>
                </svg>
                <div className="answer-row">יחס : <span className="inline-blank w-70" /></div>
                <div>מצומצם : <span className="inline-blank w-60" /></div>
              </div>
            );
          })}
        </div>
      </Question>
    </PageLayout>
  );
}

// ── Page 31 (NEW): שטחים יחסיים – יחסי שטחים במלבן ובמשולש ──
export function Ch3Page9() {
  return (
    <PageLayout pageNumber={26} chapter={CH}>
      <Question>
        <p>צלע המלבן מחולקת ל - 4 חלקים שווים. החלק הימני צבוע <strong>בכחול</strong> והשאר בלבן.</p>
        <div className="svg-center">
          <svg viewBox="0 0 200 60" width="220" height="64" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="196" height="56" fill="none" stroke="#1a1a1a" strokeWidth="1.5" />
            <rect x="2" y="2" width="49" height="56" fill="#cfe3ff" stroke="#1a1a1a" strokeWidth="1.2" />
            <line x1="100" y1="2" x2="100" y2="58" stroke="#1a1a1a" strokeWidth="0.8" />
            <line x1="149" y1="2" x2="149" y2="58" stroke="#1a1a1a" strokeWidth="0.8" />
          </svg>
        </div>
        <SubQuestion label="א."><p>איזה חלק מן המלבן צבוע בכחול?</p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין השטח הצבוע בכחול לשטח הצבוע בלבן?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>במלבן <strong>ABCD</strong> הצמוד למשולש <strong>שווה-שוקיים</strong> ששטחו זהה לשטח חצי המלבן (קודקודו על הצלע העליונה ובסיסו צלע התחתונה) – חלקו של המשולש צבוע בכחול.</p>
        <div className="svg-center">
          <svg viewBox="0 0 200 80" width="220" height="84" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="196" height="76" fill="none" stroke="#1a1a1a" strokeWidth="1.5" />
            <polygon points="100,2 196,78 4,78" fill="#cfe3ff" stroke="#1a1a1a" strokeWidth="1.2" />
          </svg>
        </div>
        <SubQuestion label="א."><p>איזה חלק מן המלבן צבוע בכחול?</p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין השטח הצבוע בכחול לשטח הצבוע בלבן?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>צלע המלבן מחולקת ל - 4 חלקים שווים. במלבן שני משולשים <strong>לבנים</strong> בפינות התחתונות ומשולש <strong>כחול</strong> גדול במרכז.</p>
        <div className="svg-center">
          <svg viewBox="0 0 200 80" width="220" height="84" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="196" height="76" fill="none" stroke="#1a1a1a" strokeWidth="1.5" />
            <polygon points="51,2 149,2 100,78" fill="#cfe3ff" stroke="#1a1a1a" strokeWidth="1.2" />
            <polygon points="2,78 51,2 100,78" fill="none" stroke="#1a1a1a" strokeWidth="0.8" />
            <polygon points="100,78 149,2 198,78" fill="none" stroke="#1a1a1a" strokeWidth="0.8" />
            <line x1="51" y1="2" x2="51" y2="78" stroke="#1a1a1a" strokeWidth="0.4" strokeDasharray="2 2" />
            <line x1="100" y1="2" x2="100" y2="78" stroke="#1a1a1a" strokeWidth="0.4" strokeDasharray="2 2" />
            <line x1="149" y1="2" x2="149" y2="78" stroke="#1a1a1a" strokeWidth="0.4" strokeDasharray="2 2" />
          </svg>
        </div>
        <SubQuestion label="א."><p>מהו היחס בין שטחי שני המשולשים הצבועים בלבן?</p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין כל השטח הכחול לכל השטח הלבן?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>היחס בין גובה <strong>המלבן</strong> לגובה <strong>המשולש</strong> הוא 1 : 2 . בסיסיהם שווים.</p>
        <p>מהו היחס בין שטח המלבן לשטח המשולש? הסבירו.</p>
        <AnswerLine label="הסבר :" />
      </Question>
    </PageLayout>
  );
}
