@echo off
echo ========================================
echo    Automata Studio - Starting Server
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7 or higher from https://www.python.org/
    pause
    exit /b 1
)

echo [1/4] Checking dependencies...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
)

echo [2/4] Checking Groq API key...
if "%GROQ_API_KEY%"=="" (
    echo.
    echo WARNING: GROQ_API_KEY not set!
    echo AI Assistant features will be disabled.
    echo.
    echo To enable AI features:
    echo 1. Get API key from https://console.groq.com/keys
    echo 2. Run: setx GROQ_API_KEY "your_key_here"
    echo 3. Restart this script
    echo.
    echo See GROQ_SETUP.md for detailed instructions.
    echo.
    timeout /t 5
) else (
    echo Groq API key found! AI features enabled.
)

echo [3/4] Starting Flask server...
echo.
echo Server will start at: http://127.0.0.1:5000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

python app.py

pause
