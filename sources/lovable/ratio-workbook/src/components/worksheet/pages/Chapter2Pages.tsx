import { PageLayout, Question, SubQuestion, Blank, WorksheetTable, Checkbox, Frac, AnswerLine, QSep, CalculationResponse, WorkArea, FinalAnswer } from './PageLayout';

const CH = 'פרק 2 – חלוקה ביחס נתון';

// ── Page 6: Q1-Q5 ──
export function Ch2Page1() {
  return (
    <PageLayout pageNumber={9} chapter={CH}>
      <Question>
        <p>בשק 54 כדורים. היחס בין מספר הכדורים הצהובים למספר הכדורים השחורים הוא 4 : 5.</p>
        <p>כמה כדורים צהובים וכמה כדורים שחורים בשק?</p>
        <div className="calculation-response">
          <WorkArea lines={3} />
          <FinalAnswer label="כדורים צהובים:" />
          <FinalAnswer label="כדורים שחורים:" />
        </div>
      </Question>

      <QSep />

      <Question>
        <p>ביממה יש 24 שעות. היחס בין מספר השעות שדניאל יָשֵׁנה ביממה למספר השעות שבהן היא ערה הוא 2 : 1 .</p>
        <p>כמה שעות דניאל יָשֵׁנה ביממה?</p>
        <AnswerLine />
      </Question>

      <QSep />

      <Question>
        <p>פועל וותיק מרכיב 7 חלקים, באותו זמן שפועל מתמחה מרכיב 3 חלקים.</p>
        <p>כיצד יחלקו ביניהם 80 חלקים להרכבה כך שיסיימו יחד את המשימה?</p>
        <div className="calculation-response">
          <WorkArea lines={3} />
          <FinalAnswer label="פועל וותיק:" />
          <FinalAnswer label="פועל מתמחה:" />
        </div>
      </Question>

      <QSep />

      <Question>
        <p>לדני וליוסי יחד יש 90 תקליטורים. לדני יש יותר תקליטורים מאשר ליוסי והיחס ביניהם הוא 7 : 2.</p>
        <p>כמה תקליטורים יש לכל אחד מהם?</p>
        <div className="calculation-response">
          <WorkArea lines={3} />
          <FinalAnswer label="לדני:" />
          <FinalAnswer label="ליוסי:" />
        </div>
      </Question>

      <QSep />

      <Question>
        <p>בכיתה ח נערכה הצבעה בה נשאלו התלמידים אם הם בעד או נגד תלבושת אחידה.</p>
        <p>היחס בין מספר התלמידים שהיו בעד לבין אלו שהיו נגד הוא 3 : 2. בכיתה 35 תלמידים.</p>
        <p>כמה תלמידים הצביעו בעד וכמה תלמידים הצביעו נגד?</p>
        <div className="calculation-response">
          <WorkArea lines={3} />
          <p className="answer-sentence"><Blank /> תלמידים הצביעו בעד ו־<Blank /> תלמידים הצביעו נגד.</p>
        </div>
      </Question>
    </PageLayout>
  );
}

