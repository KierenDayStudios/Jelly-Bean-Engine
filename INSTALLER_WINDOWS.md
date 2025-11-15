# Building a Windows installer (NSIS) for Jelly Bean Engine

This project now includes an Electron wrapper and packaging configuration to produce a Windows installer (.exe) using `electron-builder`.

Prerequisites
- Node.js (16+) and npm installed
- Windows (for building NSIS installers)

Quick build steps (PowerShell)

1. Install dependencies (if you haven't already):

```powershell
cd 'C:\Users\paulk\Downloads\jelly-bean-engine-v1.0 (1)'
npm install
```

2. Build the renderer (Vite) and package the Electron app as a Windows installer:

```powershell
# Builds the web assets into `dist/`
npm run dist

# Build the Windows installer (creates artifacts in `dist/`)
npm run package:win
```

Notes
- The `package:win` script runs `electron-builder` targeting NSIS for x64 architecture. The generated installer will be placed in the project's `dist/` folder (e.g. `dist\Jelly Bean Engine Setup 1.0.0.exe` or similar).
- If you want a single-architecture or different target, edit the `package.json` `build.win.target` setting.
- If you want to run the app locally during development, build the renderer (`npm run dist`) then run:

```powershell
npx electron .
```

Troubleshooting
- If `electron-builder` fails due to missing system tools, ensure you are on Windows and have standard development tools installed. For signing or advanced targets, additional setup may be required.
- For CI builds on Windows, make sure the CI runner has all required dependencies and enough disk space.

If you'd like, I can run the `npm run package:win` step now and produce the installer in this environment — tell me to proceed and I'll start the packaging process (it may take several minutes).
