@echo off
title Madame Pastel - Iniciador de Servicios

echo ========================================================
echo             MADAME PASTEL - INICIO AUTOMATICO
echo ========================================================
echo.

set "ROOT_DIR=%~dp0"

:: 1. Verificar si Node.js esta instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] No se encontro Node.js en el sistema.
    echo Por favor asegurate de tener Node.js instalado y agregado al PATH.
    echo Descarga: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Crear frontend\.env si no existe a partir del ejemplo
if not exist "%ROOT_DIR%frontend\.env" (
    if exist "%ROOT_DIR%frontend\.env.example" (
        echo [INFO] Generando frontend\.env desde .env.example...
        copy "%ROOT_DIR%frontend\.env.example" "%ROOT_DIR%frontend\.env" >nul
    )
)

:: 3. Verificar dependencias del backend
if not exist "%ROOT_DIR%backend\node_modules" (
    echo [AVISO] node_modules no encontrado en backend.
    echo Instalando dependencias del backend...
    pushd "%ROOT_DIR%backend"
    call npm install
    popd
)

:: 4. Verificar dependencias del frontend
if not exist "%ROOT_DIR%frontend\node_modules" (
    echo [AVISO] node_modules no encontrado en frontend.
    echo Instalando dependencias del frontend...
    pushd "%ROOT_DIR%frontend"
    call npm install
    popd
)

:: 5. Detectar puertos disponibles (Backend base: 5000, Frontend base: 3000)
for /f "tokens=*" %%a in ('node "%ROOT_DIR%scripts\findPort.js" 5000') do set BACKEND_PORT=%%a
for /f "tokens=*" %%a in ('node "%ROOT_DIR%scripts\findPort.js" 3000') do set FRONTEND_PORT=%%a

if "%BACKEND_PORT%" neq "5000" (
    echo [AVISO] Puerto 5000 en uso. Asignando puerto alternativo para Backend: %BACKEND_PORT%
) else (
    echo [OK] Puerto 5000 disponible para Backend.
)

if "%FRONTEND_PORT%" neq "3000" (
    echo [AVISO] Puerto 3000 en uso. Asignando puerto alternativo para Frontend: %FRONTEND_PORT%
) else (
    echo [OK] Puerto 3000 disponible para Frontend.
)
echo.

echo [1/2] Iniciando Servidor Backend (API en puerto %BACKEND_PORT%)...
start "Madame Pastel - Backend (API :%BACKEND_PORT%)" /D "%ROOT_DIR%backend" cmd /k "set PORT=%BACKEND_PORT%&& set FRONTEND_URL=http://localhost:%FRONTEND_PORT%&& echo Servidor Backend corriendo en http://localhost:%BACKEND_PORT% ... && npm start"

:: Pausa de 3 segundos para permitir que el backend inicie primero
ping -n 4 127.0.0.1 >nul

echo [2/2] Iniciando Servidor Frontend (React en puerto %FRONTEND_PORT%)...
start "Madame Pastel - Frontend (:%FRONTEND_PORT%)" /D "%ROOT_DIR%frontend" cmd /k "set PORT=%FRONTEND_PORT%&& set REACT_APP_API_URL=http://localhost:%BACKEND_PORT%&& echo Servidor Frontend corriendo en http://localhost:%FRONTEND_PORT% ... && npm start"

echo.
echo ========================================================
echo   Servicios iniciados con exito.
echo.
echo   - Backend (API):  http://localhost:%BACKEND_PORT%
echo   - Health Check:   http://localhost:%BACKEND_PORT%/health
echo   - Frontend:       http://localhost:%FRONTEND_PORT%
echo.
echo   Se han abierto 2 consolas independientes.
echo   Para detener cualquiera de los dos, cierra su ventana
echo   o ejecuta el archivo detener.bat
echo ========================================================
echo.
pause
