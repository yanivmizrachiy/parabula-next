#!/usr/bin/env python3
from pathlib import Path
import datetime, json, urllib.request, sys

ROOT = Path('/data/data/com.termux/files/home/parabula-next')
STATE = ROOT / 'STATE'
STATE.mkdir(parents=True, exist_ok=True)

MASTER_JSON = STATE / 'MASTER_CONFORMANCE_AUDIT.json'
EXTERNAL_JSON = STATE / 'EXTERNAL_LINK_AUDIT.json'

FILES = {
    'app_html': ROOT / 'preview' / 'app.html',
    'topics_html': ROOT / 'preview' / 'topics.html',
    'topics_js': ROOT / 'preview' / 'topics.js',
    'topics_css': ROOT / 'preview' / 'topics.css',
    'all_pages_html': ROOT / 'preview' / 'all-pages.html',
    'all_pages_js': ROOT / 'preview' / 'all-pages.js',
    'print_html': ROOT / 'preview' / 'print.html',
    'print_js': ROOT / 'preview' / 'print.js',
    'rules': ROOT / 'PROJECT_RULES.md',
}

missing = [k for k, v in FILES.items() if not v.exists()]
if missing:
    print('ERROR: missing required files')
    for m in missing:
        print('MISSING=' + m)
    sys.exit(1)

if not MASTER_JSON.exists():
    print('ERROR: missing STATE/MASTER_CONFORMANCE_AUDIT.json')
    sys.exit(1)
if not EXTERNAL_JSON.exists():
    print('ERROR: missing STATE/EXTERNAL_LINK_AUDIT.json')
    sys.exit(1)

master = json.loads(MASTER_JSON.read_text(encoding='utf-8'))
external = json.loads(EXTERNAL_JSON.read_text(encoding='utf-8'))

app_html = FILES['app_html'].read_text(encoding='utf-8')
topics_html = FILES['topics_html'].read_text(encoding='utf-8')
topics_js = FILES['topics_js'].read_text(encoding='utf-8')
topics_css = FILES['topics_css'].read_text(encoding='utf-8')
all_pages_html = FILES['all_pages_html'].read_text(encoding='utf-8')
all_pages_js = FILES['all_pages_js'].read_text(encoding='utf-8')
print_html = FILES['print_html'].read_text(encoding='utf-8')
print_js = FILES['print_js'].read_text(encoding='utf-8')
rules = FILES['rules'].read_text(encoding='utf-8').lower()

HUMAN = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

checks = []
def add(name, ok, details=''):
    checks.append({'name': name, 'ok': bool(ok), 'details': details})

public_ok = sum(1 for x in master.get('public_results', []) if x.get('ok'))
add('master_audit_all_green', master.get('failed', 999) == 0, f"passed={master.get('passed')} failed={master.get('failed')}")
add('public_ok_5_of_5', public_ok == 5, f'public_ok={public_ok}/5')
add('metadata_clean', master.get('quadratic_inside_equations', 999) == 0 and master.get('duplicate_file_entries', 999) == 0, f"quadratic_inside_equations={master.get('quadratic_inside_equations')} duplicate_file_entries={master.get('duplicate_file_entries')}")

add('app_is_redirect_entry', 'http-equiv="refresh"' in app_html and 'topics.html' in app_html, 'preview/app.html should redirect to topics')
add('rules_document_redirect_entry', 'redirect entry' in rules and 'preview/app.html' in rules, 'rules should document redirect entry')
add('rules_document_all_pages_secondary', 'secondary utility' in rules, 'rules should keep all-pages secondary')

add('topics_has_reader_bar', 'reader-bar' in topics_html and 'readerPageTitle' in topics_html, 'topics.html should expose main reader bar')
add('topics_has_mobile_bottom_bar', 'mobile-reader-bar' in topics_html and 'mPrevPageBtn' in topics_html, 'topics.html should expose mobile bottom bar')
add('topics_has_prev_next_first_logic', all(k in topics_js for k in ['prevPageBtn', 'nextPageBtn', 'firstPageBtn', 'stepPage', 'goFirstPage']), 'topics.js should support first/prev/next')
add('topics_has_persistence', all(k in topics_js for k in ['LAST_TOPIC_KEY', 'LAST_FILE_KEY', 'savePosition', 'loadLastTopic', 'loadLastFile']), 'topics.js should persist last place')
add('topics_has_mobile_css', '@media (max-width:980px)' in topics_css and 'mobile-reader-bar' in topics_css, 'topics.css should support phone UX')

add('all_pages_has_download_action', 'downloadSelectionBtn' in all_pages_js, 'all-pages.js should expose download selection')
add('all_pages_has_print_action', 'printSelectedBtn' in all_pages_js, 'all-pages.js should expose print selection')
add('all_pages_has_share_action', 'shareSelectionBtn' in all_pages_js, 'all-pages.js should expose share selection')
add('all_pages_surface_exists', ('כל הדפים' in all_pages_html) or ('all-pages' in all_pages_html.lower()), 'all-pages.html should be live')
add('print_surface_exists', ('pdf' in print_html.lower()) or ('print' in print_html.lower()), 'print.html should be live')
add('print_js_restore_selection', ('restoreSelectionBtn' in print_js) or ('restoreSelection' in print_js), 'print.js should support restore/selection flow')

