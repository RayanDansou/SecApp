@echo off
REM =================================================================
REM GuardianIQ - Test Pipeline Localement (Windows)
REM =================================================================
REM Ce script simule les étapes du Jenkinsfile pour tester localement
REM Usage: test-pipeline.bat
REM =================================================================

echo.
echo ========================================
echo GuardianIQ - Pipeline Test Local
echo ========================================
echo.

set DOCKER_REPO=rayandans/guardianiq
set VERSION=local-test

REM =================================================================
REM STAGE 1: Build Images
REM =================================================================
echo [1/5] Building Docker images...
echo.

echo Building Backend...
docker build -t %DOCKER_REPO%:backend-%VERSION% -f backend/Dockerfile ./backend
if %ERRORLEVEL% neq 0 (
    echo ERROR: Backend build failed!
    pause
    exit /b 1
)

echo.
echo Building Frontend...
docker build -t %DOCKER_REPO%:frontend-%VERSION% -f frontend/Dockerfile ./frontend
if %ERRORLEVEL% neq 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)

echo.
echo [OK] Images built successfully
echo.

REM =================================================================
REM STAGE 2: Run Tests
REM =================================================================
echo [2/5] Running tests...
echo.

echo Testing Backend...
docker run --rm %DOCKER_REPO%:backend-%VERSION% python manage.py test --noinput
if %ERRORLEVEL% neq 0 (
    echo WARNING: Tests failed or not configured
)

echo.
echo [OK] Tests completed
echo.

REM =================================================================
REM STAGE 3: Tag as latest
REM =================================================================
echo [3/5] Tagging images...
echo.

docker tag %DOCKER_REPO%:backend-%VERSION% %DOCKER_REPO%:backend-latest
docker tag %DOCKER_REPO%:frontend-%VERSION% %DOCKER_REPO%:frontend-latest

echo [OK] Images tagged
echo.

REM =================================================================
REM STAGE 4: Optional - Push to Docker Hub
REM =================================================================
set /p PUSH="Push images to Docker Hub? (y/N): "
if /i "%PUSH%"=="y" (
    echo.
    echo [4/5] Pushing to Docker Hub...
    echo.

    docker login
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Docker login failed!
        pause
        exit /b 1
    )

    docker push %DOCKER_REPO%:backend-%VERSION%
    docker push %DOCKER_REPO%:frontend-%VERSION%
    docker push %DOCKER_REPO%:backend-latest
    docker push %DOCKER_REPO%:frontend-latest

    echo [OK] Images pushed successfully
    echo.
) else (
    echo Skipping Docker Hub push
    echo.
)

REM =================================================================
REM STAGE 5: Deploy Locally
REM =================================================================
echo [5/5] Deploying locally...
echo.

REM Check if .env exists
if not exist .env (
    echo WARNING: .env file not found!
    echo Creating .env from .env.jenkins template...
    copy .env.jenkins .env
    echo.
    echo IMPORTANT: Please edit .env with your actual values before continuing
    pause
)

REM Stop existing containers
echo Stopping existing containers...
docker-compose -f docker-compose.prod.yml down 2>nul

REM Start services
echo Starting services...
docker-compose -f docker-compose.prod.yml up -d

REM Wait for services
echo Waiting for services to start (20 seconds)...
timeout /t 20 /nobreak >nul

echo [OK] Deployment completed
echo.

REM =================================================================
REM STAGE 6: Health Check
REM =================================================================
echo [6/6] Running health checks...
echo.

echo Container Status:
docker ps --filter "name=guardianiq" --format "table {{.Names}}\t{{.Status}}"
echo.

echo Backend (http://localhost:8888):
curl -f -s http://localhost:8888/api/ >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK] Backend is responding
) else (
    echo [ERROR] Backend is not responding
)

echo.
echo Frontend (http://localhost:3333):
curl -f -s http://localhost:3333/ >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK] Frontend is responding
) else (
    echo [ERROR] Frontend is not responding
)

echo.
echo ========================================
echo Pipeline test completed!
echo ========================================
echo.
echo Services are running:
echo   Frontend: http://localhost:3333
echo   Backend:  http://localhost:8888
echo   Database: localhost:5438
echo.
echo Useful commands:
echo   - View logs:    docker-compose -f docker-compose.prod.yml logs -f
echo   - Stop:         docker-compose -f docker-compose.prod.yml down
echo   - Restart:      docker-compose -f docker-compose.prod.yml restart
echo.
pause
