@echo off
cls
echo Aura Intelligence System
echo ==========================
echo.
echo 1. Run Gateway (foreground)
echo 2. Open TUI
echo 3. Show Gateway status
echo 4. Run onboard setup
echo 5. Exit
echo.

set /p choice=Enter your choice (1-5): 

if "%choice%"=="1" (
    echo.
    echo Starting Gateway...
    aura_intelligence gateway run --force
) else if "%choice%"=="2" (
    echo.
    echo Opening TUI...
    aura_intelligence tui
) else if "%choice%"=="3" (
    echo.
    echo Gateway Status:
    aura_intelligence gateway status
) else if "%choice%"=="4" (
    echo.
    echo Starting Onboard Setup...
    aura_intelligence onboard
) else if "%choice%"=="5" (
    echo.
    echo Exiting...
    exit /b 0
) else (
    echo.
    echo Invalid choice: %choice%
    pause
)
