#!/usr/bin/env python3
from pathlib import Path
import re, json, datetime, sys

ROOT = Path('/data/data/com.termux/files/home/parabula-next')
STATE = ROOT / 'STATE'
STATE.mkdir(parents=True, exist_ok=True)

TARGET_EXTS = {'.html', '.js', '.css', '.md', '.json', '.webmanifest', '.mjs', '.yml', '.yaml'}
IGNORE_DIRS = {'.git', 'node_modules'}

URL_RE = re.compile(r'https?://[^\s"\')<>]+')
REL_RE = re.compile(r'''(?:href|src|url)\s*=\s*["']([^"']+)["']''', re.I)

rules_path = ROOT / 'PROJECT_RULES.md'
if not rules_path.exists():
    print('ERROR: PROJECT_RULES.md not found')
    sys.exit(1)

rules = rules_path.read_text(encoding='utf-8').lower()

files = []
for p in ROOT.rglob('*'):
    if not p.is_file():
        continue
    if any(part in IGNORE_DIRS for part in p.parts):
        continue
    if p.suffix.lower() in TARGET_EXTS:
        files.append(p)

records = []
external_map = {}
public_app_prefix = 'https://yanivmizrachiy.github.io/parabula-next/'
github_repo_prefix = 'https://github.com/yanivmizrachiy/parabula-next'

def classify(url: str):
    u = url.strip()
    if u.startswith(public_app_prefix):
        return 'public-app'
    if u.startswith(github_repo_prefix):
        return 'repo-github'
    if u.startswith('https://yanivmizrachiy.github.io/'):
        return 'other-yaniv-pages'
    if u.startswith('http://') or u.startswith('https://'):
        return 'external'
    return 'relative-or-other'

for f in files:
    try:
        text = f.read_text(encoding='utf-8', errors='replace')
    except Exception:
        continue

    ext_urls = sorted(set(URL_RE.findall(text)))
    rel_urls = []
    for m in REL_RE.finditer(text):
        rel = m.group(1).strip()
        if rel.startswith('./') or rel.startswith('../') or rel.startswith('/'):
            rel_urls.append(rel)
    rel_urls = sorted(set(rel_urls))

    for url in ext_urls:
        rec = {
            'file': str(f.relative_to(ROOT)),
            'url': url,
            'kind': classify(url),
        }
        records.append(rec)
        external_map.setdefault(url, []).append(str(f.relative_to(ROOT)))

    for rel in rel_urls:
        records.append({
            'file': str(f.relative_to(ROOT)),
            'url': rel,
            'kind': 'relative-or-other',
        })

public_app_hits = [r for r in records if r['kind'] == 'public-app']
github_hits = [r for r in records if r['kind'] == 'repo-github']
other_pages_hits = [r for r in records if r['kind'] == 'other-yaniv-pages']
external_hits = [r for r in records if r['kind'] == 'external']

suspicious = []

def has_url(substr):
    return any(substr in r['url'] for r in records)

key_routes = {
    'topics': public_app_prefix + 'preview/topics.html',
    'print': public_app_prefix + 'preview/print.html',
    'all_pages': public_app_prefix + 'preview/all-pages.html',
    'mobile': public_app_prefix + 'mobile-app.html',
    'app': public_app_prefix + 'preview/app.html',
}

for key, url in key_routes.items():
    holders = [r['file'] for r in records if r['url'] == url]
    if not holders:
        suspicious.append(f'קישור ציבורי מרכזי לא נמצא בריפו: {url}')
    elif len(holders) > 8:
        suspicious.append(f'קישור ציבורי מרכזי מופיע בהרבה מדי מקומות ({len(holders)}): {url}')

# improved actionable logic:
# phone + mobile is acceptable if rules clearly define mobile-app canonical and preview/phone compat
phone_mobile_doc_ok = ('mobile app is the primary path' in rules or 'primary mobile path' in rules or 'preview/phone.* is a utility / legacy layer' in rules or 'preview/phone.* is a utility / legacy layer and must not be treated as the canonical mobile runtime' in rules)

app_topics_doc_ok = ('redirect entry' in rules and 'preview/app.html' in rules and 'preview/topics.html' in rules)
all_pages_secondary_ok = ('secondary utility' in rules and 'preview/all-pages.*' in rules)

if has_url('preview/phone.html') and has_url('mobile-app.html') and not phone_mobile_doc_ok:
    suspicious.append('נמצאו גם preview/phone.html וגם mobile-app.html — צריך לשמור ברור מי canonical ומי compat')

