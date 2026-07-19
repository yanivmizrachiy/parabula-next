#!/usr/bin/env python3
# DEPRECATED — לא בשימוש ואינו מקור כללים.
# הכלי נכתב לסביבת Termux (נתיב /data/data/com.termux/...) ומפנה אל PROJECT_RULES.md ואל STATE/
# שאינם קיימים בריפו. הוא אינו יכול לרוץ, ואין לקרוא את הטענות שבו ככללי עבודה.
# מקור הכללים היחיד הוא CLAUDE.md.
from pathlib import Path
import datetime, hashlib, json, re, subprocess, urllib.request, sys

root = Path(__file__).resolve().parent.parent
state = root / 'STATE'
state.mkdir(parents=True, exist_ok=True)

files = {
    'rules': root / 'PROJECT_RULES.md',
    'meta': root / 'meta' / 'topics.json',
    'app_html': root / 'preview' / 'app.html',
    'topics_html': root / 'preview' / 'topics.html',
    'topics_js': root / 'preview' / 'topics.js',
    'topics_css': root / 'preview' / 'topics.css',
    'print_html': root / 'preview' / 'print.html',
    'print_js': root / 'preview' / 'print.js',
    'all_pages_html': root / 'preview' / 'all-pages.html',
    'all_pages_js': root / 'preview' / 'all-pages.js',
    'mobile_app_js': root / 'mobile-app.js',
    'phone_html': root / 'preview' / 'phone.html',
    'phone_js': root / 'preview' / 'phone.js',
    'print_center_js': root / 'preview' / 'print-center.js',
    'package_json': root / 'package.json',
}
missing = [name for name, path in files.items() if not path.exists()]
if missing:
    print('ERROR: missing required files')
    for m in missing:
        print('MISSING=' + m)
    sys.exit(1)

def txt(p: Path) -> str:
    return p.read_text(encoding='utf-8')

rules = txt(files['rules'])
meta = json.loads(txt(files['meta']))
app_html = txt(files['app_html'])
topics_html = txt(files['topics_html'])
topics_js = txt(files['topics_js'])
topics_css = txt(files['topics_css'])
print_html = txt(files['print_html'])
print_js = txt(files['print_js'])
all_pages_html = txt(files['all_pages_html'])
all_pages_js = txt(files['all_pages_js'])
mobile_app_js = txt(files['mobile_app_js'])
phone_html = txt(files['phone_html'])
phone_js = txt(files['phone_js'])
print_center_js = txt(files['print_center_js'])
package_json = json.loads(txt(files['package_json']))

stamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
human = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

checks = []
def add_check(name, ok, details=''):
    checks.append({'name': name, 'ok': bool(ok), 'details': details})

# 1) Rules / product-goal conformance
rules_lower = rules.lower()
add_check('rules_topic_first', ('topic-first' in rules_lower or 'topics first' in rules_lower), 'PROJECT_RULES must enforce topic-first')
add_check('rules_all_pages_secondary', 'secondary utility' in rules_lower, 'PROJECT_RULES must describe all-pages as secondary')
add_check('rules_no_demo', ('no ai session may add demo text' in rules_lower or 'demo' in rules_lower), 'PROJECT_RULES should prohibit demo content explicitly')
add_check('rules_no_topic_mixing', 'משוואות ריבועיות' in rules and 'משוואות' in rules, 'PROJECT_RULES should explicitly guard topic separation')
add_check('rules_app_redirect_documented', 'redirect entry' in rules_lower and 'preview/app.html' in rules, 'PROJECT_RULES should document app redirect entry')

# 2) Live home conformance
add_check('app_redirects_to_topics', 'http-equiv="refresh"' in app_html and 'topics.html' in app_html, 'preview/app.html should redirect to topics.html')
add_check('app_fallback_links_exist', ('href="./topics.html' in app_html and 'href="./print.html' in app_html and 'href="./all-pages.html' in app_html and 'href="../mobile-app.html' in app_html), 'preview/app.html should keep safe fallback links')

# 3) Topics reader strength
add_check('topics_has_reader_bar', 'reader-bar' in topics_html and 'readerPageTitle' in topics_html, 'topics.html should have reader bar')
add_check('topics_has_mobile_reader_bar', 'mobile-reader-bar' in topics_html and 'mPrevPageBtn' in topics_html, 'topics.html should have mobile bottom reader controls')
add_check('topics_js_prev_next_first', all(k in topics_js for k in ['prevPageBtn', 'nextPageBtn', 'firstPageBtn', 'stepPage', 'goFirstPage']), 'topics.js should support first/prev/next')
add_check('topics_js_persistence', ('LAST_TOPIC_KEY' in topics_js and 'LAST_FILE_KEY' in topics_js), 'topics.js should persist last topic/file')
add_check('topics_css_mobile_support', ('@media (max-width:980px)' in topics_css and 'mobile-reader-bar' in topics_css), 'topics.css should support mobile reader UX')
add_check('topics_js_safe_url', ('siteUrl' in topics_js or 'resolvePageUrl' in topics_js), 'topics.js should resolve live URLs safely')

