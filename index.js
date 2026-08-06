(() => {
  const MOBILE_URL = './mobile-app.html?v=__MOBILE_VERSION__';
  const CATALOG_URL = './catalog.html';
  const LEGACY_PREF_KEY = 'parabula-entry-pref';

  const params = new URLSearchParams(window.location.search);
  const requestedView = params.get('view');

  const mediaMatches = (query) => {
    try {
      return window.matchMedia(query).matches;
    } catch {
      return false;
    }
  };

  const viewportWidth = Math.max(
    Number(document.documentElement?.clientWidth || 0),
    Number(window.innerWidth || 0)
  );
  const userAgent = navigator.userAgent || '';
  const touchPoints = Number(navigator.maxTouchPoints || 0);
  const hasCoarsePointer = mediaMatches('(pointer: coarse)');
  const hasCompactViewport = mediaMatches('(max-width: 820px)');
  const isPortrait = mediaMatches('(orientation: portrait)');
  const browserReportsMobile = navigator.userAgentData?.mobile === true;
  const phoneUserAgent = /iPhone|iPod|Windows Phone|Android.+Mobile|Mobile.+Android/i.test(userAgent);

  // טלפון או חלון צר מקבלים את קורא המובייל. מחשב וטאבלט רחב מקבלים את הקטלוג המלא.
  const touchPortraitDevice = hasCoarsePointer && touchPoints > 0 && isPortrait && viewportWidth <= 1024;
  const detectedView = browserReportsMobile || phoneUserAgent || hasCompactViewport || touchPortraitDevice
    ? 'mobile'
    : 'catalog';

  // קישור מפורש מאפשר עקיפה נקודתית, אך ברירת המחדל תמיד מזוהה מחדש אוטומטית.
  const targetView = requestedView === 'mobile' || requestedView === 'catalog'
    ? requestedView
    : detectedView;

  // מבטלים העדפה ישנה כדי שמכשיר לא ייתקע בעתיד בתצוגה לא מתאימה.
  try {
    localStorage.removeItem(LEGACY_PREF_KEY);
  } catch {
    // מצב פרטי או אחסון חסום — אין צורך לעשות דבר.
  }

  const targetUrl = targetView === 'mobile' ? MOBILE_URL : CATALOG_URL;
  window.location.replace(targetUrl + window.location.hash);
})();
