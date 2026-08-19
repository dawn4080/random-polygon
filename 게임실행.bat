@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo RP(Random Polygon) 실행 서버를 시작합니다.
echo 브라우저가 열리지 않으면 http://localhost:8000 으로 접속하세요.
start "" http://localhost:8000
where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server 8000
) else (
  python -m http.server 8000
)
pause
