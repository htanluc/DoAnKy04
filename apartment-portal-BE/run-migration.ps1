# PowerShell script to run database migration
# Make sure MySQL is running and accessible

Write-Host "Running database migration to add attachment_urls field..."

# Read the SQL file
$sqlContent = Get-Content "add-attachment-urls-field.sql" -Raw

# Execute SQL commands
try {
    # You may need to adjust the MySQL path and credentials
    $mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    
    if (Test-Path $mysqlPath) {
        & $mysqlPath -u root -p apartmentdb -e $sqlContent
        Write-Host "Migration completed successfully!"
    } else {
        Write-Host "MySQL not found at $mysqlPath"
        Write-Host "Please run the migration manually:"
        Write-Host "1. Open MySQL Workbench or command line"
        Write-Host "2. Connect to apartmentdb database"
        Write-Host "3. Run the following SQL:"
        Write-Host $sqlContent
    }
} catch {
    Write-Host "Error running migration: $($_.Exception.Message)"
    Write-Host "Please run the migration manually using MySQL Workbench or command line"
}
