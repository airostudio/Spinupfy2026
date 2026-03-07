# Plesk Publishing Setup Guide

This guide explains how to configure automated website publishing to Plesk Obsidian 18.x hosting.

## Overview

When a user clicks "Publish" on their generated website, the system will:

1. **Generate a random subdomain** (e.g., `elephant-draw.webese.ai`)
2. **Create the subdomain in Plesk** with appropriate disk quota
3. **Export the website** to static HTML/CSS/JS files
4. **Deploy the files** to the Plesk hosting space
5. **Update the database** with the published URL

## Environment Variables

Add these to your `.env.local` file:

```bash
# Plesk Configuration
PLESK_HOST=your-plesk-server.com
PLESK_PORT=8443
PLESK_API_KEY=your-api-key-here
PLESK_USE_HTTPS=true
PLESK_PARENT_DOMAIN=webese.ai
```

### Getting Your Plesk API Key

1. Log in to Plesk
2. Go to **Tools & Settings** → **API Keys**
3. Click **Create API Key**
4. Name it "Webese AI Website Publisher"
5. Copy the generated API key to your `.env.local` file

## Testing Without Plesk

The system is designed to work without Plesk configured. If the `PLESK_HOST` and `PLESK_API_KEY` environment variables are not set:

- The publish endpoint will still work
- Random subdomains will still be generated
- Websites will be exported to static files
- Database will be updated with the subdomain and published URL
- File deployment to Plesk will be skipped (logged as warning)

This allows you to develop and test the system without a Plesk server.

## Disk Quotas by Plan

Default quota per website: **5 MB**

Future enhancement: Query user's subscription plan to determine quota:

```typescript
// TODO: Implement plan-based quotas
const quotaByPlan = {
  FREE: 5,      // 5 MB per website
  STARTER: 10,  // 10 MB per website
  PRO: 50,      // 50 MB per website
  ENTERPRISE: 100, // 100 MB per website
}
```

## File Deployment

The current implementation has a placeholder for file deployment. To complete this, you can use:

### Option 1: FTP/SFTP (Recommended)

Install `basic-ftp` package:

```bash
npm install basic-ftp
```

Then update the `deployFilesToPlesk()` function in `app/api/websites/publish/route.ts`:

```typescript
import { Client as FTPClient } from 'basic-ftp'

async function deployFilesToPlesk(
  localDir: string,
  subdomainId: number,
  files: string[]
): Promise<{ success: boolean; error?: string }> {
  const ftp = new FTPClient()

  try {
    await ftp.access({
      host: process.env.PLESK_HOST,
      user: process.env.PLESK_FTP_USER,
      password: process.env.PLESK_FTP_PASSWORD,
      secure: true,
    })

    // Upload all files
    for (const file of files) {
      await ftp.uploadFrom(
        path.join(localDir, file),
        `/httpdocs/${file}`
      )
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  } finally {
    ftp.close()
  }
}
```

### Option 2: SSH/rsync

Use Node.js `ssh2` package to execute rsync commands.

### Option 3: Plesk File Manager API

Use Plesk's REST API file upload endpoints (if available in your version).

## Database Schema

The migration adds these fields to the `websites` table:

```sql
published_url TEXT          -- Full URL: https://elephant-draw.webese.ai
plesk_subdomain_id INTEGER  -- Plesk's internal subdomain ID
primary_color TEXT          -- Theme primary color
accent_color TEXT           -- Theme accent color
```

## API Endpoint

### POST `/api/websites/publish`

Publish a website to Plesk hosting.

**Request Body:**
```json
{
  "websiteId": "uuid-here"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Website published successfully!",
  "publishedUrl": "https://elephant-draw.webese.ai",
  "subdomain": "elephant-draw.webese.ai",
  "imagesSaved": 12,
  "imageErrors": [],
  "details": {
    "files": 8,
    "totalSize": 4523,
    "pleskEnabled": true
  }
}
```

**Response (Error):**
```json
{
  "error": "Failed to create subdomain: Connection timeout"
}
```

## Subdomain Generation

Subdomains are generated using the format: `{adjective}-{noun}`

Examples:
- `cosmic-river.webese.ai`
- `happy-mountain.webese.ai`
- `electric-dragon.webese.ai`

The generator has:
- **70+ adjectives** (happy, cosmic, bright, electric, etc.)
- **80+ nouns** (mountain, river, dragon, phoenix, etc.)
- **Collision avoidance** - adds random number if duplicate (e.g., `cosmic-river-1234`)

## Static Site Export

The exporter generates:

- ✅ **HTML files** - One per page (index.html, about.html, etc.)
- ✅ **styles.css** - Complete responsive stylesheet with custom colors
- ✅ **robots.txt** - SEO configuration
- ✅ **sitemap.xml** - Search engine sitemap

## Security

### API Authentication

The publish endpoint requires authentication:
- User must be logged in (Supabase auth)
- User must own the website
- Website ownership is verified before publishing

### Plesk API Key

- Store API key in environment variables (never in code)
- Use HTTPS for all Plesk API calls
- API key should have minimal required permissions

## Rollback on Failure

If any step fails during publishing, the system automatically rolls back:

1. **Export fails** → Delete created subdomain
2. **Deploy fails** → Delete created subdomain
3. **Database update fails** → Log error but don't delete (site is already live)

## Monitoring

Check logs for publishing activity:

```bash
# Development
npm run dev

# Production (Vercel)
vercel logs
```

Look for log messages:
- `Publishing website {id} for user {userId}`
- `Generated subdomain: {subdomain}`
- `Subdomain created successfully: {id}`
- `Website exported to {tmpDir}`
- `Files deployed successfully`
- `Website published successfully: {url}`

## Troubleshooting

### "Website not found" error
- Verify user owns the website
- Check user is authenticated

### "Failed to create subdomain"
- Verify Plesk credentials
- Check parent domain exists in Plesk
- Verify API key permissions

### "Failed to export website"
- Check database connection
- Verify website has pages and sections

### "File deployment not yet implemented"
- This is expected - see "File Deployment" section above
- Files are exported but not yet uploaded
- Implement FTP/SFTP deployment to complete

## Next Steps

1. ✅ Configure Plesk environment variables
2. ⏳ Run database migration (`20250115000000_add_plesk_publishing_fields.sql`)
3. ⏳ Implement FTP file deployment
4. ⏳ Add publish button to website preview UI
5. ⏳ Test end-to-end publishing flow
