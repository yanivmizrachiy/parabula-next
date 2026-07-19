// רצף העמודים של החוברת. סדר היחידות קובע את מספור העמודים.
import unit01 from './unit-01.mjs';
import unit02 from './unit-02.mjs';
import unit03 from './unit-03.mjs';
import unit03Enrichment from './unit-03-enrichment.mjs';
import page36 from './unit-03-page36.mjs';
import pages37to38 from './unit-03-pages37-38.mjs';
import { page37Balance, page38Balance } from './unit-03-balance.mjs';
import advancedTrianglePages from './unit-03-advanced.mjs';
import advancedTriangleEnrichment from './unit-03-advanced-enrichment.mjs';
import page46 from './unit-03-assessment.mjs';

const enrichmentLimits = new Map([[33, 1], [34, 1], [35, 1]]);
const enrichedUnit03 = unit03.map(page => {
  const extra = unit03Enrichment[page.n] ?? [];
  const limit = enrichmentLimits.get(page.n);
  return {
    ...page,
    blocks: [...page.blocks, ...(limit ? extra.slice(0, limit) : extra)]
  };
});

const balancedPage36 = { ...page36, blocks: page36.blocks.slice(0, 3) };
const [rawPage37, rawPage38] = pages37to38;
const balancedPages37to38 = [
  { ...rawPage37, blocks: [...rawPage37.blocks, page37Balance] },
  { ...rawPage38, blocks: [...rawPage38.blocks.slice(0, -1), page38Balance] }
];

const advancedEnrichmentLimits = new Map([[40, 1], [44, 1]]);
const enrichedAdvancedTrianglePages = advancedTrianglePages.map(page => {
  const extra = advancedTriangleEnrichment[page.n] ?? [];
  const limit = advancedEnrichmentLimits.get(page.n);
  return {
    ...page,
    blocks: [...page.blocks, ...(limit ? extra.slice(0, limit) : extra)]
  };
});

export default [
  ...unit01,
  ...unit02,
  ...enrichedUnit03,
  balancedPage36,
  ...balancedPages37to38,
  ...enrichedAdvancedTrianglePages,
  page46
];
