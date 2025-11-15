# Jelly Bean Engine - Windows Installer Build Guide

## Overview
Your Jelly Bean Engine has been packaged as a Windows app. Now you can create a proper installer (.exe) on your Windows PC.

**You have three options:**

---

## Option 1: Use the Pre-Packaged App (Simplest)
The app is ready to use in: `release\Jelly Bean Engine-win32-x64\`

**To distribute:**
- Zip the entire `release\Jelly Bean Engine-win32-x64` folder
- Share with others; they extract and run `Jelly Bean Engine.exe`

**Pros:** No additional tools needed  
**Cons:** Not a traditional installer; users need to manually extract

---

## Option 2: Create NSIS Installer (Recommended)

### Prerequisites
1. Install NSIS (Nullsoft Scriptable Install System):
   - Download: https://nsis.sourceforge.io/Download
   - Install to default location: `C:\Program Files (x86)\NSIS`

### Steps (PowerShell as Administrator)

```powershell
# Navigate to project
cd 'C:\Users\paulk\Downloads\jelly-bean-engine-v1.0 (1)'

# Ensure packaged app exists
if (-not (Test-Path 'release\Jelly Bean Engine-win32-x64')) {
    Write-Host "Packaged app not found. Building..."
    npm run package:simple:win
}

# Compile NSIS installer
& "C:\Program Files (x86)\NSIS\makensis.exe" "build\installer.nsi"

# Verify installer was created
Get-ChildItem release\*.exe -ErrorAction SilentlyContinue | ForEach-Object { 
    Write-Host "✓ Installer created: $($_.FullName)" 
}
```

**Expected output:**
- `release\Jelly Bean Engine Setup v1.0.0.exe` (will be created)
- File size: ~200-300 MB (includes Electron runtime)

**To test the installer:**
```powershell
# Run the installer
& 'release\Jelly Bean Engine Setup v1.0.0.exe'
```

---

## Option 3: Use electron-builder (NSIS with Auto-Updates)

### Prerequisites
- Windows PC with admin privileges
- Developer Mode enabled (or run PowerShell as Administrator)

### Steps

```powershell
# Navigate to project
cd 'C:\Users\paulk\Downloads\jelly-bean-engine-v1.0 (1)'

# Run the builder
npm run package:win
```

**Note:** This may take 5-10 minutes on first run as it downloads Electron.

**Expected output:**
- `dist\Jelly Bean Engine Setup 1.0.0.exe` (NSIS installer)
- `dist\Jelly Bean Engine 1.0.0-x64.nsis.blockmap` (for delta updates)

---

## Comparison

| Method | Time | Installer | Size | Setup Difficulty | Distribution |
|--------|------|-----------|------|------------------|--------------|
| Pre-packaged Zip | 0 min | Folder | ~250 MB | Easy | zip file |
| NSIS (Option 2) | 5 min | .exe | ~250 MB | Medium | single .exe |
| electron-builder | 10 min | .exe | ~250 MB | Medium | single .exe |

---

## Distribution Options

### Option A: Share .exe Installer
Best for end users — they just double-click and follow prompts

**Files to share:**
- `release\Jelly Bean Engine Setup v1.0.0.exe` (NSIS method)
- OR `dist\Jelly Bean Engine Setup 1.0.0.exe` (electron-builder method)

### Option B: Share Portable App Folder
Best for advanced users or internal teams

**Files to share:**
- Entire `release\Jelly Bean Engine-win32-x64` folder (zipped)
- Users extract and run `Jelly Bean Engine.exe` directly

### Option C: Self-Hosted Updates
If using electron-builder, you can host updates and enable auto-update:
- Host files on web server
- Update URL in electron-builder config
- Users get automatic updates on launch

---

## Customization

### Change App Icon
1. Create a 256x256 PNG icon for your app
2. Convert to .ico format (use online converter or ImageMagick)
3. Place in: `build\icon.ico`
4. Update `package.json` build config:
   ```json
   "build": {
     "win": {
       "icon": "build/icon.ico"
     }
   }
   ```

### Change Installer Name/Version
Edit `package.json`:
```json
{
  "version": "1.0.0",
  "build": {
    "productName": "Jelly Bean Engine"
  }
}
```

### Add License Agreement
Edit `build/installer.nsi` and add:
```nsi
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
```

---

## Troubleshooting

### "makensis not found"
- Install NSIS: https://nsis.sourceforge.io/Download
- Add to PATH or use full path: `C:\Program Files (x86)\NSIS\makensis.exe`

### "Cannot create symbolic link" error (electron-builder)
- Run PowerShell as Administrator
- Enable Developer Mode in Windows Settings
- Or use Option 2 (NSIS method)

### Installer too large
- This is normal; includes full Electron runtime (~150 MB)
- Trim by removing unused dependencies from `package.json`

### App doesn't start after install
- Check that `electron/main.cjs` is present in packaged folder
- Verify `dist/index.html` exists after `npm run dist`
- Run locally first: `npm run dist && npx electron .`

---

## Next Steps

1. **Choose your method** (Option 1, 2, or 3 above)
2. **Run the commands** on your Windows PC (as Administrator for Options 2/3)
3. **Test the installer** by running the .exe and verifying the app launches
4. **Distribute** the installer or zip file to users

---

## Files Involved

- `electron/main.cjs` - Electron main process
- `electron/preload.cjs` - Electron security context
- `build/installer.nsi` - NSIS installer script
- `package.json` - Build configuration
- `dist/` - Built web assets (after `npm run dist`)
- `release/` - Packaged app folder (after `npm run package:simple:win`)

---

## Support

If you encounter issues:
- Check PowerShell error messages carefully
- Ensure Node.js and npm are in PATH
- Try running as Administrator
- Delete `node_modules/.bin/.electron-builder-*` if corrupted downloads occur
- Check available disk space (at least 2 GB recommended)

---

**Version:** 1.0.0  
**Last Updated:** November 15, 2025  
**Status:** Ready for distribution
