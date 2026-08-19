import {
  FinalAnswer,
  PageLayout,
  QSep,
  Question,
  SubQuestion,
  WorkArea,
} from '../pages/PageLayout';

const CH = 'פרק 5 – יחס בגאומטריה ובכמויות';

function MidpointTriangle() {
  return (
    <div className="geo-figure compact">
      <svg
        viewBox="0 0 130 165"
        className="geo-svg"
        role="img"
        aria-label="משולש ישר זווית ABC, הזווית ב־B ישרה, E אמצע AB ו־D אמצע BC, AB=10a, BC=4a"
        shapeRendering="geometricPrecision"
      >
        <polygon points="30,15 30,135 78,135" fill="none" stroke="#172554" strokeWidth="1.8" />
        <rect x="30" y="125" width="10" height="10" fill="none" stroke="#172554" strokeWidth="1.3" />
        <circle cx="30" cy="75" r="2.5" fill="#172554" />
        <circle cx="54" cy="135" r="2.5" fill="#172554" />
        <text x="21" y="13">A</text><text x="19" y="150">B</text><text x="80" y="150">C</text>
        <text x="16" y="79">E</text><text x="49" y="129">D</text>
        <text x="13" y="75" transform="rotate(-90 13 75)" textAnchor="middle" direction="ltr">10a</text>
        <text x="54" y="152" textAnchor="middle" direction="ltr">4a</text>
      </svg>
    </div>
  );
}

function CookieTray({ label, brown, total = 20 }: { label: string; brown: number; total?: number }) {
  return (
    <div className="tray">
      <div className="tray-grid ratio-tray-grid-5">
        {Array.from({ length: total }).map((_, index) => (
          <div key={index} className={`cookie ${index < brown ? 'brown' : 'white-cookie'}`} />
        ))}
      </div>
      <span className="tray-num">{label}</span>
    </div>
  );
}

function RectangleChallenge() {
  return (
    <div className="geo-figure compact">
      <svg
        viewBox="0 0 240 100"
        className="geo-svg"
        role="img"
        aria-label="מלבן ABCD שאורכו 6p ורוחבו 2p, E ו־F אמצעי הצלעות AB ו־DC"
        shapeRendering="geometricPrecision"
      >
        <rect x="20" y="20" width="200" height="60" fill="none" stroke="#172554" strokeWidth="1.8" />
        <line x1="120" y1="20" x2="20" y2="80" stroke="#1e40af" strokeWidth="1.2" />
        <line x1="120" y1="20" x2="220" y2="80" stroke="#1e40af" strokeWidth="1.2" />
        <line x1="120" y1="20" x2="120" y2="80" stroke="#1e40af" strokeWidth="1.2" />
        <text x="10" y="18">A</text><text x="225" y="18">B</text><text x="225" y="94">C</text><text x="10" y="94">D</text><text x="116" y="15">E</text><text x="116" y="95">F</text>
        <text x="120" y="12" textAnchor="middle" direction="ltr">6p</text><text x="228" y="54" direction="ltr">2p</text><text x="170" y="94" direction="ltr">3p</text>
      </svg>
    </div>
  );
}

export function RatioPage29() {
  return (
    <PageLayout pageNumber={29} chapter={CH} className="ratio-page-29">
      <Question>
        <p>במשולש ישר־הזווית ABC מתקיים <span dir="ltr">∠ABC=90°</span>. הנקודה E היא אמצע AB והנקודה D היא אמצע BC. נתון <span dir="ltr">AB=10a</span> ו־<span dir="ltr">BC=4a</span>.</p>
        <MidpointTriangle />
        <SubQuestion label="א.">
          <p>הביעו באמצעות a את האורכים BE ו־CD.</p>
          <WorkArea lines={2} />
          <FinalAnswer label={'⁦BE =⁩'} />
          <FinalAnswer label={'⁦CD =⁩'} />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>חשבו את היחס בין שטח △ABC לשטח △ADC.</p>
          <WorkArea lines={3} />
          <FinalAnswer type="ratio" />
        </SubQuestion>
        <SubQuestion label="ג.">
          <p>חשבו את היחס בין שטח △BCE לשטח △ABC.</p>
          <WorkArea lines={3} />
          <FinalAnswer type="ratio" />
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בכל מגש 20 עוגיות חומות ולבנות.</p>
        <div className="cookie-trays compact">
          <CookieTray label="1" brown={8} />
          <CookieTray label="2" brown={5} />
          <CookieTray label="3" brown={4} />
        </div>
        <SubQuestion label="א.">
          <p>באיזה מגש היחס חומות : לבנות הוא 1 : 4?</p>
          <FinalAnswer label="מגש:" />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>מאחדים את מגשים 2 ו־3. מהו היחס לבנות : חומות?</p>
          <WorkArea lines={2} />
          <FinalAnswer type="ratio" />
        </SubQuestion>
        <SubQuestion label="ג.">
          <p>מאחדים את מגשים 1 ו־3. איזה אחוז מהעוגיות חומות?</p>
          <WorkArea lines={3} />
          <FinalAnswer unit="%" />
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בכוס 2 יש 400 מ״ל מיץ, והיחס בין הכמות בכוס 1 לכמות בכוס 2 הוא 1 : 4.</p>
        <SubQuestion label="א.">
          <p>כמה מ״ל יש בכוס 1?</p>
          <WorkArea lines={2} />
          <FinalAnswer unit="מ״ל" />
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>מעבירים 50 מ״ל מכוס 2 לכוס 1. איזה אחוז מכלל המיץ נמצא כעת בכוס 2?</p>
          <WorkArea lines={3} />
          <FinalAnswer unit="%" />
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>במלבן ABCD נתון AB=6p,‏ AD=2p. הנקודות E ו־F הן אמצעי הצלעות AB ו־DC, ולכן CF=3p.</p>
        <RectangleChallenge />
        <SubQuestion label="א."><p>קבעו נכון או לא נכון:</p></SubQuestion>
        <div className="checkbox-list">
          <span>1. היקף המלבן : AB = 16 : 6.</span>
          <span>2. BC : היקף המלבן = 1 : 8.</span>
          <span>3. BC : AB = 6 : 2.</span>
        </div>
        <SubQuestion label="ב.">
          <p>השלימו: שטח המלבן : שטח △DEF =</p>
          <FinalAnswer type="ratio" />
        </SubQuestion>
        <SubQuestion label="ג.">
          <p>שטח △BEF : שטח המלבן =</p>
          <FinalAnswer type="ratio" />
        </SubQuestion>
        <SubQuestion label="ד.">
          <p>שטח △CDE : שטח △ADE =</p>
          <FinalAnswer type="ratio" />
        </SubQuestion>
      </Question>
    </PageLayout>
  );
}