if has_url('preview/app.html') and has_url('preview/topics.html') and not app_topics_doc_ok:
    suspicious.append('נמצאו גם preview/app.html וגם preview/topics.html — צריך לתעד ש-app הוא redirect entry')

if has_url('preview/all-pages.html') and has_url('preview/topics.html') and not all_pages_secondary_ok:
    suspicious.append('נמצאו גם all-pages וגם topics — צריך לוודא ש-all-pages נשאר משני בלבד')

duplicate_external = {u: fs for u, fs in external_map.items() if len(fs) > 1}

human = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

lines = []
lines.append('# EXTERNAL_LINK_AUDIT')
lines.append('')
lines.append(f'Generated: {human}')
lines.append('')
lines.append(f'- scanned_files: {len(files)}')
lines.append(f'- total_link_records: {len(records)}')
lines.append(f'- public_app_links: {len(public_app_hits)}')
lines.append(f'- repo_github_links: {len(github_hits)}')
lines.append(f'- other_yaniv_pages_links: {len(other_pages_hits)}')
lines.append(f'- external_links: {len(external_hits)}')
lines.append(f'- duplicate_external_urls: {len(duplicate_external)}')
lines.append(f'- suspicious_findings: {len(suspicious)}')
lines.append('')
lines.append('## Key public route coverage')
for key, url in key_routes.items():
    holders = [r['file'] for r in records if r['url'] == url]
    lines.append(f'- {key}: {len(holders)} references :: {url}')
lines.append('')
lines.append('## Suspicious / review-needed findings')
if suspicious:
    for s in suspicious:
        lines.append(f'- {s}')
else:
    lines.append('- לא זוהו ממצאים חשודים בבדיקה זו.')
lines.append('')
lines.append('## Duplicate external URLs')
real_dup_count = 0
for u, fs in sorted(duplicate_external.items()):
    if classify(u) == 'external':
        real_dup_count += 1
        lines.append(f'- {u}')
        for f in fs[:15]:
            lines.append(f'  - {f}')
        if len(fs) > 15:
            lines.append(f'  - ... +{len(fs)-15} more')
if real_dup_count == 0:
    lines.append('- אין כפילויות URL חיצוניות אמיתיות.')
lines.append('')
lines.append('## Canonical recommendation')
lines.append(f'- canonical home entry: {key_routes["app"]}')
lines.append(f'- canonical topic browser: {key_routes["topics"]}')
lines.append(f'- canonical print entry: {key_routes["print"]}')
lines.append(f'- canonical all-pages utility: {key_routes["all_pages"]}')
lines.append(f'- canonical mobile entry: {key_routes["mobile"]}')
lines.append('- preview/phone.* should remain compatibility-only unless future rules change.')
lines.append('')
lines.append('## Final judgment')
if suspicious:
    lines.append('- יש ממצאים לבדיקה, אבל לא למחיקה אוטומטית.')
else:
    lines.append('- לא נמצאו כפילויות/בלבולים חיצוניים מהותיים בבדיקה זו.')

report_md = STATE / 'EXTERNAL_LINK_AUDIT.md'
report_md.write_text('\n'.join(lines), encoding='utf-8')

report_json = STATE / 'EXTERNAL_LINK_AUDIT.json'
report_json.write_text(json.dumps({
    'generated': human,
    'scanned_files': len(files),
    'total_link_records': len(records),
    'public_app_links': len(public_app_hits),
    'repo_github_links': len(github_hits),
    'other_yaniv_pages_links': len(other_pages_hits),
    'external_links': len(external_hits),
    'duplicate_external_urls': {k: v for k, v in duplicate_external.items() if classify(k) == 'external'},
    'suspicious_findings': suspicious,
    'key_routes': key_routes,
    'phone_mobile_doc_ok': phone_mobile_doc_ok,
    'app_topics_doc_ok': app_topics_doc_ok,
    'all_pages_secondary_ok': all_pages_secondary_ok,
}, ensure_ascii=False, indent=2), encoding='utf-8')

print('EXTERNAL LINK AUDIT COMPLETE')
print(f'REPORT={report_md}')
print(f'JSON={report_json}')
print(f'SCANNED_FILES={len(files)}')
print(f'TOTAL_LINK_RECORDS={len(records)}')
print(f'SUSPICIOUS_FINDINGS={len(suspicious)}')
print(f'EXTERNAL_LINKS={len(external_hits)}')
print(f'DUPLICATE_EXTERNAL_URLS={real_dup_count}')
