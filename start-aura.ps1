# Start Aura Intelligence System
# This script simplifies running both the Gateway and TUI together

$ErrorActionPreference = "Stop"

Write-Host "Aura Intelligence System" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Check if aura_intelligence is available
if (-not (Get-Command aura_intelligence -ErrorAction SilentlyContinue)) {
    Write-Error "aura_intelligence command not found. Please run the installation first."
    exit 1
}

# Show version
$version = aura_intelligence --version
Write-Host "Version: $version" -ForegroundColor Green
Write-Host ""

# Display options
Write-Host "What would you like to do?" -ForegroundColor Yellow
Write-Host "1. Run Gateway (foreground)"
Write-Host "2. Open TUI"
Write-Host "3. Show Gateway status"
Write-Host "4. Run onboard setup"
Write-Host "5. Exit"
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host "`nStarting Gateway..." -ForegroundColor Cyan
        aura_intelligence gateway run --force
    }
    "2" {
        Write-Host "`nOpening TUI..." -ForegroundColor Cyan
        aura_intelligence tui
    }
    "3" {
        Write-Host "`nGateway Status:" -ForegroundColor Cyan
        aura_intelligence gateway status
    }
    "4" {
        Write-Host "`nStarting Onboard Setup..." -ForegroundColor Cyan
        aura_intelligence onboard
    }
    "5" {
        Write-Host "`nExiting..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Error "Invalid choice: $choice"
        exit 1
    }
}