// ── Page 7: Q6-Q8 ──
export function Ch2Page2() {
  return (
    <PageLayout pageNumber={10} chapter={CH}>
      <Question>
        <p>בכיתה ח' 4 היחס בין מספר הבנים לבין מספר הבנות בכיתה הוא 5:3. השלימו :</p>
        <SubQuestion label="א."><p>היחס בין מספר הבנות לבין מספר תלמידי הכיתה הוא : <Blank /> .</p></SubQuestion>
        <SubQuestion label="ב."><p>אם בכיתה לומדים 40 תלמידים סך הכל אז בכיתה לומדות <Blank /> בנות.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>במסגרת פעילות התנדבותית של תלמידי שכבת כיתות ח, חולקו תלמידי השכבה לשתי קבוצות ביחס של 2 : 3.</p>
        <p>בשכבת כיתות ח יש 95 תלמידים. כמה תלמידים בכל אחת מהקבוצות?</p>
        <div className="calculation-response">
          <WorkArea lines={3} />
          <FinalAnswer label="קבוצה א:" />
          <FinalAnswer label="קבוצה ב:" />
        </div>
      </Question>

      <QSep />

      <Question>
        <p>באולם תיאטרון 820 מקומות ישיבה. היחס בין מספר המושבים באולם לבין מספר המושבים ביציע הוא 1 : 4.</p>
        <p>כמה מושבים באולם התיאטרון וכמה מושבים ביציע?</p>
        <div className="calculation-response">
          <WorkArea lines={3} />
          <FinalAnswer label="מושבים באולם:" />
          <FinalAnswer label="מושבים ביציע:" />
        </div>
      </Question>

      <QSep />

      <Question>
        <p>בחוג כדורסל יש 20 מתאמנים. היחס בין מספר המתאמנים בעלי שיער שחור, חום וכתום הוא 3: 2: 5. השלימו :</p>
        <SubQuestion label="א."><p>רוב המשתתפים הם בעלי שיער <Blank /> .</p></SubQuestion>
        <SubQuestion label="ב."><p>בחוג יש <Blank /> משתתפים בעלי שיער כתום.</p></SubQuestion>
        <SubQuestion label="ג."><p>היחס בין מספר המשתתפים הכולל לבין מספר המתאמנים בעלי שיער כתום הוא <Blank /> .</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>היקפו של משולש הוא 30 ס"מ. היחס בין אורכי הצלעות הוא 6 : 5 : 4.</p>
        <p>חשבו את אורכי צלעות המשולש.</p>
        <div className="calculation-response">
          <WorkArea lines={3} />
          <FinalAnswer label="צלע ראשונה:" unit="ס״מ" />
          <FinalAnswer label="צלע שנייה:" unit="ס״מ" />
          <FinalAnswer label="צלע שלישית:" unit="ס״מ" />
        </div>
      </Question>

      <QSep />

      <Question>
        <p>אב חילק 45 שקלים בין שלושת ילדיו : דני, יאיר ונועה.</p>
        <p>סכום הכסף שקיבלו דני, יאיר ונועה הוא בהתאם ליחס 4 : 3 : 2.</p>
        <SubQuestion label="א."><p>מהו הסכום שקיבל דני?</p></SubQuestion>
        <SubQuestion label="ב."><p>מהו הסכום שקיבל יאיר?</p></SubQuestion>
        <SubQuestion label="ג."><p>מהו הסכום שקיבלה נועה?</p></SubQuestion>
      </Question>
    </PageLayout>
  );
}

// ── Page 8: Q12-Q14 ──
export function Ch2Page3() {
  return (
    <PageLayout pageNumber={11} chapter={CH}>
      <Question>
        <p>ביום קיץ הגיעו לבית הספר <strong>יותר מ-</strong> 65 תלמידים מכיתות ח. חלקם נעלו נעלי ספורט והיתר נעלו סנדלים.</p>
        <p>היחס בין מספר התלמידים שנעלו נעלי ספורט ובין מספר התלמידים שנעלו סנדלים היה 5 :3 .</p>
        <SubQuestion label="א."><p>הַסבירו מדוע לא ייתכן שבאותו יום הגיעו לבית הספר 83 תלמידים מכיתות ח.</p></SubQuestion>
        <SubQuestion label="ב."><p>כִּתבו אפשרות אחת למספר התלמידים מכיתות ח שהגיעו באותו יום לבית הספר.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>המחיר של סלט וכריך ביחד הוא 40 ש"ח. היחס בין מחיר הסלט לבין מחיר הכריך הוא 4: 1.</p>
        <SubQuestion label="א."><p>חשבו את מחיר הכריך.</p></SubQuestion>
        <SubQuestion label="ב.">
          <p>דניאל רכש ארבעה כריכים וסלט. היחס בין מחיר הסלט לבין הסכום הכולל שדניאל שילם הוא :</p>
          <div className="options-row">
            <span>(1) 2:1</span><span>(2) 32:32</span><span>(3) 32:16</span><span>(4) 1:2</span>
          </div>
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p><strong>יוסי תיקן את מכוניתו במוסך ושילם עבור התיקון 2,240 שקלים.</strong></p>
        <p><strong>היחס בין שכר העבודה לבין מחיר חלקי החילוף הוא 5 : 2.</strong></p>
        <SubQuestion label="א."><p><strong>מה היה שכר העבודה?</strong></p></SubQuestion>
        <SubQuestion label="ב."><p><strong>מה היה מחיר חלקי החילוף?</strong></p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בכיתה ח<sub>1</sub> יש 30 תלמידים. בכיתה ח<sub>2</sub> יש 32 תלמידים.</p>
        <p>עלות הטיול לשתי הכיתות יחד הייתה 2,480 שקלים. <strong>מה הייתה עלות הטיול לכל אחת מהכיתות?</strong></p>
      </Question>

      <QSep />

      <Question>
        <p>בחנות תבלינים מכינים תערובת משני תבלינים, קינמון ווניל, ביחס קבוע.</p>
        <p>לפניכם גרף המתאר את היחס בין התבלינים שבתערובת.</p>
        <div className="graph-container compact">
          <svg viewBox="0 0 300 220" className="ratio-graph">
            {Array.from({ length: 13 }).map((_, i) => (
              <line key={`v${i}`} x1={25 + i * 20} y1={10} x2={25 + i * 20} y2={200} stroke="#ddd" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 11 }).map((_, i) => (
              <line key={`h${i}`} x1={25} y1={10 + i * 18} x2={265} y2={10 + i * 18} stroke="#ddd" strokeWidth="0.5" />
            ))}
            <line x1="25" y1="200" x2="265" y2="200" stroke="#000" strokeWidth="2" />
            <line x1="25" y1="10" x2="25" y2="200" stroke="#000" strokeWidth="2" />
            <line x1="25" y1="200" x2="225" y2="10" stroke="#000" strokeWidth="2" />
            <circle cx="85" cy="140" r="4" fill="#000" />
            <circle cx="185" cy="55" r="4" fill="#000" />
            <text x="135" y="215" textAnchor="middle" fontSize="10">קינמון בגרמים</text>
            <text x="10" y="105" textAnchor="middle" fontSize="10" transform="rotate(-90, 10, 105)">וניל בגרמים</text>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map((n, i) => (
              <text key={n} x={45 + i * 20} y="213" textAnchor="middle" fontSize="8">{n}</text>
            ))}
            {[1,2,3,4,5,6,7,8,9,10].map((n, i) => (
              <text key={n} x="18" y={198 - i * 18} textAnchor="middle" fontSize="8">{n}</text>
            ))}
          </svg>
        </div>
        <SubQuestion label="א."><p>מהו היחס בין הקינמון לוניל בתערובת?</p></SubQuestion>
        <SubQuestion label="ב."><p>כמה גרם קינמון וכמה גרם וניל יש בתערובת שמשקלה 560 גרם?</p></SubQuestion>
      </Question>
    </PageLayout>
  );
}