# 4) Print / all-pages / mobile canonical checks
add_check('print_flow_live', ('printNowBtn' in print_js and 'restoreSelectionBtn' in print_js), 'print.js should be the stronger print flow')
add_check('all_pages_utility_live', ('downloadSelectionBtn' in all_pages_js and 'printSelectedBtn' in all_pages_js), 'all-pages.js should expose utility actions')
add_check('all_pages_safe_links', ('siteUrl' in all_pages_js or 'resolvePageUrl' in all_pages_js), 'all-pages.js should resolve safe live page links')
add_check('mobile_app_canonical_features', all(k in mobile_app_js for k in ['topicStrip', 'prevPageBtn', 'nextPageBtn', 'mobilePageFrame', 'printBtn']), 'mobile-app.js should expose canonical mobile reader flow')
add_check('phone_html_is_redirect_compat', ('http-equiv="refresh"' in phone_html and 'mobile-app.html' in phone_html), 'preview/phone.html should be redirect compat layer')
add_check('phone_js_still_real_logic', all(k in phone_js for k in ['pageFrame', 'prevBtn', 'nextBtn', 'openSiteBtn']), 'preview/phone.js should still contain real compat logic')
add_check('print_center_still_real_logic', all(k in print_center_js for k in ['selectionList', 'printView', 'openSelectedBtn']), 'preview/print-center.js should still contain real compat logic')

# 5) Metadata integrity
topics = meta.get('topics', [])
all_pages = []
for t in topics:
    for p in t.get('pages', []) or []:
        q = dict(p)
        q['_meta_topic'] = str(t.get('name') or '').strip()
        all_pages.append(q)

def norm(s): return str(s or '').strip()
quadratic_words = ['משוואה ריבועית', 'משוואות ריבועיות', 'ריבועית', 'quadratic']
def is_quadratic(page):
    blob = ' | '.join([norm(page.get('title')), norm(page.get('h1')), norm(page.get('topic'))])
    return any(w in blob for w in quadratic_words)

quadratic_inside_equations = []
dups = {}
seen = {}
for p in all_pages:
    f = norm(p.get('file'))
    if f:
        seen.setdefault(f, []).append(p)
for f, arr in seen.items():
    if len(arr) > 1:
        dups[f] = arr
for p in all_pages:
    if norm(p.get('_meta_topic')) == 'משוואות' and is_quadratic(p):
        quadratic_inside_equations.append(p)

add_check('metadata_total_pages_matches', meta.get('totalPages') == len(all_pages), f"meta totalPages={meta.get('totalPages')} actual={len(all_pages)}")
add_check('metadata_no_duplicate_file_entries', len(dups) == 0, f'duplicate_file_entries={len(dups)}')
add_check('metadata_no_quadratic_inside_equations', len(quadratic_inside_equations) == 0, f'quadratic_inside_equations={len(quadratic_inside_equations)}')
add_check('metadata_topics_count_ge_7', len(topics) >= 7, f'topics_count={len(topics)}')

# 6) No obvious demo/fake/placeholder markers in key live surfaces
demo_patterns = [
    r'\bdemo\b',
    r'\bfake\b',
    r'lorem ipsum',
]
key_surfaces = {
    'preview/app.html': app_html,
    'preview/topics.html': topics_html,
    'preview/topics.js': topics_js,
    'preview/print.html': print_html,
    'preview/print.js': print_js,
    'preview/all-pages.html': all_pages_html,
    'preview/all-pages.js': all_pages_js,
    'mobile-app.js': mobile_app_js,
}
# ignore legal input placeholders like placeholder="חיפוש..."
def strip_input_placeholders(text: str) -> str:
    return re.sub(r'placeholder\\s*=\\s*["\\\'][^"\\\']*["\\\']', '', text, flags=re.I)

demo_hits = {}
for name, content in key_surfaces.items():
    sanitized = strip_input_placeholders(content.lower())
    hits = []
    for pat in demo_patterns:
        if re.search(pat, sanitized, re.I):
            hits.append(pat)
    if hits:
        demo_hits[name] = hits
add_check('no_demo_markers_in_live_surfaces', len(demo_hits) == 0, json.dumps(demo_hits, ensure_ascii=False))

