@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo RP(Random Polygon) React 개발 서버를 시작합니다.
where npm >nul 2>nul
if not %errorlevel%==0 (
  echo Node.js와 npm을 먼저 설치해 주세요.
  pause
  exit /b 1
)
if not exist node_modules (
  echo 필요한 패키지를 설치합니다.
  call npm install
)
start "" http://localhost:5173
call npm run dev
pause
