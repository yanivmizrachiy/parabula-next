/**
 * reader-actions.js — Parabula Next · שכבת פעולות משותפת לספר
 * מקור אמת יחיד להדפסה, PDF, הורדה ובחירה מרובה בנייח ובנייד.
 */
'use strict';

(function () {
  const SELECTION_KEY = 'parabula:selection-v2';
  const PRINT_CONCURRENCY = 4;

  const store = {
    pages: [],
    pageUrl: (file) => file,
    selection: new Set(),
    selectionListeners: new Set(),
    printInProgress: false,
  };

  function loadSelection() {
    store.selection.clear();
    try {
      const raw = JSON.parse(localStorage.getItem(SELECTION_KEY) || '[]');
      if (Array.isArray(raw)) raw.forEach((file) => store.selection.add(file));
    } catch { /* אחסון חסום אינו מפיל את הקורא */ }
  }

  function saveSelection() {
    try { localStorage.setItem(SELECTION_KEY, JSON.stringify([...store.selection])); }
    catch { /* לא קריטי */ }
  }

  function selectionSnapshot() {
    return new Set(store.selection);
  }

  function emitSelection() {
    const snapshot = selectionSnapshot();
    store.selectionListeners.forEach((callback) => {
      try { callback(snapshot); } catch (error) { console.error(error); }
    });
  }

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
        try {
          const win = iframe.contentWindow;
          const settle = () => setTimeout(resolve, 220);
          const math = win?.MathJax?.startup?.promise || Promise.resolve();
          const fonts = win?.document?.fonts?.ready || Promise.resolve();
          Promise.race([
            Promise.all([math, fonts]),
            new Promise((doneWaiting) => setTimeout(doneWaiting, 3500)),
          ]).then(settle).catch(settle);
        } catch {
          setTimeout(resolve, 350);
        }
      };
      iframe.addEventListener('load', finish, { once: true });
      iframe.addEventListener('error', finish, { once: true });
      setTimeout(finish, 5000);
    });
  }

  function showBusy(text) {
    let overlay = document.getElementById('paraBusyOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'paraBusyOverlay';
      overlay.className = 'para-busy-overlay';
      overlay.setAttribute('role', 'status');
      overlay.setAttribute('aria-live', 'polite');
      overlay.innerHTML = '<div class="para-busy-box"><div class="para-busy-spin" aria-hidden="true"></div><span></span></div>';
      document.body.appendChild(overlay);
    }
    overlay.querySelector('span').textContent = text;
    overlay.classList.add('is-visible');
    document.body.setAttribute('aria-busy', 'true');
    return overlay;
  }

  function hideBusy(overlay) {
    (overlay || document.getElementById('paraBusyOverlay'))?.classList.remove('is-visible');
    document.body.removeAttribute('aria-busy');
  }

  async function loadFramesInBatches(frames) {
    for (let offset = 0; offset < frames.length; offset += PRINT_CONCURRENCY) {
      const batch = frames.slice(offset, offset + PRINT_CONCURRENCY);
      await Promise.all(batch.map(async ({ iframe, url }) => {
        iframe.src = url;
        await waitForFrame(iframe);
      }));
    }
  }

  async function printFiles(files, options = {}) {
    const validFiles = new Set(store.pages.map((page) => page.file));
    const list = [...new Set((files || []).filter((file) => validFiles.has(file)))];
    if (!list.length || store.printInProgress) return;

    store.printInProgress = true;
    const overlay = showBusy(options.busyText || `מכין ${list.length} דפים להדפסה…`);
    const stage = ensureStage();
    stage.innerHTML = '';

    const frames = list.map((file) => {
      const sheet = document.createElement('div');
      sheet.className = 'para-sheet';
      const iframe = document.createElement('iframe');
      iframe.title = file;
      iframe.loading = 'eager';
      sheet.appendChild(iframe);
      stage.appendChild(sheet);
      return { iframe, url: store.pageUrl(file) };
    });

    try {
      await loadFramesInBatches(frames);
      hideBusy(overlay);

      const cleanup = () => {
        document.body.classList.remove('para-printing');
        stage.innerHTML = '';
        store.printInProgress = false;
        window.removeEventListener('afterprint', cleanup);
      };
      window.addEventListener('afterprint', cleanup);
      document.body.classList.add('para-printing');
      setTimeout(() => {
        try { window.focus(); window.print(); }
        catch (error) { console.error(error); cleanup(); }
        setTimeout(() => {
          if (document.body.classList.contains('para-printing')) cleanup();
        }, 60000);
      }, 150);
    } catch (error) {
      console.error('print prepare failed', error);
      hideBusy(overlay);
      stage.innerHTML = '';
      store.printInProgress = false;
    }
  }

  async function downloadHtml(file) {
    const url = store.pageUrl(file);
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blobUrl = URL.createObjectURL(await response.blob());
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = file;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
    } catch (error) {
      console.error('download failed', error);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  function openTab(file) {
    window.open(store.pageUrl(file), '_blank', 'noopener,noreferrer');
  }

  window.ParabulaActions = {
    configure({ pages, pageUrl }) {
      if (Array.isArray(pages)) store.pages = pages;
      if (typeof pageUrl === 'function') store.pageUrl = pageUrl;
      loadSelection();
      const valid = new Set(store.pages.map((page) => page.file));
      [...store.selection].forEach((file) => { if (!valid.has(file)) store.selection.delete(file); });
      saveSelection();
      emitSelection();
    },

    printPage(file, options) { return printFiles([file], options); },
    printFiles,
    printTopic(topicName) {
      const files = store.pages.filter((page) => page.topic === topicName).map((page) => page.file);
      return printFiles(files, { busyText: `מכין ${files.length} דפים בפרק "${topicName}"…` });
    },
    printSelection() {
      const files = store.pages.filter((page) => store.selection.has(page.file)).map((page) => page.file);
      return printFiles(files, { busyText: `מכין ${files.length} דפים נבחרים…` });
    },
    printAll() {
      return printFiles(store.pages.map((page) => page.file), { busyText: `מכין את כל ${store.pages.length} דפי הספר…` });
    },

    downloadHtml,
    openTab,

    selection: store.selection,
    getSelection: selectionSnapshot,
    isSelected: (file) => store.selection.has(file),
    selectionCount: () => store.selection.size,
    selectionFiles: () => [...store.selection],
    toggleSelect(file) {
      if (store.selection.has(file)) store.selection.delete(file);
      else store.selection.add(file);
      saveSelection();
      emitSelection();
    },
    setSelected(file, selected) {
      if (selected) store.selection.add(file); else store.selection.delete(file);
      saveSelection();
      emitSelection();
    },
    selectTopic(topicName) {
      store.pages.filter((page) => page.topic === topicName).forEach((page) => store.selection.add(page.file));
      saveSelection();
      emitSelection();
    },
    clearSelection() {
      store.selection.clear();
      saveSelection();
      emitSelection();
    },
    onSelectionChange(callback) {
      store.selectionListeners.add(callback);
      try { callback(selectionSnapshot()); } catch (error) { console.error(error); }
      return () => store.selectionListeners.delete(callback);
    },
  };
})();
