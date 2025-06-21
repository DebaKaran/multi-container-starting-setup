# run-prod.ps1
Write-Host "Running Prod Mode (nginx on port 3000 -> 80) ..."
docker-compose -f docker-compose.yaml down
$env:BUILD_TARGET = "frontend-react"
docker-compose -f docker-compose.yaml up --build
