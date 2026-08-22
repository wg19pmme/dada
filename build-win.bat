@echo off
setlocal
chcp 65001 >nul
title GPT Image 便携版 - Windows 桌面打包

rem ============================================================
rem  GPT Image 本地便携版 —— Windows 桌面 App（.exe）打包
rem  用法：双击本文件即可，全程无需敲命令。
rem
rem  作用：调用 Tauri 把本项目打成原生 Windows 桌面应用
rem        （.exe / .msi 安装包），双击即开、无需装 Node/浏览器。
rem
rem  前置条件（一次性，均为图形界面安装，不用敲命令）：
rem    1) 安装 Rust：  https://www.rust-lang.org/tools/install
rem    2) 安装 WebView2 运行库（Win10/11 一般已自带）
rem ============================================================

cd /d "%~dp0"

echo.
echo  ============================================
echo    GPT Image 便携版 正在打包 Windows 桌面版...
echo  ============================================
echo.

rem ---------- 1. 检查 Rust ----------
where cargo >nul 2>nul
if errorlevel 1 (
    echo  [错误] 未检测到 Rust。
    echo         打包桌面 .exe 需要先安装 Rust（一次性）。
    echo         请打开 https://www.rust-lang.org/tools/install 下载安装。
    echo         安装完成后重新双击本文件即可。
    echo.
    pause
    exit /b 1
)

rem ---------- 2. 检查/安装前端依赖 ----------
if not exist "node_modules\" (
    echo  [首次运行] 正在安装前端依赖，请稍候...
    call npm install
    if errorlevel 1 (
        echo  [错误] 依赖安装失败，请检查网络后重试。
        pause
        exit /b 1
    )
)

rem ---------- 3. 执行 Tauri 打包 ----------
echo  [打包中] 正在编译原生应用并生成安装包，首次会较慢（需下载 Rust 依赖）...
echo           请耐心等待，不要关闭本窗口。
echo.
call npm run tauri:build

if errorlevel 1 (
    echo.
    echo  [错误] 打包失败，请把上方错误信息发给我排查。
    pause
    exit /b 1
)

echo.
echo  ============================================
echo   打包成功！
echo  ============================================
echo   安装包位置：
echo     src-tauri\target\release\bundle\nsis\  (安装程序 .exe)
echo     src-tauri\target\release\bundle\msi\   (安装包)
echo     src-tauri\target\release\bundle\exe\   (免安装单文件)
echo.
echo   把 .exe 发给小白用户，双击安装即可使用，无需装任何环境。
echo.
pause
endlocal
