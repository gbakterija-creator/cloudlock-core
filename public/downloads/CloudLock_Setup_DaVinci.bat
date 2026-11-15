@echo off
TITLE CloudLock - DaVinci Resolve Auto-Setup
COLOR 0B
SETLOCAL EnableDelayedExpansion

echo.
echo  =============================================================
echo    CLOUDLOCK - DAVINCI RESOLVE AUTO-CONFIGURATOR
echo  =============================================================
echo.

:: 1. Provjera Z: pogona
echo [1/4] Provjera CloudLock virtualnog pogona Z:\...
if not exist "Z:\" (
    echo    [UPOZORENJE] Disk Z:\ nije detektiran!
    echo    Pokrenite CloudLock servis prije otvaranja DaVincija.
) else (
    echo    [OK] CloudLock virtualni disk Z:\ je aktivan.
)

:: 2. Kreiranje lokalnog cache direktorija
echo.
echo [2/4] Kreiranje lokalnog SSD direktorija za Cache...
set "LOCAL_CACHE=%USERPROFILE%\Videos\CloudLock_ResolveCache"
if not exist "%LOCAL_CACHE%\ProxyMedia" mkdir "%LOCAL_CACHE%\ProxyMedia"
if not exist "%LOCAL_CACHE%\CacheClip" mkdir "%LOCAL_CACHE%\CacheClip"
if not exist "%LOCAL_CACHE%\Gallery" mkdir "%LOCAL_CACHE%\Gallery"
echo    [OK] Cache mape spremne u: %LOCAL_CACHE%

:: 3. Registracija Z:\ u DaVinci Media Storage postavkama
echo.
echo [3/4] Konfiguriranje DaVinci Resolve Media Storage diskova...
set "CONFIG_DIR=%APPDATA%\Blackmagic Design\DaVinci Resolve\Support\configs"
set "CONFIG_FILE=%CONFIG_DIR%\config.dat"
if not exist "%CONFIG_DIR%" mkdir "%CONFIG_DIR%"

set "ALREADY_EXISTS=0"
if exist "%CONFIG_FILE%" (
    findstr /I "Z:\\" "%CONFIG_FILE%" >nul 2>&1
    if !ERRORLEVEL! EQU 0 set "ALREADY_EXISTS=1"
    findstr /I "Z:/" "%CONFIG_FILE%" >nul 2>&1
    if !ERRORLEVEL! EQU 0 set "ALREADY_EXISTS=1"
)

if "%ALREADY_EXISTS%"=="1" (
    echo    [INFO] Z:\ je vec registriran u postavkama.
) else (
    echo Local.Media.Storage.1.Path = Z:\>>"%CONFIG_FILE%"
    echo    [OK] Z:\ uspjesno dodan u Media Storage listu.
)

:: 4. Instalacija DaVinci Utility skripte
echo.
echo [4/4] Instalacija Utility skripte za optimizaciju projekta...
set "SCRIPT_DIR=%APPDATA%\Blackmagic Design\DaVinci Resolve\Support\Developer\Scripting\Scripts\Utility"
set "PY_FILE=%SCRIPT_DIR%\CloudLock_OptimizeProject.py"
if not exist "%SCRIPT_DIR%" mkdir "%SCRIPT_DIR%"

(
echo import os, sys
echo try:
echo     import DaVinciResolveScript as dvr
echo     resolve = dvr.scriptapp("Resolve"^)
echo except ImportError:
echo     paths = [r"C:\Program Files\Blackmagic Design\DaVinci Resolve\Developer\Scripting\Modules", r"C:\ProgramData\Blackmagic Design\DaVinci Resolve\Support\Developer\Scripting\Modules"]
echo     for p in paths:
echo         if os.path.exists(p^) and p not in sys.path: sys.path.append(p^)
echo     try:
echo         import DaVinciResolveScript as dvr
echo         resolve = dvr.scriptapp("Resolve"^)
echo     except Exception: resolve = None
echo if not resolve:
echo     print("[CLOUDLOCK] DaVinci Resolve mora biti pokrenut."^)
echo     sys.exit(0^)
echo pm = resolve.GetProjectManager(^); proj = pm.GetCurrentProject(^)
echo if proj:
echo     cb = os.path.join(os.path.expanduser("~"^), "Videos", "CloudLock_ResolveCache"^)
echo     proj.SetSetting("timelineWorkingFoldersProxy", os.path.join(cb, "ProxyMedia"^)^)
echo     proj.SetSetting("timelineWorkingFoldersCache", os.path.join(cb, "CacheClip"^)^)
echo     proj.SetSetting("timelineWorkingFoldersGalleryStills", os.path.join(cb, "Gallery"^)^)
echo     print(f"[CLOUDLOCK] Projekt {proj.GetName(^)} je optimiziran za lokalni cache."^)
echo else:
echo     print("[CLOUDLOCK] Nema otvorenog projekta."^)
) > "%PY_FILE%"

echo    [OK] Skripta instalirana u DaVinci Workspace meni:
echo         Workspace -^> Scripts -^> Utility -^> CloudLock_OptimizeProject

echo.
echo  =============================================================
echo    POSTAVLJANJE USPJESNO DOVRSENO!
echo  =============================================================
echo.
pause
exit /b 0