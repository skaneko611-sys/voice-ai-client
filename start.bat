@echo off
rem voice-ai-clientをダブルクリック一つで起動するためのスクリプト。
rem 1. このファイルがあるフォルダに移動
rem 2. 別ウィンドウでサーバーを起動 (npm start)
rem 3. サーバーの起動を少し待ってからChromeでページを自動的に開く

cd /d "%~dp0"

echo サーバーを起動しています...
start "voice-ai-client server" cmd /k npm start

echo Chromeが開くまで少々お待ちください...
timeout /t 3 /nobreak >nul

start "" chrome "http://localhost:3000"
