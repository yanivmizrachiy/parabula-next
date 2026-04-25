export const LAST_PAGE_KEY = 'parabula:lastFile';
export const LAST_TOPIC_KEY = 'parabula:lastTopic';

export function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

export function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isUsableTopicsPayload(payload) {
  return Boolean(payload && Array.isArray(payload.topics) && payload.topics.length);
}

export function repoRootUrl(currentHref = window.location.href) {
  const current = new URL(currentHref, window.location.href);
  return current.pathname.includes('/preview/')
    ? new URL('../', current).href
    : new URL('./', current).href;
}

export function previewDataCandidates(currentHref = window.location.href) {
  const root = repoRootUrl(currentHref);
  return [new URL('meta/topics.json', root).href];
}

/**
 * Repository-root access surfaces (for example `mobile-app.html`, as opposed to
 * files under `preview/`) can prefer `mobile-topics.json` first so the mobile
 * entry keeps exercising the mirrored file that is published beside it, while
 * still falling back to the canonical `meta/topics.json` source.
 */
export function rootDataCandidates(currentHref = window.location.href, { includeMobileMirror = false } = {}) {
  const root = repoRootUrl(currentHref);
  const candidates = [];
  if (includeMobileMirror) candidates.push(new URL('mobile-topics.json', root).href);
  candidates.push(new URL('meta/topics.json', root).href);
  return candidates;
}

export function sortPages(pages = []) {
  return pages.slice().sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
}

export function createCatalog(payload) {
  const topics = Array.isArray(payload?.topics)
    ? payload.topics.map((topic) => {
        const pages = sortPages(Array.isArray(topic?.pages) ? topic.pages : []);
        return {
          ...topic,
          pages,
          count: pages.length
        };
      })
    : [];

  topics.sort((a, b) => String(a.name).localeCompare(String(b.name), 'he'));

  const flatPages = sortPages(topics.flatMap((topic) => topic.pages));
  const byFile = new Map(flatPages.map((page) => [page.file, page]));

  return {
    payload,
    topics,
    flatPages,
    byFile,
    topicNames: topics.map((topic) => topic.name).filter(Boolean),
    totalPages: typeof payload?.totalPages === 'number' ? payload.totalPages : flatPages.length,
    siteUrl: payload?.siteUrl || repoRootUrl()
  };
}

export function filterPages(pages, { query = '', topic = '__all__' } = {}) {
  const q = normalize(query);
  return sortPages(
    pages.filter((page) => {
      if (topic !== '__all__' && page.topic !== topic) return false;
      if (!q) return true;
      return normalize([page.title, page.h1, page.file, page.topic, page.number].join(' ')).includes(q);
    })
  );
}

export function getTopic(catalog, topicName) {
  return catalog.topics.find((topic) => topic.name === topicName) || null;
}

export function appendQueryParams(url, params) {
  const next = new URL(url, window.location.href);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    next.searchParams.set(key, String(value));
  });
  return next.href;
}

/**
 * `localUrl` always points to the real worksheet file in the current working
 * copy / preview server, while `liveUrl` points to the published GitHub Pages
 * location when it is known. If `siteUrl` is missing in metadata, `liveUrl`
 * safely falls back to the same real local worksheet URL.
 */
export function resolvePageLinks(page, currentHref = window.location.href) {
  const root = repoRootUrl(currentHref);
  const localPath = String(page?.previewPath || page?.file || '').replace(/^\//, '');
  const localUrl = new URL(localPath, root).href;
  return {
    localUrl,
    liveUrl: page?.siteUrl || localUrl
  };
}

export function rememberPage(page) {
  if (!page?.file) return;
  localStorage.setItem(LAST_PAGE_KEY, page.file);
  if (page.topic) localStorage.setItem(LAST_TOPIC_KEY, page.topic);
}

export function rememberedPageFile() {
  return localStorage.getItem(LAST_PAGE_KEY) || '';
}

export function rememberedTopic() {
  return localStorage.getItem(LAST_TOPIC_KEY) || '';
}

export function pageLabel(page) {
  return `עמוד ${page?.number ?? '—'} — ${page?.title || page?.h1 || page?.file || 'ללא כותרת'}`;
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

export async function loadTopicsData(candidates) {
  const failures = [];

  for (const url of candidates) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (!isUsableTopicsPayload(payload)) throw new Error('empty or invalid topics payload');
      return payload;
    } catch (error) {
      failures.push(`${url}: ${errorMessage(error)}`);
    }
  }

  throw new Error(`topics fetch failed:\n${failures.join('\n')}`);
}

export async function loadCatalog(candidates) {
  return createCatalog(await loadTopicsData(candidates));
}
