from pathlib import Path
import base64,tarfile
r=Path(__file__).resolve().parent
s=''.join(p.read_text().strip() for p in sorted((r/'source').glob('source-*.txt')))
a=r/'source-bundle.tar.gz';a.write_bytes(base64.b64decode(s))
o=r/'restored-source';o.mkdir(exist_ok=True)
with tarfile.open(a,'r:gz') as t:t.extractall(o)
print(o)
