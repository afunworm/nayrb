$serviceName = "Zabbix Agent 2"
$service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue

if ($service) {
    Write-Output "1"
} else {
    Write-Output "0"
}