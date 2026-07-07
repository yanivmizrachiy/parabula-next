param(
  [switch]$SkipChecks,
  [switch]$NoStash
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Step([string]$Text) {
  Write-Host ''
  Write-Host ('=' * 70) -ForegroundColor Cyan
  Write-Host $Text -ForegroundColor Cyan
  Write-Host ('=' * 70) -ForegroundColor Cyan
}

function Run([string]$Name, [scriptblock]$Command) {
  Write-Host ''
  Write-Host ">>> $Name" -ForegroundColor Magenta
  & $Command
  if ($LASTEXITCODE -ne 0) { throw "$Name failed. ExitCode=$LASTEXITCODE" }
}

Step 'Locate repository'
$repo = (git rev-parse --show-toplevel 2>$null)
if (-not $repo) { throw 'Not inside a git repository. Run from C:\Users\yaniv\parabula-next.' }
Set-Location $repo
Write-Host "Repo: $repo" -ForegroundColor Green

Step 'Protect local changes'
$statusBefore = git status --short
if ($statusBefore -and -not $NoStash) {
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  Run 'git stash local changes' { git stash push -u -m "auto-backup-before-sync-$stamp" }
} elseif ($statusBefore -and $NoStash) {
  Write-Host 'Local changes exist and NoStash was requested:' -ForegroundColor Yellow
  git status --short
} else {
  Write-Host 'Working tree already clean.' -ForegroundColor Green
}

Step 'Sync main'
Run 'git fetch origin' { git fetch origin }
Run 'git checkout main' { git checkout main }
Run 'git pull --ff-only' { git pull --ff-only }

Step 'Install dependencies'
if (Test-Path 'package-lock.json') {
  Run 'npm ci' { npm ci }
} else {
  Run 'npm install' { npm install --no-audit --no-fund }
}

if (-not $SkipChecks) {
  Step 'Run consolidated validation'
  Run 'npm run ci:all' { npm run ci:all }
}

Step 'Clean generated local artifacts'
if (Test-Path '.\scripts\clean-local-generated.ps1') {
  powershell -ExecutionPolicy Bypass -File '.\scripts\clean-local-generated.ps1'
}

Step 'Final status'
git status --short
Write-Host ''
Write-Host 'SYNC COMPLETE' -ForegroundColor Green
Write-Host 'If git status is empty, local repo is clean and updated.' -ForegroundColor Green
