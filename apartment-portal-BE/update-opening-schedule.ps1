# Script to update opening_schedule column to LONGTEXT
$connectionString = "Server=localhost;Database=ApartmentDB;Uid=root;Pwd=123456;"
$sql = "ALTER TABLE facilities MODIFY COLUMN opening_schedule LONGTEXT NULL COMMENT 'Lịch mở cửa theo tuần';"

try {
    Add-Type -AssemblyName System.Data
    $connection = New-Object System.Data.Odbc.OdbcConnection
    $connection.ConnectionString = "Driver={MySQL ODBC 8.0 Unicode Driver};Server=localhost;Database=ApartmentDB;User=root;Password=123456;"
    $connection.Open()
    
    $command = $connection.CreateCommand()
    $command.CommandText = $sql
    $result = $command.ExecuteNonQuery()
    
    Write-Host "Successfully updated opening_schedule column to LONGTEXT"
    $connection.Close()
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Please run this SQL manually in your MySQL client:"
    Write-Host $sql
}
