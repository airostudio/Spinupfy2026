# Quick Start: R2 + Cloudflare Workers
# Deploy 10,000+ Websites in 30 Minutes

## Why This Solution?

**For 50,000 websites:**
- **Plesk/FTP**: $500-2000/month + maintenance nightmare
- **R2 + Workers**: $5-10/month + zero maintenance

This is how Webflow, Wix, and Squarespace handle millions of sites.

## Setup (30 minutes)

### Step 1: Create Cloudflare Account (5 min)

1. Go to https://dash.cloudflare.com/sign-up
2. Verify email
3. Add your domain: `webese.ai`
4. Update nameservers at your domain registrar

### Step 2: Enable R2 Storage (5 min)

1. In Cloudflare dashboard → **R2 Object Storage**
2. Click **"Purchase R2"** (starts at $0/month)
3. Create bucket:
   - Name: `user-websites`
   - Location: Automatic
4. Click **"Manage R2 API Tokens"**
5. Create token:
   - Name: `webese-publisher`
   - Permissions: **Object Read & Write**
   - Copy **Access Key ID** and **Secret Access Key**

### Step 3: Configure DNS (2 min)

In Cloudflare DNS, add:

```
Type: CNAME
Name: *
Target: @
Proxy: ✓ Enabled (orange cloud)
```

This routes ALL subdomains (*.webese.ai) through Cloudflare.

### Step 4: Deploy Worker (5 min)

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Navigate to worker directory
cd cloudflare-worker

# Deploy
wrangler deploy

# Output:
# ✓ Deployed webese-websites
# ✓ Bound to route: *.webese.ai/*
```

### Step 5: Update .env.local (2 min)

Add R2 credentials to your `.env.local`:

```bash
# Cloudflare R2 Configuration
CLOUDFLARE_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=user-websites
R2_PARENT_DOMAIN=webese.ai
```

**Where to find Account ID:**
- Cloudflare Dashboard → Right sidebar → Account ID

### Step 6: Install AWS SDK (1 min)

```bash
npm install @aws-sdk/client-s3
```

### Step 7: Update Publish Endpoint (5 min)

Replace FTP deployment with R2:

```typescript
// app/api/websites/publish/route.ts
import { deployToR2 } from '@/lib/r2-deploy'

// Replace deployFilesToPlesk() call with:
const deployResult = await deployToR2(
  subdomain,
  tmpDir,
  exportResult.files || []
)
```

### Step 8: Test (5 min)

1. Generate a test website in your app
2. Click "Publish"
3. Visit: `https://[subdomain].webese.ai`
4. Should see your website instantly!

## How It Works

```
User visits: cosmic-river.webese.ai
    ↓
Cloudflare DNS (routes to Worker)
    ↓
Cloudflare Worker (checks subdomain)
    ↓
Fetches files from R2: cosmic-river/index.html
    ↓
Returns to user (cached globally for 24 hours)
```

## File Structure in R2

```
user-websites/
├── cosmic-river/
│   ├── index.html
│   ├── about.html
│   ├── styles.css
│   └── sitemap.xml
├── electric-phoenix/
│   ├── index.html
│   └── styles.css
└── [50,000 more...]
```

## Cost Breakdown (Real Numbers)

**50,000 websites @ 5MB each:**

| Item | Calculation | Cost/Month |
|------|------------|------------|
| Storage | 250GB × $0.015/GB | $3.75 |
| Requests | 100k/day FREE | $0.00 |
| Bandwidth | Unlimited FREE | $0.00 |
| Worker | 100k requests/day FREE | $0.00 |
| **Total** | | **~$5** |

**Compare to Plesk:**
- VPS for 50k sites: $500-1000/month
- Plesk license: $100-500/month
- Maintenance: 10+ hours/week
- Total: $600-1500/month + stress

## Scaling

| Sites | Storage | Cost/Month |
|-------|---------|------------|
| 10,000 | 50GB | $0.75 |
| 50,000 | 250GB | $3.75 |
| 100,000 | 500GB | $7.50 |
| 1,000,000 | 5TB | $75.00 |

## Monitoring

View real-time analytics in Cloudflare dashboard:

1. **Workers** tab: Request count, errors, CPU time
2. **R2** tab: Storage used, bandwidth, operations
3. **Analytics** tab: Traffic by subdomain

## Troubleshooting

### "Website not found" error
- Check R2 bucket for files: `wrangler r2 object list user-websites`
- Verify subdomain folder exists
- Check worker logs: `wrangler tail`

### Files uploaded but website doesn't load
- Verify wildcard DNS is set (*.webese.ai)
- Check worker routes in dashboard
- Ensure R2 binding is correct in wrangler.toml

### SSL certificate issues
- Cloudflare auto-provisions SSL for all subdomains
- May take 5-10 minutes for new subdomains
- Check SSL/TLS settings: should be "Full" or "Full (strict)"

## Advanced Features

### 1. Custom Domains

Allow users to use their own domains:

```javascript
// In worker.js
const customDomains = {
  'example.com': 'cosmic-river',
  'mysite.org': 'electric-phoenix',
}

const subdomain = customDomains[hostname] || hostname.split('.')[0]
```

### 2. Analytics

Track page views by injecting analytics code:

```javascript
// Inject before </head>
const analyticsScript = `
<script>
  fetch('/api/track', {
    method: 'POST',
    body: JSON.stringify({ page: location.pathname })
  })
</script>
`
```

### 3. Preview Environments

Deploy to preview before production:

```bash
wrangler deploy --env dev
# Preview at: *.webese-dev.io
```

### 4. Automatic Deletion

Delete sites automatically after 30 days inactive:

```typescript
// Cron job to check and delete
export async function deleteInactiveSites() {
  const inactiveSites = await db.websites.findMany({
    where: {
      last_visit: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }
  })

  for (const site of inactiveSites) {
    await deleteFromR2(site.subdomain)
  }
}
```

## Migration from Plesk

If you have existing sites on Plesk:

1. Export all site files
2. Upload to R2: `wrangler r2 object put`
3. Update DNS to point to Worker
4. Test thoroughly
5. Decommission Plesk server

## Next Steps

1. ✓ Complete setup (30 min)
2. Test with 10 websites
3. Monitor performance for 1 week
4. Scale to 1,000 websites
5. Scale to 10,000+ websites

**Questions?** Check the logs:
```bash
wrangler tail webese-websites
```

**Need help?** Share the error and I'll fix it!
