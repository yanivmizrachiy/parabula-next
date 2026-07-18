import { ReactNode } from 'react';
import { Ch1Page1, Ch1Page2, Ch1Page3, Ch1Page4, Ch1Page5, Ch1Page6, Ch1Page7, Ch1Page8, Ch1Page9 } from '@/components/worksheet/pages/Chapter1Pages';
import { Ch2Page1, Ch2Page2, Ch2Page3, Ch2Page4, Ch2Page5, Ch2Page6, Ch2Page7, Ch2Page8, Ch2Page9, Ch2Page10, Ch2Page11 } from '@/components/worksheet/pages/Chapter2Pages';
import { Ch3Page1, Ch3Page2, Ch3Page3, Ch3Page4, Ch3Page5, Ch3Page6, Ch3Page7, Ch3Page8, Ch3Page9 } from '@/components/worksheet/pages/Chapter3Pages';
import { Ch4Page1, Ch4Page2, Ch4Page3 } from '@/components/worksheet/pages/Chapter4Pages';
import { Ch5Page1 } from '@/components/worksheet/pages/Chapter5Pages';
import { Ch6Page1, Ch6Page2, Ch6Page3, Ch6Page4, Ch6Page5 } from '@/components/worksheet/pages/Chapter6Pages';
import { Ch7Page1, Ch7Page2, Ch7Page3, Ch7Page4, Ch7Page5, Ch7Page6, Ch7Page7, Ch7Page8, Ch7Page9, Ch7Page10 } from '@/components/worksheet/pages/Chapter7Pages';

export interface WorksheetPageData {
  id: number;
  title: string;
  chapter: string;
  component: () => ReactNode;
}

