// רצף העמודים של החוברת. סדר היחידות קובע את מספור העמודים.
import unit01 from './unit-01.mjs';
import unit02 from './unit-02.mjs';
import unit03 from './unit-03.mjs';
import unit03Enrichment from './unit-03-enrichment.mjs';
import page36 from './unit-03-page36.mjs';
import pages37to38 from './unit-03-pages37-38.mjs';

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

export default [...unit01, ...unit02, ...enrichedUnit03, balancedPage36, ...pages37to38];
