$ErrorActionPreference = 'Stop'
$env:GIT_PAGER = 'cat'

Write-Host '=== YANIV REPAIR REGULAR EQUATIONS DESIGN ==='

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Set-Location $repoRoot

$git = 'C:\Program Files\Git\cmd\git.exe'
$npm = 'C:\Program Files\nodejs\npm.cmd'
$gh  = 'C:\Program Files\GitHub CLI\gh.exe'
if (!(Test-Path $git)) { $git = 'git.exe' }
if (!(Test-Path $npm)) { $npm = 'npm.cmd' }

Write-Host '=== SYNC MAIN ==='
& $git checkout main
& $git fetch origin main
& $git pull --ff-only origin main
& $git restore -- dist 2>$null

$dirtyBefore = & $git status --porcelain
if ($dirtyBefore) {
  Write-Host 'DIRTY_REPO_BEFORE_WORK'
  $dirtyBefore
  throw 'Stop: repo has local changes before repair.'
}

Write-Host '=== LOAD EQUATIONS TOPIC ==='
$topics = Get-Content '.\meta\topics.json' -Raw -Encoding UTF8 | ConvertFrom-Json
$eqTopic = $topics.topics | Where-Object { $_.name -eq 'משוואות' }
if (!$eqTopic) { throw "Missing topic: משוואות" }
$pages = @($eqTopic.pages | ForEach-Object { $_.file } | Sort-Object -Unique)
if ($pages.Count -eq 0) { throw 'No equations pages found.' }

$changed = New-Object System.Collections.Generic.List[string]
$htmlChanged = 0
$cssChanged = 0

