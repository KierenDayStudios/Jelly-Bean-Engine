Netlify deployment guide

This project is ready to be hosted on Netlify as a static site. Use one of the two easy options below.

Option A — GitHub → Netlify (recommended)

1. Push your project to GitHub (follow `GITHUB_CHECKLIST.md`).
2. Go to https://app.netlify.com and sign in (use GitHub auth).
3. Click "Add new site" → "Import from Git" → choose GitHub and authorize Netlify if prompted.
4. Pick your repository (e.g., `YOUR_USERNAME/jelly-bean-engine`).
5. In the "Build settings" screen, set:
   - Build command: `npm run dist`
   - Publish directory: `dist`
6. Click "Deploy site". Netlify will build and publish your site.
7. After deployment, open the site URL Netlify provides.

Notes:
- We included `netlify.toml` that specifies the same build command and publish directory.
- On each push to the branch you connected (usually `main`), Netlify will rebuild.

Option B — Drag-and-drop (fastest, no Git required)

1. Run the local prep script to build and create a zip:

```powershell
cd 'C:\Users\paulk\Downloads\jelly-bean-engine-v1.0 (1)'
.\tools\prepare-web-deploy.ps1 -Version v1.0.0
```

2. Open https://app.netlify.com/drop
3. Drag `site-deploy-v1.0.0.zip` (or `site-deploy.zip`) onto the page
4. Netlify will upload and publish your site; you get a public URL instantly

Troubleshooting & tips

- If your site relies on client-side routing, configure redirects in `netlify.toml`.
- To use a custom domain, add it in Netlify site settings and follow DNS instructions.
- If Netlify build fails, open the site on Netlify, go to "Deploys" and read the build log.

That's it — your web export will be live on Netlify!
