@echo off
setlocal
where node >nul 2>&1 || (
  echo Node.js 20 ou superieur est requis.
  pause
  exit /b 1
)
start "" http://127.0.0.1:4173
node scripts\server.mjs
