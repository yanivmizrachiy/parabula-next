import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const SKILLS = [
  { id: 'plot-read', level: 'core-g7', label: 'קריאה וסימון נקודות', terms: ['שיעורי הנקודה', 'סמנו את הנקודות', 'קוראים שיעורי', 'מסמנים נקודות'] },
  { id: 'quadrants-signs', level: 'core-g7', label: 'ארבעת הרביעים וסימנים', terms: ['רביע', 'רביעים', 'שלילי', 'חיובי'] },
  { id: 'axes-points', level: 'core-g7', label: 'נקודות על הצירים', terms: ['על ציר', 'ציר x', 'ציר y', 'נקודות על הצירים'] },
  { id: 'missing-coordinate', level: 'core-g7', label: 'שיעור חסר והסקה', terms: ['שיעור חסר', 'השלימו את שיעורי', 'השלימו שיעורים'] },
  { id: 'translation-reflection', level: 'core-g7', label: 'הזזה ושיקוף', terms: ['הזיזו', 'הזזה', 'שיקוף', 'מראה'] },
  { id: 'axis-distance', level: 'core-g7', label: 'מרחקים מקבילים לצירים', terms: ['מרחק', 'אורך הקטע', 'אורכים'] },
  { id: 'rectangles-squares', level: 'core-g7', label: 'מלבנים וריבועים', terms: ['מלבן', 'ריבוע'] },
  { id: 'area-perimeter', level: 'core-g7', label: 'שטח והיקף', terms: ['שטח', 'היקף'] },
  { id: 'triangles-polygons', level: 'extension-g7-g8', label: 'משולשים ומרובעים', terms: ['משולש', 'מרובע', 'מקבילית', 'דלתון', 'טרפז'] },
  { id: 'midpoint-symmetry', level: 'extension-g8', label: 'אמצע קטע וסימטריה', terms: ['אמצע', 'סימטר'] },
  { id: 'linear-functions', level: 'extension-g8', label: 'פונקציה קווית וחיתוכי צירים', terms: ['משוואת הישר', 'פונקציה', 'שיפוע', 'נקודת החיתוך'] },
  { id: 'proof-similarity', level: 'extension-g8-g9', label: 'הוכחה, חפיפה ודמיון', terms: ['הוכיחו', 'חופף', 'חפיפה', 'דומים', 'דמיון'] },
];

const strip = html => html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ')
  .replace(/\s+/g, ' ');

const htmlFiles = fs.readdirSync(root)
  .filter(name => /^עמוד-\d+\.html$/.test(name))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

const rows = htmlFiles.map(file => {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const text = strip(html);
  const title = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '').replace(/<[^>]+>/g, '').trim();
  const matchedSkills = SKILLS.filter(skill => skill.terms.some(term => text.includes(term))).map(skill => skill.id);
  return { file, page: Number(file.match(/\d+/)[0]), title, matchedSkills };
});

const coordinateRows = rows.filter(row => row.matchedSkills.length >= 2 || /ציר|קואורד|רביע/.test(row.title));
const coverage = SKILLS.map(skill => {
  const pages = coordinateRows.filter(row => row.matchedSkills.includes(skill.id)).map(row => row.page);
  return { id: skill.id, label: skill.label, level: skill.level, count: pages.length, pages };
});

const report = {
  scannedHtmlPages: htmlFiles.length,
  coordinateCandidatePages: coordinateRows.length,
  skills: coverage,
  candidates: coordinateRows,
};

console.log(JSON.stringify(report, null, 2));

if (coverage.some(item => item.count === 0 && item.level === 'core-g7')) {
  process.exitCode = 2;
}
