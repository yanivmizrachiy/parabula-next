'use strict';

(() => {
  const FILE_PATTERN = /^עמוד-\d+\.html$/;
  const NAVIGATION_SELECTOR = '#navPrev,#navNext,#footPrev,#footNext,.toc-page,.search-item';
  const tocList = document.getElementById('tocList');
  if (!tocList) return;

  const requestedFile = normalizeFile(new URL(window.location.href).searchParams.get('file'));
  let initialHandled = !requestedFile;
  let pendingHistoryMode = 'replace';
  let restoringHistory = false;
  let initialAttempts = 0;

  function normalizeFile(value) {
    return FILE_PATTERN.test(String(value || '')) ? String(value) : '';
  }

  function activeFile() {
    return normalizeFile(tocList.querySelector('.toc-page.is-active')?.dataset.file);
  }

  function syncUrl(file, mode = 'replace') {
    const normalized = normalizeFile(file);
    if (!normalized) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('file') === normalized) return;
    url.searchParams.set('file', normalized);
    const method = mode === 'push' ? 'pushState' : 'replaceState';
    history[method]({ parabulaCatalogFile: normalized }, '', url);
  }

  function findPageButton(file) {
    const normalized = normalizeFile(file);
    if (!normalized) return null;
    return [...tocList.querySelectorAll('.toc-page')]
      .find((button) => button.dataset.file === normalized) || null;
  }

  function openFile(file, { historyMode = 'replace' } = {}) {
    const target = findPageButton(file);
    if (!target) return false;
    restoringHistory = historyMode === 'replace';
    pendingHistoryMode = historyMode;
    target.click();
    queueMicrotask(() => {
      syncUrl(file, historyMode);
      restoringHistory = false;
    });
    return true;
  }

  function openInitialFile() {
    if (initialHandled) return;
    if (openFile(requestedFile, { historyMode: 'replace' })) {
      initialHandled = true;
      return;
    }
    initialAttempts += 1;
    if (initialAttempts < 240) requestAnimationFrame(openInitialFile);
  }

  function restoreFromLocation() {
    const file = normalizeFile(new URL(window.location.href).searchParams.get('file'));
    if (!file) return;
    let attempts = 0;
    const tryOpen = () => {
      if (openFile(file, { historyMode: 'replace' })) return;
      attempts += 1;
      if (attempts < 120) requestAnimationFrame(tryOpen);
    };
    tryOpen();
  }

  document.addEventListener('click', (event) => {
    if (restoringHistory || !(event.target instanceof Element)) return;
    if (event.target.closest(NAVIGATION_SELECTOR)) pendingHistoryMode = 'push';
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target instanceof Element && event.target.matches('input,textarea,select,[contenteditable="true"]')) return;
    if (['ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown'].includes(event.key)) pendingHistoryMode = 'push';
  }, true);

  const observer = new MutationObserver(() => {
    const file = activeFile();
    if (!file) return;
    syncUrl(file, initialHandled ? pendingHistoryMode : 'replace');
    pendingHistoryMode = 'replace';
  });
  observer.observe(tocList, { subtree: true, attributes: true, attributeFilter: ['class'] });

  // חוברת עצמאית מתוך פרויקט Parabula Next — כפתור קבוע בכותרת הקטלוג.
  const headerRight = document.querySelector('.header-right');
  if (headerRight && !document.getElementById('algebraZWorkbookLink')) {
    const link = document.createElement('a');
    link.id = 'algebraZWorkbookLink';
    link.className = 'chip-btn';
    link.href = 'algebra-z-workbook.html';
    link.title = 'פתיחת חוברת אלגברה לכיתה ז׳ — דפדוף, PDF והדפסה';
    link.textContent = '📗 אלגברה ז׳ — 15 עמודים';
    const modeSwitch = document.getElementById('modeSwitch');
    headerRight.insertBefore(link, modeSwitch || headerRight.firstChild);
  }

  window.addEventListener('popstate', restoreFromLocation);
  requestAnimationFrame(openInitialFile);
})();
