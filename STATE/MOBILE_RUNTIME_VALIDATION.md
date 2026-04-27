# MOBILE_RUNTIME_VALIDATION

Generated: 2026-04-27T19:15:24.347Z

## Summary

- total_checks: 24
- passed: 24
- failed: 0

## Checks

- PASS — meta_topics_exists — totalPages=95
- PASS — mobile_topics_exists — totalPages=95
- PASS — mobile_app_js_exists — mobile-app.js loaded
- PASS — mobile_app_html_exists — mobile-app.html loaded
- PASS — print_js_exists — preview/print.js loaded
- PASS — mobile_install_html_exists — mobile-app-install.html loaded
- PASS — mobile_install_js_exists — mobile-app-install.js loaded
- PASS — mobile_app_uses_canonical_meta_topics — mobile-app.js fetches ./meta/topics.json
- PASS — mobile_app_not_using_mobile_topics_json — mobile-app.js no longer depends on mobile-topics.json
- PASS — mobile_html_uses_mobile_app_js — mobile-app.html loads mobile-app.js
- PASS — mobile_reader_uses_current_origin_pages — mobile-app.js resolves worksheet pages against the current origin
- PASS — mobile_print_handoff_uses_print_center — mobile-app.js deep-links into preview/print.html for preview-before-print
- PASS — mobile_print_handoff_marks_source_and_topic — mobile-app.js annotates print handoff with source and topic
- PASS — mobile_book_navigation_present — mobile-app.js includes global book navigation helper
- PASS — mobile_reader_notice_present — mobile reader exposes notice feedback for reading mode/navigation
- PASS — mobile_reader_mode_toggle_present — mobile reader exposes explicit full-page and enlarged reading modes
- PASS — mobile_reader_stage_prevents_right_edge_clipping — mobile reader uses a dedicated stage/canvas wrapper to avoid right-edge clipping
- PASS — print_center_accepts_url_selection — preview/print.js supports URL-driven page selection
- PASS — print_center_explains_mobile_handoff — preview/print.js explains mobile preview-before-print handoff
- PASS — mobile_install_flow_wired — mobile install page loads manifest and install handler
- PASS — mobile_install_supports_standalone_feedback — mobile install flow reports standalone/appinstalled state
- PASS — mobile_topics_divergence_detected — meta/topics.json totalPages=95; mobile-topics.json totalPages=95
- PASS — topic_name_sets_match — missingInMobile=0; missingInMeta=0
- PASS — compat_phone_runtime_still_exists — preview/phone.* still exists as compat/legacy layer