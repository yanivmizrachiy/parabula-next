import {
  CalculationResponse,
  MultipleChoice,
  OrderedPairAnswer,
  PageLayout,
  QSep,
  Question,
  RatioAnswer,
  SubQuestion,
  WorkArea,
} from '../pages/PageLayout';

const CH = 'פרק 7 – יחס בנתונים, תרשימים וגאומטריה';

function CoordinateTriangles() {
  const originX = 62;
  const originY = 184;
  const scale = 9;
  return (
    <div className="svg-center svg-center--tight">
      <svg
        viewBox="0 0 300 215"
        width="320"
        height="230"
        role="img"
        aria-label="מערכת צירים ובה משולשים דומים DOC ו־AOB"
        shapeRendering="geometricPrecision"
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <line key={`v-${index}`} x1={originX + index * scale} y1="20" x2={originX + index * scale} y2={originY} stroke="#e2e2e2" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 17 }).map((_, index) => (
          <line key={`h-${index}`} x1={originX} y1={originY - index * scale} x2="270" y2={originY - index * scale} stroke="#e2e2e2" strokeWidth="0.5" />
        ))}
        <line x1="30" y1={originY} x2="280" y2={originY} stroke="#172554" strokeWidth="1.5" />
        <line x1={originX} y1="12" x2={originX} y2="202" stroke="#172554" strokeWidth="1.5" />
        <polygon points={`${originX},${originY} ${originX + 4 * scale},${originY} ${originX},${originY - 6 * scale}`} fill="#eef2ff" stroke="#1e40af" strokeWidth="1.6" />
        <polygon points={`${originX},${originY} ${originX + 10 * scale},${originY} ${originX},${originY - 15 * scale}`} fill="none" stroke="#172554" strokeWidth="2" />
        <text x={originX - 12} y={originY + 16}>O</text>
        <text x={originX + 4 * scale} y={originY + 16} direction="ltr">C(4,0)</text>
        <text x={originX - 45} y={originY - 6 * scale} direction="ltr">D(0,6)</text>
        <text x={originX + 10 * scale} y={originY + 16} direction="ltr">A(10,0)</text>
        <text x={originX - 50} y={originY - 15 * scale} direction="ltr">B(0,15)</text>
      </svg>
    </div>
  );
}

export function RatioPage42() {
  return (
    <PageLayout pageNumber={42} chapter={CH} className="ratio-page-42">

      <Question>
        <p>סמנו את היחס השווה ל־3 : 7.</p>
        <MultipleChoice options={[
          { value: '6 : 10' },
          { value: '9 : 21' },
          { value: '21 : 35' },
          { value: '30 : 40' },
        ]} />
      </Question>

      <QSep />

      <Question>
        <p>סמנו את היחס השווה ל־4 : 5.</p>
        <MultipleChoice options={[
          { value: '28 : 40' },
          { value: '20 : 30' },
          { value: '16 : 25' },
          { value: '12 : 15' },
        ]} />
      </Question>

      <QSep />

      <Question>
        <p>במערכת הצירים מסורטטים שני משולשים ישרי־זווית דומים: △DOC ∼ △AOB. הנקודות הן O(0,0),‏ D(0,6),‏ C(4,0),‏ A(10,0).</p>
        <CoordinateTriangles />
        <SubQuestion label="א.">
          <p>מהו יחס הדמיון בין △DOC ל־△AOB?</p>
          <MultipleChoice options={[
            { value: '1 : 4' },
            { value: '2 : 5' },
            { value: '3 : 5' },
            { value: '3 : 20' },
          ]} />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>מהם שיעורי הנקודה B?</p>
          <OrderedPairAnswer label={'⁦B =⁩'} />
        </SubQuestion>
        <SubQuestion label="ג.">
          <p>מהו שטח △AOB? הציגו דרך פתרון.</p>
          <CalculationResponse lines={2} />
        </SubQuestion>
      </Question>
    </PageLayout>
  );
}

