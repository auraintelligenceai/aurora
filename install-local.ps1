# Install local aura_intelligence CLI wrapper for Windows
# This allows running 'aura_intelligence' from anywhere using the local development version
# This script works on any machine the project might be installed on

param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "Installing local aura_intelligence CLI wrapper..." -ForegroundColor Cyan

# Project root directory (where this script is located)
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
Write-Host "Project root: $projectRoot" -ForegroundColor Gray

# Check if dist folder exists
$distPath = Join-Path $projectRoot "dist"
$entryPath = Join-Path $distPath "entry.js"

if (-not (Test-Path $entryPath)) {
    Write-Host "Error: $entryPath not found. Please build the project first with 'pnpm build'" -ForegroundColor Red
    exit 1
}

# Determine npm prefix directory
try {
    $npmPrefix = (npm config get prefix 2>$null).Trim()
} catch {
    Write-Host "Error: Cannot determine npm prefix" -ForegroundColor Red
    exit 1
}

Write-Host "npm prefix: $npmPrefix" -ForegroundColor Gray

# Create batch file
$batchPath = Join-Path $npmPrefix "aura_intelligence.cmd"
$batchContent = "@echo off`r`nnode ""$projectRoot\dist\entry.js"" %*`r`n"

if (Test-Path $batchPath) {
    if ($Force) {
        Write-Host "Overwriting existing file: $batchPath" -ForegroundColor Yellow
    } else {
        Write-Host "File already exists: $batchPath" -ForegroundColor Yellow
        Write-Host "Use -Force to overwrite" -ForegroundColor Gray
        exit 0
    }
}

Set-Content -Path $batchPath -Value $batchContent -NoNewline
Write-Host "Created CLI wrapper: $batchPath" -ForegroundColor Green

# Create PowerShell script
$psPath = Join-Path $npmPrefix "aura_intelligence.ps1"
$psContent = @"
#Requires -Version 5.0
# Wrapper for aura_intelligence CLI (Windows PowerShell)
# This script is auto-generated

`$batchPath = Join-Path `$PSScriptRoot "aura_intelligence.cmd"
if (Test-Path `$batchPath) {
    & `$batchPath `@args
} else {
    Write-Error "aura_intelligence.cmd not found in `$PSScriptRoot"
    exit 1
}
"@

Set-Content -Path $psPath -Value $psContent -NoNewline
Write-Host "Created PowerShell wrapper: $psPath" -ForegroundColor Green

# Test if it works
Write-Host "Testing CLI..." -ForegroundColor Cyan
try {
    $version = aura_intelligence --version 2>&1
    Write-Host "Success! aura_intelligence version: $version" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not test CLI (you may need to restart your terminal)" -ForegroundColor Yellow
    Write-Host "Error details: $_" -ForegroundColor Gray
}

Write-Host "`nInstallation complete!" -ForegroundColor Green
Write-Host "You can now run 'aura_intelligence' commands from any directory" -ForegroundColor Gray
Write-Host "`nCommands available:" -ForegroundColor Yellow
Write-Host "  aura_intelligence --version  - Show version"
Write-Host "  aura_intelligence onboard   - Run setup wizard"
Write-Host "  aura_intelligence gateway   - Manage the gateway"
Write-Host "  aura_intelligence tui       - Open terminal UI"
Write-Host "  aura_intelligence --help    - Show all commands"
