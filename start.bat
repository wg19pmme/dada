@echo off
setlocal
chcp 65001 >nul
title GPT Image 本地便携版

rem ============================================================
rem  GPT Image 本地便携版 —— Windows 一键启动
rem  用法：双击本文件即可，无需敲任何命令。
rem  会自动完成：检查环境 -> 安装依赖（首次）-> 启动服务 -> 打开浏览器
rem ============================================================

cd /d "%~dp0"

echo.
echo  ============================================
echo    GPT Image 本地便携版  正在启动...
echo  ============================================
echo.

rem ---------- 1. 检查 Node.js 是否已安装 ----------
where node >nul 2>nul
if errorlevel 1 (
    echo  [错误] 未检测到 Node.js。
    echo         本便携版需要 Node.js 18 及以上版本。
    echo         请前往 https://nodejs.org 下载并安装后，重新双击本文件。
    echo.
    pause
    exit /b 1
)

rem ---------- 2. 检查/安装依赖（首次运行自动安装） ----------
if not exist "node_modules\" (
    echo  [首次运行] 正在安装依赖，请耐心等待（可能需要几分钟）...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo  [错误] 依赖安装失败，请检查网络后重试。
        pause
        exit /b 1
    )
)

rem ---------- 3. 启动本地服务并自动打开浏览器 ----------
echo  [完成] 正在启动应用并自动打开浏览器...
echo  首次打开后请稍等片刻，如未自动弹出请手动访问：http://localhost:5173
echo.
echo  提示：关闭本窗口即停止应用。
echo.
call npm run dev -- --open

pause
endlocal
