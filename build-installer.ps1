#!/usr/bin/env pwsh
# Jelly Bean Engine - Windows Installer Builder (PowerShell)
# Run as Administrator on your Windows PC

param(
    [ValidateSet('check', 'build-nsis', 'build-electron-builder', 'test')]
    [string]$Action = 'check'
)

$projectRoot = $PSScriptRoot
$releaseFolder = Join-Path $projectRoot 'release'
$packagedApp = Join-Path $releaseFolder 'Jelly Bean Engine-win32-x64'
$nsisScript = Join-Path $projectRoot 'build' 'installer.nsi'
$nsisOutput = Join-Path $releaseFolder 'Jelly Bean Engine Setup v1.0.0.exe'

function Write-Status {
    param([string]$Message, [ValidateSet('Info', 'Success', 'Warning', 'Error')]$Type = 'Info')
    $colors = @{
        'Info'    = 'Cyan'
        'Success' = 'Green'
        'Warning' = 'Yellow'
        'Error'   = 'Red'
    }
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $colors[$Type]
}

function Check-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    # Check Node.js
    try {
        $node = npm --version
        Write-Status "✓ npm version: $node" -Type Success
    } catch {
        Write-Status "✗ npm not found. Install Node.js first." -Type Error
        return $false
    }
    
    # Check packaged app
    if (Test-Path $packagedApp) {
        Write-Status "✓ Packaged app found: $packagedApp" -Type Success
    } else {
        Write-Status "✗ Packaged app not found. Run: npm run package:simple:win" -Type Warning
        return $false
    }
    
    # Check NSIS
    $nsis = where.exe makensis 2>$null
    if ($nsis) {
        Write-Status "✓ NSIS found: $nsis" -Type Success
        return $true
    } else {
        Write-Status "⚠ NSIS not found. Install from: https://nsis.sourceforge.io/Download" -Type Warning
        Write-Status "  Or use: npm run package:win (electron-builder)" -Type Info
        return $false
    }
}

function Build-Nsis {
    Write-Status "Building NSIS installer..."
    
    $nsis = where.exe makensis 2>$null
    if (-not $nsis) {
        Write-Status "✗ makensis not found in PATH" -Type Error
        Write-Status "  Install NSIS or add to PATH: C:\Program Files (x86)\NSIS" -Type Info
        return $false
    }
    
    if (-not (Test-Path $nsisScript)) {
        Write-Status "✗ NSIS script not found: $nsisScript" -Type Error
        return $false
    }
    
    try {
        Write-Status "Running makensis..." -Type Info
        & $nsis $nsisScript
        
        if (Test-Path $nsisOutput) {
            $size = (Get-Item $nsisOutput).Length / 1MB
            Write-Status "✓ Installer created successfully!" -Type Success
            Write-Status "  Location: $nsisOutput" -Type Success
            Write-Status "  Size: {0:F1} MB" -f $size -Type Success
            return $true
        } else {
            Write-Status "✗ Installer was not created" -Type Error
            return $false
        }
    } catch {
        Write-Status "✗ Error running makensis: $_" -Type Error
        return $false
    }
}

function Build-ElectronBuilder {
    Write-Status "Building with electron-builder..."
    
    try {
        Write-Status "Running: npm run package:win" -Type Info
        & npm run package:win
        
        $builderOutput = Join-Path $projectRoot 'dist' '*.exe'
        if (Get-ChildItem $builderOutput -ErrorAction SilentlyContinue) {
            $exe = Get-ChildItem $builderOutput | Select-Object -First 1
            $size = $exe.Length / 1MB
            Write-Status "✓ Installer created successfully!" -Type Success
            Write-Status "  Location: $($exe.FullName)" -Type Success
            Write-Status "  Size: {0:F1} MB" -f $size -Type Success
            return $true
        } else {
            Write-Status "✗ electron-builder may have failed" -Type Error
            return $false
        }
    } catch {
        Write-Status "✗ Error running electron-builder: $_" -Type Error
        return $false
    }
}

function Test-Installer {
    Write-Status "Locating installer..."
    
    $nsis = Get-ChildItem (Join-Path $releaseFolder '*.exe') -ErrorAction SilentlyContinue | Select-Object -First 1
    $builder = Get-ChildItem (Join-Path $projectRoot 'dist' '*.exe') -ErrorAction SilentlyContinue | Select-Object -First 1
    
    $installer = $nsis ?? $builder
    
    if ($installer) {
        Write-Status "Found: $($installer.FullName)" -Type Success
        Write-Status "Running installer test..." -Type Info
        & $installer.FullName
    } else {
        Write-Status "✗ No installer found. Build one first." -Type Error
    }
}

# Main
Write-Status "Jelly Bean Engine - Windows Installer Builder" -Type Info
Write-Status "Action: $Action" -Type Info

switch ($Action) {
    'check' {
        Check-Prerequisites | Out-Null
    }
    'build-nsis' {
        if (Check-Prerequisites) {
            Build-Nsis | Out-Null
        }
    }
    'build-electron-builder' {
        Build-ElectronBuilder | Out-Null
    }
    'test' {
        Test-Installer | Out-Null
    }
    default {
        Write-Status "Usage: .\build-installer.ps1 -Action check|build-nsis|build-electron-builder|test" -Type Info
    }
}

Write-Status "Done." -Type Success
