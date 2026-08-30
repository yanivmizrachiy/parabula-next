import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const metadata = JSON.parse(fs.readFileSync(path.join(root, 'meta/topics.json'), 'utf8'));

const AXES_FIRST = 'g7.num.directed.axesFirst';
const AXES_ALL = 'g7.num.directed.axesAll';

const SKILLS = [
  { id: 'plot-read', level: 'core-g7', label: 'קריאה וסימון נקודות', terms: ['שיעורי הנקודה', 'שיעורי נקודות', 'סמנו את הנקודות', 'סמנו נקודות', 'מסמנים נקודות', 'קוראים שיעורי'] },
  { id: 'quadrants-signs', level: 'core-g7', label: 'ארבעת הרביעים וסימנים', terms: ['ארבעת הרביעים', 'כל הרביעים', 'רביע שני', 'רביע שלישי', 'רביע רביעי', 'באיזה רביע'] },
  { id: 'axes-points', level: 'core-g7', label: 'נקודות על הצירים', terms: ['נקודות על הצירים', 'נקודה על ציר', 'נמצאת על ציר', 'חותך את ציר'] },
  { id: 'missing-coordinate', level: 'core-g7', label: 'שיעור חסר והסקה', terms: ['שיעור חסר', 'השלימו את שיעורי', 'השלימו שיעורים', 'מצאו את שיעורי'] },
  { id: 'translation-reflection', level: 'core-g7', label: 'הזזה ושיקוף', terms: ['הזיזו', 'הזזה', 'שיקוף', 'השתקפות', 'תמונת'] },
  { id: 'axis-distance', level: 'core-g7', label: 'מרחקים מקבילים לצירים', terms: ['מרחק בין', 'אורך הקטע', 'אורכי הקטעים'] },
  { id: 'rectangles-squares', level: 'core-g7', label: 'מלבנים וריבועים', terms: ['מלבן', 'ריבוע'] },
  { id: 'area-perimeter', level: 'core-g7', label: 'שטח והיקף', terms: ['שטח', 'היקף'] },
  { id: 'triangles-polygons', level: 'extension-g7-g8', label: 'משולשים ומרובעים', terms: ['משולש', 'מרובע', 'מקבילית', 'דלתון', 'טרפז'] },
  { id: 'midpoint-symmetry', level: 'extension-g8', label: 'אמצע קטע וסימטריה', terms: ['אמצע הקטע', 'אמצע הצלע', 'סימטר'] },
  { id: 'linear-functions', level: 'extension-g8', label: 'פונקציה קווית וחיתוכי צירים', terms: ['משוואת הישר', 'פונקציה קווית', 'שיפוע', 'נקודת החיתוך'] },
  { id: 'proof-similarity', level: 'extension-g8-g9', label: 'הוכחה, חפיפה ודמיון', terms: ['הוכיחו', 'חופף', 'חפיפה', 'דומים', 'דמיון'] },
];

function decodeText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&minus;|&#8722;/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function mainText(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  return decodeText(main);
}

const pageMeta = new Map();
for (const topic of metadata.topics ?? []) {
  for (const page of topic.pages ?? []) {
    const existing = pageMeta.get(page.number) ?? { curriculumIds: new Set(), topics: new Set(), h1: page.h1 ?? '', title: page.title ?? '' };
    if (page.curriculumId) existing.curriculumIds.add(page.curriculumId);
    for (const id of page.relatedCurriculumIds ?? []) existing.curriculumIds.add(id);
    if (page.topic) existing.topics.add(page.topic);
    if (!existing.h1 && page.h1) existing.h1 = page.h1;
    if (!existing.title && page.title) existing.title = page.title;
    pageMeta.set(page.number, existing);
  }
}

const htmlFiles = fs.readdirSync(root)
  .filter(name => /^עמוד-\d+\.html$/.test(name))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

const rows = htmlFiles.map(file => {
  const page = Number(file.match(/\d+/)[0]);
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const text = mainText(html);
  const meta = pageMeta.get(page) ?? { curriculumIds: new Set(), topics: new Set(), h1: '', title: '' };
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || meta.h1 || '').replace(/<[^>]+>/g, '').trim();
  const curriculumIds = [...meta.curriculumIds];
  const canonicalCoordinate = curriculumIds.includes(AXES_FIRST) || curriculumIds.includes(AXES_ALL);
  const coordinateLanguage = /מערכת\s+(?:ה)?צירים|קואורדינט|רביע(?:ים|\s+(?:ראשון|שני|שלישי|רביעי))/.test(`${h1} ${meta.title} ${text}`);
  const coordinateGraphic = /class=["'][^"']*coordinate-grid/.test(html);
  const negativeOrderedPair = /\(\s*-\s*\d+(?:\.\d+)?\s*[,،]|[,،]\s*-\s*\d+(?:\.\d+)?\s*\)/.test(text);
  const explicitNonFirstQuadrant = /ארבעת הרביעים|כל הרביעים|רביע שני|רביע שלישי|רביע רביעי/.test(text);
  const allQuadrantsEvidence = curriculumIds.includes(AXES_ALL) || negativeOrderedPair || explicitNonFirstQuadrant;
  const relatedCoordinate = canonicalCoordinate || (coordinateGraphic && coordinateLanguage) || (coordinateLanguage && allQuadrantsEvidence);
  const matchedSkills = SKILLS.filter(skill => skill.terms.some(term => text.includes(term))).map(skill => skill.id);
  return { file, page, h1, curriculumIds, canonicalCoordinate, allQuadrantsEvidence, relatedCoordinate, matchedSkills };
});

const canonicalRows = rows.filter(row => row.canonicalCoordinate);
const fourQuadrantRows = rows.filter(row => row.relatedCoordinate && row.allQuadrantsEvidence);
const relatedRows = rows.filter(row => row.relatedCoordinate);

function makeCoverage(sourceRows) {
  return SKILLS.map(skill => {
    const pages = sourceRows.filter(row => row.matchedSkills.includes(skill.id)).map(row => row.page);
    return { id: skill.id, label: skill.label, level: skill.level, count: pages.length, pages };
  });
}

const fourQuadrantCoverage = makeCoverage(fourQuadrantRows);
const coreGaps = fourQuadrantCoverage.filter(item => item.level === 'core-g7' && item.count === 0).map(item => item.id);
const report = {
  scannedHtmlPages: htmlFiles.length,
  metadataTotalPages: metadata.totalPages ?? null,
  canonicalCoordinatePages: canonicalRows.length,
  relatedCoordinatePages: relatedRows.length,
  fourQuadrantEvidencePages: fourQuadrantRows.length,
  coreGaps,
  fourQuadrantCoverage,
  canonicalCandidates: canonicalRows,
  fourQuadrantCandidates: fourQuadrantRows,
};

console.log(JSON.stringify(report, null, 2));
if (coreGaps.length) process.exitCode = 2;
