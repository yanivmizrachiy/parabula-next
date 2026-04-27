# MOBILE_NAV_READINESS

Generated: 2026-04-27T11:03:28

## Summary

- topics_count: 7
- total_pages: 95
- largest_topic: משוואות (54)
- checks_passed: 6
- checks_failed: 0

## Checks

- PASS — mobile_uses_meta_topics
- PASS — mobile_not_using_mobile_topics_runtime
- PASS — validate_mobile_script_registered
- PASS — mobile_reader_iframe_based
- PASS — topics_exist
- PASS — total_pages_present

## Canonical mobile decision

- mobile runtime: `mobile-app.*`
- canonical metadata source: `meta/topics.json`
- worksheet source of truth: root `עמוד-N.html` pages
- do not modify worksheet source during mobile runtime work

## Next gate

- open `mobile-app.html` on phone
- verify comfortable page size
- verify centering
- verify no embarrassing gray empty area
- verify topic/page navigation feels natural
- verify open/print flow still works