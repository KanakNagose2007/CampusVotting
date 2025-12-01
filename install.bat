@echo off
echo Installing CampusVote dependencies...
echo.

echo Installing root dependencies...
npm install

echo.
echo Installing server dependencies...
cd server
npm install

echo.
echo Installing client dependencies...
cd ../client
npm install

echo.
echo All dependencies installed successfully!
echo.
echo To start the application:
echo   npm run dev
echo.
echo Or run separately:
echo   npm run server    (backend)
echo   npm run client    (frontend)
echo.
pause
