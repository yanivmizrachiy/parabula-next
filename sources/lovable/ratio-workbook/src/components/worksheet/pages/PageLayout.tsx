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
    <div className={cn("worksheet-page relative bg-white", className)} dir="rtl">
      {/* Blue header bar */}
      <div className="page-header">
        <span className="page-header-title">נושא: {topic} | {chapter}</span>
        <span className="page-header-num">{pageNumber}</span>
      </div>
      <div className="page-content">
        {children}
      </div>
    </div>
  );
}

// Reusable question component with auto-numbered marker
export function Question({ children }: { children: ReactNode }) {
  return (
    <div className="question-block">
      <span className="question-bullet" aria-hidden="true" />
      <div className="question-content">{children}</div>
    </div>
  );
}

// Sub-question (no bullet)
export function SubQuestion({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="sub-question">
      <span className="sub-label">{label}</span>
      <div className="sub-content">{children}</div>
    </div>
  );
}

// Answer line
export function AnswerLine({ label }: { label?: string }) {
  return (
    <div className="answer-line-container">
      {label && <span className="answer-label">{label}</span>}
      <span className="answer-line" />
    </div>
  );
}

// Fill-in-the-blank line inline
export function Blank() {
  return <span className="inline-blank" />;
}

// Fraction component
export function Frac({ num, den }: { num: string | number; den: string | number }) {
  return (
    <span className="fraction">
      <span className="frac-num">{num}</span>
      <span className="frac-line" />
      <span className="frac-den">{den}</span>
    </span>
  );
}

// Checkbox
export function Checkbox({ label }: { label?: string }) {
  return (
    <span className="worksheet-checkbox">
      <span className="checkbox-box" />
      {label && <span className="checkbox-label">{label}</span>}
    </span>
  );
}

// Table component
interface TableProps {
  headers: string[];
  rows: (string | ReactNode)[][];
  className?: string;
}

export function WorksheetTable({ headers, rows, className }: TableProps) {
  return (
    <table className={cn("worksheet-table", className)}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Multiple choice with checkboxes
export function MultipleChoice({ options }: { options: { label?: string; value: string }[] }) {
  return (
    <div className="multiple-choice">
      {options.map((opt, i) => (
        <div key={i} className="choice-option">
          <Checkbox label={opt.label} />
          <span className="choice-value">{opt.value}</span>
        </div>
      ))}
    </div>
  );
}

// Horizontal separator between questions
export function QSep() {
  return <div className="q-separator" />;
}
