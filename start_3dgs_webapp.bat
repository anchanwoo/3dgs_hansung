@echo off
echo ====================================
echo 3D Gaussian Splatting 웹앱 시작
echo ====================================
echo.

REM 현재 디렉토리 저장
set CURRENT_DIR=%cd%

REM 1. ngrok 실행 (백그라운드)
echo [1/3] ngrok 터널 시작 중...
start "ngrok" cmd /c "ngrok http 5000 --domain=3dgs.ngrok.app"
echo ngrok 터널이 백그라운드에서 시작되었습니다.
echo.

REM 2초 대기 (ngrok 시작 시간)
timeout /t 2 /nobreak >nul

REM 2. Flask 백엔드 실행 (gsplat 가상환경)
echo [2/3] Flask 백엔드 시작 중...
cd /d "C:\Users\PC\3DGS_WebApp_API"
start "Flask Backend" cmd /c "call C:\Users\PC\miniconda3\Scripts\activate.bat gsplat && python appp.py"
echo Flask 백엔드가 백그라운드에서 시작되었습니다.
echo.

REM 5초 대기 (Flask 서버 시작 시간)
timeout /t 5 /nobreak >nul

REM 3. 프론트엔드 실행
echo [3/3] Next.js 프론트엔드 시작 중...
cd /d "%CURRENT_DIR%"
echo 프론트엔드가 시작됩니다...
echo.
echo ====================================
echo 모든 서비스가 시작되었습니다!
echo ====================================
echo.
echo 접속 주소:
echo - 로컬: http://localhost:3000
echo - 네트워크: http://192.168.55.183:3000
echo.
echo 종료하려면 이 창을 닫으세요.
echo ====================================
echo.

REM 프론트엔드는 현재 창에서 실행 (로그 확인을 위해)
npm run dev

REM 스크립트 종료 시 다른 프로세스들도 종료
echo.
echo 프론트엔드가 종료되었습니다.
echo 다른 서비스들을 종료하는 중...
taskkill /f /im ngrok.exe >nul 2>&1
taskkill /f /im python.exe >nul 2>&1
echo 모든 서비스가 종료되었습니다.
pause 