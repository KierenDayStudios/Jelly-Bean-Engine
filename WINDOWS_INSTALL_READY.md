# 🎮 Jelly Bean Engine - Ready for Windows Installation

## ✅ What's Ready

Your Jelly Bean Engine has been successfully packaged as a Windows application. The packaged app is in:
```
release\Jelly Bean Engine-win32-x64\
```

You can now create a proper Windows installer using one of three methods below.

---

## 🚀 Quick Start (Choose One Method)

### Method 1: NSIS Installer (Recommended) ⭐
**Best for:** Traditional Windows users who expect a .exe installer

**On your Windows PC, open PowerShell as Administrator and run:**

```powershell
cd 'C:\Users\paulk\Downloads\jelly-bean-engine-v1.0 (1)'
.\build-installer.ps1 -Action check
```

If NSIS is not installed:
1. Download NSIS: https://nsis.sourceforge.io/Download
2. Install to default location
3. Run again:
   ```powershell
   .\build-installer.ps1 -Action build-nsis
   ```

**Result:** Creates `release\Jelly Bean Engine Setup v1.0.0.exe` (~250 MB)

---

### Method 2: electron-builder (One-Command) ⚡
**Best for:** If you want automatic updates later

**On your Windows PC, open PowerShell as Administrator and run:**

```powershell
cd 'C:\Users\paulk\Downloads\jelly-bean-engine-v1.0 (1)'
npm run package:win
```

**Result:** Creates `dist\Jelly Bean Engine Setup 1.0.0.exe` (~250 MB)

---

### Method 3: Portable App Folder (Simplest)
**Best for:** Internal distribution or testing

**Already done!** The packaged app is ready in:
```
release\Jelly Bean Engine-win32-x64\
```

Just:
1. Zip the entire `Jelly Bean Engine-win32-x64` folder
2. Share the zip file
3. Users extract and run `Jelly Bean Engine.exe`

---

## 📁 Files Created for You

| File | Purpose |
|------|---------|
| `electron/main.cjs` | Electron main process (loads your web app) |
| `electron/preload.cjs` | Security context bridge |
| `build/installer.nsi` | NSIS installer script |
| `build-installer.ps1` | PowerShell helper script (check, build, test) |
| `WINDOWS_INSTALLER_GUIDE.md` | Detailed guide with all options |
| `INSTALLER_WINDOWS.md` | Quick reference |
| `package.json` | Updated with build scripts |

---

## 🎯 Installation Commands at a Glance

### Option A: NSIS (Recommended)
```powershell
# Check if everything is ready
.\build-installer.ps1 -Action check

# Build NSIS installer
.\build-installer.ps1 -Action build-nsis

# Test the installer
.\build-installer.ps1 -Action test
```

### Option B: electron-builder
```powershell
# Build installer (single command)
npm run package:win

# Run the installer to test
Get-ChildItem dist\*.exe | ForEach-Object { & $_.FullName }
```

### Option C: Just Use Portable App
```powershell
# Zip it for distribution
Compress-Archive `
  -Path 'release\Jelly Bean Engine-win32-x64' `
  -DestinationPath 'release\Jelly Bean Engine-Portable.zip' `
  -Force

# Share the zip file!
```

---

## 📦 Distribution

### For Installer Method (Options A & B)
- Share the `.exe` file
- File size: ~250 MB
- Users run .exe → Choose installation path → App installed to Program Files → Desktop shortcut created

### For Portable Method (Option C)
- Share the `.zip` file  
- Users extract → Run `Jelly Bean Engine.exe` directly
- No installation required

---

## 🔧 Customization

### Change App Icon
1. Create icon (256x256 PNG)
2. Convert to `.ico` format
3. Save to: `build/icon.ico`
4. Rebuild using chosen method

### Change App Name/Version
Edit `package.json`:
```json
{
  "version": "1.0.0",
  "build": {
    "productName": "Jelly Bean Engine",
    "appId": "com.jellybean.engine"
  }
}
```

### Add License Agreement
Edit `build/installer.nsi` to include license page

---

## ✨ Next Steps

**Choose your preferred method above and run the commands on your Windows PC as Administrator.**

1. ✅ Packaged app is ready: `release\Jelly Bean Engine-win32-x64\`
2. 🔨 Create installer using Method 1, 2, or 3
3. 🧪 Test by running the installer or exe
4. 📤 Distribute to users

---

## 📝 Installation Experience (User Perspective)

### What users see with NSIS installer:
1. Double-click `Jelly Bean Engine Setup v1.0.0.exe`
2. Choose installation location (default: `C:\Program Files\Jelly Bean Engine`)
3. Wait for files to copy (~30 seconds)
4. Desktop shortcut appears automatically
5. Double-click desktop shortcut → App launches
6. Can uninstall via Control Panel → Programs and Features

### What users see with portable app:
1. Extract zip file
2. Double-click `Jelly Bean Engine.exe`
3. App launches immediately
4. Can move folder anywhere or create shortcuts manually

---

## 🆘 Troubleshooting

**"makensis not found"**
- Install NSIS: https://nsis.sourceforge.io/Download

**"Cannot create symbolic link"**
- Run PowerShell as Administrator

**"App doesn't start after install"**
- Check that `electron/main.cjs` and `dist/index.html` exist
- Run locally to test: `npm run dist && npx electron .`

**"Installation hangs"**
- Disable antivirus temporarily
- Ensure sufficient disk space (2+ GB free)

---

## 📚 Additional Resources

- **WINDOWS_INSTALLER_GUIDE.md** - Comprehensive guide with all options
- **INSTALLER_WINDOWS.md** - Quick reference
- **package.json** - All build configuration
- **build-installer.ps1** - Automated helper script

---

## 🎉 You're Ready!

Your Jelly Bean Engine is now ready to be distributed as a professional Windows application. Choose your preferred installation method above and follow the commands on your Windows PC.

**Happy distributing! 🚀**

---

**Version:** 1.0.0  
**Platform:** Windows 64-bit  
**Status:** ✅ Ready for Installation  
**Date:** November 15, 2025
