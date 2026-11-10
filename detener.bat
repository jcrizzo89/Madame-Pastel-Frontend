@echo off
title Madame Pastel - Detener Servicios

echo ========================================================
echo             MADAME PASTEL - DETENER SERVICIOS
echo ========================================================
echo.

set "ROOT_DIR=%~dp0"

node "%ROOT_DIR%scripts\stopServices.js"

echo.
pause