// ── Page 9: Q17-Q19 ──
export function Ch2Page4() {
  return (
    <PageLayout pageNumber={12} chapter={CH}>
      <Question>
        <p>שותף אחד השקיע בעסקה 2000 שקלים, וחברו השקיע 3000 שקלים. הוסכם ביניהם שהרווח יחולק לפי יחס ההשקעות. איך יחלקו ביניהם רווח של 1200 שקלים?</p>
        <div className="calculation-response">
          <WorkArea lines={3} />
          <FinalAnswer label="השותף שהשקיע 2000:" unit="ש״ח" />
          <FinalAnswer label="השותף שהשקיע 3000:" unit="ש״ח" />
        </div>
      </Question>

      <QSep />

      <Question>
        <p>זווית אחת במשולש היא בת °120 . היחס בין שתי הזוויות האחרות הוא 1 : 5 .</p>
        <p>מה גודלן של שתי הזוויות האחרות במשולש ?</p>
        <div className="calculation-response">
          <WorkArea lines={3} />
          <FinalAnswer label="הזווית האחת:" unit="°" />
          <FinalAnswer label="הזווית השנייה:" unit="°" />
        </div>
      </Question>

      <QSep />

      <Question>
        <p>נתון : ΔAPB ו- ABCD ריבוע. שטח המצולע ADCBP בסרטוט הוא 66 סמ"ר. היחס בין שטח הריבוע לשטח המשולש הוא 5 : 6 .</p>
        <div className="geometry-figure">
          <svg viewBox="0 0 170 235" className="geo-svg" role="img" aria-label="משולש APB מעל ריבוע ABCD, PE גובה המשולש" shapeRendering="geometricPrecision">
            <rect x="60" y="160" width="45" height="45" fill="none" stroke="#000" strokeWidth="1.8" />
            <polygon points="82.5,52 60,160 105,160" fill="none" stroke="#000" strokeWidth="1.8" />
            <line x1="82.5" y1="52" x2="82.5" y2="160" stroke="#000" strokeWidth="1.1" strokeDasharray="4" />
            <rect x="82.5" y="152" width="8" height="8" fill="none" stroke="#000" strokeWidth="1" />
            <text x="82.5" y="46" textAnchor="middle" fontSize="11">P</text>
            <text x="50" y="158" textAnchor="end" fontSize="11">A</text>
            <text x="112" y="158" fontSize="11">B</text>
            <text x="50" y="216" textAnchor="end" fontSize="11">D</text>
            <text x="112" y="216" fontSize="11">C</text>
            <text x="92" y="172" fontSize="10">E</text>
          </svg>
        </div>
        <SubQuestion label="א."><p>חשבו את שטח הריבוע.</p><CalculationResponse lines={3} unit="סמ״ר" /></SubQuestion>
        <SubQuestion label="ב."><p>חשבו את שטח המשולש.</p><CalculationResponse lines={3} unit="סמ״ר" /></SubQuestion>
        <SubQuestion label="ג."><p>מהו היחס בין אורך צלע הריבוע לגובה של המשולש PE ?</p></SubQuestion>
      </Question>
    </PageLayout>
  );
}

