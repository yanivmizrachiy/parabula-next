// זמן ריצה מינימלי לקורא. הדף עצמו סטטי לחלוטין וניתן להדפסה בלי JS.
// התפקיד היחיד כאן: לחשוף את מספר העמוד הנוכחי לכותרת הדפדפן בזמן גלילה,
// ולאפשר קפיצה לעמוד דרך hash. אין כאן לוגיקה לימודית ואין שינוי תוכן.

(function () {
  'use strict';

  var pages = Array.prototype.slice.call(document.querySelectorAll('.a4-page'));
  if (!pages.length) return;

  var baseTitle = document.title;

  function setCurrent(page) {
    var n = page.dataset.page;
    document.title = baseTitle + ' — עמוד ' + n;
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setCurrent(entry.target);
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    pages.forEach(function (page) { observer.observe(page); });
  }

  // ניווט ישיר: index.html#page-7
  if (location.hash) {
    var target = document.querySelector(location.hash);
    if (target && target.classList.contains('a4-page')) {
      target.scrollIntoView();
    }
  }
})();
