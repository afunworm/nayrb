# Task settings
$taskName = "nayrb Manager"
$taskDescription = "nayrb Manager to ensure client's availability for configuration management."
$nodePath = "C:\Program Files\nodejs\node.exe"
$taskPath = "C:\nayrb\manager.mjs"

# Check if the task already exists
$task = Get-ScheduledTask | Where-Object { $_.TaskName -eq $taskName }

if ($task) {
    Write-Output "Task '$taskName' already exists."

    Start-ScheduledTask -TaskName $taskName
    
    Write-Output "Task '$taskName' started successfully."
} else {
    # Define the action to run the Node.js script using 'node' from PATH
    $action = New-ScheduledTaskAction -Execute $nodePath -Argument $taskPath -ErrorAction Stop

    # Define the trigger to run every 15 minutes
    $trigger = New-ScheduledTaskTrigger -Once -At 12am -RepetitionInterval (New-TimeSpan -Minutes 15) -ErrorAction Stop

    # Define task settings
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ErrorAction Stop

    # Define task principal
    $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest -ErrorAction Stop

    # Register the task
    Register-ScheduledTask -Action $action -Trigger $trigger -Settings $settings -TaskName $taskName -Description $taskDescription -Principal $principal

    Write-Output "Task '$taskName' created successfully."

    Start-ScheduledTask -TaskName $taskName
    
    Write-Output "Task '$taskName' started successfully."
}