// ── Page 10 (NEW): שאלות חלוקה גיאומטריות ושינוי יחס ──
export function Ch2Page5() {
  return (
    <PageLayout pageNumber={13} chapter={CH}>
      <Question>
        <p>שטחו של מלבן הוא 48 סמ"ר. היחס בין צלעותיו הוא 3 : 1 .</p>
        <SubQuestion label="א."><p>חשבו את אורכי צלעות המלבן.</p></SubQuestion>
        <SubQuestion label="ב."><p>חשבו את היקף המלבן.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>היחס בין מספר הכדורים בשקים <strong>א', ב' ו-ג'</strong> הוא 3 : 5 : 2 .</p>
        <div className="bags-illustration compact">
          <svg viewBox="0 0 300 55" className="bags-svg">
            <g transform="translate(20, 0)">
              <text x="35" y="8" textAnchor="middle" fontSize="10">א'</text>
              <rect x="5" y="12" width="60" height="38" rx="4" fill="none" stroke="#000" strokeWidth="1.5" />
            </g>
            <g transform="translate(120, 0)">
              <text x="35" y="8" textAnchor="middle" fontSize="10">ב'</text>
              <rect x="5" y="12" width="60" height="38" rx="4" fill="none" stroke="#000" strokeWidth="1.5" />
            </g>
            <g transform="translate(220, 0)">
              <text x="35" y="8" textAnchor="middle" fontSize="10">ג'</text>
              <rect x="5" y="12" width="60" height="38" rx="4" fill="none" stroke="#000" strokeWidth="1.5" />
            </g>
          </svg>
        </div>
        <SubQuestion label="א."><p>בשק ב' יש 5 כדורים. כמה כדורים יש בסך הכול בכל השקים?</p></SubQuestion>
        <SubQuestion label="ב."><p>אם נתון כי כמות הכדורים הכללית בכל השקים היא 70, מהו מספר הכדורים בכל שק?</p></SubQuestion>
        <SubQuestion label="ג."><p>האם ייתכן שכמות הכדורים הכללית היא 72? נמקו.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בכיתה 24 תלמידים. היחס בין מספר הבנים למספר הבנות הוא 5 : 3 .</p>
        <p>כמה בנים צריך לצרף לכיתה כדי שהיחס בין מספר הבנים למספר הבנות יהיה 1 : 1 ?</p>
      </Question>
    </PageLayout>
  );
}

// ── Page (NEW) Ch2Page6: חלוקה ביחס מתוך נתון מספרי – Q7, Q8, Q11 ──
export function Ch2Page6() {
  return (
    <PageLayout pageNumber={14} chapter={CH}>
      <Question>
        <p>בכיתה 36 תלמידים. <Frac num={5} den={9} /> מהתלמידים הם בנים והשאר בנות.</p>
        <SubQuestion label="א."><p>מהו מספר הבנים בכיתה?</p><CalculationResponse lines={2} /></SubQuestion>
        <SubQuestion label="ב."><p>מהו מספר הבנות בכיתה?</p><CalculationResponse lines={2} /></SubQuestion>
        <SubQuestion label="ג."><p>מהו היחס בין מספר הבנים לבין מספר הבנות בכיתה?</p></SubQuestion>
        <SubQuestion label="ד."><p>מהו היחס בין מספר הבנות לבין כלל תלמידי הכיתה?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בכיתה ח'1 היחס בין מספר התלמידים מרכיבי המשקפיים לבין אלה שאינם מרכיבים משקפיים הוא 7 : 3 .</p>
        <SubQuestion label="א."><p>אם מספר מרכיבי המשקפיים הוא 21, מהו מספר התלמידים שאינם מרכיבים משקפיים?</p><CalculationResponse lines={2} /></SubQuestion>
        <SubQuestion label="ב."><p>מהו מספר התלמידים בכיתה?</p><CalculationResponse lines={2} /></SubQuestion>
        <SubQuestion label="ג."><p>מהו היחס בין מספר מרכיבי המשקפיים לבין כלל תלמידי הכיתה?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>באוטובוס יש 54 מקומות. לאוטובוס עלו ילדים ומבוגרים ומילאו את כל המקומות. היחס בין מספר הילדים שעלו לאוטובוס לבין מספר המבוגרים שעלו לאוטובוס הוא 5 : 4 .</p>
        <SubQuestion label="א."><p>מהו מספר הילדים שעלו לאוטובוס?</p><CalculationResponse lines={2} /></SubQuestion>
        <SubQuestion label="ב."><p>מהו מספר המבוגרים שעלו לאוטובוס?</p><CalculationResponse lines={2} /></SubQuestion>
        <SubQuestion label="ג."><p>מהו היחס בין מספר הילדים שעלו לאוטובוס לבין כלל הנוסעים (לא כולל הנהג)?</p></SubQuestion>
      </Question>
    </PageLayout>
  );
}