# 7) Public live verification
urls = {
    "app": "https://yanivmizrachiy.github.io/parabula-next/preview/app.html",
    "topics": "https://yanivmizrachiy.github.io/parabula-next/preview/topics.html",
    "print": "https://yanivmizrachiy.github.io/parabula-next/preview/print.html",
    "all_pages": "https://yanivmizrachiy.github.io/parabula-next/preview/all-pages.html",
    "mobile": "https://yanivmizrachiy.github.io/parabula-next/mobile-app.html",
}
expect = {
    "app": ["topics.html", "מעביר", "בחירה לפי נושאים"],
    "topics": ["דפדוף לפי נושאים", "topics.js"],
    "print": ["print", "PDF"],
    "all_pages": ["כל הדפים", "all-pages.js"],
    "mobile": ["mobile", "topic", "iframe"],
}
public_results = []
for name, url in urls.items():
    ok = False
    details = []
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=25) as r:
            body = r.read()
            text = body.decode('utf-8', errors='replace').lower()
            status = getattr(r, 'status', 200)
            missing_markers = [m for m in expect[name] if m.lower() not in text]
            ok = (status == 200 and not missing_markers)
            details = [f'status={status}', f'missing_markers={missing_markers}', f'final_url={r.geturl()}']
    except Exception as e:
        details = [str(e)]
    public_results.append((name, ok, '; '.join(details)))
public_ok = sum(1 for _, ok, _ in public_results if ok)
add_check('public_live_urls_all_ok', public_ok == len(public_results), f'public_ok={public_ok}/{len(public_results)}')

# 8) Scripts sanity
scripts = package_json.get('scripts', {})
add_check('package_has_preview', 'preview' in scripts, 'package.json should include preview script')
add_check('package_has_validate_access', 'validate:access' in scripts, 'package.json should include validate:access')
add_check('package_has_rules_sync', 'rules:sync' in scripts, 'package.json should include rules:sync')

passed = sum(1 for c in checks if c['ok'])
failed = len(checks) - passed

lines = []
lines.append('# MASTER_CONFORMANCE_AUDIT')
lines.append('')
lines.append(f'Generated: {human}')
lines.append('')
lines.append(f'- total_checks: {len(checks)}')
lines.append(f'- passed: {passed}')
lines.append(f'- failed: {failed}')
lines.append('')
lines.append('## Check results')
for c in checks:
    lines.append(f"- [{'PASS' if c['ok'] else 'FAIL'}] {c['name']} :: {c['details']}")
lines.append('')
lines.append('## Public verification detail')
for name, ok, detail in public_results:
    lines.append(f"- [{'PASS' if ok else 'FAIL'}] {name} :: {detail}")
lines.append('')
lines.append('## Metadata summary')
lines.append(f'- topics_count: {len(topics)}')
lines.append(f'- total_pages_field: {meta.get("totalPages")}')
lines.append(f'- actual_pages_in_metadata: {len(all_pages)}')
lines.append(f'- quadratic_inside_equations: {len(quadratic_inside_equations)}')
lines.append(f'- duplicate_file_entries: {len(dups)}')
lines.append('')
lines.append('## Canonical / compatibility snapshot')
lines.append('- canonical: preview/topics.*, preview/print.*, preview/all-pages.*, mobile-app.*')
lines.append('- compatibility / legacy-adjacent: preview/phone.*, preview/print-center.js')
lines.append('')
if failed == 0:
    lines.append('## Final judgment')
    lines.append('- all audited product requirements in this pass are currently satisfied.')
else:
    lines.append('## Final judgment')
    lines.append('- some audited requirements still fail in this pass and require targeted repair.')

report = state / 'MASTER_CONFORMANCE_AUDIT.md'
report.write_text('\\n'.join(lines), encoding='utf-8')

json_report = state / 'MASTER_CONFORMANCE_AUDIT.json'
json_report.write_text(json.dumps({
    'generated': human,
    'total_checks': len(checks),
    'passed': passed,
    'failed': failed,
    'checks': checks,
    'public_results': [{'name': n, 'ok': ok, 'details': d} for n, ok, d in public_results],
    'topics_count': len(topics),
    'actual_pages_in_metadata': len(all_pages),
    'quadratic_inside_equations': len(quadratic_inside_equations),
    'duplicate_file_entries': len(dups),
}, ensure_ascii=False, indent=2), encoding='utf-8')

print('MASTER CONFORMANCE AUDIT COMPLETE')
print(f'REPORT={report}')
print(f'JSON={json_report}')
print(f'TOTAL_CHECKS={len(checks)}')
print(f'PASSED={passed}')
print(f'FAILED={failed}')
print(f'PUBLIC_OK={public_ok}/{len(public_results)}')
print(f'QUADRATIC_INSIDE_EQUATIONS={len(quadratic_inside_equations)}')
print(f'DUPLICATE_FILE_ENTRIES={len(dups)}')