function TrapezoidModel() {
  return (
    <div className="svg-center svg-center--tight">
      <svg
        viewBox="0 0 300 170"
        width="330"
        height="185"
        role="img"
        aria-label="טרפז ישר זווית שבו AB שווה 12, CD שווה 18, AD ו־BE שווים 8, BC שווה 10 ו־EC שווה 6"
        shapeRendering="geometricPrecision"
      >
        <polygon points="45,30 165,30 225,110 45,110" fill="#fff" stroke="#172554" strokeWidth="1.8" />
        <line x1="165" y1="30" x2="165" y2="110" stroke="#1e40af" strokeWidth="1.4" strokeDasharray="4 3" />
        <rect x="165" y="101" width="9" height="9" fill="none" stroke="#172554" strokeWidth="1" />
        <text x="34" y="27">A</text><text x="168" y="27">B</text><text x="231" y="115">C</text><text x="34" y="125">D</text><text x="158" y="125">E</text>
        <text x="105" y="24" textAnchor="middle" direction="ltr">12</text>
        <text x="135" y="126" textAnchor="middle" direction="ltr">12</text>
        <text x="195" y="126" textAnchor="middle" direction="ltr">6</text>
        <text x="36" y="72" direction="ltr">8</text>
        <text x="190" y="65" direction="ltr">10</text>
      </svg>
    </div>
  );
}

function InscribedRectangleModel() {
  return (
    <div className="svg-center svg-center--tight">
      <svg
        viewBox="0 0 230 250"
        width="240"
        height="250"
        role="img"
        aria-label="משולש ישר זווית ABC, זווית B ישרה, מלבן BDFE חסום, DF=5, BC=15, AB=18"
        shapeRendering="geometricPrecision"
      >
        <polygon points="40,53 40,215 175,215" fill="#fff" stroke="#172554" strokeWidth="1.8" />
        <rect x="40" y="107" width="45" height="108" fill="#eef2ff" stroke="#1e40af" strokeWidth="1.5" />
        <rect x="40" y="205" width="10" height="10" fill="none" stroke="#172554" strokeWidth="1.2" />
        <text x="28" y="50">A</text><text x="27" y="230">B</text><text x="179" y="230">C</text>
        <text x="27" y="110">D</text><text x="88" y="103">F</text><text x="88" y="230">E</text>
        <text x="22" y="140" transform="rotate(-90 22 140)" textAnchor="middle" direction="ltr">AB=18</text>
        <text x="107" y="233" textAnchor="middle" direction="ltr">BC=15</text>
        <text x="62" y="100" textAnchor="middle" direction="ltr">DF=5</text>
      </svg>
    </div>
  );
}

export function RatioPage48() {
  return (
    <PageLayout pageNumber={48} chapter={CH} className="ratio-page-48">

      <Question>
        <p>בטרפז ישר־הזווית ABCD,‏ BE הוא גובה לצלע CD. נתון AB=12 ס״מ,‏ AD=BE=8 ס״מ,‏ EC=6 ס״מ ו־BC=10 ס״מ.</p>
        <TrapezoidModel />
        <SubQuestion label="א.">
          <p>מהו היקף הטרפז? הציגו דרך פתרון.</p>
          <CalculationResponse lines={2} unit="ס״מ" />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>מהו היחס בין שטח △BEC לשטח הטרפז ABCD?</p>
          <MultipleChoice options={[
            { value: '1 : 3' },
            { value: '1 : 5' },
            { value: '1 : 6' },
            { value: '1 : 10' },
          ]} />
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>במשולש ישר־הזווית ABC מתקיים ∠B=90°. המלבן BDFE חסום במשולש. נתון DF=5 ס״מ,‏ BC=15 ס״מ ו־AB=18 ס״מ.</p>
        <InscribedRectangleModel />
        <SubQuestion label="א.">
          <p>הסבירו מדוע △ADF ∼ △ABC.</p>
          <WorkArea label="הסבר:" lines={2} />
        </SubQuestion>
        <SubQuestion label="ב1.">
          <p>מהו יחס הדמיון △ADF : △ABC?</p>
          <RatioAnswer />
        </SubQuestion>
        <SubQuestion label="ב2.">
          <p>מהו שטח המלבן BDFE? הציגו דרך פתרון.</p>
          <CalculationResponse lines={2} />
        </SubQuestion>
      </Question>
    </PageLayout>
  );
}
