'use strict';
/*
 * grade-book.js — שיפור מתקדם (progressive enhancement) לעמוד השער.
 * העמוד עובד במלואו גם בלי הקובץ הזה; הוא רק מזרז את פתיחת הקורא.
 * ללא תלות בספרייה חיצונית (CLAUDE.md §5.2).
 */
(() => {
  const prefetched = new Set();

  function prefetch(url) {
    if (!url || prefetched.has(url)) return;
    prefetched.add(url);
    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    } catch { /* prefetch אופציונלי — כשל לא משפיע על העמוד */ }
  }

  // חימום עצל של מעטפת הקורא כשמצב הרשת פנוי
  const warmReader = () => {
    prefetch('./catalog.html');
    prefetch('./meta/topics.json');
  };
  if ('requestIdleCallback' in window) requestIdleCallback(warmReader, { timeout: 2500 });
  else setTimeout(warmReader, 1200);

  // חימום היעד הספציפי במגע/ריחוף — פתיחה מיידית בלחיצה
  const onIntent = (event) => {
    const a = event.target.closest && event.target.closest('a[href*="catalog.html?file="]');
    if (a) prefetch(a.getAttribute('href'));
  };
  document.addEventListener('pointerover', onIntent, { passive: true });
  document.addEventListener('touchstart', onIntent, { passive: true });
})();
