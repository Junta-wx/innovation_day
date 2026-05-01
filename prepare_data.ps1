
# Process Performance CSV
$csvPath = "data_team1\shared\edr_partnership_hackathon_data.csv"
$csvData = Import-Csv $csvPath
$performanceJson = $csvData | ConvertTo-Json -Compress

# Process Marketing MD
$marketingPath = "data_team1\marketing\shared\cip_campaigns_summary.md"
$marketingContent = Get-Content $marketingPath -Raw
$campaigns = @()
$sections = $marketingContent -split "## "
foreach ($section in $sections) {
    if ($section -match "^(.+)\r?\n- \*\*Week:\*\* (.+)\r?\n- \*\*Date:\*\* (.+)\r?\n- \*\*Owner:\*\* (.+)\r?\n- \*\*Manager:\*\* (.+)\r?\n- \*\*Priority:\*\* (.+)\r?\n- \*\*Complexity:\*\* (.+)\r?\n- \*\*Team:\*\* (.+)\r?\n- \*\*Partner:\*\* (.+)") {
        $campaigns += @{
            name = $matches[1].Trim()
            week = $matches[2].Trim()
            date = $matches[3].Trim()
            owner = $matches[4].Trim()
            manager = $matches[5].Trim()
            priority = $matches[6].Trim()
            complexity = $matches[7].Trim()
            team = $matches[8].Trim()
            partner = $matches[9].Trim()
        }
    }
}
$marketingJson = $campaigns | ConvertTo-Json -Compress

# Process Meetings and Contracts
$meetings = Get-ChildItem -Recurse data_team1\meetings | Where-Object { $_.PsIsContainer -eq $false -and $_.Name -notmatch "Instructions" } | Select-Object Name, @{Name="Partner"; Expression={$_.Directory.Name}}, Length, LastWriteTime
$contracts = Get-ChildItem -Recurse data_team1\contracts | Where-Object { $_.PsIsContainer -eq $false -and $_.Name -notmatch "Instructions" } | Select-Object Name, @{Name="Partner"; Expression={$_.Directory.Name}}, Length, LastWriteTime

$meetingsJson = $meetings | ConvertTo-Json -Compress
$contractsJson = $contracts | ConvertTo-Json -Compress

# Write to data.js
$dataJs = "const performanceData = $performanceJson;`n"
$dataJs += "const marketingData = $marketingJson;`n"
$dataJs += "const meetingsData = $meetingsJson;`n"
$dataJs += "const contractsData = $contractsJson;"
Set-Content -Path "data.js" -Value $dataJs
