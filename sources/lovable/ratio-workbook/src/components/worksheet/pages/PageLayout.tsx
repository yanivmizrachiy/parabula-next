import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  pageNumber: number;
  chapter: string;
  children: ReactNode;
  className?: string;
  topic?: string;
}

export function PageLayout({ pageNumber, chapter, children, className, topic = 'יחס' }: PageLayoutProps) {
  return (
    <div className={cn('worksheet-page relative bg-white', className)} dir="rtl">
      <header className="header-container page-header">
        <span className="page-header-title page-title">נושא: {topic} | {chapter}</span>
        <div className="page-number">{pageNumber}</div>
      </header>
      <div className="page-content">
        {children}
      </div>
    </div>
  );
}

export function Question({ children }: { children: ReactNode }) {
  return (
    <div className="question-block">
      <span className="question-bullet" aria-hidden="true" />
      <div className="question-content">{children}</div>
    </div>
  );
}

export function SubQuestion({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="sub-question">
      <span className="sub-label">{label}</span>
      <div className="sub-content">{children}</div>
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
