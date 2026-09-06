'use strict';
/*
 * sefer-z.js — ספר כיתה ז׳ על מנוע הקורא של razpages (catalog.css).
 * התוכן (המשימות/הנושאים) מגיע אך ורק מפורטל מחוז ירושלים (chomarim/z);
 * אין כאן דפי עבודה של razpages ואין שום כיתוב דמו — רק שמות נושא אמיתיים
 * וקישורים חיים לפורטל.
 */
(() => {
  const J2 = "https://jerusalem2.vercel.app";

  // מבנה כיתה ז׳ מתוך פורטל המחוז (chativat-beynayim/z/chomarim). שמות + קישורים בלבד.
  const DATA = { grade: "כיתה ז׳", domains: [
    { name: "תחום מספרי", topics: [
      { n:1, name:"מספרים מכוונים",  href:J2+"/chativat-beynayim/z/topics/z-directed-numbers/" },
      { n:2, name:"מערכת צירים",     href:J2+"/chativat-beynayim/z/topics/z-coordinate-system/" },
      { n:3, name:"סדר פעולות חשבון", href:J2+"/chativat-beynayim/z/topics/z-order-operations/" },
    ]},
    { name: "תחום אלגברי", topics: [
      { n:4, name:"ביטויים אלגבריים", href:J2+"/chativat-beynayim/z/topics/z-expressions/" },
      { n:5, name:"חוק הפילוג",       href:J2+"/chativat-beynayim/z/topics/z-distributive-law/" },
      { n:6, name:"משוואות",          href:J2+"/chativat-beynayim/z/topics/z-equations/" },
    ]},
    { name: "תחום גיאומטרי", topics: [
      { n:7,  name:"זוויות",          href:J2+"/chativat-beynayim/z/topics/z-angles/" },
      { n:8,  name:"מעגל",            href:J2+"/chativat-beynayim/z/topics/z-circle/" },
      { n:9,  name:"משפט פיתגורס",     href:J2+"/chativat-beynayim/z/topics/z-pythagoras/" },
      { n:10, name:"שטחים והיקפים",    href:J2+"/chativat-beynayim/z/topics/z-areas-perimeters/" },
      { n:11, name:"תיבה וקובייה",     href:J2+"/chativat-beynayim/z/topics/z-box-cube/" },
    ]},
    { name: "תחום אי־ודאות", topics: [] },
    { name: "מבחנים", topics: [
      { n:12, name:"מבחנים לכיתה ז׳", href:J2+"/chativat-beynayim/z/collections/z-mivchanim/" },
    ]},
    { name: "משימות סיכום", topics: [
      { n:13, name:"משימות סיכום לשכבת ז׳", href:J2+"/chativat-beynayim/z/collections/z-sikumim/" },
    ]},
    { name: "מאגרים ומשאבי הוראה", topics: [
      { n:14, name:"דפי נוסחאות לכיתה ז׳",                          href:J2+"/chativat-beynayim/z/collections/z-noschaot/" },
      { n:15, name:"משחקים לכיתה ז׳",                               href:J2+"/chativat-beynayim/z/collections/z-mischakim/" },
      { n:16, name:"העשרה מתמטית לכיתה ז׳",                         href:J2+"/chativat-beynayim/z/collections/z-haashara/" },
      { n:17, name:"מאגרי הוראה לכיתה ז׳",                          href:J2+"/chativat-beynayim/z/collections/z-maagarim/" },
      { n:18, name:"יחידת הוראה: משוואות ללא מספרים שליליים",       href:J2+"/chativat-beynayim/z/units/mishvaot/" },
      { n:19, name:"מקורות והדרכה למורי חטיבת הביניים",             href:J2+"/chativat-beynayim/mekorot-hadracha/" },
    ]},
  ]};

  const cidx = (n) => ((n - 1) % 12) + 1;
  const two  = (n) => String(n).padStart(2, "0");
  const esc  = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const CARET = '<svg class="tt-caret" viewBox="0 0 24 24" fill="none" aria-hidden="true"><polyline points="9,6 15,12 9,18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const flat = [];
  DATA.domains.forEach((d) => d.topics.forEach((t) => flat.push({ ...t, domain: d.name })));

  const tocList = document.getElementById("tocList");
  const stat = document.getElementById("statChip");

  function build() {
    tocList.innerHTML = "";
    const g = document.createElement("div");
    g.className = "toc-node is-open"; g.dataset.depth = "0"; g.style.setProperty("--depth", "0");
    g.innerHTML = '<button class="toc-node-head" type="button" aria-expanded="true">' + CARET +
      '<span class="tt-name">' + esc(DATA.grade) + '</span><span class="tt-count">' + flat.length + '</span></button>' +
      '<div class="toc-node-children"></div>';
    const gk = g.querySelector(".toc-node-children");
    g.querySelector(".toc-node-head").onclick = () => {
      const o = g.classList.toggle("is-open");
      g.querySelector(".toc-node-head").setAttribute("aria-expanded", String(o));
    };

    DATA.domains.forEach((d) => {
      const empty = d.topics.length === 0;
      const node = document.createElement("div");
      node.className = "toc-node" + (empty ? " is-empty" : " is-open");
      node.dataset.depth = "1"; node.style.setProperty("--depth", "1");
      node.innerHTML = '<button class="toc-node-head" type="button" aria-expanded="' + (!empty) + '">' +
        (empty ? '<span class="tt-caret-gap" aria-hidden="true"></span>' : CARET) +
        '<span class="tt-name">' + esc(d.name) + '</span><span class="tt-count">' + d.topics.length + '</span></button>' +
        '<div class="toc-pages"></div>';
      const pages = node.querySelector(".toc-pages");
      const head = node.querySelector(".toc-node-head");
      head.onclick = () => { if (empty) return; const o = node.classList.toggle("is-open"); head.setAttribute("aria-expanded", String(o)); };
      d.topics.forEach((t) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "toc-page"; b.dataset.n = t.n; b.dataset.topicColor = cidx(t.n);
        b.style.setProperty("--depth", "2");
        b.innerHTML = '<span class="tp-num">' + two(t.n) + '</span><span class="tp-title">' + esc(t.name) + '</span>';
        b.onclick = () => select(t.n, true);
        pages.appendChild(b);
      });
      gk.appendChild(node);
    });

    tocList.appendChild(g);
    stat.textContent = flat.length + " נושאים · " + DATA.domains.length + " תחומים";
  }

  const frame = document.getElementById("topicFrame");
  const frameWrap = document.getElementById("frameWrap");
  const frameLoading = document.getElementById("frameLoading");
  const rT = document.getElementById("rTitle"), rM = document.getElementById("rMeta"), rO = document.getElementById("rOpen");
  const fP = document.getElementById("footPrev"), fN = document.getElementById("footNext");
  const nP = document.getElementById("navPrev"),  nN = document.getElementById("navNext");
  let cur = 0, loadTimer = 0;

  function hideLoading() { frameLoading.hidden = true; clearTimeout(loadTimer); }
  function showLoading() {
    frameLoading.hidden = false;
    clearTimeout(loadTimer);
    loadTimer = setTimeout(hideLoading, 12000); // גיבוי אם onload לא נורה
  }
  frame.addEventListener("load", () => { if (frame.src && frame.src !== "about:blank") hideLoading(); });

  function select(n, scroll) {
    const i = flat.findIndex((t) => t.n === n); if (i < 0) return; cur = n; const t = flat[i];
    tocList.querySelectorAll(".toc-page").forEach((el) => el.classList.toggle("is-active", +el.dataset.n === n));
    rT.textContent = t.name;
    rM.textContent = "כיתה ז׳ · " + t.domain;
    rO.href = t.href;
    frameWrap.dataset.topicColor = cidx(n);
    // המשימות מוצגות מיד בתוך החלון — טעינה ישירה של דף הנושא מפורטל המחוז.
    if (frame.getAttribute("src") !== t.href) { showLoading(); frame.src = t.href; }
    fP.disabled = nP.disabled = i === 0;
    fN.disabled = nN.disabled = i === flat.length - 1;
    const a = tocList.querySelector(".toc-page.is-active");
    if (scroll && a) a.scrollIntoView({ block: "nearest" });
  }
  const step = (d) => { const i = flat.findIndex((t) => t.n === cur); const j = i + d; if (j >= 0 && j < flat.length) select(flat[j].n, true); };
  fP.onclick = nP.onclick = () => step(-1);
  fN.onclick = nN.onclick = () => step(1);

  document.getElementById("bookSearch").addEventListener("input", (e) => {
    const q = e.target.value.trim();
    tocList.querySelectorAll(".toc-page").forEach((el) => {
      el.style.display = (!q || el.querySelector(".tp-title").textContent.includes(q)) ? "" : "none";
    });
    tocList.querySelectorAll('.toc-node[data-depth="1"]').forEach((node) => {
      const any = [...node.querySelectorAll(".toc-page")].some((el) => el.style.display !== "none");
      node.style.display = (!q || any) ? "" : "none";
      if (q && any) node.classList.add("is-open");
    });
  });

  build();
  select(1, false);
})();
