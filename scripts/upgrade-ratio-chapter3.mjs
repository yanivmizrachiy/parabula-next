import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = path.join(root, 'sources', 'lovable', 'ratio-workbook', 'src', 'components', 'worksheet', 'corrected', 'Chapter3Corrections.tsx');
let source = fs.readFileSync(sourcePath, 'utf8');
let changed = false;

function replaceRequired(label, before, after) {
  if (source.includes(after)) return;
  if (!source.includes(before)) {
    throw new Error(`Ratio chapter 3 upgrade could not find expected source block: ${label}`);
  }
  source = source.replace(before, after);
  changed = true;
}

replaceRequired(
  'response component imports',
  `import {
  AnswerLine,
  Blank,
  Checkbox,
  Frac,
  PageLayout,
  QSep,
  Question,
  SubQuestion,
  WorksheetTable,
} from '../pages/PageLayout';`,
  `import {
  AnswerLine,
  Blank,
  CalculationResponse,
  Checkbox,
  FinalAnswer,
  Frac,
  PageLayout,
  QSep,
  Question,
  SubQuestion,
  WorkArea,
  WorksheetTable,
} from '../pages/PageLayout';`,
);

replaceRequired(
  'page 18 class',
  '<PageLayout pageNumber={18} chapter={CH}>',
  '<PageLayout pageNumber={18} chapter={CH} className="ratio-page-18">',
);

replaceRequired(
  'page 18 necklace responses',
  `        <SubQuestion label="ג."><p>במחרוזת של רותם 16 חרוזים אדומים באותו יחס. כמה חרוזים כחולים יש?</p></SubQuestion>
      </Question>`,
  `        <SubQuestion label="ג."><p>במחרוזת של רותם 16 חרוזים אדומים באותו יחס. כמה חרוזים כחולים יש?</p></SubQuestion>
        <div className="response-set">
          <WorkArea lines={1} />
          <FinalAnswer label="א." type="ratio" />
          <FinalAnswer label="ג. כחולים:" unit="חרוזים" />
        </div>
      </Question>`,
);

replaceRequired(
  'page 18 family responses',
  `        <SubQuestion label="ג."><p>איזה חלק מהילדים הן בנות?</p></SubQuestion>
      </Question>`,
  `        <SubQuestion label="ג."><p>איזה חלק מהילדים הן בנות?</p></SubQuestion>
        <div className="response-set">
          <FinalAnswer label="א." type="ratio" />
          <FinalAnswer label="ב." type="ratio" />
          <FinalAnswer label="ג. חלק:" />
        </div>
      </Question>`,
);

replaceRequired(
  'page 18 simplification responses',
  `        <p>צמצמו: 8 : 24, 20 : 100, 48 : 6, 18 : 3.</p>
        <AnswerLine label="תשובות:" />`,
  `        <p>צמצמו: 8 : 24, 20 : 100, 48 : 6, 18 : 3.</p>
        <div className="response-set ratio-four-answers">
          <FinalAnswer label="8 : 24" type="ratio" />
          <FinalAnswer label="20 : 100" type="ratio" />
          <FinalAnswer label="48 : 6" type="ratio" />
          <FinalAnswer label="18 : 3" type="ratio" />
        </div>`,
);

replaceRequired(
  'page 18 bus responses',
  `        <SubQuestion label="ג."><p>ילדים : כלל הנוסעים</p></SubQuestion>
      </Question>`,
  `        <SubQuestion label="ג."><p>ילדים : כלל הנוסעים</p></SubQuestion>
        <div className="response-set">
          <FinalAnswer label="א." type="ratio" />
          <FinalAnswer label="ב." type="ratio" />
          <FinalAnswer label="ג." type="ratio" />
        </div>
      </Question>`,
);

replaceRequired(
  'page 19 class',
  '<PageLayout pageNumber={19} chapter={CH}>',
  '<PageLayout pageNumber={19} chapter={CH} className="ratio-page-19">',
);

replaceRequired(
  'page 19 cyclists answer',
  `        <p>בשכבת ח׳ יש 130 תלמידים, ו־30 מהם מגיעים באופניים. מהו היחס המצומצם בין מספר הרוכבים למספר התלמידים בשכבה?</p>
        <AnswerLine label="תשובה:" />`,
  `        <p>בשכבת ח׳ יש 130 תלמידים, ו־30 מהם מגיעים באופניים. מהו היחס המצומצם בין מספר הרוכבים למספר התלמידים בשכבה?</p>
        <CalculationResponse lines={1} answerType="ratio" className="compact-response" />`,
);

replaceRequired(
  'page 19 percentage responses',
  `        <SubQuestion label="ב."><p>איזה חלק ממשתתפי החוג הן בנות?</p></SubQuestion>
      </Question>`,
  `        <SubQuestion label="ב."><p>איזה חלק ממשתתפי החוג הן בנות?</p></SubQuestion>
        <div className="response-set">
          <WorkArea lines={1} />
          <FinalAnswer label="א." type="ratio" />
          <FinalAnswer label="ב. חלק:" />
        </div>
      </Question>`,
);

replaceRequired(
  'page 19 juice responses',
  `        <SubQuestion label="ב."><p>מעבירים 50 מ״ל מכוס 2 לכוס 1. איזה אחוז מכלל המיץ נשאר בכוס 2?</p></SubQuestion>
      </Question>`,
  `        <SubQuestion label="ב."><p>מעבירים 50 מ״ל מכוס 2 לכוס 1. איזה אחוז מכלל המיץ נשאר בכוס 2?</p></SubQuestion>
        <div className="response-set">
          <WorkArea lines={1} />
          <FinalAnswer label="א." unit="מ״ל" />
          <FinalAnswer label="ב." unit="%" />
        </div>
      </Question>`,
);

if (changed) {
  fs.writeFileSync(sourcePath, source, 'utf8');
  console.log('Upgraded ratio pages 18–19 with structured response areas.');
} else {
  console.log('Ratio pages 18–19 are already upgraded.');
}
