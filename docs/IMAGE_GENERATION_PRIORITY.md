# Image Generation Priority System

## 🚨 **CRITICAL: GEMINI IS MANDATORY - NO DALL-E**

This document outlines the **MANDATORY** image generation priority system with **GEMINI ONLY** for AI-generated images.

**DALL-E HAS BEEN COMPLETELY REMOVED** - Gemini or Unsplash only.

---

## **📋 Priority Order**

### **🌟 GEMINI ONLY FOR AI IMAGES**

**Status**: **ABSOLUTELY MANDATORY** - Google Gemini/Imagen is the ONLY AI image generator
**API**: Google Gemini/Imagen via AI Studio or Vertex AI
**Purpose**: All AI-generated images with comprehensive prohibitions
**Speed**: 3-5 seconds per image
**Cost**: Free tier available

**⚠️ CRITICAL: NO DALL-E FALLBACK**
- Gemini is the ONLY AI image generator
- DALL-E has been completely removed from the codebase
- If Gemini fails, we fall back to Unsplash (stock photos)
- Hero images REQUIRE Gemini - will fail if not configured

### **Priority Order:**
1. **Google Gemini/Imagen** (PRIMARY - AI-generated with prohibitions)
2. **Unsplash** (FALLBACK - professional stock photography)

**NO DALL-E - IT HAS BEEN REMOVED**

---

## **📊 Image Type Priorities**

### **🌟 Hero Images**
- **MUST USE**: Google Gemini/Imagen
- **FALLBACK**: NONE - Will fail if Gemini unavailable
- **WHY**: Requires complete business context and strict prohibitions

### **⚡ Content Page Images**
(FEATURES, ABOUT, TEAM, SERVICES, CONTACT, PORTFOLIO, TESTIMONIALS)
- **PRIMARY**: Unsplash (instant, professional stock photos)
- **FALLBACK**: Google Gemini/Imagen

### **🎨 Other Images**
- **PRIMARY**: Google Gemini/Imagen (if configured)
- **FALLBACK**: Unsplash

---

## **🔧 Configuration**

### **Option A: Vertex AI (Recommended - Imagen 3)**
```bash
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key
GOOGLE_CLOUD_PROJECT_ID=your_gcp_project_id
GOOGLE_CLOUD_LOCATION=us-central1
```
**Setup guide**: https://cloud.google.com/vertex-ai/docs/start/cloud-environment

### **Option B: AI Studio (Simple - Gemini Flash)**
```bash
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key
```
**Get API key**: https://aistudio.google.com/app/apikey

### **Unsplash (Fallback)**
```bash
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```
**Get API key**: https://unsplash.com/developers

---

## **🎯 Why Gemini Only? (NO DALL-E)**

### **Problems with DALL-E:**
- ❌ Was adding cameras and photography equipment to images
- ❌ Camera model names in prompts (Sony, Canon, Leica)
- ❌ Brand logo references (Apple, LinkedIn, etc.)
- ❌ Ignored prohibition instructions
- ❌ Slower than Gemini (15-20s vs 3-5s)

### **Benefits of Gemini:**
- ✅ Comprehensive prohibition system that WORKS
- ✅ No cameras, photography equipment, or brand logos
- ✅ ULTRA-REALISTIC photography only
- ✅ Faster generation (3-5s)
- ✅ Better quality control
- ✅ Consistent with our standards

---

## **📝 Example Log Output**

### **Scenario 1: Gemini Success (Hero Image)**
```
🌟 [GEMINI MANDATORY] Generating HERO image with complete business context
   📋 Client Information:
      ✓ Business: Acme Corp
      ✓ Type: Tech SaaS
      ...
✅ [GEMINI SUCCESS] HERO image generated with complete business context
```

### **Scenario 2: Gemini Configured, Content Uses Unsplash**
```
⚡ [UNSPLASH - CONTENT PAGES] Fetching FEATURES image from Unsplash...
✅ [UNSPLASH SUCCESS] FEATURES image found (instant)
```

### **Scenario 3: Gemini Not Configured (ERROR)**
```
🚨 [ERROR] GEMINI API NOT CONFIGURED - Hero images require Google Gemini/Imagen.
Please set GOOGLE_GEMINI_API_KEY in environment variables.
```

---

## **🚀 Implementation**

### **Code Location**
- **Primary Logic**: `app/api/generate/route.ts`
- **Gemini Service**: `lib/gemini-image.ts`
- **Functions**: `getHybridImage()`, `getHybridMultipleImages()`

### **Function Flow**
```typescript
async function getHybridImage(params) {
  const isHeroImage = params.sectionType.toUpperCase() === 'HERO'

  // HERO IMAGES: GEMINI MANDATORY
  if (isHeroImage) {
    if (!isGeminiConfigured()) {
      throw new Error('GEMINI REQUIRED')
    }
    return await generateGeminiImage(params) // NO FALLBACK
  }

  // CONTENT PAGES: UNSPLASH PRIMARY
  if (isContentSection && hasUnsplash()) {
    try {
      return await getUnsplashImage(params)
    } catch {
      // Fall back to Gemini
    }
  }

  // OTHER: GEMINI FIRST
  if (isGeminiConfigured()) {
    try {
      return await generateGeminiImage(params)
    } catch {
      // Fall back to Unsplash
    }
  }

  // LAST RESORT: UNSPLASH
  if (hasUnsplash()) {
    return await getUnsplashImage(params)
  }

  // FAIL: No options available
  throw new Error('No image generation options available')
}
```

---

## **⚠️ Critical Rules**

### **🚨 GEMINI IS MANDATORY**
1. **Hero images**: MUST have Gemini configured
2. **NO DALL-E**: Completely removed from codebase
3. **Fallback**: Unsplash only (stock photos)
4. **Quality**: Comprehensive prohibitions ensure NO cameras/logos

### **📏 Image Prohibitions (Built into Gemini)**
- ❌ NO photography equipment (cameras, tripods, lights, umbrellas, etc.)
- ❌ NO camera models (Sony, Canon, Leica, Fujifilm, etc.)
- ❌ NO lens specifications (24-70mm, 85mm, etc.)
- ❌ NO brand logos (Apple, Microsoft, Google, Nike, Samsung, etc.)
- ❌ NO cartoons, illustrations, or CGI-looking images
- ✅ ULTRA-REALISTIC photography ONLY

---

## **🎯 Performance**

- **Gemini**: 3-5s per image (FAST)
- **Unsplash**: Instant (FASTEST)
- **DALL-E**: REMOVED (was 15-20s, had quality issues)

---

## **💡 Pro Tips**

1. **Always configure Gemini** - Required for hero images, recommended for all
2. **Vertex AI for best quality** - Imagen 3 provides superior results
3. **Unsplash for speed** - Content pages use instant stock photos
4. **Monitor logs** - Check which service is being used

---

## **🆘 Troubleshooting**

### **Hero Generation Failing?**
- Check `GOOGLE_GEMINI_API_KEY` is configured
- Verify API key is active
- Check rate limits (free tier)

### **Images Still Have Cameras?**
- **IMPOSSIBLE** - DALL-E has been removed
- If seeing cameras, check which API is actually being used
- Review logs for Gemini vs Unsplash

### **Slow Generation?**
- Should be 3-5s with Gemini
- Instant with Unsplash
- Check API response times in logs

---

**Last Updated**: 2026-02-28
**Version**: 2.0 - DALL-E REMOVED
**Status**: ✅ GEMINI MANDATORY
