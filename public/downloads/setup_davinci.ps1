Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "  CLOUDLOCK - DAVINCI RESOLVE AUTO-CONFIGURATOR" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan

# 1. Provjera Z: diska
Write-Host "`n[1/4] Provjera CloudLock virtualnog pogona Z:\..." -ForegroundColor Cyan
if (-not (Test-Path "Z:\")) {
    Write-Host "   [UPOZORENJE] Disk Z:\ nije detektiran!" -ForegroundColor Yellow
    Write-Host "   Pokrenite CloudLock prije otvaranja DaVinci Resolvea." -ForegroundColor DarkGray
} else {
    Write-Host "   [OK] CloudLock virtualni disk Z:\ je aktivan." -ForegroundColor Green
}

# 2. Kreiranje lokalnog cache foldera
Write-Host "`n[2/4] Kreiranje lokalnog SSD direktorija za Cache..." -ForegroundColor Cyan
$localCache = Join-Path $env:USERPROFILE "Videos\CloudLock_ResolveCache"
$folders = @("ProxyMedia", "CacheClip", "Gallery")
foreach ($f in $folders) {
    $target = Join-Path $localCache $f
    if (-not (Test-Path $target)) {
        New-Item -ItemType Directory -Path $target -Force | Out-Null
    }
}
Write-Host "   [OK] Lokalni SSD cache spreman u: $localCache" -ForegroundColor Green

# 3. Dodavanje Z: u Media Storage listu
Write-Host "`n[3/4] Konfiguriranje DaVinci Resolve Media Storage diskova..." -ForegroundColor Cyan
$cfgDir = Join-Path $env:APPDATA "Blackmagic Design\DaVinci Resolve\Support\configs"
$cfgFile = Join-Path $cfgDir "config.dat"
if (-not (Test-Path $cfgDir)) { New-Item -ItemType Directory -Path $cfgDir -Force | Out-Null }

$needAdd = $true
if (Test-Path $cfgFile) {
    $raw = Get-Content -Path $cfgFile -Raw -ErrorAction SilentlyContinue
    if ($raw -and ($raw -match 'Z:\\' -or $raw -match 'Z:/')) {
        $needAdd = $false
        Write-Host "   [INFO] Z:\ je vec registriran u DaVinci postavkama." -ForegroundColor Yellow
    }
}
if ($needAdd) {
    Add-Content -Path $cfgFile -Value "Local.Media.Storage.1.Path = Z:\" -Encoding Ascii
    Write-Host "   [OK] Z:\ uspjesno dodan u Media Storage listu." -ForegroundColor Green
}

# 4. Instalacija DaVinci Utility Python skripte
Write-Host "`n[4/4] Instalacija Utility skripte za optimizaciju projekta..." -ForegroundColor Cyan
$scriptDir = Join-Path $env:APPDATA "Blackmagic Design\DaVinci Resolve\Support\Developer\Scripting\Scripts\Utility"
if (-not (Test-Path $scriptDir)) { New-Item -ItemType Directory -Path $scriptDir -Force | Out-Null }

$pyTarget = Join-Path $scriptDir "CloudLock_OptimizeProject.py"

$pythonLines = @(
    'import os',
    'import sys',
    'try:',
    '    import DaVinciResolveScript as dvr',
    '    resolve = dvr.scriptapp("Resolve")',
    'except ImportError:',
    '    paths = [',
    '        r"C:\Program Files\Blackmagic Design\DaVinci Resolve\Developer\Scripting\Modules",',
    '        r"C:\ProgramData\Blackmagic Design\DaVinci Resolve\Support\Developer\Scripting\Modules"',
    '    ]',
    '    for p in paths:',
    '        if os.path.exists(p) and p not in sys.path:',
    '            sys.path.append(p)',
    '    try:',
    '        import DaVinciResolveScript as dvr',
    '        resolve = dvr.scriptapp("Resolve")',
    '    except Exception:',
    '        resolve = None',
    'if not resolve:',
    '    print("[CLOUDLOCK] DaVinci Resolve mora biti pokrenut.")',
    '    sys.exit(0)',
    'pm = resolve.GetProjectManager()',
    'proj = pm.GetCurrentProject()',
    'if proj:',
    '    cb = os.path.join(os.path.expanduser("~"), "Videos", "CloudLock_ResolveCache")',
    '    proj.SetSetting("timelineWorkingFoldersProxy", os.path.join(cb, "ProxyMedia"))',
    '    proj.SetSetting("timelineWorkingFoldersCache", os.path.join(cb, "CacheClip"))',
    '    proj.SetSetting("timelineWorkingFoldersGalleryStills", os.path.join(cb, "Gallery"))',
    '    print(f"[CLOUDLOCK] Projekt {proj.GetName()} uspjesno postavljen na lokalni cache.")',
    'else:',
    '    print("[CLOUDLOCK] Nema otvorenog projekta.")'
)

$pythonLines | Set-Content -Path $pyTarget -Encoding UTF8
Write-Host "   [OK] Skripta instalirana u DaVinci Workspace meni:" -ForegroundColor Green
Write-Host "        Workspace -> Scripts -> Utility -> CloudLock_OptimizeProject" -ForegroundColor DarkGray

Write-Host "`n=============================================================" -ForegroundColor Cyan
Write-Host "  POSTAVLJANJE USPJESNO DOVRSENO!" -ForegroundColor Green
Write-Host "=============================================================" -ForegroundColor Cyan