// ── Page (NEW) Ch2Page7: חלוקה ביחס – בעיות גיאומטריות וצרופות – Q12, Q13, Q14 ──
export function Ch2Page7() {
  return (
    <PageLayout pageNumber={15} chapter={CH}>
      <Question>
        <p>במשולש ישר-זווית היחס בין שתי הזוויות החדות הוא 1 : 8 .</p>
        <div className="svg-center svg-center--tight">
          <svg viewBox="0 0 270 130" width="260" height="125" role="img" aria-label="משולש ישר-זווית: זווית ישרה מימין-למטה, זווית חדה קטנה משמאל וזווית חדה גדולה למעלה" shapeRendering="geometricPrecision">
            <polygon points="15,100 245,100 245,59.5" fill="none" stroke="#1f2a44" strokeWidth="2.2" />
            <rect x="233" y="88" width="12" height="12" fill="none" stroke="#1f2a44" strokeWidth="1.6" />
          </svg>
        </div>
        <SubQuestion label="א.">
          <p>מהו גודלן של הזוויות החדות?</p>
          <div className="calculation-response">
            <WorkArea lines={3} />
            <FinalAnswer label="הזווית האחת:" unit="°" />
            <FinalAnswer label="הזווית השנייה:" unit="°" />
          </div>
        </SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין גודל הזווית הגדולה ביותר במשולש לבין גודל הזווית הקטנה ביותר?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בקופסת ממתקים יש 48 סוכריות. על כל 3 סוכריות חמוצות יש 5 סוכריות מתוקות.</p>
        <SubQuestion label="א."><p>מהו היחס בין מספר הסוכריות המתוקות למספר הסוכריות החמוצות?</p></SubQuestion>
        <SubQuestion label="ב.">
          <p>כמה סוכריות חמוצות וכמה סוכריות מתוקות יש בקופסה?</p>
          <div className="calculation-response">
            <WorkArea lines={3} />
            <FinalAnswer label="סוכריות חמוצות:" />
            <FinalAnswer label="סוכריות מתוקות:" />
          </div>
        </SubQuestion>
        <SubQuestion label="ג."><p>כמה סוכריות חמוצות יש להוסיף לקופסה כדי שהיחס בין מספרן לבין מספר הסוכריות המתוקות יהיה 1 : 1 ?</p><CalculationResponse lines={3} /></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בסרטוט שלפניכם מלבן ומשולש. השטח הכולל של המלבן והמשולש הוא 72 סמ"ר. היחס בין שטח המלבן לשטח המשולש הוא 7 : 2 .</p>
        <div className="svg-center svg-center--tight">
          <svg viewBox="0 0 160 90" width="150" height="85" role="img" aria-label="מלבן ומשולש, יחס שטח מלבן למשולש 7:2" shapeRendering="geometricPrecision">
            <polygon points="80,14.3 30,40 130,40" fill="none" stroke="#000" strokeWidth="1.6" />
            <rect x="30" y="40" width="100" height="45" fill="none" stroke="#000" strokeWidth="1.6" />
          </svg>
        </div>
        <SubQuestion label="א."><p>חשבו את שטח המלבן.</p><CalculationResponse lines={3} unit="סמ״ר" /></SubQuestion>
        <SubQuestion label="ב."><p>חשבו את שטח המשולש.</p><CalculationResponse lines={3} unit="סמ״ר" /></SubQuestion>
        <SubQuestion label="ג."><p>אם אורך הצלע הקצרה במלבן הוא 4 ס"מ, מהו היחס בין אורך הצלע הקצרה לאורך הצלע הארוכה במלבן?</p></SubQuestion>
      </Question>
    </PageLayout>
  );
}

