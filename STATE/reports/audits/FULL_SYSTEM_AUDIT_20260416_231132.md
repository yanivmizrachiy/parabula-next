# FULL SYSTEM AUDIT 20260416_231132

repo: `/data/data/com.termux/files/home/parabula-next`
backup: `/data/data/com.termux/files/home/parabula-next/STATE/backup_20260416_231132`

## counts
- root_pages: 95
- docs_pages: 95
- root_page_css: 95
- docs_page_css: 95

## topics
- topics_count: 6
- total_pages: 95
- topic_names: ['גיאומטריה', 'כללי', 'משוואות', 'משפט פיתגורס', 'סדרות וחוקיות', 'פונקציות']
- pages_missing_siteUrl: 0

## signals
- rules_primary_mobile_app_declared: True
- rules_public_mobile_topics_declared: True
- rules_root_and_docs_dual_publish_declared: True
- preview_readme_declares_phone_layer: True
- mobile_app_has_iframe: True
- preview_phone_has_iframe: True
- mobile_js_uses_siteUrl: True
- mobile_js_uses_root_base: True
- mobile_js_uses_docs_paths: False
- preview_phone_js_uses_meta_topics: True
- preview_phone_js_is_second_mobile_runtime: True
- mobile_css_has_bottom_nav: True
- mobile_css_has_fixed_bottom_nav: True

## contradictions
- גם PROJECT_RULES וגם preview/README מציגים שכבות מובייל רשמיות שונות.
- יש שני runtimes שונים למובייל, ושניהם מבוססי iframe.
- preview/phone.js תלוי ב-meta/topics.json בזמן שהחוק הציבורי דורש mobile-topics.json.
- חוקי הפרויקט עדיין מאפשרים dual-publish שעלול לבלבל את מסלול הפרסום.

## live
- https://yanivmizrachiy.github.io/parabula-next/mobile-app.html?v=fullaudit => ok=True status=200 type=text/html; charset=utf-8
- https://yanivmizrachiy.github.io/parabula-next/mobile-app-install.html?v=fullaudit => ok=True status=200 type=text/html; charset=utf-8
- https://yanivmizrachiy.github.io/parabula-next/mobile-topics.json?v=fullaudit => ok=False status=404 type=
- https://yanivmizrachiy.github.io/parabula-next/עמוד-31.html?v=fullaudit => ok=False status=None type=
- https://yanivmizrachiy.github.io/parabula-next/styles/a4-base.css?v=fullaudit => ok=True status=200 type=text/css; charset=utf-8
- https://yanivmizrachiy.github.io/parabula-next/styles/pages/%D7%A2%D7%9E%D7%95%D7%93-31.css?v=fullaudit => ok=True status=200 type=text/css; charset=utf-8
- https://yanivmizrachiy.github.io/parabula-next/preview/phone.html?v=fullaudit => ok=True status=200 type=text/html; charset=utf-8

## git
- last_commit: ad549b8 fix: canonicalize mobile runtime and demote preview phone layer
- status: D docs/styles/_probe.css
?? STATE/backup_20260416_231132/

## recommendations
- לקבע mobile-app.* כמסלול מובייל קנוני יחיד.
- להשאיר preview/phone.* כ-legacy/utility בלבד ולא כנתיב מובייל פעיל.
- לא לגעת בדפי A4 עצמם בשלב הבא.
- לטפל רק במעטפת mobile-app.* ובכללים הסותרים.
- לא למחוק קבצים לפני נטרול/סיווג/גיבוי.