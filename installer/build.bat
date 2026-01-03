@echo off
REM PromptMapGUI Build Script
REM This script automates the build process for creating the Windows installer

echo.
echo ===============================================================
echo   PromptMapGUI Windows Installer Build Script
echo ===============================================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

echo [1/4] Checking PyInstaller...
pip show pyinstaller >nul 2>&1
if errorlevel 1 (
    echo PyInstaller not found. Installing...
    pip install pyinstaller
    if errorlevel 1 (
        echo ERROR: Failed to install PyInstaller
        pause
        exit /b 1
    )
)

echo [2/4] Building standalone executable with PyInstaller...
echo This may take a few minutes...
cd /d "%~dp0.."
pyinstaller --onefile --windowed --name PromptMapGUI --icon=installer\icon.ico installer\launcher.py
if errorlevel 1 (
    echo ERROR: PyInstaller build failed
    pause
    exit /b 1
)

echo.
echo [3/4] Checking for Inno Setup...
set INNO_PATH=C:\Program Files (x86)\Inno Setup 6\ISCC.exe
if not exist "%INNO_PATH%" (
    set INNO_PATH=C:\Program Files\Inno Setup 6\ISCC.exe
)
if not exist "%INNO_PATH%" (
    echo.
    echo WARNING: Inno Setup not found at expected locations
    echo.
    echo Please install Inno Setup 6 from:
    echo https://jrsoftware.org/isdl.php
    echo.
    echo After installation, run this script again.
    pause
    exit /b 1
)

echo [4/4] Compiling installer with Inno Setup...
cd installer
"%INNO_PATH%" setup.iss
if errorlevel 1 (
    echo ERROR: Inno Setup compilation failed
    pause
    exit /b 1
)

echo.
echo ===============================================================
echo   Build Complete!
echo ===============================================================
echo.
echo Installer created at:
echo   installer\output\PromptMapGUI-Setup-v2.0.exe
echo.
echo You can now distribute this installer to users.
echo.
pause
