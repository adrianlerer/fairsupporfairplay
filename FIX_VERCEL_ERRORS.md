# 🚨 FIX VERCEL DEPLOYMENT ERRORS - QUICK GUIDE

**Status**: Deployment errors detected on:
- `fairsupporfairplay` project
- `fair-play-support-app` project

**Root Cause**: Vercel is trying to build from root directory instead of `src/client/`

**Fix Time**: 2 minutes

---

## 🎯 QUICK FIX (2 Minutes)

### Step 1: Go to Vercel Dashboard

Open: https://vercel.com/dashboard

### Step 2: Configure Project Settings

For **EACH** project that failed (`fairsupporfairplay` and `fair-play-support-app`):

1. **Click on the project name**
2. **Click "Settings" tab** (top menu)
3. **Click "General"** (left sidebar)
4. **Scroll down to "Build & Development Settings"**
5. **Click "Edit" button**

### Step 3: Set These Exact Values

```
Framework Preset: Next.js

Root Directory: src/client
                ^^^^^^^^^^^
                (CRITICAL - This is the fix!)

Build Command: (leave empty or: npm run build)

Output Directory: (leave empty or: .next)

Install Command: npm install --legacy-peer-deps
                 ^^^^^^^^^^^^^^^^^^^^^^^^^
                 (REQUIRED for dependencies)
```

### Step 4: Save & Redeploy

1. **Click "Save"** at the bottom
2. **Go to "Deployments" tab** (top menu)
3. **Find the latest failed deployment**
4. **Click the "..." (three dots)** on the right
5. **Click "Redeploy"**
6. **Uncheck "Use existing Build Cache"**
7. **Click "Redeploy" button**

---

## ✅ Expected Result

After redeploying, you should see:

```
Building...
✓ Linting and checking validity of types
✓ Creating an optimized production build
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Build completed successfully!
```

**Deployment URL**: `https://[project].vercel.app`

---

## 🧪 Verify Deployment Works

Visit these URLs to confirm everything is working:

```
https://[project].vercel.app/investor
→ Should show landing page with "Cumplimiento" section

https://[project].vercel.app/parent/compliance  
→ Should show parental dashboard (may show loading or empty state)

https://[project].vercel.app/child/complaints
→ Should show complaints history (may show empty state)
```

---

## 🔑 Add Environment Variables (Optional but Recommended)

After successful deployment, add this environment variable:

1. **Settings → Environment Variables**
2. **Add Variable**:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://your-backend.railway.app
   Environment: Production, Preview, Development
   ```
3. **Click "Save"**
4. **Redeploy again** to activate the variable

---

## 🐛 If Still Failing

### Error: "No framework detected"

**Fix**: Make sure Root Directory is exactly: `src/client` (no leading slash, no trailing slash)

### Error: "ERESOLVE unable to resolve dependency tree"

**Fix**: Make sure Install Command is: `npm install --legacy-peer-deps`

### Error: "Module not found"

**Fix**: 
```bash
# Locally test the build
cd fairsupporfairplay/src/client
npm install --legacy-peer-deps
npm run build

# If it works locally but not on Vercel, clear cache:
# Vercel Dashboard → Settings → General → "Clear Cache"
```

---

## 📊 Screenshot of Correct Settings

The "Build & Development Settings" section should look like this:

```
┌─────────────────────────────────────────────┐
│ Build & Development Settings          Edit │
├─────────────────────────────────────────────┤
│ Framework Preset                            │
│ Next.js                                     │
│                                             │
│ Root Directory                              │
│ src/client                         ← FIX! │
│                                             │
│ Build Command                               │
│ npm run build                               │
│                                             │
│ Output Directory                            │
│ .next                                       │
│                                             │
│ Install Command                             │
│ npm install --legacy-peer-deps    ← FIX! │
└─────────────────────────────────────────────┘
```

---

## 🆘 Alternative Fix (If Dashboard Doesn't Work)

### Via Vercel CLI

```bash
# 1. Install Vercel CLI (if not installed)
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy from correct directory
cd fairsupporfairplay/src/client
vercel --prod --force

# This will bypass the root directory issue
```

---

## ✅ Success Checklist

After following the steps, verify:

- [ ] Root Directory is set to `src/client` in Vercel Settings
- [ ] Install Command is `npm install --legacy-peer-deps`
- [ ] Latest deployment shows green checkmark (✓ Ready)
- [ ] `/investor` page loads without errors
- [ ] No "framework not detected" errors in build logs
- [ ] Console has no critical errors (check browser DevTools)

---

## 📞 Need Help?

### Check Build Logs

1. Vercel Dashboard → Your Project
2. Deployments tab
3. Click on latest deployment
4. View "Build Logs" to see exact error

### Common Log Messages

**If you see**: "Error: No framework detected"
→ **Fix**: Set Root Directory to `src/client`

**If you see**: "ERESOLVE unable to resolve dependency tree"
→ **Fix**: Set Install Command to `npm install --legacy-peer-deps`

**If you see**: "Module not found: Can't resolve '@components/...'"
→ **Fix**: Verify all imports in code use correct paths

---

## 🎯 Summary

**Problem**: Vercel building from wrong directory (root instead of src/client)

**Solution**: Set `Root Directory = src/client` in Vercel Dashboard Settings

**Time to Fix**: 2 minutes

**After Fix**: Deployment should succeed, all routes should work

---

**Files Updated in Git**:
- ✅ `vercel.json` (simplified)
- ✅ `.vercelignore` (added)
- ✅ `VERCEL_SETTINGS.md` (comprehensive guide)
- ✅ This file (`FIX_VERCEL_ERRORS.md`)

**Latest Commit**: `d3ca98b` - Vercel configuration fix

**Ready to Deploy**: Just configure the Root Directory setting and redeploy!

---

## 🚀 Quick Command Reference

```bash
# If using CLI instead of dashboard:
cd fairsupporfairplay/src/client
vercel --prod

# To force rebuild:
vercel --prod --force

# To check deployment status:
vercel ls

# To view logs:
vercel logs [deployment-url]
```

---

**¡La configuración correcta ya está en GitHub!**  
Solo falta configurar el Root Directory en Vercel Dashboard y redeploy.

**Tiempo estimado**: 2 minutos  
**Complejidad**: Muy baja (solo cambiar un setting)
