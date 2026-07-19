"""מודד את קובצי ה-PDF שנוצרו ב-audit-linear-print: מספר עמודים ומידות A4."""
import sys, os, glob, json
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import fitz

OUT = os.path.join('STATE', 'reports', 'linear-print')
A4_W, A4_H = 210 / 25.4 * 72, 297 / 25.4 * 72
TOL = 1.5
rows, findings = [], []
for f in sorted(glob.glob(os.path.join(OUT, '*.pdf'))):
    d = fitz.open(f)
    n = d.page_count
    r = d[0].rect
    name = os.path.basename(f).replace('.pdf', '.html')
    rows.append({'file': name, 'pages': n, 'w': round(r.width, 1), 'h': round(r.height, 1)})
    if n != 1:
        findings.append(f'{name}: ההדפסה יוצרת {n} עמודים במקום 1 — שבירת עמוד בתוך דף העבודה')
    if abs(r.width - A4_W) > TOL or abs(r.height - A4_H) > TOL:
        findings.append(f'{name}: מידות {r.width:.1f}x{r.height:.1f} אינן A4 ({A4_W:.1f}x{A4_H:.1f})')
    d.close()
print('=' * 60)
print(f'{"קובץ":22s} {"עמודים":8s} מידות')
print('-' * 60)
for r in rows:
    print(f'{r["file"]:22s} {str(r["pages"]):8s} {r["w"]}x{r["h"]}')
print('=' * 60)
json.dump({'rows': rows, 'findings': findings},
          open(os.path.join(OUT, 'measure.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
if findings:
    print(f'\n[FAIL] {len(findings)} ממצאים:')
    for x in findings:
        print('  X ' + x)
    sys.exit(1)
print(f'\n[OK] כל {len(rows)} הדפים: עמוד A4 יחיד במידות מדויקות.')
