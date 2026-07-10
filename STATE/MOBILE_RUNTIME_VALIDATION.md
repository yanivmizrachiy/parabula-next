# MOBILE_RUNTIME_VALIDATION

Generated: 2026-07-10T04:42:48.526Z

## Summary

- total_checks: 10
- passed: 10
- failed: 0

## Checks

- PASS — meta_topics_exists — totalPages=98
- PASS — mobile_topics_exists — totalPages=98
- PASS — mobile_app_js_exists — mobile-app.js loaded
- PASS — mobile_app_html_exists — mobile-app.html loaded
- PASS — mobile_app_uses_canonical_meta_topics — mobile-app.js fetches ./meta/topics.json
- PASS — mobile_app_not_using_mobile_topics_json — mobile-app.js no longer depends on mobile-topics.json
- PASS — mobile_html_uses_mobile_app_js — mobile-app.html loads mobile-app.js
- PASS — mobile_topics_divergence_detected — meta/topics.json totalPages=98; mobile-topics.json totalPages=98
- PASS — topic_name_sets_match — missingInMobile=0; missingInMeta=0
- PASS — compat_phone_runtime_still_exists — preview/phone.* still exists as compat/legacy layer