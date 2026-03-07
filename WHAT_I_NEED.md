# What Information I Need from You

To make Plesk publishing work, I need these **3 pieces of information** from you:

## 1. PLESK_HOST

**What it is:** The URL/domain where you access your Plesk control panel

**How to find it:**
- Check your hosting provider's welcome email
- Look for something like:
  - `plesk.yourdomain.com`
  - `server.yourhost.com`
  - `123.45.67.89` (IP address)

**Example:**
```bash
PLESK_HOST=plesk.webese.ai   # Just the hostname, no https:// or port
```

---

## 2. PLESK_API_KEY

**What it is:** A secret key that lets the app control your Plesk server

**How to get it:**
1. Visit your Plesk panel (the PLESK_HOST URL above + `:8443`)
2. Log in with your admin credentials
3. Go to: **Tools & Settings** → **API Keys**
4. Click **"Create API Key"**
5. Name it: `Webese AI Publisher`
6. **Copy the entire key** (long string of random characters)

**If you can't find "API Keys" in Plesk:**
- You might not have admin access
- Your Plesk version might be too old (need Obsidian 18.x or newer)
- Contact your hosting provider for help

**Example:**
```bash
PLESK_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Very long string
```

---

## 3. PLESK_PARENT_DOMAIN

**What it is:** The domain you own in Plesk where subdomains will be created

**How to find it:**
1. Log in to Plesk
2. Look at the "Domains" section
3. Use one of your existing domains

**Example:**
```bash
PLESK_PARENT_DOMAIN=webese.ai   # Must already exist in your Plesk
```

---

## Once You Have These 3 Things

Update your `.env.local` file:

```bash
# Replace these lines:
PLESK_HOST=your-plesk-server.com          # ← Change this
PLESK_API_KEY=your-api-key-here           # ← Change this
PLESK_PARENT_DOMAIN=webese.ai           # ← Verify this exists

# With real values like:
PLESK_HOST=plesk.webese.ai              # ✓ Real hostname
PLESK_API_KEY=sk_abc123def456...          # ✓ Real API key
PLESK_PARENT_DOMAIN=webese.ai           # ✓ Exists in Plesk
```

Then restart your dev server:
```bash
npm run dev
```

And test the connection:
```bash
npx tsx scripts/verify-plesk.ts
```

---

## If You Don't Have Plesk Access

**Tell me which of these is true:**

- [ ] I don't have a Plesk server
- [ ] I have Plesk but don't know how to access it
- [ ] I have Plesk but don't have admin access
- [ ] I have Plesk but API Keys option is missing
- [ ] I want to use different hosting (not Plesk)

And I'll adjust the infrastructure to work with what you have!

---

## Current Status

🔴 **Plesk NOT connected** (placeholder values in .env.local)
✅ **Infrastructure complete** (all code ready)
✅ **Alternative routes work** (websites accessible via /site/[slug])

The system is functional, it just won't create actual subdomains on your Plesk server until you provide real credentials.