export const WORKSHEET_PAGES: WorksheetPageData[] = [
  // Chapter 1 – יחס (8 pages)
  { id: 1,  title: 'עמוד 1',  chapter: 'פרק 1', component: () => <Ch1Page1 /> },
  { id: 2,  title: 'עמוד 2',  chapter: 'פרק 1', component: () => <Ch1Page2 /> },
  { id: 3,  title: 'עמוד 3',  chapter: 'פרק 1', component: () => <Ch1Page3 /> },
  { id: 4,  title: 'עמוד 4',  chapter: 'פרק 1', component: () => <Ch1Page4 /> },
  { id: 5,  title: 'עמוד 5',  chapter: 'פרק 1', component: () => <Ch1Page5 /> },
  { id: 6,  title: 'עמוד 6',  chapter: 'פרק 1', component: () => <Ch1Page6 /> },
  { id: 7,  title: 'עמוד 7',  chapter: 'פרק 1', component: () => <Ch1Page7 /> },
  { id: 8,  title: 'עמוד 8',  chapter: 'פרק 1', component: () => <Ch1Page8 /> },
  // Chapter 2 – חלוקה ביחס נתון (8 pages)
  { id: 9,  title: 'עמוד 9',  chapter: 'פרק 2', component: () => <Ch2Page1 /> },
  { id: 10, title: 'עמוד 10', chapter: 'פרק 2', component: () => <Ch2Page2 /> },
  { id: 11, title: 'עמוד 11', chapter: 'פרק 2', component: () => <Ch2Page3 /> },
  { id: 12, title: 'עמוד 12', chapter: 'פרק 2', component: () => <Ch2Page4 /> },
  { id: 13, title: 'עמוד 13', chapter: 'פרק 2', component: () => <Ch2Page5 /> },
  { id: 14, title: 'עמוד 14', chapter: 'פרק 2', component: () => <Ch2Page6 /> },
  { id: 15, title: 'עמוד 15', chapter: 'פרק 2', component: () => <Ch2Page7 /> },
  { id: 16, title: 'עמוד 16', chapter: 'פרק 2', component: () => <Ch2Page8 /> },
  { id: 17, title: 'עמוד 17', chapter: 'פרק 2', component: () => <Ch2Page9 /> },
  // Chapter 3 – מהו היחס (9 pages)
  { id: 18, title: 'עמוד 18', chapter: 'פרק 3', component: () => <Ch3Page1 /> },
  { id: 19, title: 'עמוד 19', chapter: 'פרק 3', component: () => <Ch3Page2 /> },
  { id: 20, title: 'עמוד 20', chapter: 'פרק 3', component: () => <Ch3Page3 /> },
  { id: 21, title: 'עמוד 21', chapter: 'פרק 3', component: () => <Ch3Page4 /> },
  { id: 22, title: 'עמוד 22', chapter: 'פרק 3', component: () => <Ch3Page5 /> },
  { id: 23, title: 'עמוד 23', chapter: 'פרק 3', component: () => <Ch3Page6 /> },
  { id: 24, title: 'עמוד 24', chapter: 'פרק 3', component: () => <Ch3Page7 /> },
  { id: 25, title: 'עמוד 25', chapter: 'פרק 3', component: () => <Ch3Page8 /> },
  { id: 26, title: 'עמוד 26', chapter: 'פרק 3', component: () => <Ch3Page9 /> },
  // Chapter 4 – האם היחס נשמר (2 pages)
  { id: 27, title: 'עמוד 27', chapter: 'פרק 4', component: () => <Ch4Page1 /> },
  { id: 28, title: 'עמוד 28', chapter: 'פרק 4', component: () => <Ch4Page2 /> },
  // Chapter 5 – שאלות אתגר
  { id: 29, title: 'עמוד 29', chapter: 'פרק 5', component: () => <Ch5Page1 /> },
  // Chapter 6 – פרופורציה
  { id: 30, title: 'עמוד 30', chapter: 'פרק 6', component: () => <Ch6Page1 /> },
  { id: 31, title: 'עמוד 31', chapter: 'פרק 6', component: () => <Ch6Page2 /> },
  { id: 32, title: 'עמוד 32', chapter: 'פרק 6', component: () => <Ch6Page3 /> },
  // Additional pages – יחס בכלים אלגבריים, יחידות מידה, פרופורציות
  { id: 33, title: 'עמוד 33', chapter: 'פרק 2', component: () => <Ch2Page10 /> },
  { id: 34, title: 'עמוד 34', chapter: 'פרק 4', component: () => <Ch4Page3 /> },
  { id: 35, title: 'עמוד 35', chapter: 'פרק 6', component: () => <Ch6Page4 /> },
  { id: 36, title: 'עמוד 36', chapter: 'פרק 1', component: () => <Ch1Page9 /> },
  { id: 37, title: 'עמוד 37', chapter: 'פרק 2', component: () => <Ch2Page11 /> },
  { id: 38, title: 'עמוד 38', chapter: 'פרק 6', component: () => <Ch6Page5 /> },
  // Chapter 7 – מבחני מיצ"ב (תשע"א–תשע"ו)
  { id: 39, title: 'עמוד 39', chapter: 'פרק 7', component: () => <Ch7Page1 /> },
  { id: 40, title: 'עמוד 40', chapter: 'פרק 7', component: () => <Ch7Page2 /> },
  { id: 41, title: 'עמוד 41', chapter: 'פרק 7', component: () => <Ch7Page3 /> },
  { id: 42, title: 'עמוד 42', chapter: 'פרק 7', component: () => <Ch7Page4 /> },
  { id: 43, title: 'עמוד 43', chapter: 'פרק 7', component: () => <Ch7Page5 /> },
  { id: 44, title: 'עמוד 44', chapter: 'פרק 7', component: () => <Ch7Page6 /> },
  { id: 45, title: 'עמוד 45', chapter: 'פרק 7', component: () => <Ch7Page7 /> },
  { id: 46, title: 'עמוד 46', chapter: 'פרק 7', component: () => <Ch7Page8 /> },
  { id: 47, title: 'עמוד 47', chapter: 'פרק 7', component: () => <Ch7Page9 /> },
  { id: 48, title: 'עמוד 48', chapter: 'פרק 7', component: () => <Ch7Page10 /> },
];
