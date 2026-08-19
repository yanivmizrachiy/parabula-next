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
  TeacherIntroPage01,
  TeacherIntroPage02,
  TeacherIntroPage03,
  TeacherIntroPage04,
  TeacherIntroPage05,
  TeacherIntroPage06,
  TeacherIntroPage07,
  TeacherIntroPage08,
} from '@/components/worksheet/corrected/TeacherIntroPages';
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
  id: number;
  title: string;
  chapter: string;
  component: () => ReactNode;
  // 'authors' = the supplied teacher-authored explanatory page (credited to ד״ר תנעמי · איילת
  // קריספין); 'yaniv' = the worksheet pages (credited to יניב רז). Defaults to 'yaniv'.
  credit?: 'authors' | 'yaniv';
}

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

// הדפים מסודרים לפי פרק ומדורגים מהקל אל הקשה. ההסברים של החוברת המקורית (שמונת עמודי הפתיחה של
// ד״ר תנעמי ואיילת קריספין) פורקו ושובצו בתחילת הפרק שאותו הם מציגים (הוראת יניב, 2026-08-19).
// עמוד שמסומן credit:'authors' נושא את הקרדיט של המחברים; שאר העמודים נושאים את הקרדיט של יניב רז.
export const WORKSHEET_PAGES: WorksheetPageData[] = [
  // ── מושגים בסיסיים ──
  { id: 1, title: 'יחס — מדוע עכשיו? והיכרות ראשונית', chapter: CHAPTERS.foundations, credit: 'authors', component: () => <TeacherIntroPage01 /> },
  { id: 2, title: 'יחס ישר מתוך מדבקות וטבלה', chapter: CHAPTERS.foundations, credit: 'authors', component: () => <TeacherIntroPage02 /> },
  { id: 3, title: 'סיכום מושג היחס וכתיבה מתוך מחרוזות', chapter: CHAPTERS.foundations, credit: 'authors', component: () => <TeacherIntroPage03 /> },
  { id: 4, title: 'יחסים שווים, השלמות וכתיבה כשבר', chapter: CHAPTERS.foundations, credit: 'authors', component: () => <TeacherIntroPage04 /> },
  { id: 5, title: 'זיהוי יחס ושמירתו', chapter: CHAPTERS.foundations, component: () => <RatioPage01 /> },
  { id: 6, title: 'יחס מתוך איור והסקת תכונות', chapter: CHAPTERS.foundations, component: () => <RatioPage02 /> },
  { id: 7, title: 'יחס חלק־לשלם ובעיות מילוליות', chapter: CHAPTERS.foundations, component: () => <Ch1Page3 /> },
  { id: 8, title: 'יחסים שווים והשלמת כמויות', chapter: CHAPTERS.foundations, component: () => <RatioPage04 /> },
  { id: 9, title: 'יחס בגילים, בכיתה ובתמיסה', chapter: CHAPTERS.foundations, component: () => <RatioPage05 /> },
  { id: 10, title: 'היתכנות והשוואת יחסים', chapter: CHAPTERS.foundations, component: () => <RatioPage06 /> },
  { id: 11, title: 'יחס מתוך ייצוגים חזותיים', chapter: CHAPTERS.foundations, component: () => <RatioPage07 /> },
  { id: 12, title: 'יחסים שווים ומספר חסר', chapter: CHAPTERS.foundations, component: () => <Ch1Page8 /> },
  { id: 13, title: 'יישומי יחס במצבים מגוונים', chapter: CHAPTERS.foundations, component: () => <Ch1Page9 /> },

  // ── חלוקה ביחס נתון ──
  { id: 14, title: 'חלוקת כמות לשני חלקים', chapter: CHAPTERS.division, component: () => <Ch2Page1 /> },
  { id: 15, title: 'חלוקה לשלושה חלקים', chapter: CHAPTERS.division, component: () => <Ch2Page2 /> },
  { id: 16, title: 'חלוקה לפי מחיר, תלמידים וגרף', chapter: CHAPTERS.division, component: () => <RatioPage11 /> },
  { id: 17, title: 'חלוקת רווחים, זוויות ושטחים', chapter: CHAPTERS.division, component: () => <Ch2Page4 /> },
  { id: 18, title: 'חלוקה גאומטרית ושינוי הרכב', chapter: CHAPTERS.division, component: () => <RatioPage13 /> },
  { id: 19, title: 'מעבר משבר ליחס', chapter: CHAPTERS.division, component: () => <Ch2Page6 /> },
  { id: 20, title: 'חלוקה, זוויות ושטחים', chapter: CHAPTERS.division, component: () => <Ch2Page7 /> },
  { id: 21, title: 'יישומים מורחבים של חלוקה', chapter: CHAPTERS.division, component: () => <RatioPage16 /> },
  { id: 22, title: 'חלוקת השקעות וביטויים אלגבריים', chapter: CHAPTERS.division, component: () => <Ch2Page9 /> },
  { id: 23, title: 'פתרון חלוקה באמצעות משתנה', chapter: CHAPTERS.division, component: () => <Ch2Page10 /> },
  { id: 24, title: 'חלוקה ביחס — בעיות ויישומים', chapter: CHAPTERS.division, component: () => <Ch2Page11 /> },

  // ── כתיבה והשוואת יחסים ──
  { id: 25, title: 'כתיבה מתמטית, מילולית וחלק־שלם', chapter: CHAPTERS.representation, credit: 'authors', component: () => <TeacherIntroPage05 /> },
  { id: 26, title: 'כתיבת יחסים שווים', chapter: CHAPTERS.representation, credit: 'authors', component: () => <TeacherIntroPage08 /> },
  { id: 27, title: 'כתיבת יחס מתוך דגמים ונתונים', chapter: CHAPTERS.representation, component: () => <RatioPage18 /> },
  { id: 28, title: 'יחסי קטעים, תערובות ומעברים', chapter: CHAPTERS.representation, component: () => <RatioPage20 /> },
  { id: 29, title: 'יחס בקבוצות, בשברים ובאחוזים', chapter: CHAPTERS.representation, component: () => <RatioPage21 /> },
  { id: 30, title: 'יחסי שטחים במלבנים ובמשולשים', chapter: CHAPTERS.representation, component: () => <RatioPage22 /> },
  { id: 31, title: 'יחס במשבצות, בזוויות ובמחרוזות', chapter: CHAPTERS.representation, component: () => <RatioPage23 /> },
  { id: 32, title: 'יחס בסיפורים ובמשולשים', chapter: CHAPTERS.representation, component: () => <Ch3Page8 /> },
  { id: 33, title: 'יחסי שטחים מתוך מבנה', chapter: CHAPTERS.representation, component: () => <RatioPage26 /> },

  // ── יחס מצומצם ──
  { id: 34, title: 'לימונדה, יחסים שווים וצמצום', chapter: CHAPTERS.reduced, credit: 'authors', component: () => <TeacherIntroPage07 /> },
  { id: 35, title: 'צמצום, אחוזים ויחס בגילים', chapter: CHAPTERS.reduced, component: () => <RatioPage19 /> },
  { id: 36, title: 'צמצום יחס ויחסי זוויות', chapter: CHAPTERS.reduced, component: () => <Ch3Page7 /> },

  // ── שמירת היחס ──
  { id: 37, title: 'חלק־חלק, חלק־שלם ושמירת יחס', chapter: CHAPTERS.preservation, credit: 'authors', component: () => <TeacherIntroPage06 /> },
  { id: 38, title: 'מתי היחס נשמר?', chapter: CHAPTERS.preservation, component: () => <RatioPage27 /> },
  { id: 39, title: 'שינוי יחס במתכון ובתערובת', chapter: CHAPTERS.preservation, component: () => <Ch4Page2 /> },
  { id: 40, title: 'שיעור ליחידה ויחידות מידה', chapter: CHAPTERS.preservation, component: () => <Ch4Page3 /> },

  // ── יחס בגאומטריה ובכמויות ──
  { id: 41, title: 'אמצעי צלעות, עוגיות ושטחים', chapter: CHAPTERS.combined, component: () => <RatioPage29 /> },

  // ── פרופורציה ──
  { id: 42, title: 'בדיקת פרופורציה ופתרון משוואות', chapter: CHAPTERS.proportion, component: () => <Ch6Page1 /> },
  { id: 43, title: 'יישומי פרופורציה', chapter: CHAPTERS.proportion, component: () => <Ch6Page2 /> },
  { id: 44, title: 'יחס ישר וייצוג אלגברי', chapter: CHAPTERS.proportion, component: () => <Ch6Page3 /> },
  { id: 45, title: 'פרופורציות, משתנים ואומדן', chapter: CHAPTERS.proportion, component: () => <RatioPage35 /> },
  { id: 46, title: 'פרופורציה בחיי היום־יום', chapter: CHAPTERS.proportion, component: () => <Ch6Page5 /> },

  // ── שאלות מיצ״ב ──
  { id: 47, title: 'מיצ״ב תשע״ו — יחס ותרשים', chapter: CHAPTERS.data, component: () => <Ch7Page1 /> },
  { id: 48, title: 'מיצ״ב תשע״ו — היגדים', chapter: CHAPTERS.data, component: () => <Ch7Page2 /> },
  { id: 49, title: 'מיצ״ב תשע״ו — אוכלוסייה', chapter: CHAPTERS.data, component: () => <Ch7Page3 /> },
  { id: 50, title: 'מיצ״ב תשע״ה — יחס ודמיון', chapter: CHAPTERS.data, component: () => <RatioPage42 /> },
  { id: 51, title: 'מיצ״ב תשע״ד — מסילה ודמיון', chapter: CHAPTERS.data, component: () => <Ch7Page5 /> },
  { id: 52, title: 'מיצ״ב תשע״ג — יחס וגילים', chapter: CHAPTERS.data, component: () => <Ch7Page6 /> },
  { id: 53, title: 'מיצ״ב תשע״ג — דיאגרמה', chapter: CHAPTERS.data, component: () => <Ch7Page7 /> },
  { id: 54, title: 'מיצ״ב תשע״ב — מתכון', chapter: CHAPTERS.data, component: () => <Ch7Page8 /> },
  { id: 55, title: 'מיצ״ב תשע״א — אלגברה וטבלה', chapter: CHAPTERS.data, component: () => <Ch7Page9 /> },
  { id: 56, title: 'מיצ״ב — גאומטריה ויחסים', chapter: CHAPTERS.data, component: () => <RatioPage48 /> },

  // ── שאלות מתוך תוכנית הלימודים ──
  { id: 57, title: 'יחס והסתברות — מחרוזת וצופים', chapter: CHAPTERS.curriculum, component: () => <CurriculumPage01 /> },
  { id: 58, title: 'חלוקה ביחס נתון — כדורים וגולות', chapter: CHAPTERS.curriculum, component: () => <CurriculumPage02 /> },
  { id: 59, title: 'חלוקת רווח וכריכים לפי יחס', chapter: CHAPTERS.curriculum, component: () => <CurriculumPage03 /> },
  { id: 60, title: 'אפשרויות, הסתברות והיקף מלבן', chapter: CHAPTERS.curriculum, component: () => <CurriculumPage04 /> },
  { id: 61, title: 'יחס במשולש ישר־זווית ובריבוע', chapter: CHAPTERS.curriculum, component: () => <CurriculumPage05 /> },
  { id: 62, title: 'יחס במלבן אלגברי ובשטח משולש', chapter: CHAPTERS.curriculum, component: () => <CurriculumPage06 /> },
  { id: 63, title: 'יחס בהיקפים ובמסילת תמונות', chapter: CHAPTERS.curriculum, component: () => <CurriculumPage07 /> },
];
