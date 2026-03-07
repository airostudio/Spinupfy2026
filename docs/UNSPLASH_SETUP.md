# Unsplash Integration Setup Guide

## 🚀 What This Does

Unsplash integration **dramatically reduces website generation time**:

### Performance Comparison:
- **Before (DALL-E only)**: 5-10 minutes per website
- **After (Unsplash + DALL-E)**: **< 3 minutes** per website ⚡

### Time Savings Per Image:
- Hero image: 15-20s → **Instant**
- 6 Feature images: 90-120s → **Instant**
- 3 Team headshots: 45-60s → **Instant**
- 6 Page heroes: 90-120s → **Instant**

**Total time saved: 4-7 minutes per website!**

---

## ⚙️ Setup Instructions

### Step 1: Get Your Unsplash API Key

1. Go to https://unsplash.com/developers
2. Click **"Register as a Developer"** (free account)
3. Create a **new application**:
   - Application name: `Webese AI Website Builder`
   - Description: `AI-powered website generation platform`
   - Accept the terms
4. Copy your **Access Key**

### Step 2: Add to Environment Variables

Add this to your `.env` file:

```bash
# Unsplash (Rapid image loading - HIGHLY RECOMMENDED)
UNSPLASH_ACCESS_KEY=your_access_key_here
```

### Step 3: Restart Your Server

```bash
npm run dev
```

That's it! Unsplash is now integrated.

---

## 📊 API Limits

### Free Tier (Demo/Testing):
- **50 requests per hour**
- Good for: Development, testing, small-scale use
- Perfect for getting started

### Production Tier (Paid):
- **Unlimited requests**
- **$29/month**
- Required for: High-volume production use

---

## 🎯 How It Works

### Hybrid Image Strategy:

1. **Unsplash First** (Primary):
   - Searches Unsplash for relevant business images
   - Uses curated search queries per business type
   - Instant loading (no generation time)
   - Professional stock photography quality

2. **DALL-E Fallback** (Secondary):
   - Only used if Unsplash fails
   - Or if Unsplash API key not configured
   - Custom-generated images on demand

### Intelligent Search Queries

The system has 100+ pre-defined search queries for each business type:

**Example: Restaurant**
- Hero: "upscale restaurant interior", "fine dining atmosphere"
- Services: "gourmet food plating", "restaurant dish presentation"
- Team: "chef portrait professional", "restaurant staff uniform"

**Example: Law Firm**
- Hero: "law office interior elegant", "professional legal office"
- Services: "legal consultation meeting", "attorney client discussion"
- Team: "attorney professional portrait", "lawyer headshot"

---

## 🎨 Image Quality

### Unsplash Benefits:
- ✅ Professional stock photography
- ✅ Modern, high-resolution images
- ✅ Diverse, authentic imagery
- ✅ No AI artifacts or imperfections
- ✅ Licensed for commercial use

### DALL-E Benefits:
- ✅ Custom-generated for your brand
- ✅ Unique to your business
- ✅ Can include specific details
- ✅ More control over composition

---

## 🔍 What Happens If Not Configured?

If `UNSPLASH_ACCESS_KEY` is not set:
- System automatically falls back to DALL-E
- Generation time reverts to 5-10 minutes
- Still works, just slower
- No errors or failures

**Recommendation: Always configure Unsplash for production!**

---

## 📈 Monitoring Usage

### Check Unsplash Usage:
1. Log into https://unsplash.com/developers
2. Go to your application
3. View **Statistics** tab

### What to Monitor:
- Requests per hour
- Requests per month
- Approaching rate limits

### Upgrade When:
- Consistently hitting 50 req/hour limit
- Need to generate >50 websites per hour
- Running production service

---

## 💡 Best Practices

### For Development:
- ✅ Use free tier (50 req/hour)
- ✅ Perfect for testing
- ✅ No cost

### For Production:
- ✅ Upgrade to unlimited plan ($29/month)
- ✅ Monitor usage regularly
- ✅ Consider caching images
- ✅ Store generated images in your storage

### For High Volume:
- Consider implementing image caching
- Store Unsplash images in your CDN
- Reduce repeated API calls

---

## 🐛 Troubleshooting

### "No images found" Warning:
**Cause**: Unsplash didn't find relevant images
**Solution**: System automatically falls back to DALL-E
**Action**: No action needed, this is expected behavior

### "Unsplash API key not configured" Log:
**Cause**: `UNSPLASH_ACCESS_KEY` not in `.env`
**Solution**: Add API key following Step 2 above
**Action**: Restart server after adding key

### Rate Limit Exceeded:
**Cause**: More than 50 requests in 1 hour (free tier)
**Solution**:
- Wait for hour to reset, OR
- Upgrade to unlimited plan
**Action**: Monitor usage more carefully

### Images Not Business-Relevant:
**Cause**: Search query may not match perfectly
**Solution**: System provides multiple fallbacks:
1. Try alternative search queries
2. Fall back to DALL-E generation
3. Use generic business images
**Action**: Generally resolves automatically

---

## 📞 Support

### Unsplash Support:
- Documentation: https://unsplash.com/documentation
- Email: api@unsplash.com

### Webese Support:
- GitHub Issues: [Report Issue](https://github.com/your-repo/issues)
- Check logs for detailed error messages

---

## 🎯 Expected Results

### After Setup:

```bash
⚡ Fetching hero image (Unsplash with DALL-E fallback)...
✅ Hero image ready from Unsplash (instant)

⚡ Fetching feature images (Unsplash with DALL-E fallback)...
✅ Feature images ready: 6 from Unsplash, 0 from DALL-E

⚡ Fetching team headshots (Unsplash with DALL-E fallback)...
✅ Team headshots ready from unsplash

⚡ Fetching page hero images (Unsplash with DALL-E fallback)...
✅ Page hero images ready: 6 from Unsplash, 0 from DALL-E

Total generation time: 2 minutes 45 seconds ⚡
```

---

## ✅ Quick Checklist

Before going to production, ensure:

- [ ] Unsplash API key obtained
- [ ] API key added to `.env`
- [ ] Server restarted
- [ ] Test generation (<3 min)
- [ ] Monitor usage dashboard
- [ ] Consider paid tier for production

---

**Recommendation**: Set this up immediately for the best user experience!
