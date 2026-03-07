# DNS Configuration Guide

## Overview

The DNS Configuration feature provides pre-configured DNS record presets for popular services, making it easy to set up email forwarding, domain verification, and other DNS-based integrations with just a few clicks.

## Features

### 🎯 What's Included

- **Email Forwarding Presets**:
  - Google Workspace (Gmail for Business)
  - Microsoft 365 (Outlook Business)
  - Cloudflare Email Routing (Free)

- **Copy-Paste DNS Records**: Each DNS record can be copied to clipboard with one click
- **Step-by-Step Instructions**: Detailed setup guides for each service
- **Official Documentation Links**: Direct links to provider documentation
- **Search & Filter**: Quickly find the preset you need

## Accessing DNS Configuration

### From Settings Page:

1. Navigate to **Settings** (`/settings`)
2. Scroll to **DNS & Domain Configuration** section
3. Click **"Configure DNS Records"** button
4. You'll be taken to `/settings/dns`

### Direct Access:

Go directly to: `https://yourdomain.com/settings/dns`

## How to Use

### Step 1: Select Your Email Provider

1. Browse the available presets or use the search bar
2. Click on the preset card to expand it
3. Review the DNS records and setup instructions

### Step 2: Copy DNS Records

Each DNS record displays:
- **Type**: Record type (MX, CNAME, TXT, etc.)
- **Name**: Host/subdomain (`@` for root domain)
- **Value**: Target server or value
- **Priority**: For MX records (mail routing order)
- **TTL**: Time-to-live in seconds

Click the **"Copy"** button to copy the record details to your clipboard.

### Step 3: Add Records to Your Domain Registrar

1. Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
2. Navigate to **DNS Management** or **DNS Records**
3. Add each DNS record with the exact values shown
4. Save your changes

### Step 4: Wait for DNS Propagation

- DNS changes typically take **1-24 hours** to propagate
- Can take up to **48 hours** in some cases
- Use tools like [whatsmydns.net](https://www.whatsmydns.net) to check propagation status

### Step 5: Test Your Configuration

- Send a test email to your domain email address
- Verify it arrives at your forwarding destination
- Check spam folders if not received immediately

## Available Presets

### 🔵 Google Workspace Email (Simplified)

**Best for**: Small businesses, quick setup

**DNS Records**:
- **1 MX Record**: `SMTP.GOOGLE.COM` (Priority: 1)

**Requirements**:
- Active Google Workspace account
- Domain ownership verification in Google Admin

**Cost**: Starting at $6/user/month

---

### 🔵 Google Workspace Email (Full Configuration)

**Best for**: Production use, high reliability

**DNS Records**:
- **5 MX Records**: Primary + 4 backup mail servers
- Includes redundancy for maximum uptime

**Requirements**:
- Active Google Workspace account
- Domain ownership verification

**Features**:
- ✅ 99.9% uptime SLA
- ✅ Multiple backup servers
- ✅ Automatic failover

---

### 🔷 Microsoft 365 Email

**Best for**: Organizations using Microsoft ecosystem

**DNS Records**:
- **1 MX Record**: Custom to your domain

**Requirements**:
- Active Microsoft 365 subscription
- Domain verification in Microsoft 365 Admin Center

**Cost**: Starting at $6/user/month

**Note**: The MX record value is unique to your domain. You'll need to get it from your Microsoft 365 admin panel.

---

### 🟠 Cloudflare Email Routing

**Best for**: Free email forwarding, simple forwarding needs

**DNS Records**:
- **3 MX Records**: Cloudflare's email routing servers

**Requirements**:
- Domain must be on Cloudflare DNS
- Free Cloudflare account

**Cost**: **FREE** 🎉

**Features**:
- ✅ Unlimited email addresses
- ✅ Forward to any email (Gmail, Outlook, etc.)
- ✅ No storage (forwards only)
- ✅ No sending capability

## Common DNS Record Types

| Type | Purpose | Example |
|------|---------|---------|
| **MX** | Mail exchange (email routing) | `SMTP.GOOGLE.COM` |
| **CNAME** | Alias to another domain | `mail.yourdomain.com → ghs.google.com` |
| **TXT** | Text records (verification, SPF, DKIM) | `v=spf1 include:_spf.google.com ~all` |
| **A** | IPv4 address mapping | `yourdomain.com → 192.0.2.1` |
| **AAAA** | IPv6 address mapping | `yourdomain.com → 2001:db8::1` |

## Troubleshooting

### Email Not Receiving

**Check**:
1. DNS propagation is complete (use [whatsmydns.net](https://www.whatsmydns.net))
2. MX records are added correctly
3. Priority values match exactly
4. No conflicting MX records from other providers
5. Email service account is active

**Solution**:
- Wait 24-48 hours for full DNS propagation
- Check spam/junk folders
- Verify domain ownership in email provider admin panel
- Contact email provider support

### DNS Changes Not Taking Effect

**Check**:
1. Correct TTL value (3600 = 1 hour)
2. Records saved in DNS management panel
3. No typos in record values

**Solution**:
- Clear DNS cache on your computer
- Use different DNS checker tools
- Contact domain registrar support

### Multiple Email Services Conflict

**Problem**: Added MX records from multiple providers (Google + Microsoft)

**Solution**:
- **Remove all MX records**
- Add only ONE email service's MX records
- Wait for DNS propagation
- You can only use one email service at a time

### "Domain Already in Use" Error

**Problem**: Email provider says domain is already configured elsewhere

**Solution**:
1. Check if domain is configured in another account
2. Remove domain from old account first
3. Wait 24 hours, then add to new account
4. Contact provider support if needed

## Best Practices

### ✅ Do:

- **Backup existing DNS records** before making changes
- **Test with a single email address** first
- **Document your DNS changes** for future reference
- **Use high TTL values** (3600+) for stable records
- **Verify domain ownership** with email provider
- **Set up SPF/DKIM records** for better deliverability (provider will give you these)

### ❌ Don't:

- **Don't mix multiple email services** (only use one at a time)
- **Don't skip domain verification** steps
- **Don't expect instant changes** (DNS takes time)
- **Don't delete existing records** without understanding them
- **Don't use low TTL values** unless testing

## Advanced Configuration

### SPF Records (Email Authentication)

After setting up MX records, add SPF (Sender Policy Framework) record:

**Google Workspace**:
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.google.com ~all
```

**Microsoft 365**:
```
Type: TXT
Name: @
Value: v=spf1 include:spf.protection.outlook.com ~all
```

### DKIM Records (Email Signing)

DKIM records are generated by your email provider. Find them in:
- **Google Workspace**: Admin Console → Apps → Gmail → Authenticate email
- **Microsoft 365**: Admin Center → Security → DKIM

### DMARC Policy (Email Reporting)

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@yourdomain.com
```

## Support

### Need Help?

- **Email**: support@webese.ai
- **Documentation**: [Webese Docs](https://docs.webese.ai)
- **Community**: [Discord](https://discord.gg/webese)

### Provider Support:

- **Google Workspace**: [support.google.com/a](https://support.google.com/a)
- **Microsoft 365**: [support.microsoft.com](https://support.microsoft.com)
- **Cloudflare**: [support.cloudflare.com](https://support.cloudflare.com)

## Related Documentation

- [Custom Domain Setup](./CUSTOM_DOMAIN_SETUP.md)
- [Publishing Your Website](./PUBLISHING_GUIDE.md)
- [DNS Troubleshooting](./DNS_TROUBLESHOOTING.md)

---

**Last Updated**: 2026-02-26
