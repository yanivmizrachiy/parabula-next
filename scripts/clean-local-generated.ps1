param(
  [switch]$RunChecks
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$repo = (git rev-parse --show-toplevel 2>$null)
if (-not $repo) { throw 'Not inside a git repository.' }
Set-Location $repo

Write-Host 'Cleaning local generated build artifacts...' -ForegroundColor Cyan

$restorePaths = @(
  'dist',
  'meta/pages.json',
  'package-lock.json'
)

foreach ($path in $restorePaths) {
  git restore --worktree --staged -- $path 2>$null
}

$cleanPaths = @(
  'dist',
  'node_modules/.vite',
  '.vite',
  '.cache'
)

foreach ($path in $cleanPaths) {
  git clean -fd -- $path 2>$null
}

Write-Host 'Current git status:' -ForegroundColor Cyan
git status --short

if ($RunChecks) {
  npm ci
  npm run validate:meta
  npm run build
  Write-Host 'Checks completed.' -ForegroundColor Green
}
