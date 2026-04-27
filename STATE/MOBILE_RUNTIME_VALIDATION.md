# MOBILE_RUNTIME_VALIDATION

Generated: 2026-04-27T10:41:31.120Z

## Summary

- total_checks: 14
- passed: 14
- failed: 0

## Checks

- PASS — meta_topics_exists — totalPages=95
- PASS — mobile_topics_exists — totalPages=95
- PASS — mobile_app_js_exists — mobile-app.js loaded
- PASS — mobile_app_html_exists — mobile-app.html loaded
- PASS — print_js_exists — preview/print.js loaded
- PASS — mobile_app_uses_canonical_meta_topics — mobile-app.js fetches ./meta/topics.json
- PASS — mobile_app_not_using_mobile_topics_json — mobile-app.js no longer depends on mobile-topics.json
- PASS — mobile_html_uses_mobile_app_js — mobile-app.html loads mobile-app.js
- PASS — mobile_print_handoff_uses_print_center — mobile-app.js deep-links into preview/print.html for preview-before-print
- PASS — mobile_book_navigation_present — mobile-app.js includes global book navigation helper
- PASS — print_center_accepts_url_selection — preview/print.js supports URL-driven page selection
- PASS — mobile_topics_divergence_detected — meta/topics.json totalPages=95; mobile-topics.json totalPages=95
- PASS — topic_name_sets_match — missingInMobile=0; missingInMeta=0
- PASS — compat_phone_runtime_still_exists — preview/phone.* still exists as compat/legacy layer