const BASE = (() => {
  const url = new URL('.', window.location.href);
  return url.href.endsWith('/') ? url.href : `${url.href}/`;
})();

const PAGE_BASE = (() => {
  const previewRoot = new URL('./', window.location.href);
  return new URL('../', previewRoot).href;
})();

const SITE_BASE = (() => {
  const href = window.location.href;
  const idx = href.indexOf('/preview/');
  return idx >= 0 ? `${href.slice(0, idx + 1)}parabula-next/` : PAGE_BASE;
})();

const els = {
  libraryPanel: document.getElementById('libraryPanel'),
  pagesList: document.getElementById('pagesList'),
  searchBox: document.getElementById('searchBox'),
  topicFilter: document.getElementById('topicFilter'),
  headerMeta: document.getElementById('headerMeta'),
  currentTitle: document.getElementById('currentTitle'),
  currentMeta: document.getElementById('currentMeta'),
  pageFrame: document.getElementById('pageFrame'),
  prevBtn: document.getElementById('prevBtn'),
  nextBtn: document.getElementById('nextBtn'),
  toggleLibraryBtn: document.getElementById('toggleLibraryBtn'),
  closeLibraryBtn: document.getElementById('closeLibraryBtn'),
  showLibraryBtn: document.getElementById('showLibraryBtn'),
  bottomLibraryBtn: document.getElementById('bottomLibraryBtn'),
  openPageBtn: document.getElementById('openPageBtn'),
  openSiteBtn: document.getElementById('openSiteBtn'),
  printPageBtn: document.getElementById('printPageBtn'),
  bottomPrintBtn: document.getElementById('bottomPrintBtn')
};

let db = null;
let flatPages = [];
let currentIndex = -1;

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function pageAbsoluteUrl(file) {
  return new URL(file, PAGE_BASE).href;
}

function pageLiveUrl(file) {
  return new URL(file, SITE_BASE).href;
}

function setLibraryOpen(isOpen) {
  els.libraryPanel.classList.toggle('open', isOpen);
  els.toggleLibraryBtn?.setAttribute('aria-expanded', String(isOpen));
}

function syncButtons() {
  const hasCurrent = currentIndex >= 0 && flatPages[currentIndex];
  els.prevBtn.disabled = !hasCurrent || currentIndex <= 0;
  els.nextBtn.disabled = !hasCurrent || currentIndex >= flatPages.length - 1;
  els.openPageBtn.disabled = !hasCurrent;
  els.openSiteBtn.disabled = !hasCurrent;
  els.printPageBtn.disabled = !hasCurrent;
  els.bottomPrintBtn.disabled = !hasCurrent;

  document.querySelectorAll('.page-card').forEach((btn) => {
    btn.classList.toggle('active', hasCurrent && btn.dataset.file === flatPages[currentIndex].file);
  });
}

function updateCurrent(page) {
  const abs = pageAbsoluteUrl(page.file);
  els.pageFrame.src = `${abs}?v=${Date.now()}`;
  els.currentTitle.textContent = page.title;
  els.currentMeta.textContent = `${page.topic} · ${page.file}`;
  els.headerMeta.textContent = `${db.totalPages} דפים · ${db.topics.length} נושאים`;
  localStorage.setItem('parabula:phone:lastFile', page.file);
  syncButtons();
}

function setCurrentFile(file) {
  const idx = flatPages.findIndex((page) => page.file === file);
  if (idx < 0) return;
  currentIndex = idx;
  updateCurrent(flatPages[currentIndex]);
  if (window.innerWidth <= 900) setLibraryOpen(false);
}

