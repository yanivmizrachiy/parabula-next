// Define areas to mask (cover with white) on each page
// and bullet overlay positions for question starts
// Coordinates are percentages of the page dimensions

export interface MaskArea {
  top: number;    // % from top
  left: number;   // % from left
  width: number;  // % width
  height: number; // % height
}

export interface BulletOverlay {
  top: number;    // % from top
  right: number;  // % from right edge
}

export interface PageOverlay {
  masks: MaskArea[];
  bullets: BulletOverlay[];
}

export interface PageOverlays {
  [pageId: number]: PageOverlay;
}

// Helper: create a standard mask for question number at top-right of a section
const qMask = (top: number): MaskArea => ({
  top,
  left: 78,
  width: 21,
  height: 5.5,
});

// Helper: create a bullet overlay aligned with a mask
const qBullet = (top: number): BulletOverlay => ({
  top: top + 1.2,
  right: 4.5,
});

// Helper: create mask + bullet pair for a question at a given vertical position
const questionOverlay = (top: number) => ({
  mask: qMask(top),
  bullet: qBullet(top),
});

// Build page overlays from question positions
function buildOverlay(...tops: number[]): PageOverlay {
  const overlays = tops.map(questionOverlay);
  return {
    masks: overlays.map(o => o.mask),
    bullets: overlays.map(o => o.bullet),
  };
}

// Empty overlay for non-content pages
const EMPTY: PageOverlay = { masks: [], bullets: [] };

// Per-page overlay positions based on actual image analysis
export const PAGE_OVERLAYS: PageOverlays = {
  // Page 1: Cover page
  1: EMPTY,

  // Page 2 - Question 1 (Chapter intro - label near bottom)
  2: buildOverlay(65),

  // Page 3 - Question 2 (label near bottom of page)
  3: buildOverlay(88),

  // Page 4 - Question 3 (label near bottom of page)
  4: buildOverlay(88),

  // Page 5 - Questions 4-5
  5: buildOverlay(7, 44),

  // Page 6 - Questions 6-7
  6: buildOverlay(3, 62),

  // Page 7 - Questions 8-10
  7: buildOverlay(7, 34, 64),

  // Page 8 - Questions 11-13
  8: buildOverlay(19, 39, 63),

  // Page 9 - Questions 14-16
  9: buildOverlay(7, 34, 64),

  // Page 10 - Questions 17-19
  10: buildOverlay(15, 45, 73),

  // Page 11 - Questions 20-22
  11: buildOverlay(7, 34, 64),

  // Page 12 - Questions 1-3 (Chapter 2 - has chapter banner at bottom)
  12: buildOverlay(8, 38, 72),

  // Page 13 - Questions 4-6
  13: buildOverlay(7, 34, 64),

  // Page 14 - Questions 7-9
  14: buildOverlay(18, 45, 72),

  // Page 15 - Questions 10-12
  15: buildOverlay(7, 34, 64),

  // Page 16 - Questions 13-14
  16: buildOverlay(7, 49),

  // Page 17 - Questions 15-16
  17: buildOverlay(7, 49),

  // Page 18 - Questions 17-19
  18: buildOverlay(7, 34, 64),

  // Page 19 - Questions 1-2 (Chapter 3 - has chapter banner at bottom)
  19: buildOverlay(44, 82),

  // Page 20 - Question 3
  20: buildOverlay(2),

  // Page 21 - Questions 4-6
  21: buildOverlay(7, 34, 64),

  // Page 22 - Questions 7-9
  22: buildOverlay(7, 34, 64),

  // Page 23 - Questions 10-11
  23: buildOverlay(7, 49),

  // Page 24 - Question 12
  24: buildOverlay(7),

  // Page 25 - Question 13
  25: buildOverlay(7),

  // Page 26 - Questions 14-15
  26: buildOverlay(7, 49),

  // Page 27 - Question 16
  27: buildOverlay(7),

  // Page 28 - Questions 17-19
  28: buildOverlay(7, 34, 64),

  // Page 29 - Questions 20-22
  29: buildOverlay(7, 34, 64),

  // Page 30 - Questions 23-24
  30: buildOverlay(7, 49),

  // Page 31 - Questions 25-27
  31: buildOverlay(7, 34, 64),

  // Page 32 - Empty page
  32: EMPTY,

  // Page 33 - Question 1 (Chapter 4 - has chapter banner at bottom)
  33: buildOverlay(52),

  // Page 34 - Questions 2-4
  34: buildOverlay(7, 34, 64),

  // Page 35 - Questions 5-7
  35: buildOverlay(7, 34, 64),

  // Page 36 - Questions 8-10
  36: buildOverlay(7, 34, 64),

  // Page 37 - Challenge Questions 1-2 (Chapter 5)
  37: buildOverlay(7, 49),

  // Page 38 - Challenge Questions 3-4
  38: buildOverlay(7, 49),

  // Page 39 - End page
  39: EMPTY,
};

// Legacy export for backwards compatibility
export type PageMasks = { [pageId: number]: MaskArea[] };
export const PAGE_MASKS: PageMasks = Object.fromEntries(
  Object.entries(PAGE_OVERLAYS).map(([key, value]) => [key, value.masks])
);
