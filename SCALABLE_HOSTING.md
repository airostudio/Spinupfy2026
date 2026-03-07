# Scalable Multi-Site Hosting Architecture
# For 10,000 - 50,000+ User Websites

## Overview

This architecture uses Cloudflare R2 (S3-compatible object storage) + Cloudflare Workers
to serve unlimited user-generated websites with:

- Global CDN (instant loading worldwide)
- Automatic SSL for all subdomains
- $0.015/GB storage (much cheaper than servers)
- Zero maintenance
- Infinite scalability

## Architecture Diagram

```
User visits: cosmic-river.webese.ai
         ↓
Cloudflare DNS (routes to Worker)
         ↓
Cloudflare Worker (determines which site to serve)
         ↓
Cloudflare R2 Bucket (fetches files)
         ↓
Returns website to user (cached globally)
```

## Cost Breakdown (50,000 sites @ 5MB each)

**Storage:**
- 50,000 sites × 5MB = 250GB
- Cloudflare R2: 250GB × $0.015 = $3.75/month
- First 10GB free, so actually: $3.60/month

**Bandwidth:**
- Cloudflare Workers: 100,000 requests/day FREE
- CDN bandwidth: FREE (unlimited)
- R2 egress to Cloudflare: FREE

**Total Monthly Cost: ~$5-10** (vs $500-2000 with Plesk)

## Setup Steps

### 1. Create Cloudflare R2 Bucket

```bash
# Via Cloudflare Dashboard:
# 1. Go to R2 Object Storage
# 2. Create bucket: "user-websites"
# 3. Note the bucket URL
```

### 2. Configure Wildcard DNS

In Cloudflare DNS, add:
```
Type: CNAME
Name: *
Target: webese.ai
Proxy: ✓ Enabled (orange cloud)
```

This routes ALL subdomains (*.webese.ai) through Cloudflare.

### 3. Deploy Cloudflare Worker

The Worker intercepts requests and serves the correct website:

```javascript
// File: worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const subdomain = url.hostname.split('.')[0]

    // Handle main domain
    if (subdomain === 'webese' || subdomain === 'www') {
      return fetch('https://yourmainsite.com' + url.pathname)
    }

    // Serve user website from R2
    const path = `${subdomain}${url.pathname}`
    const object = await env.WEBSITES.get(path)

    if (!object) {
      // Fallback to index.html for SPA routing
      const indexObject = await env.WEBSITES.get(`${subdomain}/index.html`)
      if (indexObject) {
        return new Response(indexObject.body, {
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'public, max-age=3600',
          }
        })
      }
      return new Response('Website not found', { status: 404 })
    }

    // Determine content type
    const contentType = getContentType(path)

    return new Response(object.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 24 hours
      }
    })
  }
}

function getContentType(path) {
  const ext = path.split('.').pop().toLowerCase()
  const types = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
  }
  return types[ext] || 'application/octet-stream'
}
```

Deploy:
```bash
npm install -g wrangler
wrangler login
wrangler publish
```

### 4. Configure R2 Binding

In wrangler.toml:
```toml
name = "user-websites-worker"
main = "worker.js"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "WEBSITES"
bucket_name = "user-websites"
```

## File Upload Strategy

Each user website is uploaded to R2 with this structure:

```
R2 Bucket: user-websites/
├── cosmic-river/
│   ├── index.html
│   ├── about.html
│   ├── styles.css
│   ├── robots.txt
│   └── sitemap.xml
├── electric-phoenix/
│   ├── index.html
│   ├── styles.css
│   └── ...
└── [50,000 more sites...]
```

## Integration with Your App

Replace FTP deployment with R2 upload:

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// R2 is S3-compatible
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

async function deployToR2(subdomain: string, files: Map<string, string>) {
  for (const [filePath, content] of files) {
    await r2.send(new PutObjectCommand({
      Bucket: 'user-websites',
      Key: `${subdomain}/${filePath}`,
      Body: content,
      ContentType: getContentType(filePath),
      CacheControl: 'public, max-age=86400',
    }))
  }
}
```

## Advantages Over Plesk

| Feature | Plesk | R2 + Workers |
|---------|-------|--------------|
| **Max Sites** | ~100-500 | Unlimited |
| **Cost (50k sites)** | $500-2000/mo | $5-10/mo |
| **Setup Time** | Hours per site | Seconds per site |
| **Global CDN** | ❌ No | ✅ Yes |
| **SSL Certificates** | Manual | ✅ Automatic |
| **Uptime** | 99% | 99.99% |
| **Maintenance** | High | Zero |
| **Scalability** | ❌ Limited | ✅ Infinite |

## Alternative: Multi-Tenant Architecture

Instead of subdomains, serve ALL sites from your main app:

```
https://webese.ai/sites/cosmic-river
https://webese.ai/sites/electric-phoenix
```

Pros:
- Even simpler
- No DNS setup needed
- Single deployment

Cons:
- Less "professional" URLs
- No custom domains (without proxy)

Implementation:
```typescript
// app/sites/[slug]/page.tsx
export default async function SitePage({ params }: { params: { slug: string } }) {
  const website = await db.websites.findUnique({
    where: { subdomain: params.slug }
  })

  return <RenderWebsite website={website} />
}
```

## Custom Domains (Advanced)

Users can point their own domains:

1. User adds custom domain in dashboard
2. They create DNS record: CNAME → webese.ai
3. Cloudflare Worker checks both subdomain and custom domain:

```javascript
const hostname = url.hostname
const subdomain = hostname.includes('webese.ai')
  ? hostname.split('.')[0]
  : await getSubdomainForCustomDomain(hostname)
```

4. Cloudflare automatically provisions SSL for custom domains

## Recommendation

For **10,000-50,000 sites**, I recommend:

**Phase 1: R2 + Cloudflare Workers (Immediate)**
- Cheapest ($5-10/month)
- Fastest to implement (1-2 days)
- Infinite scalability
- Zero maintenance

**Phase 2: Add Custom Domains (Later)**
- Allow users to use their own domains
- Automatic SSL provisioning
- Professional appearance

**Phase 3: Edge Computing (Future)**
- Add dynamic features via Workers
- Form submissions
- Analytics
- A/B testing

## Next Steps

1. Create Cloudflare account
2. Enable R2 storage
3. Set up wildcard DNS (*.webese.ai)
4. Deploy Worker (I can write the code)
5. Replace FTP deployment with R2 upload
6. Test with 10 sites, then scale to thousands

**Total implementation time: 1-2 days**
**Total cost for 50,000 sites: ~$10/month**

Would you like me to implement the R2 + Workers solution?