// ── Page 16 (NEW): חלוקה ביחס – יישומים מורחבים (פרופסורים, סלט, גולות, הגרלה, ספרים) ──
export function Ch2Page8() {
  return (
    <PageLayout pageNumber={16} chapter={CH}>
      <Question>
        <p>בקבוצות מחקר, לכל פרופסור מסייעים 5 סטודנטים. <strong>היחס</strong> בין מספר הפרופסורים למספר הסטודנטים הוא 1 : 5 . בכל סעיף מצאו את מספר הפרופסורים ומספר הסטודנטים.</p>
        <SubQuestion label="א."><p>30 אנשי מחקר עובדים במעבדה.   פרופסורים : <Blank />   סטודנטים : <Blank /></p></SubQuestion>
        <SubQuestion label="ב."><p>6 אנשי מחקר טסו לכנס בחו"ל.   פרופסורים : <Blank />   סטודנטים : <Blank /></p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>החומרים הדרושים להכנת סלט פירות : 3 תפוזים , 2 בננות , 1 תפוח. ( היחס 3 : 2 : 1 )</p>
        <SubQuestion label="א."><p>נועה חתכה לקוביות 9 תפוזים. כמה בננות וכמה תפוחים עליה להוסיף כדי להכין סלט לפי המתכון?</p></SubQuestion>
        <SubQuestion label="ב."><p>שרית רוצה להכין סלט בדיוק לפי המתכון, אך יש לה רק בננה אחת. כמה תפוזים וכמה תפוחים עליה להוסיף?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>יוני ודני חילקו ביניהם 40 גולות ביחס של 3 : 5 . <strong>בחרו</strong> את המשפטים הנכונים :</p>
        <div className="checkbox-list">
          <span><Checkbox /> ליוני 3 גולות ולדני 5 .</span>
          <span><Checkbox /> ליוני <Frac num={3} den={5} /> מכל הגולות .</span>
          <span><Checkbox /> ליוני <Frac num={3} den={8} /> מהגולות .</span>
          <span><Checkbox /> לדני <Frac num={5} den={8} /> מהגולות .</span>
          <span><Checkbox /> אם יוני יסדר בכל שורה 3 גולות, ודני יסדר בכל שורה 5 גולות, יהיה לכל אחד אותו מספר שורות .</span>
        </div>
      </Question>

      <QSep />

      <Question>
        <p>טל ואורי השתתפו בהגרלה. טל קנה 3 כרטיסים ואורי קנה 4 כרטיסים. אם יזכו, יחלקו ביניהם את הפרס באותו יחס.</p>
        <SubQuestion label="א."><p>מהו היחס בין מספר הכרטיסים שקנה טל למספר הכרטיסים שקנה אורי?</p></SubQuestion>
        <SubQuestion label="ב."><p>איזה חלק מן הזכייה יקבל טל, ואיזה חלק יקבל אורי?</p></SubQuestion>
        <SubQuestion label="ג."><p>אם יזכו ב - 14 שקלים, איזה סכום יקבל כל אחד? הסבירו.</p></SubQuestion>
        <SubQuestion label="ד."><p>אם יזכו ב - 70 שקלים, כיצד יחלקו ביניהם את הזכייה?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בחנות הספרים הוכרז מבצע : <strong>"קנו 3 ספרים – הזול ביותר חינם!"</strong></p>
        <p>יפה בחרה שני ספרים במחירים 57 ש"ח ו - 33 ש"ח . נעמה בחרה ספר במחיר 45 ש"ח . הן ביצעו קנייה משותפת.</p>
        <SubQuestion label="א."><p>כמה כסף חסכו יפה ונעמה יחד הודות למבצע?</p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין סכום הקנייה של יפה לסכום הקנייה של נעמה (לפני המבצע)?</p></SubQuestion>
        <SubQuestion label="ג."><p>חלקו את החיסכון ביניהן באופן יחסי לסכום שכל אחת קנתה. כמה תחסוך כל אחת?</p></SubQuestion>
      </Question>
    </PageLayout>
  );
}

