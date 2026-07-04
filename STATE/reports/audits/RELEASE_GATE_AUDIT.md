# RELEASE_GATE_AUDIT

Generated: 2026-04-26 13:07:27

- total_checks: 22
- passed: 22
- failed: 0

## Check results
- [PASS] master_audit_all_green :: passed=29 failed=0
- [PASS] public_ok_5_of_5 :: public_ok=5/5
- [PASS] metadata_clean :: quadratic_inside_equations=0 duplicate_file_entries=0
- [PASS] app_is_redirect_entry :: preview/app.html should redirect to topics
- [PASS] rules_document_redirect_entry :: rules should document redirect entry
- [PASS] rules_document_all_pages_secondary :: rules should keep all-pages secondary
- [PASS] topics_has_reader_bar :: topics.html should expose main reader bar
- [PASS] topics_has_mobile_bottom_bar :: topics.html should expose mobile bottom bar
- [PASS] topics_has_prev_next_first_logic :: topics.js should support first/prev/next
- [PASS] topics_has_persistence :: topics.js should persist last place
- [PASS] topics_has_mobile_css :: topics.css should support phone UX
- [PASS] all_pages_has_download_action :: all-pages.js should expose download selection
- [PASS] all_pages_has_print_action :: all-pages.js should expose print selection
- [PASS] all_pages_has_share_action :: all-pages.js should expose share selection
- [PASS] all_pages_surface_exists :: all-pages.html should be live
- [PASS] print_surface_exists :: print.html should be live
- [PASS] print_js_restore_selection :: print.js should support restore/selection flow
- [PASS] no_real_public_link_confusion :: real_public_confusion=0
- [PASS] no_duplicate_public_app_urls :: duplicate_public_app_urls=0
- [PASS] public_route_topics_ok :: status=200 missing=[] final=https://yanivmizrachiy.github.io/parabula-next/preview/topics.html
- [PASS] public_route_all_pages_ok :: status=200 missing=[] final=https://yanivmizrachiy.github.io/parabula-next/preview/all-pages.html
- [PASS] public_route_print_ok :: status=200 missing=[] final=https://yanivmizrachiy.github.io/parabula-next/preview/print.html

## External link actionable interpretation
- suspicious_findings_raw: 0
- duplicate_public_app_urls: 0
- duplicate_repo_github_urls: 0
- duplicate_other_external_urls: 266
- real_public_confusion: none

## Final judgment
- release gate PASSED: topic-first home, topic browsing, all-pages browsing, print/pdf, metadata integrity, and public route checks are all green in this pass.