$version = $PSVersionTable.PSVersion

if ($version) {
    Write-Output "$($version.Major).$($version.Minor)"
} else {
    Write-Output "Unknown PowerShell Version"
}