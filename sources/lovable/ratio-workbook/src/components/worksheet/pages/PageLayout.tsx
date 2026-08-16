import { Children, createContext, isValidElement, ReactElement, ReactNode, useContext } from 'react';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  pageNumber: number;
  chapter: string;
  children: ReactNode;
  className?: string;
  topic?: string;
}

function cleanTopicTitle(chapter: string, topic: string): string {
  const chapterTitle = chapter.replace(/^פרק\s*\d+\s*[–-]\s*/, '').trim();
  const explicitTopic = topic.trim();
  if (!explicitTopic || explicitTopic === 'יחס') return chapterTitle || 'יחס';
  return explicitTopic;
}

export function PageLayout({ pageNumber, chapter, children, className, topic = 'יחס' }: PageLayoutProps) {
  const pageTopicTitle = cleanTopicTitle(chapter, topic);
  return (
    <div className={cn('worksheet-page relative bg-white', className)} dir="rtl">
      <header className="header-container page-header">
        <span className="page-header-title page-title">{pageTopicTitle}</span>
        <div className="page-number">{pageNumber}</div>
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
const DRAWING_CUES = /ציירו|שרטטו/;
const EXPLANATION_CUES = /הסבירו|הסבר|נמקו|נמק|מדוע|הראו|הוכיחו|תארו|מה מייצג|כתבו במילים|כתבו סיפור/;
const CALCULATION_CUES = /כמה|חשבו|מצאו|פתרו|חלקו|מה גודל|מהו מספר|מה היה|מה הייתה|מהם אורכי|מה גודלן|איזה סכום|מהו הסכום|עלות|מחיר|היקף|שטח|אומדן/;
const RATIO_CUES = /מהו היחס|מה היחס|כתבו יחס|כתבו פרופורציה/;
const SHORT_ANSWER_CUES = /\?|איזה חלק|האם|מה יש יותר|באיזו|מה מבטא|איזו|מהו|מהי|מה הם|מה הן|כתבו אפשרות|כתבו|קבעו|רשמו|ציינו|השלימו/;

function getNodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
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
  return 'none';
}

function AutoResponse({ kind }: { kind: AutoResponseKind }) {
  if (kind === 'short') return <AnswerLine label="תשובה:" />;
  if (kind === 'ratio') return <RatioAnswer label="תשובה:" />;
  if (kind === 'calculation') return <CalculationResponse lines={1} className="auto-response auto-response--calculation" />;
  if (kind === 'explanation') return <WorkArea lines={2} label="תשובה:" className="auto-response auto-response--explanation" />;
  if (kind === 'drawing') return <div className="drawing-box auto-response auto-response--drawing" aria-label="מקום לציור או לשרטוט" />;
  return null;
}

export function Question({ children }: { children: ReactNode }) {
  const hasSubQuestions = hasNode(children, (element) => element.type === SubQuestion);
  const hasGroupedResponse = hasClassName(children, 'response-set');
  const responseKind = hasSubQuestions ? 'none' : inferResponseKind(children);
  return (
    <SuppressSubResponseContext.Provider value={hasGroupedResponse}>
      <div className="question-block" data-auto-response={responseKind} data-grouped-response={hasGroupedResponse ? 'true' : 'false'}>
        <span className="question-bullet" aria-hidden="true" />
        <div className="question-content">
          {children}
          <AutoResponse kind={responseKind} />
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

export function WorkArea({ lines = 3, label = 'דרך:', className }: WorkAreaProps) {
  const safeLines = Math.max(1, Math.min(6, Math.floor(lines)));
  return (
    <div className={cn('work-area', className)} aria-label="מקום לכתיבת דרך החישוב">
      <span className="work-area-label">{label}</span>
      <div className="work-area-lines" aria-hidden="true">
        {Array.from({ length: safeLines }, (_, index) => (
          <span className="work-area-line" key={index} />
        ))}
      </div>
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

export function FinalAnswer({ label = 'תשובה:', type = 'line', unit, className }: FinalAnswerProps) {
  return (
    <div className={cn('final-answer', className)}>
      <span className="answer-label">{label}</span>
      {type === 'ratio' ? (
        <span className="ratio-answer" dir="ltr" aria-label="מקום לכתיבת יחס סופי">
          <span className="ratio-answer-box" aria-hidden="true" />
          <span className="ratio-answer-colon" aria-hidden="true">:</span>
          <span className="ratio-answer-box" aria-hidden="true" />
        </span>
      ) : (
        <span className="final-answer-line" aria-hidden="true" />
      )}
      {unit && <span className="answer-unit">{unit}</span>}
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
      <FinalAnswer type={answerType} unit={unit} />
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
          {headers.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
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
