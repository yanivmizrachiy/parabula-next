# MOBILE_RUNTIME_VALIDATION

Generated: 2026-04-27T07:51:11.299Z

## Summary

- total_checks: 10
- passed: 9
- failed: 1

## Checks

- PASS — meta_topics_exists — totalPages=95
- PASS — mobile_topics_exists — totalPages=95
- PASS — mobile_app_js_exists — mobile-app.js loaded
- PASS — mobile_app_html_exists — mobile-app.html loaded
- PASS — mobile_app_uses_canonical_meta_topics — mobile-app.js fetches ./meta/topics.json
- PASS — mobile_app_not_using_mobile_topics_json — mobile-app.js no longer depends on mobile-topics.json
- PASS — mobile_html_uses_mobile_app_js — mobile-app.html loads mobile-app.js
- PASS — mobile_topics_divergence_detected — meta/topics.json totalPages=95; mobile-topics.json totalPages=95
- FAIL — topic_name_sets_match — missingInMobile=1; missingInMeta=0
- PASS — compat_phone_runtime_still_exists — preview/phone.* still exists as compat/legacy layer

## Failures

- topic_name_sets_match: missingInMobile=1; missingInMeta=0