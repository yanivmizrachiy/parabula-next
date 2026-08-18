#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKBOOKS = ROOT / "workbooks"
SOURCE_REPO = "https://github.com/yanivmizrachiy/smartschool-hebrew-voice-notes.git"


def run(*args: str, cwd: Path | None = None) -> None:
    subprocess.run(args, cwd=cwd, check=True)


def copy_dir(src: Path, dst: Path) -> None:
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(src, dst)


def reader(title: str, total: int, subtitle: str) -> str:
    return f'''<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{title}</title>
  <style>
    *{{box-sizing:border-box}} body{{margin:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#172033}}
    .bar{{position:sticky;top:0;z-index:10;background:#fff;border-bottom:1px solid #d9e2ef;padding:10px 14px;display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap}}
    .title{{font-weight:800;font-size:18px;margin-inline-end:12px}} .sub{{font-size:13px;color:#52627a}}
    button,a,input{{font:inherit}} button,.link{{border:1px solid #b9c8da;background:#fff;border-radius:10px;padding:8px 12px;cursor:pointer;text-decoration:none;color:#172033}}
    button:hover,.link:hover{{background:#eef4fb}} input{{width:72px;border:1px solid #b9c8da;border-radius:9px;padding:8px;text-align:center}}
    .frame-wrap{{max-width:1050px;margin:14px auto;padding:0 10px}} iframe{{display:block;width:100%;height:calc(100vh - 92px);min-height:760px;border:1px solid #ced9e8;border-radius:14px;background:#fff;box-shadow:0 8px 30px rgba(42,61,89,.08)}}
    @media(max-width:700px){{.title{{width:100%;text-align:center}} .sub{{display:none}} iframe{{height:calc(100vh - 135px);min-height:620px}}}}
  </style>
</head>
<body>
  <nav class="bar" aria-label="ניווט בחוברת">
    <span class="title">{title}</span><span class="sub">{subtitle}</span>
    <button id="prev" type="button">הקודם</button>
    <span>עמוד <input id="page" type="number" min="1" max="{total}" value="1" inputmode="numeric"> מתוך {total}</span>
    <button id="next" type="button">הבא</button>
    <a id="open" class="link" href="page-1.html" target="_blank" rel="noopener">פתח דף מלא</a>
    <a class="link" href="../index.html">כל החוברות</a>
  </nav>
  <div class="frame-wrap"><iframe id="sheet" title="{title} — עמוד 1" src="page-1.html"></iframe></div>
  <script>
    const total={total};
    const input=document.getElementById('page'), frame=document.getElementById('sheet'), open=document.getElementById('open');
    function go(n){{n=Math.max(1,Math.min(total,Number(n)||1));input.value=n;const u=`page-${{n}}.html`;frame.src=u;frame.title=`{title} — עמוד ${{n}}`;open.href=u;history.replaceState(null,'',`#page=${{n}}`);}}
    document.getElementById('prev').onclick=()=>go(Number(input.value)-1);
    document.getElementById('next').onclick=()=>go(Number(input.value)+1);
    input.onchange=()=>go(input.value);
    const m=location.hash.match(/page=(\d+)/); if(m) go(m[1]);
  </script>
</body>
</html>
'''


def landing() -> str:
    return '''<!doctype html>
<html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>חוברות גאומטריה — מעגל, גליל וחרוט</title>
<style>*{box-sizing:border-box}body{margin:0;background:#f6f8fc;font-family:Arial,sans-serif;color:#172033}.wrap{max-width:980px;margin:auto;padding:34px 18px}h1{font-size:clamp(28px,5vw,46px);margin:0 0 8px}.lead{color:#52627a;margin-bottom:28px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.card{display:block;background:#fff;border:1px solid #d6e0ec;border-radius:18px;padding:24px;text-decoration:none;color:inherit;box-shadow:0 8px 28px rgba(42,61,89,.07)}.card:hover{transform:translateY(-2px)}.n{font-size:34px;font-weight:900}.t{font-size:22px;font-weight:800;margin:6px 0}.d{color:#5a6980;line-height:1.5}.badge{display:inline-block;margin-top:14px;border:1px solid #c6d4e5;border-radius:999px;padding:6px 10px;font-size:13px}@media(max-width:760px){.grid{grid-template-columns:1fr}}</style></head>
<body><main class="wrap"><h1>חוברות גאומטריה</h1><p class="lead">מקור האמת היחיד ב־razpages: מעגל, גליל וחרוט.</p><div class="grid">
<a class="card" href="circle/index.html"><div class="n">88</div><div class="t">מעגל</div><div class="d">מתחיל במושגים הבסיסיים: מעגל לעומת עיגול, וממשיך ברצף עד העמוד האחרון.</div><span class="badge">פתח חוברת</span></a>
<a class="card" href="cylinder/index.html"><div class="n">38</div><div class="t">גליל</div><div class="d">כל דפי הגליל שהיו במקור, ברצף אחד ובאותו ריפו.</div><span class="badge">פתח חוברת</span></a>
<a class="card" href="cone/index.html"><div class="n">46</div><div class="t">חרוט</div><div class="d">חוברת החרוט המלאה, כולל דף ההמחשה המקורי וכל נכסי האיור.</div><span class="badge">פתח חוברת</span></a>
</div></main></body></html>'''


