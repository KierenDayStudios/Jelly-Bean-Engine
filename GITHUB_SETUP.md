╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                  ║
║              🚀 GITHUB SETUP GUIDE - GET YOUR APP LIVE                          ║
║                                                                                  ║
╚════════════════════════════════════════════════════════════════════════════════╝

📋 QUICK START (5 MINUTES)
═════════════════════════════════════════════════════════════════════════════════

Follow these steps to get your Jelly Bean Engine on GitHub with automatic Windows
installer builds:

═════════════════════════════════════════════════════════════════════════════════

STEP 1: Create GitHub Repository
────────────────────────────────────

1. Go to https://github.com/new
2. Create new repository:
   • Repository name: jelly-bean-engine
   • Description: Visual game development engine for Windows
   • Choose: Public (so people can download)
   • Click "Create repository"

3. Copy the repository URL (example: https://github.com/YOUR_USERNAME/jelly-bean-engine.git)

═════════════════════════════════════════════════════════════════════════════════

STEP 2: Initialize Git & Push Code
────────────────────────────────────

Open PowerShell in your project folder and run:

```powershell
cd 'C:\Users\paulk\Downloads\jelly-bean-engine-v1.0 (1)'

# Initialize git
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Jelly Bean Engine v1.0"

# Add GitHub as remote (replace URL with yours)
git remote add origin https://github.com/YOUR_USERNAME/jelly-bean-engine.git

# Push to GitHub
git branch -M main
git push -u origin main
```

⏳ Wait 1-2 minutes...

═════════════════════════════════════════════════════════════════════════════════

STEP 3: Create Release & Trigger Installer Build
───────────────────────────────────────────────────

Go to your GitHub repository and:

1. Click "Releases" (right sidebar)
2. Click "Create a new release"
3. Tag version: v1.0.0
4. Title: "Jelly Bean Engine v1.0.0"
5. Description:
   ```
   🎮 Jelly Bean Engine v1.0.0
   
   ✨ Features:
   - Visual game logic editor
   - Real-time game preview
   - Export games to HTML
   - AI-powered game generation
   
   📥 Downloads:
   - Windows Installer (.exe)
   - Portable App (.zip)
   
   Automatic builds powered by GitHub Actions ⚡
   ```
6. Click "Publish release"

GitHub Actions will automatically:
  ✅ Build the Windows installer
  ✅ Create portable zip
  ✅ Upload both to your release page
  ⏳ Takes 5-10 minutes (watch "Actions" tab)

═════════════════════════════════════════════════════════════════════════════════

STEP 4: Share Your Release
───────────────────────────

Once the build completes:

1. Go to your repository's "Releases" page
2. Click the latest release (v1.0.0)
3. Download links are ready for users!
4. Share the URL: https://github.com/YOUR_USERNAME/jelly-bean-engine/releases

Users can now download:
  • Jelly Bean Engine Setup.exe (Windows installer)
  • Jelly-Bean-Engine-portable.zip (Portable version)

═════════════════════════════════════════════════════════════════════════════════

AUTOMATED WORKFLOW SETUP
═════════════════════════════════════════════════════════════════════════════════

What just got set up for you:

📁 File: .github/workflows/build-windows.yml

This workflow:
  ✅ Triggers on any tag push (v1.0.0, v1.1.0, etc.)
  ✅ Installs Node.js and dependencies
  ✅ Builds Vite distribution
  ✅ Creates Windows installer using electron-builder
  ✅ Creates portable ZIP as fallback
  ✅ Uploads both to your GitHub Release
  ✅ All automatically! No manual work needed.

═════════════════════════════════════════════════════════════════════════════════

FUTURE RELEASES (How To)
═════════════════════════════════════════════════════════════════════════════════

To release a new version:

1. Edit version in package.json:
   "version": "1.1.0"

2. Commit and push:
   ```powershell
   git add package.json
   git commit -m "Release v1.1.0"
   git push
   ```

3. Create release tag:
   ```powershell
   git tag v1.1.0
   git push origin v1.1.0
   ```

4. GitHub Actions automatically builds & publishes!
   (Watch Actions tab while it builds)

5. Download link: https://github.com/YOUR_USERNAME/jelly-bean-engine/releases/tag/v1.1.0

═════════════════════════════════════════════════════════════════════════════════

SHARE YOUR APP
═════════════════════════════════════════════════════════════════════════════════

Once live, you can share your app in these places:

📌 Reddit:
   • r/gamedev
   • r/indiegames
   • r/webgames
   • r/Windows

📌 Communities:
   • itch.io (upload and share link)
   • Product Hunt (showcase launches)
   • Hacker News (Show HN thread)

📌 Social Media:
   • Twitter/X (share your GitHub link)
   • Discord (indie dev servers)
   • Facebook (game dev groups)

📌 Aggregators:
   • LibGDX news
   • Gamedev.net
   • Indie Hackers

═════════════════════════════════════════════════════════════════════════════════

TROUBLESHOOTING
═════════════════════════════════════════════════════════════════════════════════

❌ Build failed on GitHub?
   • Click "Actions" tab in your repo
   • Click the failed build
   • Read the error message
   • Fix locally and push again

❌ Release page is empty?
   • Wait 5-10 minutes (builds take time)
   • Refresh the page
   • Check "Actions" tab to see build status

❌ Git push says "permission denied"?
   • Generate GitHub Personal Access Token:
     Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate
   • Copy token
   • When asked for password, paste the token instead

❌ "origin" already exists error?
   • Run: git remote remove origin
   • Then re-add: git remote add origin [your-url]

═════════════════════════════════════════════════════════════════════════════════

WHAT YOUR USERS WILL SEE
═════════════════════════════════════════════════════════════════════════════════

Your GitHub Release page will show:

┌─────────────────────────────────────────────────────────────┐
│ 🎮 Jelly Bean Engine v1.0.0                                │
│                                                              │
│ Release details...                                          │
│                                                              │
│ 📥 Downloads:                                               │
│   • Jelly Bean Engine Setup.exe (250 MB)                   │
│   • Jelly-Bean-Engine-portable.zip (250 MB)                │
│                                                              │
│ [Download] [Download]                                      │
└─────────────────────────────────────────────────────────────┘

Users simply click download and get your app!

═════════════════════════════════════════════════════════════════════════════════

🎯 NEXT STEPS
═════════════════════════════════════════════════════════════════════════════════

1. ✅ Populate your GitHub repository with code (STEP 2)
2. ✅ Create your first release (STEP 3)
3. ✅ Watch GitHub Actions build your installers
4. ✅ Download and test the installer
5. ✅ Share the release link with the world!

═════════════════════════════════════════════════════════════════════════════════

Need help? See:
  • .github/workflows/build-windows.yml (automation script)
  • package.json (version management)
  • GitHub Actions documentation: https://docs.github.com/actions

Happy coding! 🚀

═════════════════════════════════════════════════════════════════════════════════