// ── Page (NEW) Ch2Page9: חלוקה ביחס – המשך (השקעות, הגרלה, מבצעים, אלגברי) ──
export function Ch2Page9() {
  return (
    <PageLayout pageNumber={17} chapter={CH}>
      <Question>
        <p>עודד ועמיחי פתחו יחד עסק. עודד השקיע 24,000 ש"ח ועמיחי השקיע 36,000 ש"ח . הם מחלקים את הרווחים יחסית להשקעה של כל אחד.</p>
        <SubQuestion label="א."><p>מהו היחס המצומצם בין השקעת עודד להשקעת עמיחי?</p></SubQuestion>
        <SubQuestion label="ב."><p>איזה חלק מן הרווחים מגיע לעודד, ואיזה חלק מגיע לעמיחי?</p></SubQuestion>
        <SubQuestion label="ג."><p>כעבור שנה היו רווחים של 30,000 ש"ח . איזה סכום הרוויח כל אחד? הסבירו.</p></SubQuestion>
        <SubQuestion label="ד."><p>כעבור שנתיים היו רווחים של 50,000 ש"ח . כיצד יחלקו ביניהם?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>חיים ומשה השתתפו בהגרלה. חיים קנה 3 כרטיסים ומשה קנה 4 כרטיסים. אם יזכו, יחלקו את הפרס לפי יחס הכרטיסים.</p>
        <SubQuestion label="א."><p>אם זכו ב - 84 ש"ח , איך יחלקו ביניהם את הזכייה? הסבירו.</p></SubQuestion>
        <SubQuestion label="ב."><p>אם זכו ב - 350 ש"ח , איך יחלקו ביניהם?</p></SubQuestion>
        <SubQuestion label="ג."><p>אם זכו ב - x ש"ח (x &gt; 0) , כתבו <strong>ביטוי אלגברי</strong> לסכום שיקבל כל אחד.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>תלמידי הכיתה בחרו מה יאכלו במסיבה : פלאפל או פיצה (אחד בלבד). מסמנים ב - <strong>a</strong> את מספר התלמידים שבחרו פלאפל וב - <strong>b</strong> את מספר התלמידים שבחרו פיצה (a, b מספרים טבעיים).</p>
        <SubQuestion label="א."><p>מה מבטא היחס a : b ?</p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין מספר התלמידים שבחרו פלאפל למספר כל התלמידים בכיתה? <Blank /></p></SubQuestion>
        <SubQuestion label="ג."><p>איזה חלק מן הכיתה בחרו בפיצה? כתבו ביטוי אלגברי.</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>סימה ושושי נפגשו בחנות שהכריזה : <strong>"קנו 3 ספרים – הזול ביותר חינם!"</strong>. סימה בחרה ספרים במחירים 25 ש"ח ו - 35 ש"ח , ושושי בחרה ספר במחיר 40 ש"ח .</p>
        <SubQuestion label="א."><p>כמה כסף חסכו יחד הודות למבצע?</p></SubQuestion>
        <SubQuestion label="ב.">
          <p>חלקו את החיסכון באופן יחסי לסכומי הקנייה של כל אחת. כמה חסכה סימה וכמה חסכה שושי?</p>
          <div className="calculation-response">
            <WorkArea lines={4} />
            <FinalAnswer label="סימה:" unit="ש״ח" />
            <FinalAnswer label="שושי:" unit="ש״ח" />
          </div>
        </SubQuestion>
      </Question>
    </PageLayout>
  );
}

// ── Page 33 (NEW): חלוקה ביחס – פתרון בעזרת משוואה (x כגורם הרחבה) ──
export function Ch2Page10() {
  return (
    <PageLayout pageNumber={33} chapter={CH}>
      <div className="info-box">
        <p>אם היחס בין שתי כמויות הוא <strong>a : b</strong> , אפשר לבטא אותן באמצעות משתנה אחד : <strong>a·x</strong> ו - <strong>b·x</strong> , כאשר <strong>x</strong> הוא <strong>גורם ההרחבה</strong> של היחס המצומצם.</p>
      </div>

      <Question>
        <p>בתחילת השנה היה היחס בין מספר התלמידים בכיתה ח<sub>1</sub> למספר התלמידים בכיתה ח<sub>2</sub> הוא 2 : 5 . הֶעבירו 9 תלמידים מהכיתה הגדולה לכיתה הקטנה, ואז בשתי הכיתות היה מספר שווה של תלמידים.</p>
        <SubQuestion label="א."><p>כּ ִתבו ביטויים אלגבריים למספר התלמידים בשתי הכיתות בתחילת השנה.</p></SubQuestion>
        <SubQuestion label="ב."><p>כּ ִתבו משוואה לסיפור ופִתרו אותה.</p><CalculationResponse lines={4} /></SubQuestion>
        <SubQuestion label="ג."><p>כמה תלמידים היו בכל כיתה בהתחלה? כמה אחרי המעבר?</p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>היחס בין שני מספרים הוא 4 : 9 , <strong>מכפלת</strong> המספרים היא 144 . מצאו את שני המספרים.</p>
        <div className="calculation-response">
          <WorkArea lines={4} />
          <FinalAnswer label="המספר הראשון:" />
          <FinalAnswer label="המספר השני:" />
        </div>
      </Question>

      <QSep />

      <Question>
        <p>סכום אורכי שתי צלעות סמוכות של מלבן הוא 28 ס"מ. היחס בין אורכי הצלעות הוא 3 : 4 . מהם אורכי צלעות המלבן?</p>
        <div className="calculation-response">
          <WorkArea lines={3} />
          <FinalAnswer label="הצלע האחת:" unit="ס״מ" />
          <FinalAnswer label="הצלע השנייה:" unit="ס״מ" />
        </div>
      </Question>

      <QSep />

      <Question>
        <p>היקף מלבן 64 ס"מ. היחס בין אורכי שתי צלעות סמוכות הוא 3 : 5 . מהם אורכי צלעות המלבן?</p>
        <div className="calculation-response">
          <WorkArea lines={3} />
          <FinalAnswer label="הצלע האחת:" unit="ס״מ" />
          <FinalAnswer label="הצלע השנייה:" unit="ס״מ" />
        </div>
      </Question>

      <QSep />

      <Question>
        <p>היחס בין גודלן של שלוש זוויות במשולש הוא 2 : 3 : 4 . מה גודלה של כל זווית במשולש? <span className="text-muted-foreground">(רמז : סכום זוויות במשולש = 180°)</span></p>
        <div className="calculation-response">
          <WorkArea lines={3} />
          <FinalAnswer label="זווית ראשונה:" unit="°" />
          <FinalAnswer label="זווית שנייה:" unit="°" />
          <FinalAnswer label="זווית שלישית:" unit="°" />
        </div>
      </Question>

      <QSep />

      <Question>
        <p>טלי פָּתרה בעיה. היא כתבה את המשוואה : <strong>3x + 5x = 400</strong> ופִתרה : לחדר הקטן 150 אריחים, לחדר הגדול 250 אריחים.</p>
        <SubQuestion label="א."><p>מה מייצג <strong>x</strong> במשוואה?</p></SubQuestion>
        <SubQuestion label="ב."><p>איך התקבלו המספרים 150 ו - 250 ?</p></SubQuestion>
        <SubQuestion label="ג."><p>כּ ִתבו סיפור מתאים. מהו היחס? איזה חלק מהאריחים דרוש לכל חדר?</p></SubQuestion>
      </Question>
    </PageLayout>
  );
}

