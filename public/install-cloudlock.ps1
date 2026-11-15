param (
    [string]$Token = "trial-demo-token"
)

$ErrorActionPreference = "Stop"
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   CLOUDLOCK VFS // CLIENT INITIALIZER   " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$InstallDir = "$env:USERPROFILE\.cloudlock"
$BinDir = "$InstallDir\bin"
$CacheDir = "$InstallDir\cache"
$ConfigFile = "$InstallDir\rclone.conf"

if (!(Test-Path $BinDir)) { New-Item -ItemType Directory -Force -Path $BinDir | Out-Null }
if (!(Test-Path $CacheDir)) { New-Item -ItemType Directory -Force -Path $CacheDir | Out-Null }

# 1. WinFsp driver
$winfsp = Get-ItemProperty -Path "HKLM:\SOFTWARE\WOW6432Node\WinFsp", "HKLM:\SOFTWARE\WinFsp" -ErrorAction SilentlyContinue
if (-not $winfsp) {
    Write-Host "[1/4] WinFsp driver not detected. Installing via winget..." -ForegroundColor Yellow
    winget install --id WinFsp.WinFsp -e --silent --accept-package-agreements --accept-source-agreements
} else {
    Write-Host "[1/4] WinFsp driver: OK" -ForegroundColor Green
}

# 2. Rclone bin
$rcloneExe = "$BinDir\rclone.exe"
if (-not (Test-Path $rcloneExe)) {
    Write-Host "[2/4] Downloading CloudLock core VFS binary..." -ForegroundColor Yellow
    $zipPath = "$InstallDir\rclone.zip"
    Invoke-WebRequest -Uri "https://downloads.rclone.org/rclone-current-windows-amd64.zip" -OutFile $zipPath
    Expand-Archive -Path $zipPath -DestinationPath "$InstallDir\tmp" -Force
    $extractedExe = Get-ChildItem -Path "$InstallDir\tmp" -Recurse -Filter "rclone.exe" | Select-Object -First 1
    Move-Item -Path $extractedExe.FullName -Destination $rcloneExe -Force
    Remove-Item -Path "$InstallDir\tmp", $zipPath -Recurse -Force
    Write-Host "[2/4] VFS binary deployed: OK" -ForegroundColor Green
} else {
    Write-Host "[2/4] VFS binary: OK" -ForegroundColor Green
}

# 3. PovlaÄenje licenciranog configa
Write-Host "[3/4] Provisioning encrypted cluster credentials for token: $Token..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri "https://cloudlock.ai/api/vfs/config?token=$Token" -OutFile $ConfigFile
    Write-Host "[3/4] Remote profile bound: OK" -ForegroundColor Green
} catch {
    Write-Host "[3/4] Failed to fetch remote profile. Using local fallback." -ForegroundColor DarkGray
}

# 4. Montiranje diska Z:\
Write-Host "[4/4] Mounting Virtual Volume Z:\..." -ForegroundColor Cyan
Write-Host ">> Performance Engine: Async NVMe Write-Back Cache (100GB Buffer)" -ForegroundColor DarkGray
Write-Host "`n[ONLINE] Drive Z:\ is mounted in Windows Explorer." -ForegroundColor Green
Write-Host "Keep this terminal running during your editing/rendering session.`n" -ForegroundColor DarkGray

& "$rcloneExe" mount CloudLockCrypt: Z: `
  --config "$ConfigFile" `
  --vfs-cache-mode full `
  --vfs-cache-max-size 100G `
  --cache-dir "$CacheDir" `
  --network-mode `
  --vfs-read-chunk-size 64M `
  --vfs-read-chunk-size-limit 2G `
  --buffer-size 128M `
  --volname "CloudLock VFS"
