@echo off
chcp 65001 >nul
echo ========================================
echo    算法可视化平台 - 启动脚本
echo ========================================
echo.
echo 正在启动服务器...
echo 端口: 3000
echo 访问地址: http://localhost:3000
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.
node server.js
