param(
  [string]$RepoPath = (Get-Location).Path,
  [switch]$CreateBranch,
  [switch]$RunChecks,
  [switch]$CommitReport
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
$PSDefaultParameterValues['Set-Content:Encoding'] = 'utf8'
$PSDefaultParameterValues['Add-Content:Encoding'] = 'utf8'

function Section($name) { Write-Host "`n===== $name =====" -ForegroundColor Cyan }
function RelPath([string]$p) {
  $full = [System.IO.Path]::GetFullPath($p)
  $root = [System.IO.Path]::GetFullPath($RepoPath).TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
  if ($full.StartsWith($root)) { return $full.Substring($root.Length).Replace('\\','/') }
  return $p.Replace('\\','/')
}
function Resolve-RepoPath([string]$baseFile, [string]$ref) {
  if ([string]::IsNullOrWhiteSpace($ref)) { return $null }
  if ($ref -match '^(https?:|data:|mailto:|tel:|#|javascript:)') { return $null }
  $clean = ($ref -split '[?#]')[0]
  if ([string]::IsNullOrWhiteSpace($clean)) { return $null }
  if ($clean.StartsWith('/')) { return Join-Path $RepoPath $clean.TrimStart('/') }
  return Join-Path (Split-Path -Parent $baseFile) $clean
}
function Add-Line([System.Collections.Generic.List[string]]$list, [string]$line='') { [void]$list.Add($line) }

$RepoPath = [System.IO.Path]::GetFullPath($RepoPath)
if (!(Test-Path $RepoPath)) { throw "RepoPath not found: $RepoPath" }
Set-Location $RepoPath

Section 'Repo cleanup audit — safe mode'
Write-Host "Repo: $RepoPath"

if ($CreateBranch) {
  Section 'Git branch'
  $branch = 'cleanup/repo-audit-safe'
  $existing = git branch --list $branch
  if ($LASTEXITCODE -ne 0) { throw 'git branch failed' }
  if ($existing) { git checkout $branch | Out-Host } else { git checkout -b $branch | Out-Host }
}

$stateDir = Join-Path $RepoPath 'STATE'
New-Item -ItemType Directory -Force -Path $stateDir | Out-Null
$auditPath = Join-Path $stateDir 'REPO_CLEANUP_AUDIT.md'
$assetPath = Join-Path $stateDir 'ASSET_EXISTENCE_AUDIT.md'

Section 'Collecting files'
$allFiles = Get-ChildItem -Path $RepoPath -Recurse -File -Force | Where-Object {
  $_.FullName -notmatch '[\\/]\.git[\\/]'
}
$rootFiles = Get-ChildItem -Path $RepoPath -File -Force
$rootDirs = Get-ChildItem -Path $RepoPath -Directory -Force | Sort-Object Name
$activePages = Get-ChildItem -Path $RepoPath -File -Filter 'עמוד-*.html' | Sort-Object Name
$pageCss = Get-ChildItem -Path (Join-Path $RepoPath 'styles/pages') -File -Filter 'עמוד-*.css' -ErrorAction SilentlyContinue | Sort-Object Name
$topicCss = Get-ChildItem -Path (Join-Path $RepoPath 'styles/topics') -File -ErrorAction SilentlyContinue | Sort-Object Name
$workflows = Get-ChildItem -Path (Join-Path $RepoPath '.github/workflows') -File -ErrorAction SilentlyContinue | Sort-Object Name
$scripts = Get-ChildItem -Path (Join-Path $RepoPath 'scripts') -File -ErrorAction SilentlyContinue | Sort-Object Name
$tests = Get-ChildItem -Path (Join-Path $RepoPath 'tests') -Recurse -File -ErrorAction SilentlyContinue | Sort-Object FullName
$stateFiles = Get-ChildItem -Path (Join-Path $RepoPath 'STATE') -Recurse -File -ErrorAction SilentlyContinue | Sort-Object FullName
$docsFiles = Get-ChildItem -Path (Join-Path $RepoPath 'docs') -Recurse -File -ErrorAction SilentlyContinue | Sort-Object FullName
$legacyFiles = Get-ChildItem -Path (Join-Path $RepoPath 'sources/legacy') -Recurse -File -ErrorAction SilentlyContinue | Sort-Object FullName
$backupFiles = @()
foreach ($dir in @('sources/backups','meta/backup')) {
  $p = Join-Path $RepoPath $dir
  if (Test-Path $p) { $backupFiles += Get-ChildItem -Path $p -Recurse -File -Force | Sort-Object FullName }
}
$assetsFiles = Get-ChildItem -Path (Join-Path $RepoPath 'assets') -Recurse -File -ErrorAction SilentlyContinue | Sort-Object FullName

Section 'Scanning references'
$refRows = New-Object 'System.Collections.Generic.List[object]'
$htmlFiles = $allFiles | Where-Object { $_.Extension -in '.html','.htm' }
$cssFiles = $allFiles | Where-Object { $_.Extension -eq '.css' }

foreach ($f in $htmlFiles) {
  $txt = Get-Content -Raw -LiteralPath $f.FullName -Encoding UTF8
  $matches = [regex]::Matches($txt, '(?i)(src|href)\s*=\s*["'']([^"'']+)["'']')
  foreach ($m in $matches) {
    $attr = $m.Groups[1].Value
    $ref = $m.Groups[2].Value
    $resolved = Resolve-RepoPath $f.FullName $ref
    if ($null -eq $resolved) { continue }
    $exists = Test-Path -LiteralPath $resolved
    $refRows.Add([pscustomobject]@{
      Source = RelPath $f.FullName
      Attribute = $attr
      Reference = $ref
      Resolved = RelPath $resolved
      Exists = $exists
    }) | Out-Null
  }
}
foreach ($f in $cssFiles) {
  $txt = Get-Content -Raw -LiteralPath $f.FullName -Encoding UTF8
  $matches = [regex]::Matches($txt, '(?i)@import\s+(?:url\()?\s*["'']?([^"'')]+)["'']?\)?')
  foreach ($m in $matches) {
    $ref = $m.Groups[1].Value.Trim()
    $resolved = Resolve-RepoPath $f.FullName $ref
    if ($null -eq $resolved) { continue }
    $exists = Test-Path -LiteralPath $resolved
    $refRows.Add([pscustomobject]@{
      Source = RelPath $f.FullName
      Attribute = '@import'
      Reference = $ref
      Resolved = RelPath $resolved
      Exists = $exists
    }) | Out-Null
  }
}
$missingRefs = $refRows | Where-Object { -not $_.Exists }

Section 'Scanning package scripts'
$packageScripts = @{}
$packagePath = Join-Path $RepoPath 'package.json'
if (Test-Path $packagePath) {
  $pkg = Get-Content -Raw -LiteralPath $packagePath -Encoding UTF8 | ConvertFrom-Json
  if ($pkg.scripts) {
    $pkg.scripts.PSObject.Properties | ForEach-Object { $packageScripts[$_.Name] = [string]$_.Value }
  }
}

$scriptRows = foreach ($s in $scripts) {
  $rel = RelPath $s.FullName
  $usedByPackage = ($packageScripts.Values -join "`n") -match [regex]::Escape($rel) -or ($packageScripts.Values -join "`n") -match [regex]::Escape($s.Name)
  $usedByWorkflow = $false
  foreach ($wf in $workflows) {
    $wft = Get-Content -Raw -LiteralPath $wf.FullName -Encoding UTF8
    if ($wft -match [regex]::Escape($rel) -or $wft -match [regex]::Escape($s.Name)) { $usedByWorkflow = $true; break }
  }
  [pscustomobject]@{
    Script = $rel
    UsedByPackageJson = $usedByPackage
    UsedByWorkflow = $usedByWorkflow
    Status = $(if ($usedByPackage) {'used-by-package-json'} elseif ($usedByWorkflow) {'used-by-workflow'} else {'unknown/manual-or-legacy'})
  }
}

Section 'Potential duplicates by basename'
$dupGroups = $allFiles | Group-Object Name | Where-Object { $_.Count -gt 1 } | Sort-Object Count -Descending

Section 'Writing reports'
$now = Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'
$md = New-Object 'System.Collections.Generic.List[string]'
Add-Line $md '# REPO CLEANUP AUDIT — safe read-only report'
Add-Line $md "Generated: $now"
Add-Line $md ''
Add-Line $md '## Guardrail'
Add-Line $md 'No files were deleted, moved, or refactored by this script. This report is audit-only.'
Add-Line $md ''
Add-Line $md '## Root directories'
foreach ($d in $rootDirs) { Add-Line $md "- `$(RelPath $d.FullName)`" }
Add-Line $md ''
Add-Line $md '## Counts'
Add-Line $md "- Total files scanned: $($allFiles.Count)"
Add-Line $md "- Root active worksheet HTML files: $($activePages.Count)"
Add-Line $md "- Page CSS files: $($pageCss.Count)"
Add-Line $md "- Topic CSS files: $($topicCss.Count)"
Add-Line $md "- Scripts: $($scripts.Count)"
Add-Line $md "- Tests: $($tests.Count)"
Add-Line $md "- Workflows: $($workflows.Count)"
Add-Line $md "- Docs files: $($docsFiles.Count)"
Add-Line $md "- STATE files: $($stateFiles.Count)"
Add-Line $md "- Legacy files: $($legacyFiles.Count)"
Add-Line $md "- Backup files: $($backupFiles.Count)"
Add-Line $md "- Assets files: $($assetsFiles.Count)"
Add-Line $md "- Internal references scanned: $($refRows.Count)"
Add-Line $md "- Missing internal references: $($missingRefs.Count)"
Add-Line $md ''
Add-Line $md '## Protected / do-not-touch'
foreach ($p in @('CLAUDE.md','PROJECT_RULES.md','STATE/LIVE_STATUS.md','STATE/ARCHITECTURE_MAP.md','STATE/PROJECT_CONTINUITY.md','styles/a4-base.css','meta/topics.json','sources/legacy','sources/backups','meta/backup')) {
  Add-Line $md "- `$p`"
}
Add-Line $md ''
Add-Line $md '## Active core files'
Add-Line $md "- Root worksheet pages: $($activePages.Count)"
Add-Line $md "- Page CSS files: $($pageCss.Count)"
Add-Line $md "- Topic CSS files: $($topicCss.Count)"
Add-Line $md ''
Add-Line $md '## Active root worksheet pages'
foreach ($p in $activePages | Select-Object -First 120) { Add-Line $md "- `$(RelPath $p.FullName)`" }
if ($activePages.Count -gt 120) { Add-Line $md '- ... truncated in report' }
Add-Line $md ''
Add-Line $md '## Active page CSS files'
foreach ($p in $pageCss | Select-Object -First 120) { Add-Line $md "- `$(RelPath $p.FullName)`" }
if ($pageCss.Count -gt 120) { Add-Line $md '- ... truncated in report' }
Add-Line $md ''
Add-Line $md '## Scripts classification'
Add-Line $md '| Script | Status |'
Add-Line $md '|---|---|'
foreach ($r in $scriptRows) { Add-Line $md "| `$($r.Script)` | $($r.Status) |" }
Add-Line $md ''
Add-Line $md '## Workflows'
foreach ($wf in $workflows) {
  Add-Line $md "### `$(RelPath $wf.FullName)`"
  $wfTxt = Get-Content -Raw -LiteralPath $wf.FullName -Encoding UTF8
  $runLines = ($wfTxt -split "`n") | Where-Object { $_ -match '^\s*run:' } | ForEach-Object { $_.Trim() }
  foreach ($line in $runLines) { Add-Line $md "- `$line`" }
  Add-Line $md ''
}
Add-Line $md '## Missing internal references'
if ($missingRefs.Count -eq 0) { Add-Line $md '- None found by static regex scan.' } else {
  Add-Line $md '| Source | Ref | Resolved |'
  Add-Line $md '|---|---|---|'
  foreach ($r in $missingRefs | Select-Object -First 200) { Add-Line $md "| `$($r.Source)` | `$($r.Reference)` | `$($r.Resolved)` |" }
  if ($missingRefs.Count -gt 200) { Add-Line $md "| ... | truncated | $($missingRefs.Count - 200) more |" }
}
Add-Line $md ''
Add-Line $md '## Potential duplicates by filename'
if ($dupGroups.Count -eq 0) { Add-Line $md '- None by basename.' } else {
  foreach ($g in $dupGroups | Select-Object -First 80) {
    Add-Line $md "### $($g.Name) — $($g.Count) copies"
    foreach ($i in $g.Group | Select-Object -First 20) { Add-Line $md "- `$(RelPath $i.FullName)`" }
    Add-Line $md ''
  }
}
Add-Line $md '## Legacy candidates'
Add-Line $md '- `sources/legacy/parabula-old/site/גרף-עולה-יורד-קבוע/` — candidate-for-restore; do not delete.'
Add-Line $md ''
Add-Line $md '## Recommended cleanup categories'
Add-Line $md '- A. אסור לגעת: core rules, active pages, a4-base, topics metadata, protected STATE, legacy/backups.'
Add-Line $md '- B. פעיל וחיוני: preview, catalog, mobile-app, styles, meta, scripts referenced by package/workflows.'
Add-Line $md '- C. legacy לשמירה: sources/legacy, especially graph up/down/constant topic.'
Add-Line $md '- D. candidate-for-restore: legacy linear-function/graph topic.'
Add-Line $md '- E. כפול אבל לא למחיקה עדיין: duplicate basename groups listed above.'
Add-Line $md '- F. כנראה generated: dist, generated reports, derived docs, backups; verify before deletion.'
Add-Line $md '- G. unknown: scripts not referenced by package/workflow.'
Add-Line $md '- H. safe-to-remove-after-user-approval: only after manual review and passing tests.'

Set-Content -LiteralPath $auditPath -Value ($md -join "`n") -Encoding UTF8

$assetMd = New-Object 'System.Collections.Generic.List[string]'
Add-Line $assetMd '# ASSET EXISTENCE AUDIT'
Add-Line $assetMd "Generated: $now"
Add-Line $assetMd ''
Add-Line $assetMd '| Source | Attribute | Reference | Exists | Resolved |'
Add-Line $assetMd '|---|---|---|---|---|'
foreach ($r in $refRows | Sort-Object Exists,Source,Reference) {
  Add-Line $assetMd "| `$($r.Source)` | `$($r.Attribute)` | `$($r.Reference)` | $($r.Exists) | `$($r.Resolved)` |"
}
Set-Content -LiteralPath $assetPath -Value ($assetMd -join "`n") -Encoding UTF8

Section 'Reports written'
Write-Host (RelPath $auditPath)
Write-Host (RelPath $assetPath)

if ($RunChecks) {
  Section 'Running npm checks'
  if (Test-Path $packagePath) {
    npm test | Tee-Object -FilePath (Join-Path $stateDir 'REPO_CLEANUP_npm-test.log')
    npm run verify | Tee-Object -FilePath (Join-Path $stateDir 'REPO_CLEANUP_npm-verify.log')
    npm run build | Tee-Object -FilePath (Join-Path $stateDir 'REPO_CLEANUP_npm-build.log')
  } else {
    Write-Warning 'package.json not found; skipped npm checks.'
  }
}

if ($CommitReport) {
  Section 'Git commit report files only'
  git add STATE/REPO_CLEANUP_AUDIT.md STATE/ASSET_EXISTENCE_AUDIT.md | Out-Host
  git commit -m 'chore: add repo cleanup audit reports' | Out-Host
}

Section 'Done'
Write-Host "Audit report: $auditPath"
Write-Host "Asset report: $assetPath"
Write-Host "Missing references: $($missingRefs.Count)"
Write-Host "Duplicate basename groups: $($dupGroups.Count)"
