'use strict';

(() => {
  const FILE_PATTERN = /^עמוד-\d+\.html$/;
  const NAVIGATION_SELECTOR = '#prevPageBtn,#nextPageBtn,.page-open,.topic-btn';
  const pagesRoot = document.getElementById('topicPages');
  if (!pagesRoot) return;

  let pendingHistoryMode = 'replace';
  let restoringHistory = false;
  let lastFile = '';

  function normalizeFile(value) {
    return FILE_PATTERN.test(String(value || '')) ? String(value) : '';
  }

  function activeFile() {
    return normalizeFile(pagesRoot.querySelector('.page-card.active')?.dataset.file);
  }

  function syncUrl(file, mode = 'replace') {
    const normalized = normalizeFile(file);
    if (!normalized || normalized === lastFile) return;
    const url = new URL(window.location.href);
    const current = normalizeFile(url.searchParams.get('file'));
    lastFile = normalized;
    if (current === normalized) return;
    url.searchParams.set('file', normalized);
    const method = mode === 'push' ? 'pushState' : 'replaceState';
    history[method]({ parabulaMobileFile: normalized }, '', url);
  }

  function findOpenButton(file) {
    const normalized = normalizeFile(file);
    if (!normalized) return null;
    return [...pagesRoot.querySelectorAll('.page-card')]
      .find((card) => card.dataset.file === normalized)
      ?.querySelector('.page-open') || null;
  }

  function restoreFromLocation() {
    const file = normalizeFile(new URL(window.location.href).searchParams.get('file'));
    if (!file || file === activeFile()) return;
    restoringHistory = true;
    pendingHistoryMode = 'replace';
    const button = findOpenButton(file);
    if (button) {
      button.click();
      queueMicrotask(() => { restoringHistory = false; });
      return;
    }
    window.location.reload();
  }

  document.addEventListener('click', (event) => {
    if (restoringHistory || !(event.target instanceof Element)) return;
    if (event.target.closest(NAVIGATION_SELECTOR)) pendingHistoryMode = 'push';
  }, true);

  document.addEventListener('keydown', (event) => {
    if (restoringHistory || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target instanceof Element && event.target.matches('input,textarea,select,[contenteditable="true"]')) return;
    if (['ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown'].includes(event.key)) pendingHistoryMode = 'push';
  }, true);

  const observer = new MutationObserver(() => {
    const file = activeFile();
    if (!file) return;
    syncUrl(file, pendingHistoryMode);
    pendingHistoryMode = 'replace';
  });
  observer.observe(pagesRoot, { subtree: true, attributes: true, attributeFilter: ['class'] });

  window.addEventListener('popstate', restoreFromLocation);

  const initialUrlFile = normalizeFile(new URL(window.location.href).searchParams.get('file'));
  if (initialUrlFile) lastFile = initialUrlFile;
})();