// ── Page 37 (NEW): חלוקה ביחס נתון – אנשים, כלים, סכומים ──
export function Ch2Page11() {
  return (
    <PageLayout pageNumber={37} chapter='פרק 2 – חלוקה ביחס נתון'>
      <div className="info-box">
        <p>כדי לחלק כמות ביחס נתון : מחברים את חלקי היחס ⟵ מחלקים את הכמות במספר זה ⟵ מכפילים את התוצאה בכל חלק.</p>
      </div>

      <Question>
        <p>קבוצה של <strong>50 מבוגרים וילדים</strong> נכנסה למסעדה. היחס בין מספר המבוגרים למספר הילדים הוא <strong>3 : 2</strong> .</p>
        <SubQuestion label="א."><p>מה יש יותר – מבוגרים או ילדים? <Blank /></p></SubQuestion>
        <SubQuestion label="ב."><p>מהו היחס בין מספר הילדים למספר הכולל בקבוצה? <Blank /></p></SubQuestion>
        <SubQuestion label="ג.">
          <p>כמה מבוגרים וכמה ילדים בקבוצה?</p>
          <div className="calculation-response">
            <WorkArea lines={3} />
            <FinalAnswer label="מבוגרים:" />
            <FinalAnswer label="ילדים:" />
          </div>
        </SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>היחס בין מספר העפרונות למספר העטים בקלמר של רינת הוא <strong>1 : 3</strong> .</p>
        <SubQuestion label="א."><p>האם אפשר לדעת כמה עפרונות וכמה עטים יש לרינת? הסבירו.</p></SubQuestion>
        <SubQuestion label="ב."><p>מה יש לה יותר – עטים או עפרונות? <Blank /></p></SubQuestion>
        <SubQuestion label="ג."><p>לעידן יש אותו יחס בין מספר העפרונות למספר העטים, ובסך הכל <strong>16 כלים</strong> בקלמר. כמה עפרונות יש לו? <Blank /></p></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>חַלקו סכום של <strong>180 ש"ח</strong> בין שני ילדים ביחס <strong>4 : 5</strong> .</p>
        <SubQuestion label="א.">
          <p>כמה יקבל כל אחד?</p>
          <div className="calculation-response">
            <WorkArea lines={3} />
            <FinalAnswer label="הילד האחד:" unit="ש״ח" />
            <FinalAnswer label="הילד השני:" unit="ש״ח" />
          </div>
        </SubQuestion>
        <SubQuestion label="ב."><p>מהו ההפרש בין הסכומים?</p><CalculationResponse lines={2} unit="ש״ח" /></SubQuestion>
      </Question>

      <QSep />

      <Question>
        <p>בכד <strong>72 ליטר</strong> תערובת של מיץ ומים ביחס <strong>2 : 7</strong> בהתאמה. כמה ליטרים של כל אחד יש בכד?</p>
        <div className="calculation-response">
          <WorkArea lines={3} />
          <FinalAnswer label="מיץ:" unit="ליטר" />
          <FinalAnswer label="מים:" unit="ליטר" />
        </div>
      </Question>
    </PageLayout>
  );
}
