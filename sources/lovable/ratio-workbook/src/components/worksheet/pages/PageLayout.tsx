import { Children, createContext, isValidElement, ReactElement, ReactNode, useContext } from 'react';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  pageNumber: number;
  chapter: string;
  children: ReactNode;
  className?: string;
  topic?: string;
}

const ActivePageNumberContext = createContext<number | null>(null);

export function PageNumberScope({ pageNumber, children }: { pageNumber: number; children: ReactNode }) {
  return (
    <ActivePageNumberContext.Provider value={pageNumber}>
      {children}
    </ActivePageNumberContext.Provider>
  );
}

function cleanTopicTitle(chapter: string, topic: string): string {
  const explicitTopic = topic.trim();
  if (explicitTopic) return explicitTopic;
  return chapter
    .replace(/^פרק\s*\d+\s*[–-]\s*/, '')
    .replace(/^\d+\s*·\s*/, '')
    .trim() || 'יחס';
}

function withoutLegacyRatioPageClass(className?: string): string | undefined {
  if (!className) return className;
  const cleaned = className
    .split(/\s+/)
    .filter((token) => token && !/^ratio-page-\d+$/.test(token))
    .join(' ');
  return cleaned || undefined;
}

export function PageLayout({ pageNumber, chapter, children, className, topic = 'יחס' }: PageLayoutProps) {
  const activePageNumber = useContext(ActivePageNumberContext);
  const displayPageNumber = activePageNumber ?? pageNumber;
  const pageTopicTitle = cleanTopicTitle(chapter, topic);

  return (
    <div
      className={cn(
        'worksheet-page relative bg-white',
        `ratio-page-${displayPageNumber}`,
        `ratio-source-page-${pageNumber}`,
        withoutLegacyRatioPageClass(className),
      )}
      dir="rtl"
    >
      <header className="header-container page-header">
        <span className="page-header-title page-title">{pageTopicTitle}</span>
        <div className="page-number">{displayPageNumber}</div>
      </header>
      <div className="page-content">
        {children}
      </div>
    </div>
  );
}

type AutoResponseKind = 'none' | 'short' | 'ratio' | 'calculation' | 'explanation' | 'drawing';

const SuppressSubResponseContext = createContext(false);

const NO_WRITING_CUES = /סמנו|בחרו|הקיפו|התאימו|מתחו קו|צבעו/;
// A "circle/choose the correct statements" task whose options are listed as א/ב/ג/ד sub-items.
// Its sub-items are statements to judge, not sub-questions to answer — so they must NOT each get
// an answer box; the whole question gets ONE reasoning ("נימוק") box instead.
const SELECT_STATEMENTS_CUES = /הקיפו|בחרו את|(?:אילו|איזה|איזו)[^?]{0,40}(?:היגד|טענ|משפט)|(?:היגדים|טענות|משפטים)\s+ה?(?:נכונים|מתאימים|הנכונים|המתאימים)/;
const DRAWING_CUES = /ציירו|שרטטו/;
const EXPLANATION_CUES = /הסבירו|הסבר|נמקו|נמק|מדוע|הראו|הוכיחו|תארו|מה מייצג|כתבו במילים|כתבו סיפור/;
const CALCULATION_CUES = /כמה|חשבו|מצאו|פתרו|חלקו|מה גודל|מהו מספר|מה היה|מה הייתה|מהם אורכי|מה גודלן|איזה סכום|מהו הסכום|עלות|מחיר|היקף|שטח|אומדן/;
const RATIO_CUES = /מהו היחס|מה היחס|כתבו יחס|כתבו פרופורציה/;
const SHORT_ANSWER_CUES = /\?|איזה חלק|האם|מה יש יותר|באיזו|מה מבטא|איזו|מהו|מהי|מה הם|מה הן|כתבו אפשרות|כתבו|קבעו|רשמו|ציינו|השלימו/;

function getNodeText(node: ReactNode): string {
  // Strip Hebrew niqqud (vowel points, U+0591–U+05C7) so cue matching is robust: a vowelised
  // "סַמנו"/"סַדרו" must still match /סמנו/, otherwise the question wrongly grows an answer box.
  if (typeof node === 'string' || typeof node === 'number') return String(node).replace(/[֑-ׇ]/g, '');
  // Questions often hold several children (e.g. two <p>). Without handling arrays the text came
  // back empty and the question was left with no answer box — fixed by walking every child.
  if (Array.isArray(node)) return node.map(getNodeText).join(' ');
  if (!isValidElement(node)) return '';
  return getNodeText((node.props as { children?: ReactNode }).children);
}

function hasNode(node: ReactNode, predicate: (element: ReactElement) => boolean): boolean {
  let found = false;
  Children.forEach(node, (child) => {
    if (found || !isValidElement(child)) return;
    if (predicate(child)) {
      found = true;
      return;
    }
    if (hasNode((child.props as { children?: ReactNode }).children, predicate)) found = true;
  });
  return found;
}

