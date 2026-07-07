param(
  [string]$RepoPath = 'C:\Users\yaniv\parabula-next',
  [switch]$SkipChecks
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Step([string]$Text) {
  Write-Host ''
  Write-Host ('=' * 72) -ForegroundColor Cyan
  Write-Host $Text -ForegroundColor Cyan
  Write-Host ('=' * 72) -ForegroundColor Cyan
}

function Run([string]$Name, [scriptblock]$Command) {
  Write-Host ''
  Write-Host ">>> $Name" -ForegroundColor Magenta
  & $Command
  if ($LASTEXITCODE -ne 0) { throw "$Name failed. ExitCode=$LASTEXITCODE" }
}

Step 'Bootstrap local parabula-next sync'
if (-not (Test-Path -LiteralPath $RepoPath)) {
  throw "Repo path not found: $RepoPath"
}
Set-Location $RepoPath
Write-Host "Repo: $RepoPath" -ForegroundColor Green

Step 'Backup local work before force-safe sync'
$statusBefore = git status --short
if ($statusBefore) {
  git status --short
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  Run 'git stash all local changes' { git stash push -u -m "auto-backup-before-bootstrap-sync-$stamp" }
} else {
  Write-Host 'Working tree already clean.' -ForegroundColor Green
}

Step 'Fetch and align to origin/main'
Run 'git fetch origin' { git fetch origin }
Run 'git checkout main' { git checkout main }
Run 'git reset --hard origin/main' { git reset --hard origin/main }

Step 'Install dependencies'
if (Test-Path 'package-lock.json') {
  Run 'npm ci' { npm ci }
} else {
  Run 'npm install' { npm install --no-audit --no-fund }
}

if (-not $SkipChecks) {
  Step 'Run full consolidated validation'
  Run 'npm run ci:all' { npm run ci:all }
}

Step 'Clean local generated artifacts'
if (Test-Path '.\scripts\clean-local-generated.ps1') {
  powershell -ExecutionPolicy Bypass -File '.\scripts\clean-local-generated.ps1'
}

Step 'Final status'
git status --short
Write-Host ''
Write-Host 'BOOTSTRAP SYNC COMPLETE' -ForegroundColor Green
Write-Host 'If git status is empty, the local repo is clean and fully aligned to origin/main.' -ForegroundColor Green
Write-Host 'Local backup, if created, is in git stash.' -ForegroundColor Yellow
