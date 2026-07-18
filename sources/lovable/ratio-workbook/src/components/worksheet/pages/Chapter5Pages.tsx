import { PageLayout, Question, SubQuestion, Blank, Checkbox, Frac, QSep } from './PageLayout';

const CH = 'פרק 5 – שאלות אתגר';

// ── Page 15: All challenge questions ──
export function Ch5Page1() {
  return (
    <PageLayout pageNumber={29} chapter={CH}>
      <Question>
        <p>(*) הנקודות D ו-E הן אמצעי הצלעות במשולש ΔABC ישר הזווית (∠ABC = 90°).</p>
        <p>נתון : AB = 10a, BC = 4a.</p>
        <div className="geo-figure compact">
          <svg viewBox="0 0 150 110" className="geo-svg">
            <polygon points="20,10 20,100 130,100" fill="none" stroke="#000" strokeWidth="1.5" />
            <rect x="20" y="90" width="10" height="10" fill="none" stroke="#000" strokeWidth="1" />
            <circle cx="20" cy="55" r="2" fill="#000" /><text x="12" y="58" fontSize="9">E</text>
            <circle cx="75" cy="100" r="2" fill="#000" /><text x="75" y="112" fontSize="9">D</text>
            <text x="15" y="7" fontSize="9">A</text><text x="15" y="112" fontSize="9">C</text><text x="135" y="112" fontSize="9">B</text>
          </svg>
        </div>
        <SubQuestion label="א."><p>הביעו באמצעות a את אורכי הקטעים : 1) BE  2) CD.</p></SubQuestion>
        <SubQuestion label="ב.">
          <p>1) היחס בין שטח ΔABC לשטח ΔADC הוא <Blank /> .</p>
          <p>2) היחס בין שטח ΔBCE לשטח ΔABC הוא <Blank /> .</p>
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>(*) שרית הכינה שלושה מגשים של עוגיות משוקולד חום ושוקולד לבן.</p>
        <div className="cookie-trays compact">
          <div className="tray">
            <div className="tray-grid">
              {[1,1,1,1,0,1,1,1,0,0,1,1,0,0,0,1].map((filled, i) => (
                <div key={i} className={`cookie ${filled ? 'brown' : 'white-cookie'}`} />
              ))}
            </div>
            <span className="tray-num">1</span>
          </div>
          <div className="tray">
            <div className="tray-grid">
              {[1,1,1,1,0,1,1,1,0,0,1,1,0,0,0,0].map((filled, i) => (
                <div key={i} className={`cookie ${filled ? 'brown' : 'white-cookie'}`} />
              ))}
            </div>
            <span className="tray-num">2</span>
          </div>
          <div className="tray">
            <div className="tray-grid">
              {[1,1,1,1,0,1,1,0,0,0,1,0,0,0,0,0].map((filled, i) => (
                <div key={i} className={`cookie ${filled ? 'brown' : 'white-cookie'}`} />
              ))}
            </div>
            <span className="tray-num">3</span>
          </div>
        </div>
        <SubQuestion label="א."><p>היחס בין מספר העוגיות החומות לבין מספר הלבנות הוא 1:4 במגש מספר <Blank /> .</p></SubQuestion>
        <SubQuestion label="ב."><p>אם תכולת מגשים 2 ו-3 תוכנס לשקית אז היחס בין הלבנות לחומות יהיה <Blank /> .</p></SubQuestion>
        <SubQuestion label="ג."><p>תכולת מגשים 1 ו-3 בשקית אחת. העוגיות החומות הן <Blank /> % מסך הכל.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>(*) נתונות שתי כוסות מיץ. בכוס 2 יש 400 מ"ל מיץ. היחס בין כמות המיץ בכוס 1 לבין כמות המיץ בכוס 2 הוא 1:4.</p>
        <SubQuestion label="א."><p>בכוס 1 יש : (1) 100 מ"ל  (2) 1,600 מ"ל  (3) 200 מ"ל  (4) 250 מ"ל</p></SubQuestion>
        <SubQuestion label="ב."><p>מעבירים 50 מ"ל מכוס 2 לכוס 1. לאחר ההעברה, בכוס 2 יש : (1) 30%  (2) 70%  (3) 87.5%  (4) 35%  מכמות המיץ בשתי הכוסות יחד.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>במלבן ABCD נתון : AB = 6p, AD = CF = 2p. הנקודה E היא אמצע AB.</p>
        <div className="geo-figure compact">
          <svg viewBox="0 0 200 65" className="geo-svg">
            <rect x="10" y="10" width="180" height="45" fill="none" stroke="#000" strokeWidth="1.5" />
            <line x1="100" y1="10" x2="10" y2="55" stroke="#000" strokeWidth="1" />
            <line x1="100" y1="10" x2="190" y2="55" stroke="#000" strokeWidth="1" />
            <circle cx="100" cy="10" r="2" fill="#000" />
            <text x="10" y="7" fontSize="9">A</text><text x="100" y="7" fontSize="9">E</text><text x="190" y="7" fontSize="9">B</text>
            <text x="10" y="67" fontSize="9">D</text><text x="190" y="67" fontSize="9">C</text><text x="100" y="67" fontSize="9">F</text>
          </svg>
        </div>
        <SubQuestion label="א.">
          <p>1) היחס בין היקף המלבן לאורכו AB הוא 16:6.  נכון / לא נכון</p>
          <p>2) היחס בין רוחב BC להיקף המלבן הוא 1:8.  נכון / לא נכון</p>
          <p>3) היחס בין רוחב BC לאורך AB הוא 6:2.  נכון / לא נכון</p>
        </SubQuestion>
        <SubQuestion label="ב.">
          <p>1) היחס בין שטח המלבן לשטח ΔDEF הוא <Blank /> .</p>
          <p>2) היחס בין שטח ΔBEF לשטח המלבן הוא <Blank /> .</p>
          <p>3) היחס בין שטח ΔCDE לשטח ΔADE הוא <Blank /> .</p>
        </SubQuestion>
      </Question>
    </PageLayout>
  );
}
