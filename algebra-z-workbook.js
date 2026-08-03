(() => {
  'use strict';
  const files = {
    color: {
      id: '1sc4iqSAMTji4sroQZvLx5jpAWqtiA2Mw',
      label: 'גרסה צבעונית'
    },
    bw: {
      id: '17sDILtaouvzKLF9sQ2z4Un9yZhaxAlp_',
      label: 'גרסה בשחור־לבן'
    }
  };

  let mode = new URLSearchParams(location.search).get('mode') === 'bw' ? 'bw' : 'color';
  const frame = document.getElementById('pdfFrame');
  const colorButton = document.getElementById('colorMode');
  const bwButton = document.getElementById('bwMode');
  const downloadButton = document.getElementById('downloadButton');
  const openButton = document.getElementById('openButton');
  const label = document.getElementById('viewerModeLabel');
  const status = document.getElementById('status');
  const panel = document.getElementById('viewerPanel');

  function urls(file) {
    return {
      preview: `https://drive.google.com/file/d/${file.id}/preview`,
      view: `https://drive.google.com/file/d/${file.id}/view`,
      download: `https://drive.google.com/uc?export=download&id=${file.id}`
    };
  }

  function render() {
    const file = files[mode];
    const target = urls(file);
    status.textContent = 'טוען את החוברת…';
    frame.src = target.preview;
    openButton.href = target.view;
    downloadButton.href = target.download;
    label.textContent = file.label;
    colorButton.classList.toggle('is-active', mode === 'color');
    bwButton.classList.toggle('is-active', mode === 'bw');
    colorButton.setAttribute('aria-pressed', String(mode === 'color'));
    bwButton.setAttribute('aria-pressed', String(mode === 'bw'));
    const url = new URL(location.href);
    url.searchParams.set('mode', mode);
    history.replaceState(null, '', url);
  }

  function setMode(next) {
    if (!files[next] || next === mode) return;
    mode = next;
    render();
  }

  frame.addEventListener('load', () => { status.textContent = 'מוכן לדפדוף'; });
  colorButton.addEventListener('click', () => setMode('color'));
  bwButton.addEventListener('click', () => setMode('bw'));
  document.getElementById('fullscreenButton').addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) await panel.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      openButton.click();
    }
  });
  render();
})();
