(() => {
  const pages = [634,635,636,637,638,639,640,641,651,642,652,643,644,645,646,647,653,648,649,650,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,41];
  const root = document.getElementById('reader-pages');
  const progress = document.getElementById('reader-progress');
  const select = document.getElementById('reader-page-select');
  const BASE_WIDTH = 794;
  const BASE_HEIGHT = 1123;

  const resizeFrame = (section) => {
    const shell = section.querySelector('.reader-frame-shell');
    const frame = section.querySelector('.reader-frame');
    if (!shell || !frame) return;
    const scale = Math.min(1, section.clientWidth / BASE_WIDTH);
    shell.style.height = `${Math.round(BASE_HEIGHT * scale)}px`;
    frame.style.transform = `scale(${scale})`;
  };

  const prepareFrameDocument = (frame) => {
    try {
      const doc = frame.contentDocument;
      if (!doc) return;
      const nav = doc.querySelector('.preview-nav');
      if (nav) nav.style.display = 'none';
      doc.documentElement.style.background = 'transparent';
      doc.body.style.margin = '0';
      doc.body.style.overflow = 'hidden';
      doc.body.style.background = 'transparent';
      const page = doc.querySelector('.a4-page');
      if (page) page.style.margin = '0 auto';
    } catch (_) {
      // Same-origin reader normally reaches the page document; visual fallback still works if it cannot.
    }
  };

  pages.forEach((globalPage, index) => {
    const localPage = index + 1;
    const option = document.createElement('option');
    option.value = String(localPage);
    option.textContent = `עמוד ${localPage}`;
    select.appendChild(option);

    const section = document.createElement('section');
    section.className = 'reader-page';
    section.id = `page-${localPage}`;
    section.dataset.localPage = String(localPage);
    section.dataset.src = `עמוד-${globalPage}.html`;
    section.innerHTML = `<div class="reader-page-label">עמוד ${localPage} / ${pages.length}</div><div class="reader-frame-shell"><div class="reader-placeholder">טוען עמוד ${localPage}…</div></div>`;
    root.appendChild(section);
  });

  const loadPage = (section) => {
    if (section.dataset.loaded === 'true') return;
    section.dataset.loaded = 'true';
    const shell = section.querySelector('.reader-frame-shell');
    const frame = document.createElement('iframe');
    frame.className = 'reader-frame';
    frame.title = `משפט פיתגורס — עמוד ${section.dataset.localPage}`;
    frame.loading = 'lazy';
    frame.scrolling = 'no';
    frame.src = section.dataset.src;
    frame.addEventListener('load', () => {
      prepareFrameDocument(frame);
      shell.querySelector('.reader-placeholder')?.remove();
      resizeFrame(section);
    });
    shell.appendChild(frame);
    resizeFrame(section);
  };

  const preloadObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) loadPage(entry.target);
    }
  }, { rootMargin: '1800px 0px', threshold: 0.01 });

  const positionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const localPage = Number(visible.target.dataset.localPage);
    progress.textContent = `עמוד ${localPage} / ${pages.length}`;
    select.value = String(localPage);
  }, { rootMargin: '-18% 0px -48% 0px', threshold: [0.1, 0.35, 0.6] });

  document.querySelectorAll('.reader-page').forEach((section) => {
    preloadObserver.observe(section);
    positionObserver.observe(section);
  });

  select.addEventListener('change', () => {
    const section = document.getElementById(`page-${select.value}`);
    if (!section) return;
    loadPage(section);
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.querySelectorAll('.reader-page[data-loaded="true"]').forEach(resizeFrame);
    }, 80);
  }, { passive: true });

  loadPage(document.getElementById('page-1'));
  loadPage(document.getElementById('page-2'));
})();
