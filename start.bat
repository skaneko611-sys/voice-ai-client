@echo off
rem voice-ai-clientをダブルクリック一つで起動するためのスクリプト。
rem 1. このファイルがあるフォルダに移動
rem 2. 別ウィンドウでサーバーを起動 (npm start)
rem 3. サーバーの起動を少し待ってから、専用のChromeプロファイルでページを自動的に開く
rem    (専用プロファイル + 自動再生制限の解除により、ボタンを押さなくても
rem     ページを開いた瞬間に通話が始まり、AIの声もそのまま再生される)

cd /d "%~dp0"

echo サーバーを起動しています...
start "voice-ai-client server" cmd /k npm start

echo Chromeが開くまで少々お待ちください...
timeout /t 3 /nobreak >nul

start "" chrome --user-data-dir="%~dp0chrome-profile" --autoplay-policy=no-user-gesture-required "http://localhost:3000"
