from pathlib import Path

path = Path('scripts/export-ratio-workbook-live.mjs')
text = path.read_text(encoding='utf-8')
old = '''.ratio-live-page {
  position: relative;
  margin: 0;
  padding: 0;
  box-shadow: none;
  border: 0;
  overflow: visible;
}

.ratio-live-page > .gz-footer {'''
new = '''.ratio-live-page {
  position: relative;
  display: block;
  margin: 0;
  padding: 0;
  box-shadow: none;
  border: 0;
  overflow: visible;
}

/* a4-base.css is shared by the whole book and has legacy selectors that
   collide with the React workbook class names. Re-establish the verified
   React geometry inside ratio canonical pages instead of clipping content. */
.ratio-live-page > .header-container {
  margin-bottom: 0;
}

.ratio-live-page .page-title {
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
}

.ratio-live-page .question-block {
  flex-direction: row;
  justify-content: flex-start;
}

.ratio-live-page .multiple-choice {
  justify-content: flex-start;
  width: auto;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  direction: inherit;
}

.ratio-live-page > .gz-footer {'''
count = text.count(old)
if count != 1:
    raise SystemExit(f'Expected one semantic shell block, found {count}')
text = text.replace(old, new)
if 'overflow: hidden;' in text[text.index('.ratio-live-page {'):text.index('.ratio-live-page > .gz-footer {')]:
    raise SystemExit('Semantic shell must not hide overflow')
path.write_text(text, encoding='utf-8')
print('semantic shell collision resets applied')
