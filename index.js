(() => {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');

  const viewportIsCompact = window.matchMedia?.('(max-width: 820px)').matches || false;
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches || false;
  const touchDevice = Number(navigator.maxTouchPoints || 0) > 0;
  const uaMobile = navigator.userAgentData?.mobile === true || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
  const shortScreenSide = Math.min(Number(screen.width || 0), Number(screen.height || 0));
  const phoneLikeTouchDevice = coarsePointer && touchDevice && shortScreenSide > 0 && shortScreenSide <= 1024;
  const isMobile = viewportIsCompact || uaMobile || phoneLikeTouchDevice;

  const target = view === 'mobile'
    ? './mobile-app.html?v=__MOBILE_VERSION__'
    : view === 'catalog'
      ? './catalog.html'
      : isMobile
        ? './mobile-app.html?v=__MOBILE_VERSION__'
        : './catalog.html';

  window.location.replace(target + window.location.hash);
})();
