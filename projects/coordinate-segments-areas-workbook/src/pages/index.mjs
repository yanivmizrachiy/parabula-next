// רצף העמודים של החוברת. סדר היחידות קובע את מספור העמודים.
import unit01 from './unit-01.mjs';
import unit02 from './unit-02.mjs';
import unit03 from './unit-03.mjs';
import unit03Enrichment from './unit-03-enrichment.mjs';

const enrichedUnit03 = unit03.map(page => ({
  ...page,
  blocks: [...page.blocks, ...(unit03Enrichment[page.n] ?? [])]
}));

export default [...unit01, ...unit02, ...enrichedUnit03];
