/**
 * reader-actions.js — Parabula Next · שכבת פעולות משותפת לספר
 *
 * מקור אמת יחיד לפעולות ההדפסה / שמירה כ-PDF / הורדה / בחירה מרובה,
 * המשמש גם את הקטלוג בנייח (catalog.js) וגם את אפליקציית הנייד (mobile-app.js)
 * — כדי לשמור תפיסה זהה ונאמנות A4 בכל המשטחים (CLAUDE.md §1.1, §10).
 *
 * מנגנון ההדפסה: iframe אחד לכל דף A4 בתוך "במת הדפסה" נסתרת, עם
 * page-break ב-@media print (אותו דפוס מוכח כמו preview/print.js).
 * "שמירה כ-PDF" היא ייצוא אמיתי דרך חלון ההדפסה של הדפדפן — לא כפתור דמה.
 */
'use strict';

(function () {
  const SELECTION_KEY = 'parabula:selection-v2';

  const store = {
    pages: [],              // מערך שטוח של כל הדפים (מ-meta/topics.json)
    pageUrl: (file) => file,
    selection: new Set(),
    selectionListeners: new Set(),
  };

  /* ─── בחירה מרובה ─────────────────────────────── */
  function loadSelection() {
    try {
      const raw = JSON.parse(localStorage.getItem(SELECTION_KEY) || '[]');
      if (Array.isArray(raw)) raw.forEach((f) => store.selection.add(f));
    } catch { /* אחסון לא זמין — לא קריטי */ }
  }

  function saveSelection() {
    try {
      localStorage.setItem(SELECTION_KEY, JSON.stringify([...store.selection]));
    } catch { /* לא קריטי */ }
  }

  function emitSelection() {
    store.selectionListeners.forEach((cb) => {
      try { cb(store.selection); } catch (e) { console.error(e); }
    });
  }

  /* ─── במת הדפסה נסתרת ─────────────────────────── */
  function ensureStage() {
    let stage = document.getElementById('paraPrintStage');
    if (!stage) {
      stage = document.createElement('div');
      stage.id = 'paraPrintStage';
      stage.className = 'para-print-stage';
      stage.setAttribute('aria-hidden', 'true');
      document.body.appendChild(stage);
    }
    return stage;
  }

  function waitForFrame(iframe) {
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        // נותנים ל-MathJax ולגופנים זמן להתייצב בתוך ה-iframe
        try {
          const win = iframe.contentWindow;
          const settle = () => setTimeout(resolve, 260);
          const mj = win && win.MathJax && win.MathJax.startup && win.MathJax.startup.promise;
          const fonts = win && win.document && win.document.fonts && win.document.fonts.ready;
          Promise.race([
            Promise.all([mj || Promise.resolve(), fonts || Promise.resolve()]),
            new Promise((r) => setTimeout(r, 2500)),
          ]).then(settle).catch(settle);
        } catch {
          setTimeout(resolve, 400);
        }
      };
      iframe.addEventListener('load', finish, { once: true });
      // רשת ביטחון אם load כבר קרה / נתקע
      setTimeout(finish, 4000);
    });
  }

  /**
   * פותח את חלון ההדפסה של הדפדפן עבור רשימת קבצים (עמוד אחד או יותר).
   * משם המשתמש בוחר מדפסת אמיתית או "שמירה כ-PDF".
   */
  async function printFiles(files, options = {}) {
    const list = (files || []).filter(Boolean);
    if (!list.length) return;

    const overlay = showBusy(options.busyText || 'מכין להדפסה…');
    const stage = ensureStage();
    stage.innerHTML = '';

    const frames = list.map((file) => {
      const sheet = document.createElement('div');
      sheet.className = 'para-sheet';
      const iframe = document.createElement('iframe');
      iframe.setAttribute('title', file);
      iframe.setAttribute('loading', 'eager');
      iframe.src = store.pageUrl(file);
      sheet.appendChild(iframe);
      stage.appendChild(sheet);
      return iframe;
    });

    try {
      await Promise.all(frames.map(waitForFrame));
    } catch (e) {
      console.error('print prepare failed', e);
    }

    hideBusy(overlay);

    const cleanup = () => {
      document.body.classList.remove('para-printing');
      stage.innerHTML = '';
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);

    document.body.classList.add('para-printing');
    // רגע קטן לצביעה לפני קריאת ההדפסה
    setTimeout(() => {
      try { window.focus(); window.print(); }
      catch (e) { console.error(e); cleanup(); }
      // fallback לניקוי אם afterprint לא נורה
      setTimeout(() => { if (document.body.classList.contains('para-printing')) cleanup(); }, 60000);
    }, 120);
  }

  /* ─── מחוון "מכין…" ────────────────────────────── */
  function showBusy(text) {
    let overlay = document.getElementById('paraBusyOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'paraBusyOverlay';
      overlay.className = 'para-busy-overlay';
      overlay.innerHTML = '<div class="para-busy-box"><div class="para-busy-spin" aria-hidden="true"></div><span></span></div>';
      document.body.appendChild(overlay);
    }
    overlay.querySelector('span').textContent = text;
    overlay.classList.add('is-visible');
    return overlay;
  }

  function hideBusy(overlay) {
    (overlay || document.getElementById('paraBusyOverlay'))?.classList.remove('is-visible');
  }

  /* ─── הורדת HTML של עמוד בודד ─────────────────── */
  async function downloadHtml(file) {
    const url = store.pageUrl(file);
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = file;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
    } catch (err) {
      console.error('download failed', err);
      window.open(url, '_blank', 'noopener');
    }
  }

  function openTab(file) {
    window.open(store.pageUrl(file), '_blank', 'noopener,noreferrer');
  }

  /* ─── API ציבורי ─────────────────────────────── */
  window.ParabulaActions = {
    configure({ pages, pageUrl }) {
      if (Array.isArray(pages)) store.pages = pages;
      if (typeof pageUrl === 'function') store.pageUrl = pageUrl;
      loadSelection();
      // מסננים בחירות ישנות שכבר לא קיימות בקטלוג
      const valid = new Set(store.pages.map((p) => p.file));
      [...store.selection].forEach((f) => { if (!valid.has(f)) store.selection.delete(f); });
      emitSelection();
    },

    // הדפסה / שמירה כ-PDF
    printPage(file, opts) { return printFiles([file], opts); },
    printFiles,
    printTopic(topicName) {
      const files = store.pages.filter((p) => p.topic === topicName).map((p) => p.file);
      return printFiles(files, { busyText: `מכין ${files.length} דפים בפרק "${topicName}"…` });
    },
    printSelection() {
      const files = store.pages.filter((p) => store.selection.has(p.file)).map((p) => p.file);
      return printFiles(files, { busyText: `מכין ${files.length} דפים נבחרים…` });
    },
    printAll() {
      const files = store.pages.map((p) => p.file);
      return printFiles(files, { busyText: `מכין את כל ${files.length} דפי הספר…` });
    },

    // הורדה / פתיחה
    downloadHtml,
    openTab,

    // בחירה מרובה
    selection: store.selection,
    isSelected: (file) => store.selection.has(file),
    selectionCount: () => store.selection.size,
    selectionFiles: () => [...store.selection],
    toggleSelect(file) {
      if (store.selection.has(file)) store.selection.delete(file);
      else store.selection.add(file);
      saveSelection();
      emitSelection();
    },
    setSelected(file, on) {
      if (on) store.selection.add(file); else store.selection.delete(file);
      saveSelection();
      emitSelection();
    },
    selectTopic(topicName) {
      store.pages.filter((p) => p.topic === topicName).forEach((p) => store.selection.add(p.file));
      saveSelection();
      emitSelection();
    },
    clearSelection() {
      store.selection.clear();
      saveSelection();
      emitSelection();
    },
    onSelectionChange(cb) {
      store.selectionListeners.add(cb);
      return () => store.selectionListeners.delete(cb);
    },
  };
})();
