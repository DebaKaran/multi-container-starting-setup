# run-dev.ps1
Write-Host "Running Dev Mode on port 3001 ..."
docker-compose down
$env:BUILD_TARGET = "dev"
$env:DEV_PORT = "3001"
docker-compose -f docker-compose.yaml -f docker-compose.override.yaml up -d --build
