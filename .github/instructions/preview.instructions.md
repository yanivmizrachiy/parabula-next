---
applyTo: "preview/**,meta/**,.vscode/**"
---
When working on preview, metadata, or VS Code workspace files in this repository:

- Preserve compatibility with real worksheet files at repository root.
- Ensure preview navigation maps only to existing `עמוד-N.html` files.
- Prefer improvements over rewrites.
- Keep preview stable for daily editing use.
- Keep links to the real GitHub Pages site accurate.
- Avoid introducing assumptions that are not backed by repository files.
- If editing metadata, derive values from actual files whenever possible.