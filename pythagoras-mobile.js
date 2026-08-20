const mobileQuery = window.matchMedia('(max-width: 760px)');
const workbook = document.querySelector('#workbook');
const jumpInput = document.querySelector('#page-jump');
const prevButton = document.querySelector('#prev-page');
const nextButton = document.querySelector('#next-page');

function requestedPage() {
  const fromInput = Number(jumpInput?.value);
  if (Number.isFinite(fromInput) && fromInput > 0) return Math.trunc(fromInput);
  const fromUrl = Number(new URL(location.href).searchParams.get('page'));
  return Number.isFinite(fromUrl) && fromUrl > 0 ? Math.trunc(fromUrl) : 1;
}

function syncMobilePage() {
  if (!workbook) return;
  const wrappers = [...workbook.querySelectorAll('.workbook-page-wrap')];
  if (!wrappers.length) return;

  if (!mobileQuery.matches) {
    for (const wrapper of wrappers) wrapper.classList.remove('is-mobile-active');
    return;
  }

  const page = Math.max(1, Math.min(wrappers.length, requestedPage()));
  for (const wrapper of wrappers) {
    wrapper.classList.toggle('is-mobile-active', Number(wrapper.dataset.localPage) === page);
  }

  requestAnimationFrame(() => {
    const active = workbook.querySelector('.workbook-page-wrap.is-mobile-active');
    if (active) active.scrollIntoView({ block: 'start', behavior: 'auto' });
  });
}

const observer = new MutationObserver(syncMobilePage);
if (workbook) observer.observe(workbook, { childList: true });

for (const control of [prevButton, nextButton]) {
  control?.addEventListener('click', () => requestAnimationFrame(syncMobilePage), true);
}

jumpInput?.addEventListener('change', () => requestAnimationFrame(syncMobilePage), true);
window.addEventListener('popstate', syncMobilePage);
mobileQuery.addEventListener?.('change', syncMobilePage);

syncMobilePage();
