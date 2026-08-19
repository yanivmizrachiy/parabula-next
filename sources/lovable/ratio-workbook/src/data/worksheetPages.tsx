import { ReactNode } from 'react';
import { Ch1Page3, Ch1Page8, Ch1Page9 } from '@/components/worksheet/pages/Chapter1Pages';
import { Ch2Page1, Ch2Page2, Ch2Page4, Ch2Page6, Ch2Page7, Ch2Page9, Ch2Page10, Ch2Page11 } from '@/components/worksheet/pages/Chapter2Pages';
import { Ch3Page7, Ch3Page8 } from '@/components/worksheet/pages/Chapter3Pages';
import { Ch4Page2, Ch4Page3 } from '@/components/worksheet/pages/Chapter4Pages';
import { Ch6Page1, Ch6Page2, Ch6Page3, Ch6Page5 } from '@/components/worksheet/pages/Chapter6Pages';
import { Ch7Page1, Ch7Page2, Ch7Page3, Ch7Page5, Ch7Page6, Ch7Page7, Ch7Page8, Ch7Page9 } from '@/components/worksheet/pages/Chapter7Pages';
import { RatioPage01 } from '@/components/worksheet/corrected/RatioPage01';
import { RatioPage02, RatioPage04, RatioPage05, RatioPage06, RatioPage07 } from '@/components/worksheet/corrected/Chapter1Corrections';
import { RatioPage11, RatioPage13, RatioPage16 } from '@/components/worksheet/corrected/Chapter2Corrections';
import { RatioPage18, RatioPage19, RatioPage20, RatioPage21, RatioPage22, RatioPage23, RatioPage26 } from '@/components/worksheet/corrected/Chapter3Corrections';
import { RatioPage27 } from '@/components/worksheet/corrected/Chapter4Corrections';
import { RatioPage29 } from '@/components/worksheet/corrected/Chapter5Corrections';
import { RatioPage35 } from '@/components/worksheet/corrected/Chapter6Corrections';
import { RatioPage42, RatioPage48 } from '@/components/worksheet/corrected/Chapter7Corrections';
import {
  CurriculumPage01,
  CurriculumPage02,
  CurriculumPage03,
  CurriculumPage04,
  CurriculumPage05,
  CurriculumPage06,
  CurriculumPage07,
} from '@/components/worksheet/corrected/CurriculumQuestionsPages';

export interface WorksheetPageData {
  /** Sequential student-facing number. Derived from array order; never hand-maintained. */
  id: number;
  /** Stable identifier for tests, manifests and future moves/reordering. */
  key: string;
  title: string;
  chapter: string;
  component: () => ReactNode;
  /** Public/student workbook credit. Teacher-authored intro pages are intentionally excluded. */
  credit?: 'yaniv';
}

type WorksheetPageDefinition = Omit<WorksheetPageData, 'id'>;

const CHAPTERS = {
  foundations: '1 · מושגים בסיסיים',
  division: '2 · חלוקה ביחס נתון',
  representation: '3 · כתיבה והשוואת יחסים',
  reduced: '4 · יחס מצומצם',
  preservation: '5 · שמירת היחס',
  combined: '6 · יחס בגאומטריה ובכמויות',
  proportion: '7 · פרופורציה',
  data: '8 · שאלות מיצ״ב',
  curriculum: '9 · שאלות מתוך תוכנית הלימודים',
} as const;

/**
 * מקור האמת לחוברת התלמיד.
 *
 * כלל ברזל (2026-08-19):
 * - אין דפי מורה / דפי פתיחה למורה בתוך WORKSHEET_PAGES.
 * - העמוד הראשון שמוצג לתלמיד הוא RatioPage01 והוא ממוספר 1.
 * - המספור נגזר אוטומטית מהסדר כאן, כדי שהוספה/הזזה לא תשבור מזהים או בדיקות.
 * - `key` הוא המזהה היציב. אין לבנות לוגיקה על מיקום במערך או על id היסטורי.
 */
