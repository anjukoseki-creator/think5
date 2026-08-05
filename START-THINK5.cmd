@echo off
title THINK5 - close this window to stop the app
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
echo ==========================================================
echo   THINK5 starting...  (opens http://localhost:3100)
echo   Keep this window open while using the app.
echo   Close this window to stop.
echo ==========================================================
rem open the browser a few seconds after the server boots
start "" /b cmd /c "timeout /t 4 >nul & start "" http://localhost:3100"
npm start
