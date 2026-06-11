param(
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Frontend = Join-Path $Root "frontend"
$Backend = Join-Path $Root "backend"
$Desktop = Join-Path $Root "desktop"
$BackendDist = Join-Path $Root "backend_dist"

Write-Host "== ROM-AI Windows EXE build =="
Write-Host "Project root: $Root"

if (-not $SkipInstall) {
  Write-Host "== Installing frontend dependencies =="
  Push-Location $Frontend
  npm install
  Pop-Location

  Write-Host "== Installing desktop dependencies =="
  Push-Location $Desktop
  npm install
  Pop-Location

  Write-Host "== Creating Python venv =="
  Push-Location $Backend
  if (-not (Test-Path ".venv")) {
    py -3 -m venv .venv
  }
  .\.venv\Scripts\python.exe -m pip install --upgrade pip
  .\.venv\Scripts\python.exe -m pip install -r requirements.txt pyinstaller
  Pop-Location
}

Write-Host "== Building frontend =="
Push-Location $Frontend
npm run build
Pop-Location

Write-Host "== Building backend executable =="
if (Test-Path $BackendDist) {
  Remove-Item $BackendDist -Recurse -Force
}
Push-Location $Backend
.\.venv\Scripts\pyinstaller.exe `
  --noconfirm `
  --clean `
  --name rom-ai-backend `
  --distpath $BackendDist `
  --workpath (Join-Path $Backend "build") `
  --specpath $Backend `
  --collect-all pydantic `
  --collect-all pydantic_settings `
  --collect-all fastapi `
  --collect-all uvicorn `
  desktop_server.py
Pop-Location

Write-Host "== Building Windows installer =="
Push-Location $Desktop
npm run dist:win
Pop-Location

Write-Host "== Done =="
Write-Host "Installer output:"
Get-ChildItem (Join-Path $Root "release") -Filter "*.exe" | Select-Object FullName, Length, LastWriteTime