function hasClassName(node: ReactNode, fragment: string): boolean {
  return hasNode(node, (element) => {
    const className = (element.props as { className?: string }).className;
    return typeof className === 'string' && className.includes(fragment);
  });
}

function hasExplicitResponse(node: ReactNode): boolean {
  return hasNode(node, (element) => (
    element.type === AnswerLine ||
    element.type === Blank ||
    element.type === RatioAnswer ||
    element.type === OrderedPairAnswer ||
    element.type === WorkArea ||
    element.type === FinalAnswer ||
    element.type === CalculationResponse ||
    element.type === Checkbox ||
    element.type === WorksheetTable ||
    element.type === MultipleChoice ||
    hasClassName(element, 'response-set') ||
    hasClassName(element, 'options-row') ||
    hasClassName(element, 'checkbox-list') ||
    hasClassName(element, 'drawing-box')
  ));
}

function inferResponseKind(children: ReactNode): AutoResponseKind {
  if (hasExplicitResponse(children)) return 'none';
  const text = getNodeText(children).replace(/\s+/g, ' ').trim();
  if (!text || NO_WRITING_CUES.test(text)) return 'none';
  if (DRAWING_CUES.test(text)) return 'drawing';
  if (EXPLANATION_CUES.test(text)) return 'explanation';
  if (RATIO_CUES.test(text) && !CALCULATION_CUES.test(text)) return 'ratio';
  if (CALCULATION_CUES.test(text)) return 'calculation';
  if (SHORT_ANSWER_CUES.test(text)) return 'short';
  // Default: any leaf question with real text that isn't a select/mark task still gets a uniform
  // answer box, so no question in the workbook is ever left without a place to write (§4.6).
  return 'explanation';
}

function AutoResponse({ kind }: { kind: AutoResponseKind }) {
  // Clean, label-free answer spaces (the box/line itself is the cue) for one uniform look.
  if (kind === 'short') return <AnswerLine />;
  if (kind === 'ratio') return <RatioAnswer />;
  if (kind === 'calculation') return <CalculationResponse lines={2} className="auto-response auto-response--calculation" />;
  if (kind === 'explanation') return <WorkArea lines={2} className="auto-response auto-response--explanation" />;
  if (kind === 'drawing') return <div className="drawing-box auto-response auto-response--drawing" aria-label="מקום לציור או לשרטוט"><span className="drawing-label">ציור:</span></div>;
  return null;
}

export function Question({ children }: { children: ReactNode }) {
  const hasSubQuestions = hasNode(children, (element) => element.type === SubQuestion);
  const hasGroupedResponse = hasClassName(children, 'response-set');
  const parentText = getNodeText(children).replace(/\s+/g, ' ').trim();
  // Statement-selection: sub-items are options to circle, not questions. Give the whole question a
  // single "נימוק" box and stop each sub-item from sprouting its own answer box.
  const isSelectStatements = hasSubQuestions && SELECT_STATEMENTS_CUES.test(parentText);
  const suppressSub = hasGroupedResponse || isSelectStatements;
  const needsReasoning = isSelectStatements && !hasExplicitResponse(children);
  const responseKind = hasSubQuestions ? 'none' : inferResponseKind(children);

  return (
    <SuppressSubResponseContext.Provider value={suppressSub}>
      <div className="question-block" data-auto-response={responseKind} data-grouped-response={hasGroupedResponse ? 'true' : 'false'}>
        <span className="question-bullet" aria-hidden="true" />
        <div className="question-content">
          {children}
          <AutoResponse kind={responseKind} />
          {needsReasoning && (
            <WorkArea lines={2} label="נימוק:" className="auto-response auto-response--reasoning" />
          )}
        </div>
      </div>
    </SuppressSubResponseContext.Provider>
  );
}

export function SubQuestion({ label, children }: { label: string; children: ReactNode }) {
  const suppressAutoResponse = useContext(SuppressSubResponseContext);
  const responseKind = suppressAutoResponse ? 'none' : inferResponseKind(children);

  return (
    <div className="sub-question" data-auto-response={responseKind}>
      <span className="sub-label">{label}</span>
      <div className="sub-content">
        {children}
        <AutoResponse kind={responseKind} />
      </div>
    </div>
  );
}

export function AnswerLine({ label }: { label?: string }) {
  return (
    <div className="answer-line-container">
      {label && <span className="answer-label">{label}</span>}
      <span className="answer-line" />
    </div>
  );
}

export function Blank() {
  return <span className="inline-blank" />;
}

interface RatioAnswerProps {
  label?: string;
  className?: string;
  inline?: boolean;
}

