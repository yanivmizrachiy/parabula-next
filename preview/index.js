import {
  appendQueryParams,
  filterPages,
  loadCatalog,
  previewDataCandidates,
  rememberPage,
  rememberedPageFile,
  resolvePageLinks
} from './catalog-shared.js';

const viewer = document.getElementById('viewer');
const topicsList = document.getElementById('topicsList');
const searchBox = document.getElementById('searchBox');
const topicFilter = document.getElementById('topicFilter');
const summaryText = document.getElementById('summaryText');
const currentTitle = document.getElementById('currentTitle');
const currentMeta = document.getElementById('currentMeta');
const openPageBtn = document.getElementById('openPageBtn');
const openSiteHome = document.getElementById('openSiteHome');
const openRealSiteBtn = document.getElementById('openRealSiteBtn');
const reloadCurrentBtn = document.getElementById('reloadCurrentBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let catalog = null;
let visiblePages = [];
let currentIndex = -1;
let reloadTimer = null;

function render() {
  if (!catalog) return;

  visiblePages = filterPages(catalog.flatPages, {
    query: searchBox.value,
    topic: topicFilter.value
  });

  const grouped = catalog.topics
    .map((topic) => ({
      ...topic,
      pages: visiblePages.filter((page) => page.topic === topic.name)
    }))
    .filter((topic) => topic.pages.length > 0);

  topicsList.innerHTML = '';
  summaryText.textContent = `${catalog.totalPages} דפים, ${catalog.topics.length} נושאים, מוצגים כעת ${visiblePages.length} דפים`;

  grouped.forEach((topic) => {
    const section = document.createElement('section');
    section.className = 'topic';

    const header = document.createElement('div');
    header.className = 'topic-header';
    header.innerHTML = `<span>${topic.name}</span><span>${topic.pages.length}</span>`;
    section.appendChild(header);

    const pagesWrap = document.createElement('div');
    pagesWrap.className = 'pages';

    topic.pages.forEach((page) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'page-btn';
      btn.dataset.file = page.file;
      btn.innerHTML = `<div class="page-num">עמוד ${page.number}</div><div>${page.title}</div>`;
      btn.addEventListener('click', () => setCurrentPage(page.file));
      pagesWrap.appendChild(btn);
    });

    section.appendChild(pagesWrap);
    topicsList.appendChild(section);
  });

  if (!visiblePages.length) {
    currentIndex = -1;
    currentTitle.textContent = 'לא נמצאו דפים';
    currentMeta.textContent = 'נסה חיפוש או סינון אחר';
    viewer.src = 'about:blank';
  } else if (!visiblePages[currentIndex]) {
    const remembered = rememberedPageFile();
    const target = remembered && visiblePages.some((page) => page.file === remembered)
      ? remembered
      : visiblePages[0].file;
    setCurrentPage(target);
    return;
  }

  syncActiveButton();
  syncPrevNextState();
}

function syncActiveButton() {
  document.querySelectorAll('.page-btn').forEach((btn) => {
    btn.classList.toggle('active', currentIndex >= 0 && visiblePages[currentIndex] && btn.dataset.file === visiblePages[currentIndex].file);
  });
}

function syncPrevNextState() {
  prevBtn.disabled = currentIndex <= 0;
  nextBtn.disabled = currentIndex < 0 || currentIndex >= visiblePages.length - 1;
}

function setCurrentPage(file) {
  const idx = visiblePages.findIndex((page) => page.file === file);
  const page = idx >= 0 ? visiblePages[idx] : catalog.byFile.get(file);
  if (!page) return;

  currentIndex = visiblePages.findIndex((entry) => entry.file === page.file);
  if (currentIndex < 0) {
    currentIndex = catalog.flatPages.findIndex((entry) => entry.file === page.file);
    visiblePages = catalog.flatPages;
  }

  const links = resolvePageLinks(page);
  viewer.src = appendQueryParams(links.localUrl, { v: Date.now() });
  currentTitle.textContent = page.title;
  currentMeta.textContent = `${page.topic} · עמוד ${page.number} · ${page.file}`;
  openRealSiteBtn.href = links.liveUrl;
  openPageBtn.onclick = () => window.open(links.localUrl, '_blank', 'noopener');
  openSiteHome.href = catalog.siteUrl;
  rememberPage(page);
  syncActiveButton();
  syncPrevNextState();
}

reloadCurrentBtn.addEventListener('click', () => {
  if (currentIndex >= 0 && visiblePages[currentIndex]) setCurrentPage(visiblePages[currentIndex].file);
});

prevBtn.addEventListener('click', () => {
  if (currentIndex > 0) setCurrentPage(visiblePages[currentIndex - 1].file);
});

nextBtn.addEventListener('click', () => {
  if (currentIndex >= 0 && currentIndex < visiblePages.length - 1) setCurrentPage(visiblePages[currentIndex + 1].file);
});

searchBox.addEventListener('input', render);
topicFilter.addEventListener('change', render);

async function refreshCatalog() {
  catalog = await loadCatalog(previewDataCandidates());
  topicFilter.innerHTML = '<option value="__all__">כל הנושאים</option>';
  catalog.topics.forEach((topic) => {
    const opt = document.createElement('option');
    opt.value = topic.name;
    opt.textContent = `${topic.name} (${topic.count})`;
    topicFilter.appendChild(opt);
  });
}

async function boot() {
  await refreshCatalog();
  render();

  const saved = rememberedPageFile();
  if (saved && catalog.flatPages.some((page) => page.file === saved)) {
    setCurrentPage(saved);
  } else if (catalog.flatPages.length > 0) {
    setCurrentPage(catalog.flatPages[0].file);
  }
}

boot().catch(console.error);

const es = new EventSource('/events');
es.addEventListener('reload', () => {
  if (reloadTimer) clearTimeout(reloadTimer);
  reloadTimer = setTimeout(async () => {
    try {
      const prevFile = currentIndex >= 0 && visiblePages[currentIndex] ? visiblePages[currentIndex].file : null;
      await refreshCatalog();
      render();
      if (prevFile) setCurrentPage(prevFile);
    } catch {}
  }, 220);
});
