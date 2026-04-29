const DATA_URL = new URL('../meta/topics.json', window.location.href);
const STORE_KEY = 'parabula-equations-selection-v1';
const TARGET_TOPIC = 'משוואות';
const EXCLUDED_TOPIC = 'משוואות ריבועיות';

const topicNameBadge = document.getElementById('topicNameBadge');
const pageCountBadge = document.getElementById('pageCountBadge');
const selectedCountBadge = document.getElementById('selectedCountBadge');
const searchBox = document.getElementById('searchBox');
const selectAllBtn = document.getElementById('selectAllBtn');
const clearSelectionBtn = document.getElementById('clearSelectionBtn');
const openPrintBtn = document.getElementById('openPrintBtn');
const printAllBtn = document.getElementById('printAllBtn');
const downloadLinksBtn = document.getElementById('downloadLinksBtn');
const listMeta = document.getElementById('listMeta');
const pagesList = document.getElementById('pagesList');
const currentTitle = document.getElementById('currentTitle');
const currentMeta = document.getElementById('currentMeta');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const openFullLink = document.getElementById('openFullLink');
const downloadCurrentLink = document.getElementById('downloadCurrentLink');
const loadingState = document.getElementById('loadingState');
const pageFrame = document.getElementById('pageFrame');

let pages = [];
let visiblePages = [];
let currentIndex = 0;
const selected = new Set();

function norm(value) {
  return String(value || '').trim().toLowerCase();
}

function pageUrl(page) {
  return page.siteUrl || new URL(`../${page.file}`, window.location.href).href;
}

function saveSelection() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...selected].sort()));
}

function loadSelection() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const stored = raw ? JSON.parse(raw) : [];
    if (Array.isArray(stored)) stored.forEach((file) => selected.add(file));
  } catch {}
}

function updateBadges() {
  topicNameBadge.textContent = TARGET_TOPIC;
  pageCountBadge.textContent = `${pages.length} דפים`;
  selectedCountBadge.textContent = `${selected.size} נבחרו`;
}

function getCurrentPage() {
  return pages[currentIndex] || pages[0] || null;
}

function renderList() {
  const q = norm(searchBox.value);
  visiblePages = pages.filter((page) => {
    if (!q) return true;
    return norm(`${page.title} ${page.h1} ${page.file} ${page.number}`).includes(q);
  });

  listMeta.textContent = visiblePages.length === pages.length
    ? `${pages.length} דפים בנושא משוואות בלבד`
    : `${visiblePages.length} מתוך ${pages.length} דפים`;

  pagesList.innerHTML = visiblePages.map((page) => {
    const realIndex = pages.findIndex((entry) => entry.file === page.file);
    const isActive = realIndex === currentIndex;
    const isSelected = selected.has(page.file);
    return `
      <article class="eq-page-card ${isActive ? 'is-active' : ''}" data-file="${page.file}">
        <div class="eq-page-card-top">
          <div>
            <div class="eq-page-title">${page.title || page.file}</div>
            <div class="eq-page-meta">דף ${realIndex + 1} מתוך ${pages.length} · ${page.file}</div>
          </div>
          <input type="checkbox" aria-label="בחר ${page.title || page.file}" ${isSelected ? 'checked' : ''} />
        </div>
        <div class="eq-page-actions">
          <button type="button" data-action="open">צפה</button>
          <a href="${pageUrl(page)}" target="_blank" rel="noopener">פתח מלא</a>
          <button type="button" data-action="toggle">${isSelected ? 'הסר' : 'בחר'}</button>
          <a href="${pageUrl(page)}" download>הורד HTML</a>
        </div>
      </article>
    `;
  }).join('');

  updateBadges();
}

function updateReader() {
  const page = getCurrentPage();
  if (!page) {
    currentTitle.textContent = 'לא נמצאו דפי משוואות';
    currentMeta.textContent = 'בדוק את meta/topics.json';
    pageFrame.src = 'about:blank';
    return;
  }

  currentTitle.textContent = page.title || page.file;
  currentMeta.textContent = `משוואות בלבד · דף ${currentIndex + 1} מתוך ${pages.length} · ${page.file}`;
  openFullLink.href = pageUrl(page);
  downloadCurrentLink.href = pageUrl(page);
  prevBtn.disabled = currentIndex <= 0;
  nextBtn.disabled = currentIndex >= pages.length - 1;

  loadingState.hidden = false;
  pageFrame.src = pageUrl(page);
  renderList();
}

