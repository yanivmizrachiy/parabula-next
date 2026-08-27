fetch('manifest.json',{cache:'no-store'})
  .then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json()})
  .then(manifest=>{
    for(const node of document.querySelectorAll('[data-book-count]')){
      const key=node.dataset.bookCount;
      const pages=Number(manifest.workbooks?.[key]?.pages);
      node.textContent=Number.isInteger(pages)&&pages>0?String(pages):'—';
      node.setAttribute('aria-label',Number.isInteger(pages)&&pages>0?`${pages} עמודים`:'מספר עמודים לא זמין');
    }
  })
  .catch(error=>{
    console.error(error);
    for(const node of document.querySelectorAll('[data-book-count]'))node.textContent='—';
  });
