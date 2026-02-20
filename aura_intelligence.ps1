#Requires -Version 5.0

# The batch file points to the correct project root, so we can use that
$batchPath = Join-Path $PSScriptRoot "aura_intelligence.cmd"
if (Test-Path $batchPath) {
    & $batchPath @args
} else {
    Write-Error "aura_intelligence.cmd not found in $PSScriptRoot"
    exit 1
}