function render() {
  if (!db) return;
  const q = normalize(els.searchBox.value);
  const topic = els.topicFilter.value;

  flatPages = db.topics.flatMap((entry) => entry.pages)
    .filter((page) => (topic === '__all__' || page.topic === topic))
    .filter((page) => {
      if (!q) return true;
      const hay = normalize(`${page.title} ${page.topic} ${page.file} ${page.number}`);
      return hay.includes(q);
    })
    .sort((a, b) => a.number - b.number);

  els.pagesList.innerHTML = '';
  flatPages.forEach((page) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'page-card';
    button.dataset.file = page.file;
    button.innerHTML = `
      <span class="page-topic">${page.topic} · עמוד ${page.number}</span>
      <span class="page-title">${page.title}</span>
      <span class="page-file">${page.file}</span>
    `;
    button.addEventListener('click', () => setCurrentFile(page.file));
    els.pagesList.appendChild(button);
  });

  if (!flatPages.length) {
    els.currentTitle.textContent = 'לא נמצאו דפים';
    els.currentMeta.textContent = 'נסה חיפוש אחר או נושא אחר';
    els.pageFrame.src = 'about:blank';
    currentIndex = -1;
    syncButtons();
    return;
  }

  const remembered = localStorage.getItem('parabula:phone:lastFile');
  const stillVisible = remembered && flatPages.some((page) => page.file === remembered);
  if (currentIndex < 0 || !flatPages[currentIndex] || !flatPages.some((page) => page.file === flatPages[currentIndex]?.file)) {
    setCurrentFile(stillVisible ? remembered : flatPages[0].file);
  } else {
    currentIndex = flatPages.findIndex((page) => page.file === flatPages[currentIndex].file);
    updateCurrent(flatPages[currentIndex]);
  }
}

async function boot() {
  const response = await fetch(new URL('../meta/topics.json', BASE));
  db = await response.json();
  els.headerMeta.textContent = `${db.totalPages} דפים · ${db.topics.length} נושאים`;

  db.topics.forEach((topic) => {
    const option = document.createElement('option');
    option.value = topic.name;
    option.textContent = `${topic.name} (${topic.count})`;
    els.topicFilter.appendChild(option);
  });

  render();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(new URL('./sw.js', BASE));
  }
}

function printCurrent() {
  if (currentIndex < 0 || !flatPages[currentIndex]) return;
  window.open(pageAbsoluteUrl(flatPages[currentIndex].file), '_blank', 'noopener,noreferrer');
}

els.searchBox.addEventListener('input', render);
els.topicFilter.addEventListener('change', render);
els.toggleLibraryBtn?.addEventListener('click', () => setLibraryOpen(!els.libraryPanel.classList.contains('open')));
els.closeLibraryBtn?.addEventListener('click', () => setLibraryOpen(false));
els.showLibraryBtn?.addEventListener('click', () => setLibraryOpen(true));
els.bottomLibraryBtn?.addEventListener('click', () => setLibraryOpen(true));
els.prevBtn.addEventListener('click', () => {
  if (currentIndex > 0) setCurrentFile(flatPages[currentIndex - 1].file);
});
els.nextBtn.addEventListener('click', () => {
  if (currentIndex >= 0 && currentIndex < flatPages.length - 1) setCurrentFile(flatPages[currentIndex + 1].file);
});
els.openPageBtn.addEventListener('click', () => {
  if (currentIndex < 0 || !flatPages[currentIndex]) return;
  window.open(pageAbsoluteUrl(flatPages[currentIndex].file), '_blank', 'noopener,noreferrer');
});
els.openSiteBtn.addEventListener('click', () => {
  if (currentIndex < 0 || !flatPages[currentIndex]) return;
  window.open(pageLiveUrl(flatPages[currentIndex].file), '_blank', 'noopener,noreferrer');
});
els.printPageBtn.addEventListener('click', printCurrent);
els.bottomPrintBtn.addEventListener('click', printCurrent);

boot().catch((error) => {
  console.error(error);
  els.currentTitle.textContent = 'שגיאה בטעינת הדפים';
  els.currentMeta.textContent = 'בדוק את meta/topics.json ואת חיבור האתר';
});