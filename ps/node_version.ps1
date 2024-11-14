# Check if Node.js is installed
$nodeVersion = & node -v 2>$null

if ($nodeVersion) {
    Write-Output $nodeVersion
} else {
    Write-Output ""
}