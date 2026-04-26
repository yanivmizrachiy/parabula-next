# MASTER_CONFORMANCE_AUDIT

Generated: 2026-04-26 10:11:14

- total_checks: 29
- passed: 28
- failed: 1

## Check results
- [PASS] rules_topic_first :: PROJECT_RULES must enforce topic-first
- [PASS] rules_all_pages_secondary :: PROJECT_RULES must describe all-pages as secondary
- [PASS] rules_no_demo :: PROJECT_RULES should prohibit demo content explicitly
- [PASS] rules_no_topic_mixing :: PROJECT_RULES should explicitly guard topic separation
- [PASS] rules_app_redirect_documented :: PROJECT_RULES should document app redirect entry
- [PASS] app_redirects_to_topics :: preview/app.html should redirect to topics.html
- [PASS] app_fallback_links_exist :: preview/app.html should keep safe fallback links
- [PASS] topics_has_reader_bar :: topics.html should have reader bar
- [PASS] topics_has_mobile_reader_bar :: topics.html should have mobile bottom reader controls
- [PASS] topics_js_prev_next_first :: topics.js should support first/prev/next
- [PASS] topics_js_persistence :: topics.js should persist last topic/file
- [PASS] topics_css_mobile_support :: topics.css should support mobile reader UX
- [PASS] topics_js_safe_url :: topics.js should resolve live URLs safely
- [PASS] print_flow_live :: print.js should be the stronger print flow
- [PASS] all_pages_utility_live :: all-pages.js should expose utility actions
- [PASS] all_pages_safe_links :: all-pages.js should resolve safe live page links
- [PASS] mobile_app_canonical_features :: mobile-app.js should expose canonical mobile reader flow
- [PASS] phone_html_is_redirect_compat :: preview/phone.html should be redirect compat layer
- [PASS] phone_js_still_real_logic :: preview/phone.js should still contain real compat logic
- [PASS] print_center_still_real_logic :: preview/print-center.js should still contain real compat logic
- [PASS] metadata_total_pages_matches :: meta totalPages=95 actual=95
- [PASS] metadata_no_duplicate_file_entries :: duplicate_file_entries=0
- [PASS] metadata_no_quadratic_inside_equations :: quadratic_inside_equations=0
- [PASS] metadata_topics_count_ge_7 :: topics_count=7
- [FAIL] no_demo_markers_in_live_surfaces :: {"preview/topics.html": ["placeholder"], "preview/print.html": ["placeholder"], "preview/all-pages.html": ["placeholder"]}
- [PASS] public_live_urls_all_ok :: public_ok=5/5
- [PASS] package_has_preview :: package.json should include preview script
- [PASS] package_has_validate_access :: package.json should include validate:access
- [PASS] package_has_rules_sync :: package.json should include rules:sync

## Public verification detail
- [PASS] app :: status=200; missing_markers=[]; final_url=https://yanivmizrachiy.github.io/parabula-next/preview/app.html
- [PASS] topics :: status=200; missing_markers=[]; final_url=https://yanivmizrachiy.github.io/parabula-next/preview/topics.html
- [PASS] print :: status=200; missing_markers=[]; final_url=https://yanivmizrachiy.github.io/parabula-next/preview/print.html
- [PASS] all_pages :: status=200; missing_markers=[]; final_url=https://yanivmizrachiy.github.io/parabula-next/preview/all-pages.html
- [PASS] mobile :: status=200; missing_markers=[]; final_url=https://yanivmizrachiy.github.io/parabula-next/mobile-app.html

## Metadata summary
- topics_count: 7
- total_pages_field: 95
- actual_pages_in_metadata: 95
- quadratic_inside_equations: 0
- duplicate_file_entries: 0

## Canonical / compatibility snapshot
- canonical: preview/topics.*, preview/print.*, preview/all-pages.*, mobile-app.*
- compatibility / legacy-adjacent: preview/phone.*, preview/print-center.js

## Final judgment
- some audited requirements still fail in this pass and require targeted repair.