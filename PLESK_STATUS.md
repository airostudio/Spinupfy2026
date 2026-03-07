# Plesk Publishing Infrastructure Status

## ✅ What's Working (Built and Ready)

### 1. **Plesk API Client** (`lib/plesk-api.ts`)
- ✓ Complete REST API v2 wrapper
- ✓ Methods: createSubdomain, deletSubdomain, updateDiskQuota, createFTPAccount
- ✓ Error handling and response parsing
- ✓ TypeScript types defined
- **Status:** Ready to use once configured

### 2. **Subdomain Generator** (`lib/subdomain-generator.ts`)
- ✓ Generates random names (e.g., `cosmic-river`, `electric-dragon`)
- ✓ 70+ adjectives, 80+ nouns
- ✓ Uniqueness checking
- ✓ Collision avoidance with random numbers
- **Status:** Fully functional (tested below)

```bash
# Test output (run anytime):
$ npx tsx -e "import {generateUniqueSubdomain} from './lib/subdomain-generator'; console.log(generateUniqueSubdomain())"

Example outputs:
  → calm-phoenix.webese.ai
  → digital-ocean.webese.ai
  → happy-mountain.webese.ai
```

### 3. **Website Exporter** (`lib/website-exporter.ts`)
- ✓ Converts database content to static HTML/CSS/JS
- ✓ Generates complete pages with navigation
- ✓ Creates robots.txt and sitemap.xml
- ✓ Responsive CSS with custom colors
- **Status:** Ready (needs database content to test)

### 4. **Publish API Endpoint** (`app/api/websites/publish/route.ts`)
- ✓ Complete workflow integration
- ✓ Authentication and authorization
- ✓ Error handling and rollback
- ✓ Graceful degradation when Plesk not configured
- **Status:** Ready to use

### 5. **Database Migration** (`supabase/migrations/20250115000000_add_plesk_publishing_fields.sql`)
- ✓ Adds required fields: published_url, plesk_subdomain_id
- ✓ Adds color fields: primary_color, accent_color
- ✓ Creates indexes
- **Status:** Ready to apply

### 6. **Verification Script** (`scripts/verify-plesk.ts`)
- ✓ Tests environment configuration
- ✓ Tests Plesk API connectivity
- ✓ Verifies parent domain exists
- ✓ Tests subdomain generator
- **Status:** Fully functional

---

## ❌ What's NOT Working (Requires Configuration)

### 1. **Plesk Environment Variables - MISSING** 🔴

**Current Status:**
```
✗ PLESK_HOST: NOT SET
✗ PLESK_API_KEY: NOT SET
⚠ PLESK_PARENT_DOMAIN: webese.ai (default)
```

**Impact:** Without these variables, the publish endpoint will:
- ✓ Still generate website
- ✓ Still export to static files
- ✓ Still generate random subdomain
- ✗ Skip creating subdomain in Plesk
- ✗ Skip deploying files
- ✗ Database will have subdomain name but no actual hosting

**What you need to do:**

1. **Get your Plesk API Key:**
   - Log in to your Plesk control panel
   - Go to: **Tools & Settings** → **API Keys**
   - Click **"Create API Key"**
   - Name it: `Webese AI Publisher`
   - **Copy the API key** (you won't see it again!)

2. **Find your Plesk hostname:**
   - This is the URL you use to access Plesk
   - Example: `plesk.yourdomain.com` or `server.hosting.com`
   - **Do not** include `https://` or the port

3. **Verify parent domain exists:**
   - Make sure `webese.ai` exists in your Plesk
   - Or change `PLESK_PARENT_DOMAIN` to a domain you have

4. **Add to `.env.local`:**
   ```bash
   PLESK_HOST=your-plesk-server.com
   PLESK_API_KEY=your-api-key-from-step-1
   PLESK_PARENT_DOMAIN=webese.ai
   ```

5. **Restart your dev server:**
   ```bash
   npm run dev
   ```

6. **Verify it works:**
   ```bash
   npx tsx scripts/verify-plesk.ts
   ```

### 2. **File Deployment - PLACEHOLDER** 🟡

**Current Status:**
The `deployFilesToPlesk()` function in `app/api/websites/publish/route.ts` is a placeholder.

**What it does now:**
- Logs a warning: "File deployment not yet implemented"
- Returns success without actually uploading files

**What needs to be done:**

Choose one deployment method:

#### **Option A: FTP (Easiest)**
```bash
npm install basic-ftp
```

Then update function (example in PLESK_SETUP.md).

#### **Option B: SFTP (More Secure)**
```bash
npm install ssh2-sftp-client
```

#### **Option C: rsync via SSH**
Use Node.js `ssh2` package.

**Estimated time:** 15-30 minutes to implement

---

## 🧪 How to Test Right Now

### Test 1: Subdomain Generator (Works without Plesk)
```bash
node -e "const {generateUniqueSubdomain} = require('./lib/subdomain-generator'); for(let i=0; i<10; i++) console.log(generateUniqueSubdomain([]))"
```

### Test 2: Verify Plesk Configuration
```bash
npx tsx scripts/verify-plesk.ts
```
**Expected Result (without config):** Shows missing variables
**Expected Result (with config):** Connects to Plesk and lists domains

### Test 3: Check Publish Endpoint Behavior
```bash
# Without Plesk configured:
# - Saves images ✓
# - Generates subdomain name ✓
# - Exports to static files ✓
# - Skips Plesk creation ✗
# - Skips file deployment ✗
# - Updates database with subdomain name ✓
```

---

## 📊 Current Publishing Flow

```
┌─────────────────────────────────────────────────────────────┐
│ User clicks "Publish" button                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Save images to permanent storage                    ✓   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Generate random subdomain (e.g., cosmic-river)      ✓   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Create subdomain in Plesk                           ✗   │
│    Status: SKIPPED (no PLESK_HOST/API_KEY)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Export website to static files                      ✓   │
│    - HTML pages (index.html, about.html, etc.)             │
│    - styles.css                                             │
│    - robots.txt                                             │
│    - sitemap.xml                                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Deploy files to Plesk                               ✗   │
│    Status: PLACEHOLDER (not implemented)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Update database                                     ✓   │
│    - published = true                                       │
│    - subdomain = "cosmic-river"                             │
│    - published_url = "https://cosmic-river.webese.ai"    │
│    - published_at = timestamp                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Return to user:                                             │
│ "Website published at https://cosmic-river.webese.ai"     │
│                                                              │
│ BUT: Site won't actually load (files not deployed)          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Checklist

- [ ] Run database migration (`20250115000000_add_plesk_publishing_fields.sql`)
- [ ] Get Plesk API key from your Plesk panel
- [ ] Add environment variables to `.env.local`
- [ ] Run `npx tsx scripts/verify-plesk.ts` (should pass all checks)
- [ ] Implement FTP deployment (15-30 min)
- [ ] Test publishing a website
- [ ] Verify subdomain appears in Plesk
- [ ] Verify website loads at published URL

---

## 📞 Support

If you run the verification script and it shows errors, share the output and I can help troubleshoot:

```bash
npx tsx scripts/verify-plesk.ts 2>&1 | tee plesk-verification.log
```

Then share `plesk-verification.log`.
