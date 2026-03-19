# Next session guide — parabula-next

## Where to work
Always open: C:\Users\yaniv\parabula-work
In VS Code: File > Open Folder > C:\Users\yaniv\parabula-work

## How to start every session
1. Open VS Code on C:\Users\yaniv\parabula-work
2. Run task: parabula-next: preview server
3. Open http://127.0.0.1:5179/preview
4. Verify GitHub Pages: https://yanivmizrachiy.github.io/parabula-next/

## Current state
- 95 worksheet pages — all contracts pass
- Preview: working
- GitHub Pages: configured, needs verification after next push
- Metadata: topics.json generated with auto-classification

## How to add a new page
npm run page:new -- N
(replace N with the next page number)

## How to validate before committing
npm test
npm run verify
npm run build

## How to commit safely
git add [specific files only]
git commit -m "type: short description"
git push

## What Copilot must not do
- Retry same edit more than twice
- Use icacls or takeown
- Run Stop-Process on Code
- Make large rewrites without approval
- Create fake buttons or fake topics

## Topics in use
- משפט פיתגורס: 95 pages