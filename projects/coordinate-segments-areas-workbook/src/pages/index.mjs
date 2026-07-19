// רצף העמודים של החוברת. סדר היחידות קובע את מספור העמודים.
import unit01 from './unit-01.mjs';
import unit02 from './unit-02.mjs';
import unit03 from './unit-03.mjs';
import unit03Enrichment from './unit-03-enrichment.mjs';
import page36 from './unit-03-page36.mjs';

const enrichedUnit03 = unit03.map(page => ({
  ...page,
  // בעמוד 35 נשאר רק בלוק ההעמקה הראשון; הבלוק השני עבר לעמוד 36 מלא.
  blocks: [
    ...page.blocks,
    ...((unit03Enrichment[page.n] ?? []).slice(0, page.n === 35 ? 1 : undefined))
  ]
}));

export default [...unit01, ...unit02, ...enrichedUnit03, page36];