function openPageByFile(file) {
  const index = pages.findIndex((page) => page.file === file);
  if (index < 0) return;
  currentIndex = index;
  updateReader();
}

function toggleSelection(file) {
  if (selected.has(file)) selected.delete(file);
  else selected.add(file);
  saveSelection();
  renderList();
}

function selectedPagesOrAll() {
  const picked = pages.filter((page) => selected.has(page.file));
  return picked.length ? picked : pages;
}

function openPrintCenter() {
  localStorage.setItem('parabula-selection-v1', JSON.stringify(selectedPagesOrAll().map((page) => page.file)));
  window.location.href = './print.html?topic=%D7%9E%D7%A9%D7%95%D7%95%D7%90%D7%95%D7%AA&autoselect=topic';
}

function downloadLinks() {
  const payload = {
    generatedAt: new Date().toISOString(),
    topic: TARGET_TOPIC,
    excludedTopic: EXCLUDED_TOPIC,
    count: pages.length,
    pages: selectedPagesOrAll().map((page, index) => ({
      index: index + 1,
      title: page.title,
      file: page.file,
      url: pageUrl(page)
    }))
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'parabula-equations-links.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

pagesList.addEventListener('click', (event) => {
  const card = event.target.closest('.eq-page-card');
  if (!card) return;
  const file = card.dataset.file;
  const actionButton = event.target.closest('[data-action]');
  const checkbox = event.target.closest('input[type="checkbox"]');

  if (checkbox || actionButton?.dataset.action === 'toggle') {
    toggleSelection(file);
    return;
  }
  if (actionButton?.dataset.action === 'open' || !event.target.closest('a')) {
    openPageByFile(file);
  }
});

searchBox.addEventListener('input', renderList);
selectAllBtn.addEventListener('click', () => {
  pages.forEach((page) => selected.add(page.file));
  saveSelection();
  renderList();
});
clearSelectionBtn.addEventListener('click', () => {
  selected.clear();
  saveSelection();
  renderList();
});
openPrintBtn.addEventListener('click', openPrintCenter);
printAllBtn.addEventListener('click', () => {
  openPrintCenter();
});
downloadLinksBtn.addEventListener('click', downloadLinks);
prevBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex -= 1;
    updateReader();
  }
});
nextBtn.addEventListener('click', () => {
  if (currentIndex < pages.length - 1) {
    currentIndex += 1;
    updateReader();
  }
});
pageFrame.addEventListener('load', () => {
  loadingState.hidden = true;
});

async function boot() {
  const response = await fetch(DATA_URL);
  const payload = await response.json();
  const topic = (payload.topics || []).find((entry) => entry.name === TARGET_TOPIC);
  if (!topic) throw new Error('Missing equations topic in metadata');

  pages = (topic.pages || [])
    .filter((page) => page.topic === TARGET_TOPIC && page.topic !== EXCLUDED_TOPIC)
    .sort((a, b) => {
      const titleA = String(a.title || '');
      const titleB = String(b.title || '');
      const localA = Number((titleA.match(/עמוד\s+(\d+)/) || [])[1] || 0);
      const localB = Number((titleB.match(/עמוד\s+(\d+)/) || [])[1] || 0);
      return (localA || a.number || 0) - (localB || b.number || 0);
    });

  loadSelection();
  selected.forEach((file) => {
    if (!pages.some((page) => page.file === file)) selected.delete(file);
  });
  saveSelection();
  updateBadges();
  updateReader();
}

boot().catch((error) => {
  console.error(error);
  pagesList.innerHTML = '<article class="eq-page-card">שגיאה בטעינת דפי משוואות</article>';
  currentTitle.textContent = 'שגיאה בטעינה';
  currentMeta.textContent = 'לא ניתן לקרוא את meta/topics.json';
});
