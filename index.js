(() => {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  const isMobile = window.matchMedia?.('(max-width: 820px)').matches || false;
  const target = view === 'mobile'
    ? './mobile-app.html'
    : view === 'catalog'
      ? './catalog.html'
      : isMobile
        ? './mobile-app.html'
        : './catalog.html';
  window.location.replace(target + window.location.hash);
})();
