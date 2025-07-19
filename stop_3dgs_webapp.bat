@echo off
echo ====================================
echo 3D Gaussian Splatting 웹앱 종료
echo ====================================
echo.

echo 실행 중인 서비스들을 종료하는 중...
echo.

REM ngrok 프로세스 종료
echo [1/3] ngrok 터널 종료 중...
taskkill /f /im ngrok.exe >nul 2>&1
if %errorlevel% == 0 (
    echo ngrok이 종료되었습니다.
) else (
    echo ngrok 프로세스를 찾을 수 없습니다.
)

REM Python (Flask) 프로세스 종료
echo [2/3] Flask 백엔드 종료 중...
taskkill /f /im python.exe >nul 2>&1
if %errorlevel% == 0 (
    echo Flask 백엔드가 종료되었습니다.
) else (
    echo Python 프로세스를 찾을 수 없습니다.
)

REM Node.js (Next.js) 프로세스 종료
echo [3/3] Next.js 프론트엔드 종료 중...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% == 0 (
    echo Next.js 프론트엔드가 종료되었습니다.
) else (
    echo Node.js 프로세스를 찾을 수 없습니다.
)

echo.
echo ====================================
echo 모든 서비스가 종료되었습니다!
echo ====================================
echo.
pause 