Write-Host '=== CLEAN HTML + ALIGN CSS ==='
foreach ($file in $pages) {
  $path = Join-Path $repoRoot $file
  if (!(Test-Path $path)) { throw "Missing page file: $file" }

  $html = Get-Content $path -Raw -Encoding UTF8
  $oldHtml = $html

  $html = [regex]::Replace($html, '\sstyle\s*=\s*"[^"]*"', '', [Text.RegularExpressions.RegexOptions]::IgnoreCase)
  $html = [regex]::Replace($html, "\sstyle\s*=\s*'[^']*'", '', [Text.RegularExpressions.RegexOptions]::IgnoreCase)
  $html = [regex]::Replace($html, '\sstart\s*=\s*"[^"]*"', '', [Text.RegularExpressions.RegexOptions]::IgnoreCase)
  $html = [regex]::Replace($html, "\sstart\s*=\s*'[^']*'", '', [Text.RegularExpressions.RegexOptions]::IgnoreCase)
  $html = [regex]::Replace($html, '<div class="worksheet-badge">.*?</div>\s*', '', [Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [Text.RegularExpressions.RegexOptions]::Singleline)
  $html = [regex]::Replace($html, '<(?:div|span)\s+class="(?:bullet-num|exercise-number|item-number|question-number|q-number|eq-number|sub-number|number-badge|exercise-badge|badge-number|ordinal)"[^>]*>.*?</(?:div|span)>\s*', '', [Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [Text.RegularExpressions.RegexOptions]::Singleline)

  if ($html -ne $oldHtml) {
    Set-Content $path $html -Encoding UTF8
    $changed.Add($file)
    $htmlChanged++
    Write-Host "HTML cleaned: $file"
  }

  if ($html -match 'class="equation-list' -or $html -match 'class="exercise"' -or $html -match 'class="answer-line"') {
    $n = ($file -replace '\D','')
    if (!$n) { continue }
    $cssFile = Join-Path 'styles/pages' ($file -replace '\.html$', '.css')
    $cssPath = Join-Path $repoRoot $cssFile
    $scope = ".page-$n"
    if (Test-Path $cssPath) { $css = Get-Content $cssPath -Raw -Encoding UTF8 } else { $css = '' }
    $oldCss = $css
    $css = [regex]::Replace($css, '(?s)/\* YANIV_REG_EQ_STYLE_START \*/.*?/\* YANIV_REG_EQ_STYLE_END \*/', '')

    $block = @"
/* YANIV_REG_EQ_STYLE_START */
$scope .worksheet-badge {
  display: none !important;
}

$scope .equation-list {
  list-style: none !important;
  counter-reset: none !important;
  margin: 0 !important;
  padding: 0 !important;
  display: grid;
  gap: 8px;
}

$scope .equation-list-left {
  counter-reset: none !important;
}

$scope .exercise::before {
  content: none !important;
  display: none !important;
}

$scope .exercise {
  list-style: none !important;
  counter-increment: none !important;
  grid-template-columns: minmax(95px, auto) minmax(70px, 1fr) !important;
  gap: 8px !important;
  align-items: stretch !important;
  background: var(--bg-subtle);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 6px;
  min-height: 70px;
  overflow: hidden;
}

$scope .eq {
  font-family: 'Rubik', 'Assistant', Arial, sans-serif;
  font-size: 15px;
  line-height: 18px;
  font-weight: 500;
  direction: ltr;
  unicode-bidi: isolate;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

$scope .answer-line {
  display: block !important;
  width: 100% !important;
  min-width: 0 !important;
  min-height: 40px !important;
  height: auto !important;
  border: 1px solid var(--border-light) !important;
  border-radius: 6px;
  background-color: var(--bg-paper);
  background-image:
    linear-gradient(to bottom, transparent 21px, var(--grid-line) 21px, var(--grid-line) 22px),
    linear-gradient(to right, transparent 21px, var(--grid-line) 21px, var(--grid-line) 22px);
  background-size: 22px 22px;
  background-repeat: repeat;
}
/* YANIV_REG_EQ_STYLE_END */
"@

    $css = $css.TrimEnd() + [Environment]::NewLine + [Environment]::NewLine + $block
    if ($css -ne $oldCss) {
      New-Item -ItemType Directory -Force (Split-Path $cssPath) | Out-Null
      Set-Content $cssPath $css -Encoding UTF8
      $changed.Add($cssFile)
      $cssChanged++
      Write-Host "CSS aligned: $cssFile"
    }
  }
}

Write-Host '=== VALIDATE NO INLINE CSS / NO START ATTRS ==='
$bad = @()
foreach ($file in $pages) {
  $h = Get-Content (Join-Path $repoRoot $file) -Raw -Encoding UTF8
  if ($h -match '\sstyle\s*=') { $bad += "$file inline-style" }
  if ($h -match '\sstart\s*=') { $bad += "$file start-attr" }
}
if ($bad.Count -gt 0) {
  $bad | ForEach-Object { Write-Host "BAD: $_" }
  throw 'Validation failed before tests.'
}

Write-Host '=== WRITE STATE REPORT ==='
New-Item -ItemType Directory -Force '.\STATE' | Out-Null
$report = '.\STATE\EQUATIONS_REGULAR_DESIGN_REPAIR.md'
@"
# Regular equations design repair

Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

Pages checked: $($pages.Count)
HTML files cleaned: $htmlChanged
CSS files aligned: $cssChanged

Rules enforced:
- no inline CSS in equations HTML
- no ordered-list start attributes for regular equations
- no per-exercise visible numbering
- regular-equations answer areas use quadratic-page visual language
- styling stays in CSS files, not HTML
"@ | Set-Content $report -Encoding UTF8
$changed.Add($report)

Write-Host '=== INSTALL / TESTS ==='
& $npm install
& $npm test
& $npm run verify
& $npm run validate:access

Write-Host '=== STAGE SAFE FILES ==='
foreach ($f in ($changed | Sort-Object -Unique)) {
  & $git add -- $f
}

$staged = & $git diff --cached --name-only
Write-Host '=== STAGED FILES ==='
$staged
$unsafe = $staged | Select-String 'dist|settings.local|node_modules|package.json|scripts/|tests/|\.github|styles/a4-base.css|meta/topics.json|mobile-topics.json'
if ($unsafe) {
  & $git reset
  throw 'UNSAFE_STAGED'
}

Write-Host '=== COMMIT / PUSH ==='
& $git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  & $git commit -m 'Align regular equations design without exercise numbering'
  & $git push origin main
} else {
  Write-Host 'NO_CHANGES_TO_COMMIT'
}

Write-Host '=== STATUS ==='
& $git status -sb
& $git log --oneline -8

if (Test-Path $gh) {
  Write-Host '=== ACTIONS ==='
  try { & $gh run list --limit 8 } catch { Write-Host 'GH_NOT_LOGGED_IN_OR_NOT_AVAILABLE' }
} else {
  Write-Host 'GH_NOT_FOUND'
}

Write-Host 'DONE_REPAIR_REGULAR_EQUATIONS_SCRIPT'
