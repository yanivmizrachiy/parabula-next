(() => {
  const MOBILE_URL = './mobile-app.html?v=__MOBILE_VERSION__';
  const CATALOG_URL = './catalog.html';
  const PREF_KEY = 'parabula-entry-pref';

  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');

  // --- זיהוי מכשיר ---
  const viewportIsCompact = window.matchMedia?.('(max-width: 820px)').matches || false;
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches || false;
  const touchDevice = Number(navigator.maxTouchPoints || 0) > 0;
  const uaMobile = navigator.userAgentData?.mobile === true || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
  const shortScreenSide = Math.min(Number(screen.width || 0), Number(screen.height || 0));
  const phoneLikeTouchDevice = coarsePointer && touchDevice && shortScreenSide > 0 && shortScreenSide <= 1024;
  const isMobile = viewportIsCompact || uaMobile || phoneLikeTouchDevice;
  const recommended = isMobile ? 'mobile' : 'catalog';

  const urlFor = (target) => (target === 'mobile' ? MOBILE_URL : CATALOG_URL);
  const go = (target) => window.location.replace(urlFor(target) + window.location.hash);

  const readPref = () => {
    try { return localStorage.getItem(PREF_KEY); } catch { return null; }
  };
  const savePref = (target) => {
    try { localStorage.setItem(PREF_KEY, target); } catch { /* private mode — ignore */ }
  };

  // מעבר מיידי: בחירה ידנית מפורשת (?view=) או העדפה שמורה ממבקר חוזר.
  if (view === 'mobile' || view === 'catalog') { go(view); return; }
  const saved = readPref();
  if (saved === 'mobile' || saved === 'catalog') { go(saved); return; }

  // מבקר חדש — מציגים דף כניסה: מסמנים את המכשיר המומלץ ושומרים את הבחירה.
  const onReady = () => {
    const cards = document.querySelectorAll('.entry-choice');
    cards.forEach((card) => {
      const target = card.getAttribute('data-target');
      if (target === recommended) {
        card.classList.add('is-recommended');
        const badge = card.querySelector('.entry-choice-badge');
        if (badge) badge.hidden = false;
      }
      card.addEventListener('click', () => savePref(target));
    });
    const note = document.getElementById('entry-note');
    if (note) {
      note.textContent = recommended === 'mobile'
        ? 'זיהינו טלפון — מומלץ "כניסה בטלפון". אפשר לבחור אחרת בכל רגע.'
        : 'זיהינו מחשב — מומלץ "כניסה במחשב". אפשר לבחור אחרת בכל רגע.';
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady, { once: true });
  } else {
    onReady();
  }
})();
