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

export interface WorksheetPageData {
  id: number;
  title: string;
  chapter: string;
  component: () => ReactNode;
}

const CHAPTERS = {
  foundations: '1 · יסודות היחס',
  division: '2 · חלוקה ביחס נתון',
  representation: '3 · כתיבה, צמצום והשוואה',
  preservation: '4 · שמירת יחס ושיעור ליחידה',
  combined: '5 · יחס בגאומטריה ובכמויות',
  proportion: '6 · פרופורציה ויחס ישר',
  data: '7 · יחס בנתונים, תרשימים וגאומטריה',
} as const;

export const WORKSHEET_PAGES: WorksheetPageData[] = [
  { id: 1, title: 'זיהוי יחס ושמירתו', chapter: CHAPTERS.foundations, component: () => <RatioPage01 /> },
  { id: 2, title: 'יחס מתוך איור והסקת תכונות', chapter: CHAPTERS.foundations, component: () => <RatioPage02 /> },
  { id: 3, title: 'יחס חלק־לשלם ובעיות מילוליות', chapter: CHAPTERS.foundations, component: () => <Ch1Page3 /> },
  { id: 4, title: 'יחסים שווים והשלמת כמויות', chapter: CHAPTERS.foundations, component: () => <RatioPage04 /> },
  { id: 5, title: 'יחס בגילים, בכיתה ובתמיסה', chapter: CHAPTERS.foundations, component: () => <RatioPage05 /> },
  { id: 6, title: 'היתכנות והשוואת יחסים', chapter: CHAPTERS.foundations, component: () => <RatioPage06 /> },
  { id: 7, title: 'יחס מתוך ייצוגים חזותיים', chapter: CHAPTERS.foundations, component: () => <RatioPage07 /> },
  { id: 8, title: 'יחסים שווים ומספר חסר', chapter: CHAPTERS.foundations, component: () => <Ch1Page8 /> },

  { id: 9, title: 'חלוקת כמות לשני חלקים', chapter: CHAPTERS.division, component: () => <Ch2Page1 /> },
  { id: 10, title: 'חלוקה לשלושה חלקים', chapter: CHAPTERS.division, component: () => <Ch2Page2 /> },
  { id: 11, title: 'חלוקה לפי מחיר, תלמידים וגרף', chapter: CHAPTERS.division, component: () => <RatioPage11 /> },
  { id: 12, title: 'חלוקת רווחים, זוויות ושטחים', chapter: CHAPTERS.division, component: () => <Ch2Page4 /> },
  { id: 13, title: 'חלוקה גאומטרית ושינוי הרכב', chapter: CHAPTERS.division, component: () => <RatioPage13 /> },
  { id: 14, title: 'מעבר משבר ליחס', chapter: CHAPTERS.division, component: () => <Ch2Page6 /> },
  { id: 15, title: 'חלוקה, זוויות ושטחים', chapter: CHAPTERS.division, component: () => <Ch2Page7 /> },
  { id: 16, title: 'יישומים מורחבים של חלוקה', chapter: CHAPTERS.division, component: () => <RatioPage16 /> },
  { id: 17, title: 'חלוקת השקעות וביטויים אלגבריים', chapter: CHAPTERS.division, component: () => <Ch2Page9 /> },

  { id: 18, title: 'כתיבת יחס מתוך דגמים ונתונים', chapter: CHAPTERS.representation, component: () => <RatioPage18 /> },
  { id: 19, title: 'צמצום, אחוזים ויחס בגילים', chapter: CHAPTERS.representation, component: () => <RatioPage19 /> },
  { id: 20, title: 'יחסי קטעים, תערובות ומעברים', chapter: CHAPTERS.representation, component: () => <RatioPage20 /> },
  { id: 21, title: 'יחס בקבוצות, בשברים ובאחוזים', chapter: CHAPTERS.representation, component: () => <RatioPage21 /> },
  { id: 22, title: 'יחסי שטחים במלבנים ובמשולשים', chapter: CHAPTERS.representation, component: () => <RatioPage22 /> },
  { id: 23, title: 'יחס במשבצות, בזוויות ובמחרוזות', chapter: CHAPTERS.representation, component: () => <RatioPage23 /> },
  { id: 24, title: 'צמצום יחס ויחסי זוויות', chapter: CHAPTERS.representation, component: () => <Ch3Page7 /> },
  { id: 25, title: 'יחס בסיפורים ובמשולשים', chapter: CHAPTERS.representation, component: () => <Ch3Page8 /> },
  { id: 26, title: 'יחסי שטחים מתוך מבנה', chapter: CHAPTERS.representation, component: () => <RatioPage26 /> },

  { id: 27, title: 'מתי היחס נשמר?', chapter: CHAPTERS.preservation, component: () => <RatioPage27 /> },
  { id: 28, title: 'שינוי יחס במתכון ובתערובת', chapter: CHAPTERS.preservation, component: () => <Ch4Page2 /> },

  { id: 29, title: 'אמצעי צלעות, עוגיות ושטחים', chapter: CHAPTERS.combined, component: () => <RatioPage29 /> },

  { id: 30, title: 'בדיקת פרופורציה ופתרון משוואות', chapter: CHAPTERS.proportion, component: () => <Ch6Page1 /> },
  { id: 31, title: 'יישומי פרופורציה', chapter: CHAPTERS.proportion, component: () => <Ch6Page2 /> },
  { id: 32, title: 'יחס ישר וייצוג אלגברי', chapter: CHAPTERS.proportion, component: () => <Ch6Page3 /> },
  { id: 33, title: 'פתרון חלוקה באמצעות משתנה', chapter: CHAPTERS.division, component: () => <Ch2Page10 /> },
  { id: 34, title: 'שיעור ליחידה ויחידות מידה', chapter: CHAPTERS.preservation, component: () => <Ch4Page3 /> },
  { id: 35, title: 'פרופורציות, משתנים ואומדן', chapter: CHAPTERS.proportion, component: () => <RatioPage35 /> },
  { id: 36, title: 'יישומי יחס במצבים מגוונים', chapter: CHAPTERS.foundations, component: () => <Ch1Page9 /> },
  { id: 37, title: 'חלוקה ביחס — בעיות ויישומים', chapter: CHAPTERS.division, component: () => <Ch2Page11 /> },
  { id: 38, title: 'פרופורציה בחיי היום־יום', chapter: CHAPTERS.proportion, component: () => <Ch6Page5 /> },

  { id: 39, title: 'מיצ״ב תשע״ו — יחס ותרשים', chapter: CHAPTERS.data, component: () => <Ch7Page1 /> },
  { id: 40, title: 'מיצ״ב תשע״ו — היגדים', chapter: CHAPTERS.data, component: () => <Ch7Page2 /> },
  { id: 41, title: 'מיצ״ב תשע״ו — אוכלוסייה', chapter: CHAPTERS.data, component: () => <Ch7Page3 /> },
  { id: 42, title: 'מיצ״ב תשע״ה — יחס ודמיון', chapter: CHAPTERS.data, component: () => <RatioPage42 /> },
  { id: 43, title: 'מיצ״ב תשע״ד — מסילה ודמיון', chapter: CHAPTERS.data, component: () => <Ch7Page5 /> },
  { id: 44, title: 'מיצ״ב תשע״ג — יחס וגילים', chapter: CHAPTERS.data, component: () => <Ch7Page6 /> },
  { id: 45, title: 'מיצ״ב תשע״ג — דיאגרמה', chapter: CHAPTERS.data, component: () => <Ch7Page7 /> },
  { id: 46, title: 'מיצ״ב תשע״ב — מתכון', chapter: CHAPTERS.data, component: () => <Ch7Page8 /> },
  { id: 47, title: 'מיצ״ב תשע״א — אלגברה וטבלה', chapter: CHAPTERS.data, component: () => <Ch7Page9 /> },
  { id: 48, title: 'מיצ״ב — גאומטריה ויחסים', chapter: CHAPTERS.data, component: () => <RatioPage48 /> },
];