const WORKSHEET_PAGE_DEFINITIONS: WorksheetPageDefinition[] = [
  // ── מושגים בסיסיים ──
  { key: 'ratio-page-01', title: 'זיהוי יחס ושמירתו', chapter: CHAPTERS.foundations, component: () => <RatioPage01 /> },
  { key: 'ratio-page-02', title: 'יחס מתוך איור והסקת תכונות', chapter: CHAPTERS.foundations, component: () => <RatioPage02 /> },
  { key: 'ch1-page-03', title: 'יחס חלק־לשלם ובעיות מילוליות', chapter: CHAPTERS.foundations, component: () => <Ch1Page3 /> },
  { key: 'ratio-page-04', title: 'יחסים שווים והשלמת כמויות', chapter: CHAPTERS.foundations, component: () => <RatioPage04 /> },
  { key: 'ratio-page-05', title: 'יחס בגילים, בכיתה ובתמיסה', chapter: CHAPTERS.foundations, component: () => <RatioPage05 /> },
  { key: 'ratio-page-06', title: 'היתכנות והשוואת יחסים', chapter: CHAPTERS.foundations, component: () => <RatioPage06 /> },
  { key: 'ratio-page-07', title: 'יחס מתוך ייצוגים חזותיים', chapter: CHAPTERS.foundations, component: () => <RatioPage07 /> },
  { key: 'ch1-page-08', title: 'יחסים שווים ומספר חסר', chapter: CHAPTERS.foundations, component: () => <Ch1Page8 /> },
  { key: 'ch1-page-09', title: 'יישומי יחס במצבים מגוונים', chapter: CHAPTERS.foundations, component: () => <Ch1Page9 /> },

  // ── חלוקה ביחס נתון ──
  { key: 'ch2-page-01', title: 'חלוקת כמות לשני חלקים', chapter: CHAPTERS.division, component: () => <Ch2Page1 /> },
  { key: 'ch2-page-02', title: 'חלוקה לשלושה חלקים', chapter: CHAPTERS.division, component: () => <Ch2Page2 /> },
  { key: 'ratio-page-11', title: 'חלוקה לפי מחיר, תלמידים וגרף', chapter: CHAPTERS.division, component: () => <RatioPage11 /> },
  { key: 'ch2-page-04', title: 'חלוקת רווחים, זוויות ושטחים', chapter: CHAPTERS.division, component: () => <Ch2Page4 /> },
  { key: 'ratio-page-13', title: 'חלוקה גאומטרית ושינוי הרכב', chapter: CHAPTERS.division, component: () => <RatioPage13 /> },
  { key: 'ch2-page-06', title: 'מעבר משבר ליחס', chapter: CHAPTERS.division, component: () => <Ch2Page6 /> },
  { key: 'ch2-page-07', title: 'חלוקה, זוויות ושטחים', chapter: CHAPTERS.division, component: () => <Ch2Page7 /> },
  { key: 'ratio-page-16', title: 'יישומים מורחבים של חלוקה', chapter: CHAPTERS.division, component: () => <RatioPage16 /> },
  { key: 'ch2-page-09', title: 'חלוקת השקעות וביטויים אלגבריים', chapter: CHAPTERS.division, component: () => <Ch2Page9 /> },
  { key: 'ch2-page-10', title: 'פתרון חלוקה באמצעות משתנה', chapter: CHAPTERS.division, component: () => <Ch2Page10 /> },
  { key: 'ch2-page-11', title: 'חלוקה ביחס — בעיות ויישומים', chapter: CHAPTERS.division, component: () => <Ch2Page11 /> },

  // ── כתיבה והשוואת יחסים ──
  { key: 'ratio-page-18', title: 'כתיבת יחס מתוך דגמים ונתונים', chapter: CHAPTERS.representation, component: () => <RatioPage18 /> },
  { key: 'ratio-page-20', title: 'יחסי קטעים, תערובות ומעברים', chapter: CHAPTERS.representation, component: () => <RatioPage20 /> },
  { key: 'ratio-page-21', title: 'יחס בקבוצות, בשברים ובאחוזים', chapter: CHAPTERS.representation, component: () => <RatioPage21 /> },
  { key: 'ratio-page-22', title: 'יחסי שטחים במלבנים ובמשולשים', chapter: CHAPTERS.representation, component: () => <RatioPage22 /> },
  { key: 'ratio-page-23', title: 'יחס במשבצות, בזוויות ובמחרוזות', chapter: CHAPTERS.representation, component: () => <RatioPage23 /> },
  { key: 'ch3-page-08', title: 'יחס בסיפורים ובמשולשים', chapter: CHAPTERS.representation, component: () => <Ch3Page8 /> },
  { key: 'ratio-page-26', title: 'יחסי שטחים מתוך מבנה', chapter: CHAPTERS.representation, component: () => <RatioPage26 /> },

  // ── יחס מצומצם ──
  { key: 'ratio-page-19', title: 'צמצום, אחוזים ויחס בגילים', chapter: CHAPTERS.reduced, component: () => <RatioPage19 /> },
  { key: 'ch3-page-07', title: 'צמצום יחס ויחסי זוויות', chapter: CHAPTERS.reduced, component: () => <Ch3Page7 /> },

  // ── שמירת היחס ──
  { key: 'ratio-page-27', title: 'מתי היחס נשמר?', chapter: CHAPTERS.preservation, component: () => <RatioPage27 /> },
  { key: 'ch4-page-02', title: 'שינוי יחס במתכון ובתערובת', chapter: CHAPTERS.preservation, component: () => <Ch4Page2 /> },
  { key: 'ch4-page-03', title: 'שיעור ליחידה ויחידות מידה', chapter: CHAPTERS.preservation, component: () => <Ch4Page3 /> },

  // ── יחס בגאומטריה ובכמויות ──
  { key: 'ratio-page-29', title: 'אמצעי צלעות, עוגיות ושטחים', chapter: CHAPTERS.combined, component: () => <RatioPage29 /> },

  // ── פרופורציה ──
  { key: 'ch6-page-01', title: 'בדיקת פרופורציה ופתרון משוואות', chapter: CHAPTERS.proportion, component: () => <Ch6Page1 /> },
  { key: 'ch6-page-02', title: 'יישומי פרופורציה', chapter: CHAPTERS.proportion, component: () => <Ch6Page2 /> },
  { key: 'ch6-page-03', title: 'יחס ישר וייצוג אלגברי', chapter: CHAPTERS.proportion, component: () => <Ch6Page3 /> },
  { key: 'ratio-page-35', title: 'פרופורציות, משתנים ואומדן', chapter: CHAPTERS.proportion, component: () => <RatioPage35 /> },
  { key: 'ch6-page-05', title: 'פרופורציה בחיי היום־יום', chapter: CHAPTERS.proportion, component: () => <Ch6Page5 /> },

  // ── שאלות מיצ״ב ──
  { key: 'ch7-page-01', title: 'מיצ״ב תשע״ו — יחס ותרשים', chapter: CHAPTERS.data, component: () => <Ch7Page1 /> },
  { key: 'ch7-page-02', title: 'מיצ״ב תשע״ו — היגדים', chapter: CHAPTERS.data, component: () => <Ch7Page2 /> },
  { key: 'ch7-page-03', title: 'מיצ״ב תשע״ו — אוכלוסייה', chapter: CHAPTERS.data, component: () => <Ch7Page3 /> },
  { key: 'ratio-page-42', title: 'מיצ״ב תשע״ה — יחס ודמיון', chapter: CHAPTERS.data, component: () => <RatioPage42 /> },
  { key: 'ch7-page-05', title: 'מיצ״ב תשע״ד — מסילה ודמיון', chapter: CHAPTERS.data, component: () => <Ch7Page5 /> },
  { key: 'ch7-page-06', title: 'מיצ״ב תשע״ג — יחס וגילים', chapter: CHAPTERS.data, component: () => <Ch7Page6 /> },
  { key: 'ch7-page-07', title: 'מיצ״ב תשע״ג — דיאגרמה', chapter: CHAPTERS.data, component: () => <Ch7Page7 /> },
  { key: 'ch7-page-08', title: 'מיצ״ב תשע״ב — מתכון', chapter: CHAPTERS.data, component: () => <Ch7Page8 /> },
  { key: 'ch7-page-09', title: 'מיצ״ב תשע״א — אלגברה וטבלה', chapter: CHAPTERS.data, component: () => <Ch7Page9 /> },
  { key: 'ratio-page-48', title: 'מיצ״ב — גאומטריה ויחסים', chapter: CHAPTERS.data, component: () => <RatioPage48 /> },

  // ── שאלות מתוך תוכנית הלימודים ──
  { key: 'curriculum-page-01', title: 'יחס והסתברות — מחרוזת וצופים', chapter: CHAPTERS.curriculum, component: () => <CurriculumPage01 /> },
  { key: 'curriculum-page-02', title: 'חלוקה ביחס נתון — כדורים וגולות', chapter: CHAPTERS.curriculum, component: () => <CurriculumPage02 /> },
  { key: 'curriculum-page-03', title: 'חלוקת רווח וכריכים לפי יחס', chapter: CHAPTERS.curriculum, component: () => <CurriculumPage03 /> },
  { key: 'curriculum-page-04', title: 'אפשרויות, הסתברות והיקף מלבן', chapter: CHAPTERS.curriculum, component: () => <CurriculumPage04 /> },
  { key: 'curriculum-page-05', title: 'יחס במשולש ישר־זווית ובריבוע', chapter: CHAPTERS.curriculum, component: () => <CurriculumPage05 /> },
  { key: 'curriculum-page-06', title: 'יחס במלבן אלגברי ובשטח משולש', chapter: CHAPTERS.curriculum, component: () => <CurriculumPage06 /> },
  { key: 'curriculum-page-07', title: 'יחס בהיקפים ובמסילת תמונות', chapter: CHAPTERS.curriculum, component: () => <CurriculumPage07 /> },
];

export const WORKSHEET_PAGES: WorksheetPageData[] = WORKSHEET_PAGE_DEFINITIONS.map((page, index) => ({
  ...page,
  id: index + 1,
  credit: 'yaniv',
}));
