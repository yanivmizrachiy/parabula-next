param(
  [switch]$RunChecks
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$repo = (git rev-parse --show-toplevel 2>$null)
if (-not $repo) { throw 'Not inside a git repository.' }
Set-Location $repo

Write-Host 'Cleaning local generated build artifacts...' -ForegroundColor Cyan

$trackedGenerated = @(
  'dist/index.html',
  'meta/pages.json',
  'package-lock.json'
)

foreach ($path in $trackedGenerated) {
  if (Test-Path $path) {
    git checkout -- $path
  }
}

if (Test-Path 'dist/assets') {
  git checkout -- dist/assets 2>$null
}

$untrackedGenerated = @(
  'node_modules/.vite',
  '.vite',
  '.cache'
)

foreach ($path in $untrackedGenerated) {
  if (Test-Path $path) {
    Remove-Item -Recurse -Force $path
  }
}

Write-Host 'Current git status:' -ForegroundColor Cyan
git status --short

if ($RunChecks) {
  npm ci
  npm run validate:meta
  npm run build
  Write-Host 'Checks completed.' -ForegroundColor Green
}