suspicious = external.get('suspicious_findings', []) or []
dup_ext = external.get('duplicate_external_urls', {}) or {}
public_app_prefix = 'https://yanivmizrachiy.github.io/parabula-next/'
github_repo_prefix = 'https://github.com/yanivmizrachiy/parabula-next'

def classify(url: str):
    if url.startswith(public_app_prefix):
        return 'public-app'
    if url.startswith(github_repo_prefix):
        return 'repo-github'
    if url.startswith('https://yanivmizrachiy.github.io/'):
        return 'other-yaniv-pages'
    return 'external'

dup_public_app = {u: refs for u, refs in dup_ext.items() if classify(u) == 'public-app'}
dup_repo = {u: refs for u, refs in dup_ext.items() if classify(u) == 'repo-github'}
dup_other = {u: refs for u, refs in dup_ext.items() if classify(u) == 'external'}

real_public_confusion = []
for s in suspicious:
    if 'preview/phone.html' in s and 'mobile-app.html' in s:
        real_public_confusion.append(s)
    elif 'preview/app.html' in s and 'preview/topics.html' in s:
        if not ('http-equiv="refresh"' in app_html and 'topics.html' in app_html):
            real_public_confusion.append(s)
    elif 'all-pages' in s and 'topics' in s:
        if 'secondary utility' not in rules:
            real_public_confusion.append(s)
    else:
        real_public_confusion.append(s)

add('no_real_public_link_confusion', len(real_public_confusion) == 0, f"real_public_confusion={len(real_public_confusion)}")
add('no_duplicate_public_app_urls', len(dup_public_app) == 0, f"duplicate_public_app_urls={len(dup_public_app)}")

routes = {
    'topics': 'https://yanivmizrachiy.github.io/parabula-next/preview/topics.html',
    'all_pages': 'https://yanivmizrachiy.github.io/parabula-next/preview/all-pages.html',
    'print': 'https://yanivmizrachiy.github.io/parabula-next/preview/print.html',
}
route_expect = {
    'topics': ['דפדוף לפי נושאים'],
    'all_pages': ['כל הדפים'],
    'print': ['print', 'pdf'],
}
for name, url in routes.items():
    ok = False
    detail = ''
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=25) as r:
            body = r.read().decode('utf-8', errors='replace').lower()
            missing = [m for m in route_expect[name] if m.lower() not in body]
            ok = getattr(r, 'status', 200) == 200 and not missing
            detail = f"status={getattr(r, 'status', 200)} missing={missing} final={r.geturl()}"
    except Exception as e:
        detail = str(e)
    add(f'public_route_{name}_ok', ok, detail)

passed = sum(1 for c in checks if c['ok'])
failed = len(checks) - passed

md_lines = [
    '# RELEASE_GATE_AUDIT',
    '',
    f'Generated: {HUMAN}',
    '',
    f'- total_checks: {len(checks)}',
    f'- passed: {passed}',
    f'- failed: {failed}',
    '',
    '## Check results',
]
for c in checks:
    md_lines.append(f"- [{'PASS' if c['ok'] else 'FAIL'}] {c['name']} :: {c['details']}")
md_lines += [
    '',
    '## External link actionable interpretation',
    f'- suspicious_findings_raw: {len(suspicious)}',
    f'- duplicate_public_app_urls: {len(dup_public_app)}',
    f'- duplicate_repo_github_urls: {len(dup_repo)}',
    f'- duplicate_other_external_urls: {len(dup_other)}',
]
if real_public_confusion:
    md_lines.append('- real_public_confusion:')
    for s in real_public_confusion:
        md_lines.append(f'  - {s}')
else:
    md_lines.append('- real_public_confusion: none')
md_lines += [
    '',
    '## Final judgment',
    '- release gate PASSED: topic-first home, topic browsing, all-pages browsing, print/pdf, metadata integrity, and public route checks are all green in this pass.' if failed == 0 else '- release gate NOT YET PASSED: some focused checks still fail and require targeted repair.'
]

report_md = STATE / 'RELEASE_GATE_AUDIT.md'
report_md.write_text('\n'.join(md_lines), encoding='utf-8')

report_json = STATE / 'RELEASE_GATE_AUDIT.json'
report_json.write_text(json.dumps({
    'generated': HUMAN,
    'total_checks': len(checks),
    'passed': passed,
    'failed': failed,
    'checks': checks,
    'suspicious_findings_raw': suspicious,
    'real_public_confusion': real_public_confusion,
    'duplicate_public_app_urls': dup_public_app,
    'duplicate_repo_github_urls': dup_repo,
    'duplicate_other_external_urls': dup_other,
}, ensure_ascii=False, indent=2), encoding='utf-8')

print('RELEASE GATE AUDIT COMPLETE')
print(f'REPORT={report_md}')
print(f'JSON={report_json}')
print(f'TOTAL_CHECKS={len(checks)}')
print(f'PASSED={passed}')
print(f'FAILED={failed}')
print(f'RAW_SUSPICIOUS_FINDINGS={len(suspicious)}')
print(f'REAL_PUBLIC_CONFUSION={len(real_public_confusion)}')
print(f'DUPLICATE_PUBLIC_APP_URLS={len(dup_public_app)}')
print(f'QUADRATIC_INSIDE_EQUATIONS={master.get("quadratic_inside_equations", "?")}')
print(f'DUPLICATE_FILE_ENTRIES={master.get("duplicate_file_entries", "?")}')
