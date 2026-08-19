import { PageLayout, Question, SubQuestion, Blank, Frac, AnswerLine, QSep, WorksheetTable, MultipleChoice, CalculationResponse, WorkArea } from './PageLayout';

const CH = 'פרק 7 – יחס בנתונים, תרשימים וגאומטריה';
const TOPIC = 'יחס בנתונים, תרשימים וגאומטריה';

/* ─────────────────────────── SVG helpers ─────────────────────────── */

// Row of circles: filled = black, hollow = white
function CircleRow({ black, white }: { black: number; white: number }) {
  const total = black + white;
  return (
    <svg width={total * 22 + 4} height="26" className="mx-auto" aria-hidden="true">
      {Array.from({ length: black }).map((_, i) => (
        <circle key={`b${i}`} cx={11 + i * 22} cy="13" r="9" fill="#111" stroke="#111" strokeWidth="1.2" />
      ))}
      {Array.from({ length: white }).map((_, i) => (
        <circle key={`w${i}`} cx={11 + (black + i) * 22} cy="13" r="9" fill="#fff" stroke="#111" strokeWidth="1.2" />
      ))}
    </svg>
  );
}

// Population bar chart for years 1955 / 2006
function PopulationChart() {
  // Hand-tuned numbers — all statements in Q2/Q6 derive from these:
  // 1955: צעירים 35%, בוגרים 60%, קשישים 5%
  // 2006: צעירים 28%, בוגרים 62%, קשישים 10%
  const data1955 = { young: 35, adult: 60, old: 5 };
  const data2006 = { young: 28, adult: 62, old: 10 };
  const W = 384, H = 216, padL = 36, padB = 30, padT = 14;
  const innerH = H - padB - padT;
  const yFor = (v: number) => padT + innerH * (1 - v / 70);
  const groups = [
    { label: '1955', d: data1955, x0: padL + 26 },
    { label: '2006', d: data2006, x0: padL + 198 },
  ];
  const colors = { young: '#5b9bd5', adult: '#ed7d31', old: '#a5a5a5' };
  const legend = [
    { c: colors.young, label: 'צעירים' },
    { c: colors.adult, label: 'בוגרים' },
    { c: colors.old, label: 'קשישים' },
  ];

  return (
    <div className="flex flex-col items-center my-2">
      <svg width={W} height={H} className="border border-[#888] bg-white" aria-hidden="true">
        {/* y-axis grid + labels */}
        {[0, 10, 20, 30, 40, 50, 60, 70].map((v) => (
          <g key={v}>
            <line x1={padL} y1={yFor(v)} x2={W - 8} y2={yFor(v)} stroke="#ddd" strokeWidth="0.5" />
            <text x={padL - 5} y={yFor(v) + 4} fontSize="11" textAnchor="end" fill="#333" direction="ltr">{v}%</text>
          </g>
        ))}
        {/* x-axis */}
        <line x1={padL} y1={H - padB} x2={W - 8} y2={H - padB} stroke="#333" strokeWidth="1" />
        {/* bars */}
        {groups.map((g) => {
          const bw = 30;
          return (
            <g key={g.label}>
              {[
                { k: 'young' as const, x: g.x0 },
                { k: 'adult' as const, x: g.x0 + bw + 8 },
                { k: 'old' as const, x: g.x0 + (bw + 8) * 2 },
              ].map(({ k, x }) => (
                <g key={k}>
                  <rect x={x} y={yFor(g.d[k])} width={bw} height={H - padB - yFor(g.d[k])} fill={colors[k]} stroke="#333" strokeWidth="0.5" />
                  <text x={x + bw / 2} y={yFor(g.d[k]) - 4} fontSize="11" textAnchor="middle" fill="#000" direction="ltr" fontWeight="bold">{g.d[k]}%</text>
                </g>
              ))}
              <text x={g.x0 + (bw + 8) * 1.5 - 4} y={H - 9} fontSize="12.5" textAnchor="middle" fill="#000" fontWeight="bold" direction="ltr">{g.label}</text>
            </g>
          );
        })}
      </svg>
      {/* legend — a clean horizontal row BELOW the plot so it never overlaps the bars */}
      <div className="flex justify-center gap-5 mt-1" style={{ fontSize: '12px', fontWeight: 600 }}>
        {legend.map((it) => (
          <span key={it.label} className="inline-flex items-center gap-1">
            <span style={{ width: 13, height: 13, background: it.c, border: '0.6px solid #333', display: 'inline-block' }} />
            {it.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Hook rail: A ── 90 ── B ── 120 ── C
function HookRail() {
  const W = 460, H = 90;
  const ax = 40, bx = 200, cx = 413; // 90:120 = 3:4 exact at 1.7778 px/unit → AB=160px, BC=213.3px
  return (
    <div className="flex justify-center my-2">
      <svg width={W} height={H} aria-hidden="true">
        {/* rail */}
        <line x1="20" y1="40" x2={W - 20} y2="40" stroke="#333" strokeWidth="2" />
        <line x1="20" y1="44" x2={W - 20} y2="44" stroke="#333" strokeWidth="2" />
        {/* hooks */}
        {[{ x: ax, l: 'A' }, { x: bx, l: 'B' }, { x: cx, l: 'C' }].map((p) => (
          <g key={p.l}>
            <path d={`M ${p.x} 44 Q ${p.x} 60, ${p.x - 6} 64 Q ${p.x - 10} 70, ${p.x} 74 Q ${p.x + 10} 70, ${p.x + 6} 64 Q ${p.x} 60, ${p.x} 44`} fill="none" stroke="#333" strokeWidth="1.5" />
            <circle cx={p.x} cy="44" r="3" fill="#333" />
            <text x={p.x} y="22" fontSize="14" textAnchor="middle" fontWeight="bold">{p.l}</text>
          </g>
        ))}
        {/* measurements */}
        <text x={(ax + bx) / 2} y="88" fontSize="11" textAnchor="middle">90 ס"מ</text>
        <text x={(bx + cx) / 2} y="88" fontSize="11" textAnchor="middle">120 ס"מ</text>
      </svg>
    </div>
  );
}

// Similar triangles ABC ~ DEF (DEF lengths shown)
function SimilarTriangles() {
  return (
    <div className="flex justify-center gap-12 my-2">
      <svg width="170" height="160" aria-hidden="true">
        <polygon points="20,140 150,140 60,20" fill="none" stroke="#222" strokeWidth="1.6" />
        <text x="14" y="156" fontSize="12">A</text>
        <text x="154" y="156" fontSize="12">B</text>
        <text x="58" y="16" fontSize="12">C</text>
      </svg>
      <svg width="130" height="160" role="img" aria-label="משולש DEF שצלעותיו 9, 7 ו־5" shapeRendering="geometricPrecision">
        <polygon points="16,120 115,120 80.2,77.4" fill="none" stroke="#222" strokeWidth="1.8" />
        <text x="8" y="133" fontSize="12">D</text>
        <text x="118" y="133" fontSize="12">E</text>
        <text x="76" y="72" fontSize="12">F</text>
        <text x="65" y="134" fontSize="11" textAnchor="middle" direction="ltr">9</text>
        <text x="38" y="98" fontSize="11" textAnchor="middle" direction="ltr">7</text>
        <text x="104" y="98" fontSize="11" textAnchor="middle" direction="ltr">5</text>
      </svg>
    </div>
  );
}

// Two similar triangles DOC ~ AOB
function TrianglesDOCAOB() {
  return (
    <div className="flex justify-center my-2">
      <svg width="260" height="220" aria-hidden="true">
        {/* big triangle AOB */}
        <line x1="30" y1="200" x2="240" y2="200" stroke="#222" strokeWidth="1.6" />
        <line x1="30" y1="200" x2="30" y2="30" stroke="#222" strokeWidth="1.6" />
        <line x1="240" y1="200" x2="30" y2="30" stroke="#222" strokeWidth="1.6" />
        {/* inner triangle DOC, sharing vertex O */}
        <line x1="30" y1="200" x2="120" y2="200" stroke="#222" strokeWidth="1.6" />
        <line x1="30" y1="130" x2="120" y2="200" stroke="#222" strokeWidth="1.6" />
        <line x1="30" y1="200" x2="30" y2="130" stroke="#222" strokeWidth="1.4" strokeDasharray="3 3" />
        <text x="14" y="206" fontSize="13" fontWeight="bold">O</text>
        <text x="244" y="206" fontSize="13" fontWeight="bold">A</text>
        <text x="22" y="22" fontSize="13" fontWeight="bold">B</text>
        <text x="122" y="214" fontSize="13" fontWeight="bold">C</text>
        <text x="14" y="128" fontSize="13" fontWeight="bold">D</text>
      </svg>
    </div>
  );
}

// Kangaroo jumps bar chart: A 30, B 20, C 40, D 6 (avg = 24)
function KangarooChart() {
  const data = [
    { l: "א'", v: 30 },
    { l: "ב'", v: 20 },
    { l: "ג'", v: 40 },
    { l: "ד'", v: 6 },
  ];
  const W = 288, H = 214, padL = 52, padB = 36, padT = 14;
  const innerH = H - padB - padT;
  const yMid = padT + innerH / 2;
  const yFor = (v: number) => padT + innerH * (1 - v / 50);
  return (
    <div className="flex justify-center my-2">
      <svg width={W} height={H} className="border border-[#888] bg-white" role="img" aria-label="דיאגרמת עמודות של מספר הקפיצות לכל קנגורו: א׳ 30, ב׳ 20, ג׳ 40, ד׳ 6">
        {[0, 10, 20, 30, 40, 50].map((v) => (
          <g key={v}>
            <line x1={padL} y1={yFor(v)} x2={W - 8} y2={yFor(v)} stroke="#ddd" strokeWidth="0.5" />
            <text x={padL - 6} y={yFor(v) + 3} fontSize="9" textAnchor="end" direction="ltr">{v}</text>
          </g>
        ))}
        {/* ציר האנכי (Y) */}
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="#333" />
        {/* ציר האופקי (X) */}
        <line x1={padL} y1={H - padB} x2={W - 8} y2={H - padB} stroke="#333" />
        {data.map((d, i) => {
          const x = padL + 16 + i * 50;
          return (
            <g key={d.l}>
              <rect x={x} y={yFor(d.v)} width="34" height={H - padB - yFor(d.v)} fill="#5b9bd5" stroke="#333" strokeWidth="0.5" />
              <text x={x + 17} y={yFor(d.v) - 3} fontSize="10" textAnchor="middle" direction="ltr">{d.v}</text>
              <text x={x + 17} y={H - padB + 15} fontSize="11" textAnchor="middle" fontWeight="bold">{d.l}</text>
            </g>
          );
        })}
        {/* תוויות הצירים — מה מייצג כל ציר */}
        <text x={(padL + W - 8) / 2} y={H - 3} fontSize="10.5" textAnchor="middle" fontWeight="bold">קנגורו</text>
        <text x="14" y={yMid} fontSize="10.5" textAnchor="middle" fontWeight="bold" transform={`rotate(-90 14 ${yMid})`}>מספר הקפיצות</text>
      </svg>
    </div>
  );
}

// Right-angle trapezoid ABCD with height BE on CD
function Trapezoid() {
  return (
    <div className="flex justify-center my-2">
      <svg width="280" height="160" aria-hidden="true">
        {/* trapezoid: A(40,30) B(220,30) C(240,130) D(20,130) */}
        <polygon points="40,30 220,30 240,130 20,130" fill="none" stroke="#222" strokeWidth="1.6" />
        {/* height BE perpendicular from B to DC */}
        <line x1="220" y1="30" x2="220" y2="130" stroke="#222" strokeWidth="1.4" strokeDasharray="3 3" />
        <rect x="216" y="126" width="8" height="8" fill="none" stroke="#222" strokeWidth="1" />
        <text x="30" y="26" fontSize="13" fontWeight="bold">A</text>
        <text x="222" y="26" fontSize="13" fontWeight="bold">B</text>
        <text x="244" y="142" fontSize="13" fontWeight="bold">C</text>
        <text x="8" y="142" fontSize="13" fontWeight="bold">D</text>
        <text x="222" y="142" fontSize="13" fontWeight="bold">E</text>
        <text x="130" y="22" fontSize="11">12</text>
        <text x="234" y="84" fontSize="11">10</text>
        <text x="130" y="146" fontSize="11">14</text>
      </svg>
    </div>
  );
}

// Right triangle ABC with inscribed rectangle BDFE
function RightTriInscribedRect() {
  return (
    <div className="flex justify-center my-2">
      <svg width="220" height="220" aria-hidden="true">
        {/* triangle: B(30,200) A(30,30) C(200,200) */}
        <polygon points="30,200 30,30 200,200" fill="none" stroke="#222" strokeWidth="1.6" />
        {/* rectangle BDFE: B(30,200) D(30,140) F(90,140) E(90,200) */}
        <rect x="30" y="140" width="60" height="60" fill="none" stroke="#222" strokeWidth="1.4" />
        <rect x="34" y="196" width="6" height="6" fill="none" stroke="#222" />
        <text x="16" y="208" fontSize="12" fontWeight="bold">B</text>
        <text x="16" y="34" fontSize="12" fontWeight="bold">A</text>
        <text x="204" y="208" fontSize="12" fontWeight="bold">C</text>
        <text x="16" y="142" fontSize="12" fontWeight="bold">D</text>
        <text x="92" y="138" fontSize="12" fontWeight="bold">F</text>
        <text x="92" y="212" fontSize="12" fontWeight="bold">E</text>
      </svg>
    </div>
  );
}

/* ─────────────────────────── PAGES ─────────────────────────── */

// Page 39 — תשע"ו, שאלות 1–2
export function Ch7Page1() {
  return (
    <PageLayout pageNumber={39} chapter={CH} topic={TOPIC}>

      <Question>
        <p>סַמנו את האיור שבו היחס בין מספר העיגולים השחורים לבין מספר העיגולים הלבנים הוא 2 : 1 .</p>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[
            { b: 4, w: 4 },
            { b: 6, w: 3 },
            { b: 3, w: 6 },
            { b: 5, w: 2 },
          ].map((o, i) => (
            <div key={i} className="circles-box">
              <span className="text-xs">□</span>
              <CircleRow black={o.b} white={o.w} />
            </div>
          ))}
        </div>
        <WorkArea lines={2} label="הסבירו את בחירתכם:" />
      </Question>

      <QSep />

      <Question>
        <p>בכתבה שהתפרסמה בעיתון תוארה התפלגות התושבים במדינת ישראל לפי קבוצות גיל (צעירים, בוגרים וקשישים) בשנים 1955 ו-2006.</p>
        <PopulationChart />
        <p>סַמנו ליד כל טענה אם היא נכונה או לא נכונה.</p>
        <WorksheetTable
          headers={['', 'טענה', 'נכונה', 'לא נכונה']}
          rows={[
            ['1.', 'אחוז הצעירים בשנת 2006 היה קטן מ-30% .', '□', '□'],
            ['2.', 'בשנת 1955 היה אחוז הבוגרים גדול פי 6 מאחוז הקשישים.', '□', '□'],
            ['3.', 'אחוז הקשישים באוכלוסייה גדל פי 2 משנת 1955 ועד שנת 2006.', '□', '□'],
            ['4.', 'בשנת 2006 היה היחס בין אחוז הצעירים לבין אחוז הקשישים 14 : 5 .', '□', '□'],
          ]}
        />
      </Question>
    </PageLayout>
  );
}

// Page 40 — תשע"ו, שאלות 3–5
export function Ch7Page2() {
  return (
    <PageLayout pageNumber={40} chapter={CH} topic={TOPIC}>

      <Question>
        <p>היחס בין מספר הבוגרים לבין מספר הצעירים במקהלת "זמיר" הוא 3 : 2 . סַמנו ליד כל היגד אם הוא נכון, לא נכון או שאי-אפשר לקבוע.</p>
        <WorksheetTable
          headers={['', 'היגד', 'נכון', 'לא נכון', 'אי-אפשר לקבוע']}
          rows={[
            ['1.', <span>מספר הצעירים הוא <Frac num={2} den={5} /> מסך כל המשתתפים.</span>, '□', '□', '□'],
            ['2.', 'במקהלה יש בסך-הכול 12 משתתפים.', '□', '□', '□'],
            ['3.', 'במקהלה יש 3 בוגרים ו-2 צעירים.', '□', '□', '□'],
            ['4.', 'מספר הבוגרים גדול פי 1.5 ממספר הצעירים.', '□', '□', '□'],
          ]}
        />
      </Question>

      <QSep />

      <Question>
        <p>סַמנו את האיור שבו היחס בין מספר העיגולים השחורים לבין מספר העיגולים הלבנים הוא 2 : 1 .</p>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[
            { b: 8, w: 4 },
            { b: 5, w: 3 },
            { b: 4, w: 8 },
            { b: 6, w: 4 },
          ].map((o, i) => (
            <div key={i} className="circles-box">
              <span className="text-xs">□</span>
              <CircleRow black={o.b} white={o.w} />
            </div>
          ))}
        </div>
        <WorkArea lines={2} label="הסבירו את בחירתכם:" />
      </Question>

      <QSep />

      <Question>
        <p>היחס בין מספר הבוגרים לבין מספר הצעירים במקהלת "זמיר" הוא 3 : 2 . סדרו את ההיגדים לפי הסדר ההפוך וסַמנו אם הם נכון / לא נכון / אי-אפשר לקבוע.</p>
        <WorksheetTable
          headers={['', 'היגד', 'נכון', 'לא נכון', 'אי-אפשר לקבוע']}
          rows={[
            ['1.', 'מספר הבוגרים גדול פי 1.5 ממספר הצעירים.', '□', '□', '□'],
            ['2.', 'במקהלה יש 3 בוגרים ו-2 צעירים.', '□', '□', '□'],
            ['3.', 'במקהלה יש בסך-הכול 12 משתתפים.', '□', '□', '□'],
            ['4.', <span>מספר הצעירים הוא <Frac num={2} den={5} /> מסך כל המשתתפים.</span>, '□', '□', '□'],
          ]}
        />
      </Question>
    </PageLayout>
  );
}

// Page 41 — תשע"ו, שאלה 6 (סיום)
export function Ch7Page3() {
  return (
    <PageLayout pageNumber={41} chapter={CH} topic={TOPIC}>

      <Question>
        <p>התפלגות התושבים במדינת ישראל לפי קבוצות גיל (צעירים, בוגרים וקשישים) בשנים 1955 ו-2006.</p>
        <PopulationChart />
        <SubQuestion label="א.">
          <p>סַמנו ליד כל טענה אם היא נכונה או לא נכונה.</p>
          <WorksheetTable
            headers={['', 'טענה', 'נכונה', 'לא נכונה']}
            rows={[
              ['1.', 'אחוז הבוגרים בשנת 1955 היה גדול מ-60% .', '□', '□'],
              ['2.', 'אחוז הקשישים באוכלוסייה גדל פי 2 משנת 1955 ועד שנת 2006.', '□', '□'],
              ['3.', 'בשנת 2006 היה היחס בין אחוז הצעירים לבין אחוז הקשישים 14 : 5 .', '□', '□'],
              ['4.', 'בשנת 1955 היה אחוז הצעירים גדול פי 3 מאחוז הקשישים.', '□', '□'],
            ]}
          />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>בשנת 2006 היו במדינת ישראל 7.1 מיליון תושבים. מה היה בערך מספר הצעירים באותה שנה?</p>
          <MultipleChoice options={[
            { value: '1 מיליון' },
            { value: '2 מיליון' },
            { value: '3 מיליון' },
            { value: '4 מיליון' },
          ]} />
        </SubQuestion>
      </Question>
    </PageLayout>
  );
}

// Page 42 — תשע"ה (Q1, Q3, Q4) — דילגנו על שאלת קנה-המידה (Q2)
export function Ch7Page4() {
  return (
    <PageLayout pageNumber={42} chapter={CH} topic={TOPIC}>

      <Question>
        <p>סַמנו את היחס השווה ליחס 3 : 7 .</p>
        <MultipleChoice options={[
          { value: '6 : 10' },
          { value: '9 : 21' },
          { value: '21 : 35' },
          { value: '30 : 40' },
        ]} />
      </Question>

      <QSep />

      <Question>
        <p>סַמנו את היחס השווה ליחס 4 : 5 .</p>
        <MultipleChoice options={[
          { value: '28 : 40' },
          { value: '20 : 30' },
          { value: '16 : 25' },
          { value: '12 : 15' },
        ]} />
      </Question>

      <QSep />

      <Question>
        <p>לפניכם סרטוט של שני משולשים דומים: ∆DOC ∼ ∆AOB . (הדמיון כתוב לפי סדר הקדקודים המתאימים.)</p>
        <TrianglesDOCAOB />
        <SubQuestion label="א.">
          <p>מהו יחס הדמיון בין משולש DOC ובין משולש AOB ?</p>
          <MultipleChoice options={[
            { value: '1 : 4' },
            { value: '2 : 1' },
            { value: '3 : 5' },
            { value: '3 : 20' },
          ]} />
        </SubQuestion>
        <SubQuestion label="ב."><p>מהם שיעורי הנקודה B ? תשובה : B ( <Blank /> , <Blank /> )</p></SubQuestion>
        <SubQuestion label="ג."><p>מהו שטח המשולש AOB ? הַציגו את דרך הפתרון.</p><AnswerLine /></SubQuestion>
      </Question>
    </PageLayout>
  );
}

// Page 43 — תשע"ד
export function Ch7Page5() {
  return (
    <PageLayout pageNumber={43} chapter={CH} topic={TOPIC}>

      <Question>
        <p>לפניכם סרטוט של מסילה ישרה לתליית תמונות. על המסילה תלויות שלוש לוּלָאות המסומנות בנקודות A , B , C . המרחקים AB , BC בין הלולאות נתונים בסרטוט.</p>
        <HookRail />
        <SubQuestion label="א."><p>מהו היחס בין AB ובין BC ? כִּתבו את תשובתכם כיחס מצומצם. תשובה : <Blank /></p></SubQuestion>
        <SubQuestion label="ב.">
          <p>הֵזיזו את לולאה B ב-60 ס"מ על המסילה לכיוון לולאה A . מהו היחס בין AB ובין BC לאחר ההזזה?</p>
          <MultipleChoice options={[
            { value: '1 : 2' },
            { value: '1 : 3' },
            { value: '1 : 4' },
            { value: '1 : 6' },
          ]} />
        </SubQuestion>
        <SubQuestion label="ג."><p>על-סמך הנתונים שבסרטוט, בכמה ס"מ צריך להזיז את לולאה B על המסילה ממקומה המקורי לכיוון לולאה C כדי שהיחס בין AB ובין BC יהיה 1 : 1 ?</p><CalculationResponse lines={3} unit='ס"מ' /></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>לפניכם סרטוט של שני משולשים דומים : ∆ABC ∼ ∆DEF . (הדמיון כתוב לפי סדר הקדקודים המתאימים.) האורך של צלעות המשולש DEF נתון בסרטוט.</p>
        <SimilarTriangles />
        <p>יחס הדמיון בין משולש ABC למשולש DEF הוא 3 : 1 . מהו היקף המשולש ABC בס"מ ?</p>
        <CalculationResponse lines={3} unit='ס"מ' />
      </Question>
    </PageLayout>
  );
}

// Page 44 — תשע"ג Q1-Q3
export function Ch7Page6() {
  return (
    <PageLayout pageNumber={44} chapter={CH} topic={TOPIC}>

      <Question>
        <p>בבחירות למועצת תלמידים קיבל רן 300 קולות ונעמה קיבלה 500 קולות. מה היחס בין מספר הקולות שקיבל רן למספר הקולות שקיבלה נעמה?</p>
        <MultipleChoice options={[
          { value: '5 : 8' },
          { value: '2 : 5' },
          { value: '3 : 8' },
          { value: '3 : 5' },
        ]} />
      </Question>

      <QSep />

      <Question>
        <p>היום אלעד בן שנתיים ואביו בן 32 .</p>
        <SubQuestion label="א.">
          <p>הַשלימו את החסר בטבלה שלפניכם.</p>
          <WorksheetTable
            headers={['', 'הגיל של אלעד', 'הגיל של אביו', 'היחס בין הגיל של אלעד לגיל של אביו']}
            rows={[
              ['היום', '', '', ''],
              ['בעוד 4 שנים', '', '', ''],
            ]}
          />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>איזה מהיחסים שלפניכם יכול להיות היחס בין הגיל של אלעד לגיל של אביו בעוד יותר מ-4 שנים מהיום?</p>
          <MultipleChoice options={[
            { value: '1 : 16' },
            { value: '1 : 8' },
            { value: '1 : 4' },
            { value: '1 : 1' },
          ]} />
        </SubQuestion>
        <SubQuestion label="ג."><p>בעוד כמה שנים מהיום יהיה הגיל של האב גדול פי 3 מהגיל של אלעד? הַציגו את דרך הפתרון :</p><CalculationResponse lines={4} /></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בבחירות למועצת תלמידים קיבל רן 200 קולות ונעמה קיבלה 700 קולות. מה היחס בין מספר הקולות שקיבל רן למספר הקולות שקיבלה נעמה?</p>
        <MultipleChoice options={[
          { value: '2 : 9' },
          { value: '5 : 7' },
          { value: '2 : 7' },
          { value: '7 : 9' },
        ]} />
      </Question>
    </PageLayout>
  );
}

// Page 45 — תשע"ג Q4 (kangaroo)
export function Ch7Page7() {
  return (
    <PageLayout pageNumber={45} chapter={CH} topic={TOPIC}>

      <Question>
        <p>ארבעה גורים של קנגורו קפצו לאורך שביל של 120 מ' . כל קנגורו עבר מרחק קבוע בכל אחת מהקפיצות שלו, מרחק זה היה שונה מקנגורו לקנגורו. הדיאגרמה שלפניכם מתארת את מספר הקפיצות שקפץ כל קנגורו לאורך השביל מתחילתו ועד סופו.</p>
        <KangarooChart />
        <SubQuestion label="א.">
          <p>איזה קנגורו עבר את המרחק הגדול ביותר בכל קפיצה?</p>
          <MultipleChoice options={[
            { value: "קנגורו א'" },
            { value: "קנגורו ב'" },
            { value: "קנגורו ג'" },
            { value: "קנגורו ד'" },
          ]} />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>סַמנו ב-☒ ליד כל טענה אם היא נכונה או לא נכונה.</p>
          <WorksheetTable
            headers={['', 'הטענה', 'נכונה', 'לא נכונה']}
            rows={[
              ['1.', "היחס בין מספר הקפיצות שקפץ קנגורו א' למספר הקפיצות שקפץ קנגורו ב' היה 3 : 2 .", '□', '□'],
              ['2.', "מספר הקפיצות הממוצע של ארבעת גורֵי הקנגורו מתחילת השביל ועד סופו היה 24 .", '□', '□'],
              ['3.', "אם המרחק שיעבור קנגורו ד' בכל קפיצה לא ישתנה, הוא יעבור ב-100 קפיצות מרחק של 2,000 מטרים.", '□', '□'],
            ]}
          />
        </SubQuestion>
      </Question>
    </PageLayout>
  );
}

// Page 46 — תשע"ב
export function Ch7Page8() {
  return (
    <PageLayout pageNumber={46} chapter={CH} topic={TOPIC}>

      <Question>
        <p>ביממה יש 24 שעות. היחס בין מספר השעות שדניאל יְשֵׁנה ביממה למספר השעות שבהן היא ערה הוא 1 : 2 . כמה שעות דניאל יְשֵׁנה ביממה?</p>
        <p className="mt-1">תשובה : <Blank /> שעות</p>
      </Question>

      <QSep />

      <Question>
        <p>נֹגַה הכינה עוגיות למסיבה. לפניכם המַתכּוֹן שבו השתמשה להכנת הבצק לעוגיות.</p>
        <div className="info-box">
          <p><strong>מתכון להכנת בצק לעוגיות</strong></p>
          <p>מערבבים בקערה את המצרכים האלה :</p>
          <p>2 כוסות קמח &nbsp;·&nbsp; <Frac num={1} den={2} /> כוס סוכר &nbsp;·&nbsp; <Frac num={1} den={4} /> כוס חלב &nbsp;·&nbsp; 100 גר' חמאה</p>
        </div>
        <SubQuestion label="א.">
          <p>מה היחס בין כמות הסוכר לכמות החלב במתכון של נֹגַה?</p>
          <MultipleChoice options={[
            { value: '2 : 1' },
            { value: '3 : 1' },
            { value: '5 : 2' },
            { value: '3 : 2' },
          ]} />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>בָּר רצה להשתמש באותו המתכון ולהכין כמות גדולה יותר של עוגיות. הוא שפך לקערה 3 כוסות קמח. הַשלימו את הכמויות החדשות ברשימת המצרכים שלפניכם :</p>
          <p><u>3</u> כוסות קמח &nbsp;·&nbsp; <Blank /> כוס סוכר &nbsp;·&nbsp; <Blank /> כוס חלב &nbsp;·&nbsp; <Blank /> גר' חמאה</p>
        </SubQuestion>
      </Question>
    </PageLayout>
  );
}

// Page 47 — תשע"א Q1, Q4, Q5
export function Ch7Page9() {
  return (
    <PageLayout pageNumber={47} chapter={CH} topic={TOPIC}>

      <Question>
        <p>בכיתה ח1 בבית הספר "עלומים" נערך סקר, ובו נשאלו התלמידים אם הם בעד או נגד תלבושת אחידה. 12 תלמידים השיבו שהם בעד תלבושת אחידה, ו-27 תלמידים השיבו שהם נגד. מה היחס בין מספר התלמידים שהצביעו בעד למספר התלמידים שהצביעו נגד?</p>
        <MultipleChoice options={[
          { value: '15 : 1' },
          { value: '12 : 27' },
          { value: '9 : 4' },
          { value: '4 : 9' },
        ]} />
      </Question>

      <QSep />

      <Question>
        <p>בבית קולנוע הוקרנו באותו הזמן שני סרטים בשני אולמות. היחס בין מספר הצופים באולם "דקל" למספר הצופים באולם "ארז" בתחילת הסרט היה 1 : 3 . במהלך הסרט הצטרפו 9 צופים לאולם "דקל", ו-5 צופים עזבו את אולם "ארז". בסוף הסרט היה היחס בין מספר הצופים באולם "דקל" למספר הצופים באולם "ארז" 3 : 5 .</p>
        <SubQuestion label="א.">
          <p>x מייצג את מספר הצופים באולם "דקל" בתחילת הסרט. הַשלימו ביטויים אלגבריים מתאימים בטבלה :</p>
          <WorksheetTable
            headers={['', 'אולם "דקל"', 'אולם "ארז"']}
            rows={[
              ['בתחילת הסרט', 'x', ''],
              ['בסוף הסרט', '', ''],
            ]}
          />
        </SubQuestion>
        <SubQuestion label="ב."><p>מה היה מספר הצופים באולם "דקל" בתחילת הסרט? הַציגו את דרך הפתרון :</p><CalculationResponse lines={4} /></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בשכבת כיתות ח' בבית הספר "כלניות" יש יחס קבוע בין מספר הבנות למספר הבנים בכל אחת מכיתות השכבה. לפניכם טבלה (חסרים בה כמה נתונים) :</p>
        <WorksheetTable
          headers={['כיתה', 'מספר בנים', 'מספר בנות']}
          rows={[
            ["ח'1", '16', '24'],
            ["ח'2", '', '21'],
            ["ח'3", '12', ''],
          ]}
        />
        <SubQuestion label="א."><p>היחס הקבוע בין מספר הבנות למספר הבנים בכל כיתה הוא : <Blank /></p></SubQuestion>
        <SubQuestion label="ב."><p>מספר הבנים בכיתה ח'2 הוא : <Blank /></p></SubQuestion>
        <SubQuestion label="ג."><p>מספר התלמידים (בנים ובנות) בשכבה הוא : <Blank /></p></SubQuestion>
        <SubQuestion label="ד."><p>4 בנות ו-4 בנים מכיתה ח'1 רוצים לעבור לכיתה ח'3. האם היחס בין מספר הבנות למספר הבנים בכיתה ח'1 יישאר כפי שהיה? סַמנו : <strong>כן / לא</strong> . נַמקו :</p><WorkArea lines={4} label="נימוק:" /></SubQuestion>
      </Question>
    </PageLayout>
  );
}

// Page 48 — תשע"א Q2, Q3 (גאומטריה)
export function Ch7Page10() {
  return (
    <PageLayout pageNumber={48} chapter={CH} topic={TOPIC}>

      <Question>
        <p>לפניכם סרטוט של טרפז ישר-זווית ABCD . BE גובה לצלע CD .</p>
        <Trapezoid />
        <SubQuestion label="א."><p>מה היקף הטרפז ABCD ? הַציגו את דרך הפתרון. תשובה : <Blank /> ס"מ</p><AnswerLine /></SubQuestion>
        <SubQuestion label="ב.">
          <p>מה היחס בין שטח המשולש BEC לשטח הטרפז ABCD ?</p>
          <MultipleChoice options={[
            { value: '3 : 1' },
            { value: '5 : 1' },
            { value: '6 : 1' },
            { value: '10 : 1' },
          ]} />
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>לפניכם משולש ישר-זווית ABC ( ∢B = 90° ) . BDFE הוא מלבן החסום במשולש.</p>
        <RightTriInscribedRect />
        <SubQuestion label="א."><p>הַסבירו מדוע המשולשים ADF ו-ABC דומים.</p><AnswerLine /></SubQuestion>
        <SubQuestion label="ב.">
          <p>נתון גם : DF = 5 ס"מ , BC = 15 ס"מ , AB = 18 ס"מ .</p>
          <p>ב1. מה יחס הדמיון בין המשולשים ABC , ADF ? תשובה : <Blank /></p>
          <p>ב2. מה שטח המלבן BDFE ? הַציגו את דרך הפתרון :</p>
          <AnswerLine />
        </SubQuestion>
      </Question>
    </PageLayout>
  );
}
