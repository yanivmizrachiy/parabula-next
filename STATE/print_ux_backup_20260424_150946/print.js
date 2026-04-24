const BASE = (() => {
  const url = new URL('.', window.location.href);
  return url.href.endsWith('/') ? url.href : `${url.href}/`;
})();

const PAGE_BASE = new URL('../', BASE).href;
const searchBox = document.getElementById('searchBox');
const topicFilter = document.getElementById('topicFilter');
const selectionList = document.getElementById('selectionList');
const printView = document.getElementById('printView');
const selectVisibleBtn = document.getElementById('selectVisibleBtn');
const clearBtn = document.getElementById('clearBtn');
const openSelectedBtn = document.getElementById('openSelectedBtn');

let db = null;
let visiblePages = [];
const selected = new Set();

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function pageUrl(file) {
  return new URL(file, PAGE_BASE).href;
}

function allPages() {
  return db.topics.flatMap((entry) => entry.pages);
}

function renderList() {
  const q = normalize(searchBox.value);
  const topic = topicFilter.value;

  visiblePages = allPages()
    .filter((page) => topic === '__all__' || page.topic === topic)
    .filter((page) => {
      if (!q) return true;
      return normalize(`${page.title} ${page.topic} ${page.file} ${page.number}`).includes(q);
    })
    .sort((a, b) => a.number - b.number);

  selectionList.innerHTML = '';

  visiblePages.forEach((page) => {
    const item = document.createElement('label');
    item.className = 'selection-item';
    item.innerHTML = `
      <input type="checkbox" ${selected.has(page.file) ? 'checked' : ''} />
      <span class="selection-copy">
        <strong>${page.title}</strong>
        <span>${page.topic} · ${page.file}</span>
      </span>
    `;
    const checkbox = item.querySelector('input');
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) selected.add(page.file);
      else selected.delete(page.file);
    });
    selectionList.appendChild(item);
  });
}

function renderPreview() {
  printView.innerHTML = '';
  allPages()
    .filter((page) => selected.has(page.file))
    .sort((a, b) => a.number - b.number)
    .forEach((page) => {
      const wrap = document.createElement('section');
      wrap.className = 'sheet-frame';
      wrap.innerHTML = `<iframe title="${page.title}" src="${pageUrl(page.file)}"></iframe>`;
      printView.appendChild(wrap);
    });
}

async function boot() {
  const response = await fetch(new URL('../meta/topics.json', BASE));
  db = await response.json();

  db.topics.forEach((topic) => {
    const option = document.createElement('option');
    option.value = topic.name;
    option.textContent = `${topic.name} (${topic.count})`;
    topicFilter.appendChild(option);
  });

  renderList();
}

searchBox.addEventListener('input', renderList);
topicFilter.addEventListener('change', renderList);
selectVisibleBtn.addEventListener('click', () => {
  visiblePages.forEach((page) => selected.add(page.file));
  renderList();
});
clearBtn.addEventListener('click', () => {
  selected.clear();
  renderList();
  renderPreview();
});
openSelectedBtn.addEventListener('click', renderPreview);

boot().catch((error) => {
  console.error(error);
  selectionList.innerHTML = '<div class="selection-item">שגיאה בטעינת רשימת הדפים</div>';
});
