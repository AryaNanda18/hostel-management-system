@echo off
echo Starting Backend Server...
start cmd /k "cd backend && call venv\Scripts\activate.bat && python app.py"

echo Starting Frontend Server...
start cmd /k "cd frontend && npm run dev"

echo Both servers are starting in new windows!
