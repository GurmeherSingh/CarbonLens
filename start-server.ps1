# CarbonLens AI Server Startup
Write-Host "Starting CarbonLens AI Server..." -ForegroundColor Green

# Install required packages
Write-Host "Installing required packages..." -ForegroundColor Yellow
npm install express dotenv selfsigned

# Get IP address
$ipConfig = ipconfig
$ipAddress = ($ipConfig | Select-String "IPv4 Address" | Select-Object -First 1) -replace ".*: ", ""

Write-Host ""
Write-Host "Starting HTTPS Server..." -ForegroundColor Green
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "   Computer: https://localhost:3001" -ForegroundColor White
Write-Host "   iPhone:   https://$ipAddress:3001" -ForegroundColor White
Write-Host ""

# Start the server
node web-prototype/server.js
