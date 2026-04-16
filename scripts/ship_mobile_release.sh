#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
export LANG=C.UTF-8 LC_ALL=C.UTF-8
cd "$HOME/parabula-next" || exit 1

VER="$(date +%Y%m%d%H%M%S)"
mkdir -p STATE "STATE/mobile_release_backups_$VER"

for f in mobile-app.html mobile-app.js mobile-app.css mobile-app.webmanifest mobile-app-install.html sw.js; do
  [ -f "$f" ] && cp -f "$f" "STATE/mobile_release_backups_$VER/${f//\//__}"
done

python3 - <<PY
from pathlib import Path
import json, re

ver = "${VER}"
files = [
    Path("mobile-app.html"),
    Path("mobile-app-install.html"),
]

def replace_or_add_versioned_ref(text, attr, path):
    pattern = rf'{attr}="{re.escape(path)}(?:\\?v=[^"]*)?"'
    repl = f'{attr}="{path}?v={ver}"'
    if re.search(pattern, text):
        return re.sub(pattern, repl, text)
    return text

for p in files:
    if p.exists():
        txt = p.read_text(encoding="utf-8", errors="ignore")
        txt = replace_or_add_versioned_ref(txt, "href", "./mobile-app.css")
        txt = replace_or_add_versioned_ref(txt, "src", "./mobile-app.js")
        txt = replace_or_add_versioned_ref(txt, "href", "./mobile-app.webmanifest")
        txt = replace_or_add_versioned_ref(txt, "href", "./icon.svg")
        txt = re.sub(r'<!-- MOBILE-RELEASE:[^>]*-->', '', txt)
        txt += f'\\n<!-- MOBILE-RELEASE:{ver} -->\\n'
        p.write_text(txt, encoding="utf-8")

manifest = Path("mobile-app.webmanifest")
if manifest.exists():
    data = json.loads(manifest.read_text(encoding="utf-8"))
    data["start_url"] = f"./mobile-app.html?v={ver}"
    if "icons" in data and isinstance(data["icons"], list):
        for icon in data["icons"]:
            src = icon.get("src")
            if src and "icon.svg" in src:
                icon["src"] = f"./icon.svg?v={ver}"
    manifest.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

sw = Path("sw.js")
sw.write_text(f"""const CACHE_NAME = 'parabula-mobile-{ver}';

self.addEventListener('install', event => {{
  self.skipWaiting();
}});

self.addEventListener('activate', event => {{
  event.waitUntil((async () => {{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  }})());
}});

self.addEventListener('fetch', event => {{
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  event.respondWith((async () => {{
    try {{
      const fresh = await fetch(req, {{ cache: 'no-store' }});
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, fresh.clone());
      return fresh;
    }} catch (err) {{
      const cached = await caches.match(req);
      if (cached) return cached;
      throw err;
    }}
  }})());
}});
""", encoding="utf-8")

js = Path("mobile-app.js")
if js.exists():
    txt = js.read_text(encoding="utf-8", errors="ignore")
    marker = "window.__parabulaSwRegistered"
    if marker not in txt:
        txt += f"""

if ('serviceWorker' in navigator && !window.__parabulaSwRegistered) {{
  window.__parabulaSwRegistered = true;
  window.addEventListener('load', () => {{
    navigator.serviceWorker.register('./sw.js?v={ver}').then(reg => {{
      if (reg.update) reg.update();
    }}).catch(console.error);
  }});
}}
"""
    else:
        txt = re.sub(r"register\('./sw\.js\?v=[^']*'\)", f"register('./sw.js?v={ver}')", txt)
    js.write_text(txt, encoding="utf-8")

Path("STATE/mobile_release_current.txt").write_text(ver + "\\n", encoding="utf-8")
print(ver)
PY

git add mobile-app.html mobile-app-install.html mobile-app.js mobile-app.css mobile-app.webmanifest sw.js STATE scripts/ship_mobile_release.sh
git commit -m "fix: add permanent mobile release cache-busting flow ($VER)" || true
git push origin main

printf '\n=== LIVE RELEASE CHECK ===\n'
for u in \
"https://yanivmizrachiy.github.io/parabula-next/mobile-app.html?v=$VER" \
"https://yanivmizrachiy.github.io/parabula-next/mobile-app.webmanifest?v=$VER" \
"https://yanivmizrachiy.github.io/parabula-next/sw.js?v=$VER"
do
  echo "--- $u"
  curl -L --retry 2 --retry-delay 2 --connect-timeout 15 --max-time 40 -I "$u" | sed -n '1,12p'
done
echo '---'
echo "APP: https://yanivmizrachiy.github.io/parabula-next/mobile-app.html?v=$VER"
echo "VERSION: $VER"
