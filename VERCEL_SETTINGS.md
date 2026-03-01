# ⚙️ Vercel Project Settings Configuration

**CRITICAL**: Estos settings DEBEN configurarse en Vercel Dashboard para que el deployment funcione.

---

## 🎯 Settings Required in Vercel Dashboard

### 1. General Settings

```
Project Name: fairsupporfairplay
```

### 2. Build & Development Settings

**IMPORTANT**: Configure estos valores EXACTAMENTE como se muestra:

```
Framework Preset: Next.js

Root Directory: src/client
(CRITICAL: Must point to src/client, not root)

Build Command: npm run build
(Leave empty to use default - framework auto-detects)

Output Directory: .next
(Leave empty to use default)

Install Command: npm install --legacy-peer-deps
(REQUIRED: Must use --legacy-peer-deps for dependencies)
```

### 3. Environment Variables

#### Required (Compliance Features)

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

**Type**: Plain Text  
**Environment**: Production, Preview, Development  

#### Optional (Existing Features)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_APP_URL=https://fairsupporfairplay.vercel.app
NEXT_PUBLIC_LANDING_PAGE_URL=https://fairsupporfairplay.vercel.app
```

---

## 📝 Step-by-Step Configuration in Vercel Dashboard

### Method 1: New Project

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select: `adrianlerer/fairsupporfairplay`
4. **CRITICAL**: Configure these settings:

   ```
   Framework Preset: Next.js
   Root Directory: src/client    ← MUST SET THIS!
   Build Command: (leave empty)
   Output Directory: (leave empty)
   Install Command: npm install --legacy-peer-deps
   ```

5. Click "Show Advanced Settings" → "Environment Variables"
6. Add at minimum:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend.railway.app
   ```
7. Click "Deploy"

### Method 2: Existing Project (Re-configure)

1. Go to your project: https://vercel.com/dashboard
2. Click on your project name
3. Go to "Settings" tab
4. Navigate to "General"
5. Scroll to "Build & Development Settings"
6. **Edit** and set:
   ```
   Root Directory: src/client
   Install Command: npm install --legacy-peer-deps
   ```
7. Click "Save"
8. Go to "Deployments" tab
9. Click "..." on latest deployment → "Redeploy"

---

## 🐛 Common Build Errors & Fixes

### Error: "No framework detected"

**Cause**: Root Directory not set to `src/client`

**Fix**:
```
Dashboard → Settings → General → Build & Development Settings
Root Directory: src/client
```

### Error: "ERESOLVE unable to resolve dependency tree"

**Cause**: Install command doesn't use `--legacy-peer-deps`

**Fix**:
```
Dashboard → Settings → General → Build & Development Settings
Install Command: npm install --legacy-peer-deps
```

### Error: "Module not found: Can't resolve 'X'"

**Cause**: Missing dependency in package.json

**Fix**:
```bash
cd src/client
npm install X --legacy-peer-deps --save
git add package.json package-lock.json
git commit -m "fix: add missing dependency X"
git push
```

### Error: "NEXT_PUBLIC_API_URL is not defined"

**Cause**: Environment variable not set

**Fix**:
```
Dashboard → Settings → Environment Variables
Add: NEXT_PUBLIC_API_URL = https://your-backend.railway.app
Select: Production, Preview, Development
```

---

## ✅ Verification Checklist

After configuring settings, verify:

- [ ] Root Directory is set to `src/client`
- [ ] Install Command is `npm install --legacy-peer-deps`
- [ ] Build Command is empty (uses default)
- [ ] At least `NEXT_PUBLIC_API_URL` env var is set
- [ ] Environment variables selected for all environments
- [ ] Latest deployment succeeded (green checkmark)

---

## 🔄 How to Redeploy After Changing Settings

### Option 1: Via Dashboard

```
1. Go to Deployments tab
2. Find latest deployment
3. Click "..." (three dots)
4. Click "Redeploy"
5. Check "Use existing Build Cache" = NO
6. Click "Redeploy"
```

### Option 2: Via Git Push

```bash
# Make a small change (e.g., update README)
git commit --allow-empty -m "chore: trigger rebuild"
git push origin main
```

### Option 3: Via Vercel CLI

```bash
cd src/client
vercel --prod --force
```

---

## 📊 Expected Build Output

Successful build should show:

```
✓ Linting and checking validity of types
✓ Creating an optimized production build
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages (X/X)
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    X kB           X kB
├ ○ /child/complaints                    X kB           X kB
├ ○ /parent/compliance                   X kB           X kB
└ ○ /investor                            X kB           X kB

Build completed in Xs
```

---

## 🚀 Post-Deployment Testing

After successful deployment, test these URLs:

```bash
# 1. Landing page
curl -I https://your-project.vercel.app/

# 2. Investor page
curl -I https://your-project.vercel.app/investor

# 3. Parent compliance
curl -I https://your-project.vercel.app/parent/compliance

# 4. Child complaints
curl -I https://your-project.vercel.app/child/complaints
```

All should return `200 OK`.

---

## 📞 Support Resources

### Vercel Dashboard Links

- **Projects**: https://vercel.com/dashboard
- **Deployments**: https://vercel.com/[username]/[project]/deployments
- **Settings**: https://vercel.com/[username]/[project]/settings
- **Environment Variables**: https://vercel.com/[username]/[project]/settings/environment-variables
- **Build Logs**: https://vercel.com/[username]/[project]/[deployment-id]

### Documentation

- **Vercel Next.js**: https://vercel.com/docs/frameworks/nextjs
- **Root Directory**: https://vercel.com/docs/projects/project-configuration#root-directory
- **Environment Variables**: https://vercel.com/docs/projects/environment-variables
- **Build Configuration**: https://vercel.com/docs/build-step

---

## 🎯 Quick Fix for Current Errors

If you're seeing errors right now:

1. **Go to**: https://vercel.com/dashboard
2. **Click on**: Your project (fairsupporfairplay or fair-play-support-app)
3. **Go to**: Settings → General
4. **Scroll to**: Build & Development Settings
5. **Click**: Edit
6. **Set**: Root Directory = `src/client`
7. **Set**: Install Command = `npm install --legacy-peer-deps`
8. **Click**: Save
9. **Go to**: Deployments tab
10. **Click**: "..." on failed deployment → Redeploy

**This should fix the build immediately.**

---

## ✅ Success Criteria

Deployment is successful when:

✅ Build completes without errors  
✅ All routes return 200 status  
✅ Console has no critical errors  
✅ Environment variables loaded correctly  
✅ Images/assets load properly  
✅ API calls reach backend (or 401 if auth required)  

---

**Last Updated**: 2026-03-01  
**For Project**: fairsupporfairplay  
**Required Vercel Settings**: Root Directory = `src/client`
