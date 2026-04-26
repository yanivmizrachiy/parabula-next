#!/usr/bin/env python3
from pathlib import Path
import json, subprocess, sys, datetime

ROOT = Path('/data/data/com.termux/files/home/parabula-next')
STATE = ROOT / 'STATE'
AUDIT_JSON = STATE / 'MASTER_CONFORMANCE_AUDIT.json'
AUDIT_MD = STATE / 'MASTER_CONFORMANCE_AUDIT.md'
SUMMARY_MD = STATE / 'MASTER_STATUS_SUMMARY.md'
POSTCHECK_MD = STATE / 'METADATA_REPAIR_POSTCHECK.md'

URLS = {
    'topics': 'https://yanivmizrachiy.github.io/parabula-next/preview/topics.html',
    'print': 'https://yanivmizrachiy.github.io/parabula-next/preview/print.html',
    'all': 'https://yanivmizrachiy.github.io/parabula-next/preview/all-pages.html',
    'mobile': 'https://yanivmizrachiy.github.io/parabula-next/mobile-app.html',
    'app': 'https://yanivmizrachiy.github.io/parabula-next/preview/app.html',
    'rules': 'https://github.com/yanivmizrachiy/parabula-next/blob/main/PROJECT_RULES.md',
}

def run(cmd, check=True):
    return subprocess.run(cmd, text=True, check=check)

def run_capture(cmd):
    return subprocess.run(cmd, text=True, check=True, capture_output=True)

def open_url(url):
    try:
        run(['termux-open-url', url], check=True)
        print(f'OPENED={url}')
    except Exception as e:
        print(f'OPEN_FAILED={url}')
        print(f'ERROR={e}')

def load_audit():
    if not AUDIT_JSON.exists():
        return None
    return json.loads(AUDIT_JSON.read_text(encoding='utf-8'))

def write_summary(data):
    ts = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    total = data.get('total_checks', 0)
    passed = data.get('passed', 0)
    failed = data.get('failed', 0)
    public = data.get('public_results', [])
    public_ok = sum(1 for x in public if x.get('ok'))
    lines = [
        '# MASTER_STATUS_SUMMARY',
        '',
        f'Generated: {ts}',
        '',
        '## Current status',
        f'- total_checks: {total}',
        f'- passed: {passed}',
        f'- failed: {failed}',
        f'- public_ok: {public_ok}/{len(public)}',
        f'- quadratic_inside_equations: {data.get("quadratic_inside_equations","?")}',
        f'- duplicate_file_entries: {data.get("duplicate_file_entries","?")}',
        '',
        '## Result',
        '- shell is stable and validated.' if failed == 0 else '- shell still has failing checks.',
    ]
    if POSTCHECK_MD.exists():
        lines += [
            '',
            '## Metadata repair postcheck',
            '- STATE/METADATA_REPAIR_POSTCHECK.md exists and is kept as evidence.',
        ]
    SUMMARY_MD.write_text('\n'.join(lines), encoding='utf-8')

def print_status(data):
    total = data.get('total_checks', 0)
    passed = data.get('passed', 0)
    failed = data.get('failed', 0)
    public = data.get('public_results', [])
    public_ok = sum(1 for x in public if x.get('ok'))
    print('STATUS=READY')
    print(f'TOTAL_CHECKS={total}')
    print(f'PASSED={passed}')
    print(f'FAILED={failed}')
    print(f'PUBLIC_OK={public_ok}/{len(public)}')
    print(f'QUADRATIC_INSIDE_EQUATIONS={data.get("quadratic_inside_equations","?")}')
    print(f'DUPLICATE_FILE_ENTRIES={data.get("duplicate_file_entries","?")}')

def doctor():
    import os
    os.chdir(ROOT)
    run(['git', 'pull', '--ff-only', 'origin', 'main'], check=False)
    run(['python3', 'tools/master_conformance_audit.py'], check=True)
    data = load_audit()
    if data is None:
        print('STATUS=NO_AUDIT_JSON')
        sys.exit(1)
    write_summary(data)
    add_list = [
        'tools/master_conformance_audit.py',
        'tools/parabula_ops.py',
        'STATE/MASTER_CONFORMANCE_AUDIT.md',
        'STATE/MASTER_CONFORMANCE_AUDIT.json',
        'STATE/MASTER_STATUS_SUMMARY.md',
    ]
    if POSTCHECK_MD.exists():
        add_list.append('STATE/METADATA_REPAIR_POSTCHECK.md')
    run(['git', 'add', *add_list], check=False)
    diff = run_capture(['git', 'status', '--short']).stdout.strip()
    if diff:
        subprocess.run(['git', 'commit', '-m', 'chore(ops): refresh audit, summary and pbook control'], text=True, check=False)
        subprocess.run(['git', 'push', 'origin', 'main'], text=True, check=False)
        print('COMMITTED=YES')
    else:
        print('COMMITTED=NO')
    print_status(data)

def status():
    data = load_audit()
    if data is None:
        print('STATUS=NO_AUDIT_YET')
        return
    write_summary(data)
    print_status(data)

def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'status'
    if cmd == 'status':
        status()
    elif cmd == 'doctor':
        doctor()
    elif cmd in URLS:
        open_url(URLS[cmd])
    elif cmd == 'live':
        open_url(URLS['topics'])
    else:
        print('USAGE=pbook [status|doctor|topics|print|all|mobile|app|rules|live]')
        sys.exit(1)

if __name__ == '__main__':
    main()
