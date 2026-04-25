import {
  appendQueryParams,
  loadCatalog,
  previewDataCandidates,
  rememberPage,
  rememberedPageFile,
  resolvePageLinks
} from './catalog-shared.js';

const continueBtn = document.getElementById('continueBtn');
const totalPagesValue = document.getElementById('totalPagesValue');
const totalTopicsValue = document.getElementById('totalTopicsValue');
const lastPageValue = document.getElementById('lastPageValue');
const featuredLabel = document.getElementById('featuredLabel');
const featuredTitle = document.getElementById('featuredTitle');
const featuredMeta = document.getElementById('featuredMeta');
const featuredFrame = document.getElementById('featuredFrame');
const featuredReaderBtn = document.getElementById('featuredReaderBtn');
const featuredLocalBtn = document.getElementById('featuredLocalBtn');
const featuredLiveBtn = document.getElementById('featuredLiveBtn');
const featuredPages = document.getElementById('featuredPages');
const topicHighlights = document.getElementById('topicHighlights');

let catalog = null;
let activeFile = '';

function pageLabel(page) {
  return `עמוד ${page.number} — ${page.title || page.h1 || page.file}`;
}

function shelfCandidates(anchorFile) {
  const all = catalog.flatPages;
  const anchorIndex = all.findIndex((page) => page.file === anchorFile);
  const indexes = [];

  if (anchorIndex >= 0) {
    indexes.push(anchorIndex, anchorIndex - 1, anchorIndex + 1, anchorIndex - 2, anchorIndex + 2);
  }

  for (let i = all.length - 1; i >= 0 && indexes.length < 10; i -= 1) indexes.push(i);

  const seen = new Set();
  return indexes
    .filter((index) => index >= 0 && index < all.length)
    .map((index) => all[index])
    .filter((page) => {
      if (!page || seen.has(page.file)) return false;
      seen.add(page.file);
      return true;
    })
    .slice(0, 8);
}

function renderTopicHighlights() {
  topicHighlights.innerHTML = catalog.topics
    .slice()
    .sort((a, b) => b.count - a.count)
    .map((topic) => `<div class="topic-pill"><strong>${topic.name}</strong><small>${topic.count} דפים פעילים</small></div>`)
    .join('');
}

function updateFeatured(page, { announceLast = false, persist = false } = {}) {
  if (!page) return;
  activeFile = page.file;
  const links = resolvePageLinks(page);
  featuredLabel.textContent = announceLast ? 'המשך מהעמוד האחרון' : 'דף מומלץ לכניסה מהירה';
  featuredTitle.textContent = page.title || page.h1 || page.file;
  featuredMeta.textContent = `${page.topic || 'ללא נושא'} · עמוד ${page.number} · ${page.file}`;
  featuredFrame.src = appendQueryParams(links.localUrl, { preview: 1, v: Date.now() });
  featuredLocalBtn.href = links.localUrl;
  featuredLiveBtn.href = links.liveUrl;
  featuredReaderBtn.href = './index.html';
  continueBtn.href = './index.html';
  continueBtn.textContent = announceLast ? `המשך לעמוד האחרון — ${page.number}` : 'התחל לקרוא';
  lastPageValue.textContent = announceLast ? String(page.number) : 'חדש';
  if (persist) rememberPage(page);

  featuredPages.querySelectorAll('.shelf-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.file === page.file);
  });
}

function renderShelf(anchorFile) {
  const pages = shelfCandidates(anchorFile);
  featuredPages.innerHTML = pages
    .map((page) => `
      <button class="shelf-btn ${page.file === activeFile ? 'active' : ''}" type="button" data-file="${page.file}">
        <span>
          <strong>${pageLabel(page)}</strong>
          <small>${page.topic || 'ללא נושא'} · ${page.file}</small>
        </span>
        <span>↗</span>
      </button>
    `)
    .join('');
}

featuredPages.addEventListener('click', (event) => {
  const button = event.target.closest('.shelf-btn');
  if (!button) return;
  const page = catalog.byFile.get(button.dataset.file);
  if (!page) return;
  updateFeatured(page, { persist: true });
  renderShelf(page.file);
});

async function boot() {
  catalog = await loadCatalog(previewDataCandidates());
  totalPagesValue.textContent = String(catalog.totalPages);
  totalTopicsValue.textContent = String(catalog.topics.length);

  const remembered = rememberedPageFile();
  const page = catalog.byFile.get(remembered) || catalog.flatPages[0];
  const announceLast = Boolean(remembered && page?.file === remembered);

  renderTopicHighlights();
  renderShelf(page.file);
  updateFeatured(page, { announceLast, persist: false });
}

boot().catch((error) => {
  console.error(error);
  featuredTitle.textContent = 'שגיאה בטעינת מסך הכניסה';
  featuredMeta.textContent = error instanceof Error ? error.message : String(error);
  featuredPages.innerHTML = '<div class="topic-pill">לא ניתן היה לטעון דפים אמיתיים כרגע.</div>';
});
