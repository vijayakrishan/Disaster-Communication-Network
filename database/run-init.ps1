$pwd = "Blacksquad@vj08"
$mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

$files = @(
    "01-create-databases.sql",
    "02-auth-schema.sql",
    "03-user-schema.sql",
    "04-worker-schema.sql",
    "05-team-schema.sql",
    "06-rescue-schema.sql",
    "07-device-schema.sql",
    "08-admin-schema.sql",
    "09-seed-data.sql"
)

foreach ($file in $files) {
    Write-Host "Executing $file..."
    Get-Content $file | & $mysql -u root "-p$pwd"
}

Write-Host "Running test verification..."
Get-Content 10-test-queries.sql | & $mysql -u root "-p$pwd"
Write-Host "Database initialization complete!"
