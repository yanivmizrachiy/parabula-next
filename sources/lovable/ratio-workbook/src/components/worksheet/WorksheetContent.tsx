 import { cn } from '@/lib/utils';
 import { ReactNode } from 'react';
 
 interface WorksheetContentProps {
   pageNumber: number;
   totalPages: number;
   children: ReactNode;
   className?: string;
 }
 
 export function WorksheetContent({
   pageNumber,
   totalPages,
   children,
   className,
 }: WorksheetContentProps) {
   return (
     <div
       className={cn(
         "worksheet-page relative bg-white font-david",
         className
       )}
       dir="rtl"
     >
       {/* Page Number Circle - Top Left */}
       <div className="absolute top-4 left-4 z-10">
         <div className="w-10 h-10 rounded-full border-2 border-black bg-white flex items-center justify-center">
           <span className="text-sm font-bold text-black font-david">
             {pageNumber}
           </span>
         </div>
       </div>
 
       {/* Page Content */}
       <div className="p-8 pt-16 h-full">
         {children}
       </div>
     </div>
   );
 }
 
 // Question component with bullet point
 interface QuestionProps {
   children: ReactNode;
   subQuestions?: ReactNode[];
 }
 
 export function Question({ children, subQuestions }: QuestionProps) {
   return (
     <div className="mb-6">
       <div className="flex gap-2 items-start">
         <span className="text-black font-bold mt-1">●</span>
         <div className="flex-1 text-sm leading-relaxed font-david">
           {children}
         </div>
       </div>
       {subQuestions && (
         <div className="mr-6 mt-2 space-y-2">
           {subQuestions.map((sub, index) => (
             <div key={index} className="flex gap-2 items-start">
               <span className="text-black text-xs">{String.fromCharCode(1488 + index)}.</span>
               <div className="flex-1 text-sm font-david">{sub}</div>
             </div>
           ))}
         </div>
       )}
     </div>
   );
 }
 
 // Section header
 interface SectionHeaderProps {
   children: ReactNode;
 }
 
 export function SectionHeader({ children }: SectionHeaderProps) {
   return (
     <h2 className="text-lg font-bold mb-4 text-black font-david border-b-2 border-black pb-2">
       {children}
     </h2>
   );
 }
 
 // Answer lines
 interface AnswerLinesProps {
   count?: number;
 }
 
 export function AnswerLines({ count = 3 }: AnswerLinesProps) {
   return (
     <div className="mt-3 space-y-3">
       {Array.from({ length: count }).map((_, i) => (
         <div key={i} className="border-b border-gray-400 h-6" />
       ))}
     </div>
   );
 }
 
 // Table component
 interface TableProps {
   headers: string[];
   rows: string[][];
 }
 
 export function WorksheetTable({ headers, rows }: TableProps) {
   return (
     <table className="w-full border-collapse border-2 border-black my-4 font-david text-sm">
       <thead>
         <tr className="bg-gray-100">
           {headers.map((header, i) => (
             <th key={i} className="border border-black p-2 font-bold">
               {header}
             </th>
           ))}
         </tr>
       </thead>
       <tbody>
         {rows.map((row, i) => (
           <tr key={i}>
             {row.map((cell, j) => (
               <td key={j} className="border border-black p-2 text-center">
                 {cell}
               </td>
             ))}
           </tr>
         ))}
       </tbody>
     </table>
   );
 }