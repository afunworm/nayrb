# Check the current PowerShell version
$version = $PSVersionTable.PSVersion

# Define the minimum required version
$requiredVersion = [Version]"7.4"

if ($version -lt $requiredVersion) {
    Write-Output "Updating PowerShell from version $version to version $requiredVersion..."
    
    # Run the installation command to install the latest version
    iex "& { $(irm https://aka.ms/install-powershell.ps1) } -UseMSI -Quiet"
} else {
    Write-Output "PowerShell is up to date (version $version)."
}