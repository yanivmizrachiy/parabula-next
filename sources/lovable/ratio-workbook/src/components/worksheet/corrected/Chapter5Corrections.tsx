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
      <svg viewBox="0 0 180 145" className="geo-svg" role="img" aria-label="משולש ישר זווית ABC, זווית B ישרה, E אמצע AB ו־D אמצע BC">
        <polygon points="25,20 25,125 155,125" fill="none" stroke="#172554" strokeWidth="1.8" />
        <rect x="25" y="115" width="10" height="10" fill="none" stroke="#172554" strokeWidth="1" />
        <circle cx="25" cy="72.5" r="2.5" fill="#172554" />
        <circle cx="90" cy="125" r="2.5" fill="#172554" />
        <text x="15" y="18">A</text><text x="13" y="139">B</text><text x="160" y="139">C</text>
        <text x="11" y="76">E</text><text x="88" y="141">D</text>
        <text x="7" y="74" transform="rotate(-90 7 74)">10a</text>
        <text x="92" y="120" textAnchor="middle">4a</text>
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
      <svg viewBox="0 0 240 100" className="geo-svg" role="img" aria-label="מלבן ABCD שאורכו 6p ורוחבו 2p, E ו־F אמצעי הצלעות AB ו־DC">
        <rect x="20" y="20" width="200" height="60" fill="none" stroke="#172554" strokeWidth="1.8" />
        <line x1="120" y1="20" x2="20" y2="80" stroke="#1e40af" strokeWidth="1.2" />
        <line x1="120" y1="20" x2="220" y2="80" stroke="#1e40af" strokeWidth="1.2" />
        <line x1="120" y1="20" x2="120" y2="80" stroke="#1e40af" strokeWidth="1.2" />
        <text x="10" y="18">A</text><text x="225" y="18">B</text><text x="225" y="94">C</text><text x="10" y="94">D</text><text x="116" y="15">E</text><text x="116" y="95">F</text>
        <text x="120" y="12" textAnchor="middle">6p</text><text x="228" y="54">2p</text><text x="170" y="94">3p</text>
      </svg>
    </div>
  );
}

export function RatioPage29() {
  return (
    <PageLayout pageNumber={29} chapter={CH} className="ratio-page-29">
      <Question>
        <p>במשולש ישר־הזווית ABC מתקיים ∠ABC=90°. הנקודה E היא אמצע AB והנקודה D היא אמצע BC. נתון AB=10a ו־BC=4a.</p>
        <MidpointTriangle />
        <SubQuestion label="א."><p>הביעו באמצעות a את האורכים BE ו־CD.</p></SubQuestion>
        <SubQuestion label="ב."><p>חשבו את היחס בין שטח △ABC לשטח △ADC.</p></SubQuestion>
        <SubQuestion label="ג."><p>חשבו את היחס בין שטח △BCE לשטח △ABC.</p></SubQuestion>
        <div className="response-set">
          <WorkArea lines={1} />
          <FinalAnswer label="א. BE, CD:" />
          <FinalAnswer label="ב." type="ratio" />
          <FinalAnswer label="ג." type="ratio" />
        </div>
      </Question>

      <QSep />

      <Question>
        <p>בכל מגש 20 עוגיות חומות ולבנות.</p>
        <div className="cookie-trays compact">
          <CookieTray label="1" brown={8} />
          <CookieTray label="2" brown={5} />
          <CookieTray label="3" brown={4} />
        </div>
        <SubQuestion label="א."><p>באיזה מגש היחס חומות : לבנות הוא 1 : 4?</p></SubQuestion>
        <SubQuestion label="ב."><p>מאחדים את מגשים 2 ו־3. מהו היחס לבנות : חומות?</p></SubQuestion>
        <SubQuestion label="ג."><p>מאחדים את מגשים 1 ו־3. איזה אחוז מהעוגיות חומות?</p></SubQuestion>
        <div className="response-set">
          <WorkArea lines={1} />
          <FinalAnswer label="א. מגש:" />
          <FinalAnswer label="ב." type="ratio" />
          <FinalAnswer label="ג." unit="%" />
        </div>
      </Question>

      <QSep />

      <Question>
        <p>בכוס 2 יש 400 מ״ל מיץ, והיחס בין הכמות בכוס 1 לכמות בכוס 2 הוא 1 : 4.</p>
        <SubQuestion label="א."><p>כמה מ״ל יש בכוס 1?</p></SubQuestion>
        <SubQuestion label="ב."><p>מעבירים 50 מ״ל מכוס 2 לכוס 1. איזה אחוז מכלל המיץ נמצא כעת בכוס 2?</p></SubQuestion>
        <div className="response-set">
          <WorkArea lines={1} />
          <FinalAnswer label="א." unit="מ״ל" />
          <FinalAnswer label="ב." unit="%" />
        </div>
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
        <SubQuestion label="ב."><p>השלימו את היחס בין שטח המלבן לשטח △DEF.</p></SubQuestion>
        <SubQuestion label="ג."><p>השלימו את היחס בין שטח △BEF לשטח המלבן.</p></SubQuestion>
        <SubQuestion label="ד."><p>השלימו את היחס בין שטח △CDE לשטח △ADE.</p></SubQuestion>
        <div className="response-set">
          <WorkArea lines={1} />
          <FinalAnswer label="ב." type="ratio" />
          <FinalAnswer label="ג." type="ratio" />
          <FinalAnswer label="ד." type="ratio" />
        </div>
      </Question>
    </PageLayout>
  );
}
