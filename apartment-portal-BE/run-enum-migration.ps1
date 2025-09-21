# PowerShell script to run migration enum values
Write-Host "Running migration enum values..." -ForegroundColor Green

# Run migration script
Get-Content update-enum-values.sql | mysql -u root -p apartmentdb

if ($LASTEXITCODE -eq 0) {
    Write-Host "Migration successful!" -ForegroundColor Green
    Write-Host "Enum values synchronized:" -ForegroundColor Yellow
    Write-Host "- ServiceCategoryType: 9 new categories" -ForegroundColor Cyan
    Write-Host "- ServiceRequestStatus: PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED" -ForegroundColor Cyan
} else {
    Write-Host "Migration failed! Please check errors." -ForegroundColor Red
}