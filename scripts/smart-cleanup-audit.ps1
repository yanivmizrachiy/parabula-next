param(
  [string]$RepoPath = (Get-Location).Path,
  [string]$OutputDir = "STATE/reports/repo-cleanup",
  [switch]$RunChecks
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
$PSDefaultParameterValues['Set-Content:Encoding'] = 'utf8'
$PSDefaultParameterValues['Add-Content:Encoding'] = 'utf8'

function Add-Line([System.Collections.Generic.List[string]]$List, [string]$Line = '') { [void]$List.Add($Line) }
function RelPath([string]$Path) {
  $full = [System.IO.Path]::GetFullPath($Path)
  $root = [System.IO.Path]::GetFullPath($RepoPath).TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
  if ($full.StartsWith($root)) { return $full.Substring($root.Length).Replace('\\','/') }
  return $Path.Replace('\\','/')
}
function Resolve-RepoRef([string]$BaseFile, [string]$Ref) {
  if ([string]::IsNullOrWhiteSpace($Ref)) { return $null }
  if ($Ref -match '^(https?:|data:|mailto:|tel:|#|javascript:|blob:)') { return $null }
  $clean = ($Ref -split '[?#]')[0].Trim()
  if ([string]::IsNullOrWhiteSpace($clean)) { return $null }
  if ($clean.StartsWith('/')) { return Join-Path $RepoPath $clean.TrimStart('/') }
  return Join-Path (Split-Path -Parent $BaseFile) $clean
}
function Read-Text([string]$Path) {
  try { return Get-Content -Raw -LiteralPath $Path -Encoding UTF8 } catch { return '' }
}
function Get-FirstMatch([string]$Text, [string]$Pattern) {
  $m = [regex]::Match($Text, $Pattern, 'IgnoreCase,Singleline')
  if ($m.Success) { return (($m.Groups[1].Value -replace '<[^>]+>','') -replace '\s+',' ').Trim() }
  return ''
}

$RepoPath = [System.IO.Path]::GetFullPath($RepoPath)
if (!(Test-Path -LiteralPath $RepoPath)) { throw "RepoPath not found: $RepoPath" }
Set-Location $RepoPath
$out = Join-Path $RepoPath $OutputDir
New-Item -ItemType Directory -Force -Path $out | Out-Null

$allFiles = Get-ChildItem -Path $RepoPath -Recurse -File -Force | Where-Object { $_.FullName -notmatch '[\\/]\.git[\\/]' }
$activePages = Get-ChildItem -Path $RepoPath -File -Filter 'עמוד-*.html' -ErrorAction SilentlyContinue | Sort-Object Name
$pageCss = Get-ChildItem -Path (Join-Path $RepoPath 'styles/pages') -File -Filter 'עמוד-*.css' -ErrorAction SilentlyContinue | Sort-Object Name
$workflows = Get-ChildItem -Path (Join-Path $RepoPath '.github/workflows') -File -ErrorAction SilentlyContinue | Sort-Object Name
$scripts = Get-ChildItem -Path (Join-Path $RepoPath 'scripts') -File -ErrorAction SilentlyContinue | Sort-Object Name

$protectedRoots = @(
  'עמוד-*.html',
  'styles/a4-base.css',
  'styles/pages',
  'styles/topics',
  'meta/topics.json',
  'PROJECT_RULES.md',
  'CLAUDE.md',
  'STATE/LIVE_STATUS.md',
  'STATE/ARCHITECTURE_MAP.md',
  'STATE/PROJECT_CONTINUITY.md',
  'sources/legacy',
  'sources/backups',
  'meta/backup'
)

$topicPages = @{}
$topicPath = Join-Path $RepoPath 'meta/topics.json'
if (Test-Path -LiteralPath $topicPath) {
  $meta = Get-Content -Raw -LiteralPath $topicPath -Encoding UTF8 | ConvertFrom-Json
  foreach ($topic in $meta.topics) {
    foreach ($page in $topic.pages) {
      $topicPages[[string]$page.file] = [pscustomobject]@{
        TopicName = [string]$topic.name
        PageTopic = [string]$page.topic
        Number = [int]$page.number
        Title = [string]$page.title
        H1 = [string]$page.h1
      }
    }
  }
}

$referenceRows = New-Object 'System.Collections.Generic.List[object]'
$scanForRefs = $allFiles | Where-Object { $_.Extension -in '.html','.htm','.css','.js','.mjs' }
foreach ($f in $scanForRefs) {
  $txt = Read-Text $f.FullName
  $patterns = @(
    '(?i)(src|href)\s*=\s*["'']([^"'']+)["'']',
    '(?i)@import\s+(?:url\()?\s*["'']?([^"'')]+)["'']?\)?',
    '(?i)url\(\s*["'']?([^"'')]+)["'']?\s*\)'
  )
  foreach ($pattern in $patterns) {
    foreach ($m in [regex]::Matches($txt, $pattern)) {
      $ref = if ($m.Groups.Count -ge 3 -and $m.Groups[2].Value) { $m.Groups[2].Value } else { $m.Groups[1].Value }
      $resolved = Resolve-RepoRef $f.FullName $ref
      if ($null -eq $resolved) { continue }
      $referenceRows.Add([pscustomobject]@{
        Source = RelPath $f.FullName
        Reference = $ref
        Resolved = RelPath $resolved
        Exists = (Test-Path -LiteralPath $resolved)
      }) | Out-Null
    }
  }
}
$missingRefs = $referenceRows | Where-Object { -not $_.Exists } | Sort-Object Source, Reference -Unique

$pageRows = foreach ($p in $activePages) {
  $txt = Read-Text $p.FullName
  $title = Get-FirstMatch $txt '<title[^>]*>(.*?)</title>'
  $h1 = Get-FirstMatch $txt '<h1[^>]*>(.*?)</h1>'
  $declaredTopic = Get-FirstMatch $txt 'data-topic\s*=\s*["'']([^"'']+)["'']'
  $m = $topicPages[$p.Name]
  $expected = if ($m) { $m.TopicName } else { '' }
  $suspected = ''
  $hay = "$title $h1 $declaredTopic $($m.Title) $($m.H1)"
  if ($hay -match 'משוואה ריבועית') { $suspected = 'משוואות ריבועיות' }
  elseif ($hay -match 'פיתגורס') { $suspected = 'משפט פיתגורס' }
  elseif ($hay -match 'פונקציה ריבועית|פונקציות') { $suspected = 'פונקציות' }
  elseif ($hay -match 'מקבילית|גיאומטריה') { $suspected = 'גיאומטריה' }
  elseif ($hay -match 'פילוג מורחב') { $suspected = 'פילוג מורחב' }
  elseif ($hay -match 'סדרות|חוקיות') { $suspected = 'סדרות וחוקיות' }
  elseif ($hay -match 'משוואות|משוואה') { $suspected = 'משוואות' }
  [pscustomobject]@{
    File = $p.Name
    MetaTopic = $expected
    PageTopic = $declaredTopic
    Title = $title
    H1 = $h1
    SuspectedTopic = $suspected
    NeedsReview = ($suspected -and $expected -and $suspected -ne $expected)
  }
}
$topicMismatches = $pageRows | Where-Object { $_.NeedsReview }

$packageScriptsText = ''
$packagePath = Join-Path $RepoPath 'package.json'
if (Test-Path -LiteralPath $packagePath) { $packageScriptsText = Read-Text $packagePath }
$workflowText = ($workflows | ForEach-Object { Read-Text $_.FullName }) -join "`n"
$scriptRows = foreach ($s in $scripts) {
  $rel = RelPath $s.FullName
  $name = $s.Name
  $used = ($packageScriptsText -match [regex]::Escape($rel)) -or ($packageScriptsText -match [regex]::Escape($name)) -or ($workflowText -match [regex]::Escape($rel)) -or ($workflowText -match [regex]::Escape($name))
  [pscustomobject]@{ Script = $rel; UsedByPackageOrWorkflow = $used; Recommendation = $(if ($used) { 'keep' } else { 'manual-review-only' }) }
}

$noiseCandidates = $allFiles | Where-Object {
  $rel = RelPath $_.FullName
  $rel -notmatch '^(sources/legacy|sources/backups|meta/backup)/' -and
  $rel -notmatch '^עמוד-\d+\.html$' -and
  $rel -notmatch '^styles/pages/עמוד-\d+\.css$' -and
  ($_.Name -match '(?i)(\.bak|\.backup|before_|_before_|\.old$|\.tmp$|~$|copy|עותק|backup)')
} | Sort-Object FullName

$dupGroups = $allFiles | Group-Object Name | Where-Object { $_.Count -gt 1 } | Sort-Object Count -Descending
$largeFiles = $allFiles | Where-Object { $_.Length -gt 500KB } | Sort-Object Length -Descending

$summaryPath = Join-Path $out 'SMART_CLEANUP_AUDIT.md'
$missingPath = Join-Path $out 'SMART_MISSING_REFS.tsv'
$topicPathOut = Join-Path $out 'SMART_TOPIC_MISMATCHES.tsv'
$scriptsPath = Join-Path $out 'SMART_SCRIPT_REVIEW.tsv'
$noisePath = Join-Path $out 'SMART_NOISE_CANDIDATES.tsv'

$missingRefs | Export-Csv -Delimiter "`t" -NoTypeInformation -Encoding UTF8 -Path $missingPath
$topicMismatches | Export-Csv -Delimiter "`t" -NoTypeInformation -Encoding UTF8 -Path $topicPathOut
$scriptRows | Export-Csv -Delimiter "`t" -NoTypeInformation -Encoding UTF8 -Path $scriptsPath
$noiseCandidates | Select-Object @{Name='Path';Expression={RelPath $_.FullName}}, @{Name='Bytes';Expression={$_.Length}} | Export-Csv -Delimiter "`t" -NoTypeInformation -Encoding UTF8 -Path $noisePath

$md = New-Object 'System.Collections.Generic.List[string]'
Add-Line $md '# SMART CLEANUP AUDIT — protected mode'
Add-Line $md "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')"
Add-Line $md ''
Add-Line $md '## Safety contract'
Add-Line $md '- This script does not delete, move, rename, or rewrite worksheet content.'
Add-Line $md '- Active A4 pages, page CSS, metadata, legacy, backups, and source-of-truth documents are protected.'
Add-Line $md '- Output is evidence for a later human-approved cleanup step.'
Add-Line $md ''
Add-Line $md '## Protected areas'
foreach ($p in $protectedRoots) { Add-Line $md "- `$p`" }
Add-Line $md ''
Add-Line $md '## Counts'
Add-Line $md "- Files scanned: $($allFiles.Count)"
Add-Line $md "- Root worksheet pages: $($activePages.Count)"
Add-Line $md "- Page CSS files: $($pageCss.Count)"
Add-Line $md "- Internal references scanned: $($referenceRows.Count)"
Add-Line $md "- Missing internal references: $($missingRefs.Count)"
Add-Line $md "- Topic mismatches requiring review: $($topicMismatches.Count)"
Add-Line $md "- Script files needing manual review: $(($scriptRows | Where-Object { -not $_.UsedByPackageOrWorkflow }).Count)"
Add-Line $md "- Backup/noise candidates outside protected backup areas: $($noiseCandidates.Count)"
Add-Line $md "- Duplicate basename groups: $($dupGroups.Count)"
Add-Line $md "- Large files over 500KB: $($largeFiles.Count)"
Add-Line $md ''
Add-Line $md '## Topic mismatch review'
if ($topicMismatches.Count -eq 0) { Add-Line $md '- None found by conservative title/H1 scan.' } else { foreach ($r in $topicMismatches | Select-Object -First 80) { Add-Line $md "- `$($r.File)` | meta=`$($r.MetaTopic)` | suspected=`$($r.SuspectedTopic)` | title=`$($r.Title)` | h1=`$($r.H1)`" } }
Add-Line $md ''
Add-Line $md '## Missing internal references'
if ($missingRefs.Count -eq 0) { Add-Line $md '- None found by static scan.' } else { foreach ($r in $missingRefs | Select-Object -First 80) { Add-Line $md "- `$($r.Source)` -> `$($r.Reference)` resolves to `$($r.Resolved)`" } }
Add-Line $md ''
Add-Line $md '## Smart cleanup candidates, not deletion approvals'
Add-Line $md '- Review `SMART_NOISE_CANDIDATES.tsv` for backup/temp files outside protected backup folders.'
Add-Line $md '- Review `SMART_SCRIPT_REVIEW.tsv` for scripts not referenced by package.json or workflows.'
Add-Line $md '- Review duplicate basename groups before any move/delete decision.'
Add-Line $md '- Keep `sources/legacy/parabula-old/site/גרף-עולה-יורד-קבוע/` as candidate-for-restore.'
Add-Line $md ''
Add-Line $md '## Next safe action'
Add-Line $md 'Fix only proven metadata/reference problems first. Do not remove legacy/backups or active A4 pages.'
$md | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($RunChecks) {
  $checks = @(
    @{ Name = 'npm-test'; Command = 'npm test' },
    @{ Name = 'npm-verify'; Command = 'npm run verify' },
    @{ Name = 'npm-build'; Command = 'npm run build' }
  )
  foreach ($c in $checks) {
    $log = Join-Path $out ("SMART_CLEANUP_" + $c.Name + ".log")
    "===== $($c.Command) =====" | Set-Content -LiteralPath $log -Encoding UTF8
    cmd /c $c.Command 2>&1 | Tee-Object -FilePath $log -Append
    if ($LASTEXITCODE -ne 0) { throw "$($c.Command) failed. See $log" }
  }
}

Write-Host "Smart cleanup audit written to: $summaryPath"