def page_numbers(folder: Path) -> list[int]:
    return sorted(int(p.stem.split("-")[1]) for p in folder.glob("page-*.html"))


def main() -> None:
    WORKBOOKS.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="geometry-source-") as td:
        src = Path(td) / "source"
        run("git", "clone", "--depth", "1", SOURCE_REPO, str(src))

        copy_dir(src / "circle", WORKBOOKS / "circle")
        copy_dir(src / "cylinder", WORKBOOKS / "cylinder")
        copy_dir(src / "visual-assets", WORKBOOKS / "visual-assets")

        cone = WORKBOOKS / "cone"
        if cone.exists():
            shutil.rmtree(cone)
        cone.mkdir(parents=True)
        shutil.copy2(src / "print" / "harut-a4.html", cone / "index.html")
        shutil.copy2(src / "print" / "styles.css", cone / "styles.css")
        shutil.copytree(src / "print" / "assets", cone / "assets")

    (WORKBOOKS / "circle" / "index.html").write_text(reader("חוברת המעגל", 88, "מעגל ועיגול — מהעמוד הראשון ועד האחרון"), encoding="utf-8")
    (WORKBOOKS / "cylinder" / "index.html").write_text(reader("חוברת הגליל", 38, "כל דפי הגליל ברצף אחד"), encoding="utf-8")
    (WORKBOOKS / "index.html").write_text(landing(), encoding="utf-8")

    manifest = {
        "canonicalRepository": "yanivmizrachiy/razpages",
        "canonicalRoot": "workbooks",
        "sourceOfTruth": True,
        "workbooks": {
            "circle": {"title": "מעגל", "pages": 88, "entry": "workbooks/circle/index.html", "firstPage": "workbooks/circle/page-1.html"},
            "cylinder": {"title": "גליל", "pages": 38, "entry": "workbooks/cylinder/index.html", "firstPage": "workbooks/cylinder/page-1.html"},
            "cone": {"title": "חרוט", "pages": 46, "entry": "workbooks/cone/index.html"},
        },
    }
    (WORKBOOKS / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    (ROOT / "geometry-workbooks.html").write_text(
        '<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>חוברות גאומטריה</title><meta http-equiv="refresh" content="0;url=workbooks/index.html"><script>location.replace(\'workbooks/index.html\'+location.hash)</script></head><body><a href="workbooks/index.html">מעבר לחוברות הגאומטריה</a></body></html>',
        encoding="utf-8",
    )

    copy_script = ROOT / "scripts" / "copy-static-site.mjs"
    text = copy_script.read_text(encoding="utf-8")
    old = "const dirs = ['styles', 'meta', 'preview', 'pages', 'vendor', 'assets'];"
    new = "const dirs = ['styles', 'meta', 'preview', 'pages', 'vendor', 'assets', 'workbooks'];"
    if new not in text:
        if old not in text:
            raise RuntimeError("canonical dirs declaration not found in copy-static-site.mjs")
        copy_script.write_text(text.replace(old, new), encoding="utf-8")

    circle = page_numbers(WORKBOOKS / "circle")
    cylinder = page_numbers(WORKBOOKS / "cylinder")
    if circle != list(range(1, 89)):
        raise RuntimeError(f"circle sequence mismatch: {circle}")
    if cylinder != list(range(1, 39)):
        raise RuntimeError(f"cylinder sequence mismatch: {cylinder}")

    first = (WORKBOOKS / "circle" / "page-1.html").read_text(encoding="utf-8")
    if not all(x in first for x in ("מושגים בסיסיים", "המעגל הוא קו הגבול", "העיגול הוא התחום")):
        raise RuntimeError("circle page 1 is not the required basic-concepts opening page")

    cone_text = (WORKBOOKS / "cone" / "index.html").read_text(encoding="utf-8")
    cone_pages = sorted(set(map(int, re.findall(r'data-local-page="(\d+)"', cone_text))))
    if cone_pages != list(range(1, 47)):
        raise RuntimeError(f"cone sequence mismatch: {cone_pages}")
    if not (WORKBOOKS / "cone" / "assets" / "ayelet-original-cone.png").is_file():
        raise RuntimeError("missing cone source image")
    if not (WORKBOOKS / "visual-assets" / "cone-3d-upright.svg").is_file():
        raise RuntimeError("missing cone 3D asset")

    print("Validated canonical geometry workbooks: circle=88, cylinder=38, cone=46")


if __name__ == "__main__":
    main()