export function RatioAnswer({ label, className, inline = false }: RatioAnswerProps) {
  return (
    <span className={cn('ratio-answer-container', inline && 'is-inline', className)}>
      {label && <span className="answer-label">{label}</span>}
      <span className="ratio-answer" dir="ltr" aria-label="מקום לכתיבת יחס">
        <span className="ratio-answer-box" aria-hidden="true" />
        <span className="ratio-answer-colon" aria-hidden="true">:</span>
        <span className="ratio-answer-box" aria-hidden="true" />
      </span>
    </span>
  );
}

interface OrderedPairAnswerProps {
  label?: string;
  className?: string;
  inline?: boolean;
}

export function OrderedPairAnswer({ label, className, inline = false }: OrderedPairAnswerProps) {
  return (
    <span className={cn('ordered-pair-answer-container', inline && 'is-inline', className)}>
      {label && <span className="answer-label">{label}</span>}
      <span className="ordered-pair-answer" dir="ltr" aria-label="מקום לכתיבת זוג סדור">
        <span className="ordered-pair-paren" aria-hidden="true">(</span>
        <span className="ordered-pair-box" aria-hidden="true" />
        <span className="ordered-pair-comma" aria-hidden="true">,</span>
        <span className="ordered-pair-box" aria-hidden="true" />
        <span className="ordered-pair-paren" aria-hidden="true">)</span>
      </span>
    </span>
  );
}

interface WorkAreaProps {
  lines?: number;
  label?: string;
  className?: string;
}

export function WorkArea({ lines = 3, label = '', className }: WorkAreaProps) {
  const safeLines = Math.max(1, Math.min(8, Math.floor(lines)));
  // Open writing box — a clean rectangle with a thick top edge signals "write here"; no generic
  // "דרך" label and no divider line. A meaningful label (נימוק/תשובה/section letter) still shows.
  return (
    <div className={cn('work-area', className)} aria-label="מקום לכתיבה">
      {label ? <span className="work-area-label">{label}</span> : null}
      <div className="work-area-space" aria-hidden="true" style={{ minHeight: `${safeLines * 26}px` }} />
    </div>
  );
}

type FinalAnswerType = 'line' | 'ratio';

interface FinalAnswerProps {
  label?: string;
  type?: FinalAnswerType;
  unit?: string;
  className?: string;
}

export function FinalAnswer({ label = '', type = 'line', unit, className }: FinalAnswerProps) {
  return (
    <div className={cn('final-answer', !label && 'final-answer--nolabel', className)}>
      {label ? <span className="answer-label">{label}</span> : null}
      {type === 'ratio' ? (
        <span className="ratio-answer" dir="ltr" aria-label="מקום לכתיבת יחס סופי">
          <span className="ratio-answer-box" aria-hidden="true" />
          <span className="ratio-answer-colon" aria-hidden="true">:</span>
          <span className="ratio-answer-box" aria-hidden="true" />
        </span>
      ) : (
        <span className="final-answer-value" dir="ltr">
          <span className="final-answer-line" aria-hidden="true" />
          {unit && <span className="answer-unit">{unit}</span>}
        </span>
      )}
    </div>
  );
}

interface CalculationResponseProps {
  lines?: number;
  answerType?: FinalAnswerType;
  unit?: string;
  className?: string;
}

export function CalculationResponse({ lines = 3, answerType = 'line', unit, className }: CalculationResponseProps) {
  return (
    <div className={cn('calculation-response', className)}>
      <WorkArea lines={lines} />
      {/* The box itself is the writing space — no redundant answer-line inside it. A ratio answer
          keeps its dedicated boxes (§4.3); a plain answer is just written in the box. */}
      {answerType === 'ratio' ? <FinalAnswer type="ratio" unit={unit} label="" /> : null}
    </div>
  );
}

export function Frac({ num, den }: { num: string | number; den: string | number }) {
  return (
    <span className="fraction">
      <span className="frac-num">{num}</span>
      <span className="frac-line" />
      <span className="frac-den">{den}</span>
    </span>
  );
}

export function Checkbox({ label }: { label?: string }) {
  return (
    <span className="worksheet-checkbox">
      <span className="checkbox-box" />
      {label && <span className="checkbox-label">{label}</span>}
    </span>
  );
}

interface TableProps {
  headers: string[];
  rows: (string | ReactNode)[][];
  className?: string;
}

export function WorksheetTable({ headers, rows, className }: TableProps) {
  return (
    <table className={cn('worksheet-table', className)}>
      <thead>
        <tr>
          {headers.map((header, index) => <th key={index}>{header}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function MultipleChoice({ options }: { options: { label?: string; value: string }[] }) {
  return (
    <div className="multiple-choice">
      {options.map((option, index) => (
        <div key={index} className="choice-option">
          <Checkbox label={option.label} />
          <span className="choice-value">{option.value}</span>
        </div>
      ))}
    </div>
  );
}

export function QSep() {
  return <div className="q-separator" />;
}
