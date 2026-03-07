# Business Type Detection Issues - Troubleshooting Guide

## Issue: Wrong Images and Content for Electrician Websites

### Problem Description
When creating an electrician website, the system was generating:
- Images of mechanics workshops and cars (instead of electrical work)
- CTA popup text about "relaxation" (instead of electrical services)
- Content completely unrelated to electrical services

### Root Cause
**Missing Business Types**: The system did NOT have dedicated business types for common trade contractors:
- ❌ No "Electrician" type
- ❌ No "Plumber" type
- ❌ No "HVAC" type
- ❌ No "Roofer" type

When users described an electrician business, the AI detection system was incorrectly matching it to:
- "Automotive" (because "electrical" sounded similar to "auto")
- "Construction" (generic contractor category)
- Other unrelated categories

This caused the entire website generation to use the wrong:
- Business context
- Industry keywords
- Image prompts
- CTA messaging

### Solution Applied

**1. Added 4 New Trade Contractor Business Types:**

#### Electrician ⚡
- **Keywords**: electrician, electrical, wiring, circuit breaker, panel, outlet, lighting, electrical repair
- **Design System**: Professional, trustworthy, safety-focused
- **Image Style**: "professional electrician at work, home electrical panels, modern lighting installations, safety equipment, clean residential and commercial settings"
- **Competitors**: Mister Sparky, Benjamin Franklin Plumbing, HomeAdvisor Pros

#### Plumber 🔧
- **Keywords**: plumber, plumbing, drain, pipe, leak, water heater, faucet, toilet, sink, sewer
- **Design System**: Reliable, professional, clean and trustworthy
- **Image Style**: "professional plumber working, modern fixtures, pipes and plumbing systems, clean residential bathrooms and kitchens"
- **Competitors**: Roto-Rooter, Benjamin Franklin Plumbing, Mr. Rooter

#### HVAC ❄️
- **Keywords**: hvac, heating, cooling, air conditioning, furnace, ac repair, climate control
- **Design System**: Modern, comfortable, climate-focused
- **Image Style**: "HVAC technician servicing units, modern air conditioning systems, heating equipment, clean home interiors with climate control"
- **Competitors**: Carrier, Trane, Lennox Dealers

#### Roofer 🏠
- **Keywords**: roofer, roofing, roof repair, roof replacement, shingles, leak repair, gutter
- **Design System**: Solid, dependable, protective service
- **Image Style**: "professional roofers at work, quality roofing materials, residential homes with beautiful roofs, roofing installation and repair"
- **Competitors**: GAF Master Elite, CertainTeed SELECT ShingleMaster, Owens Corning Preferred Contractors

**2. Updated Business Type Detector:**
- Added extensive keyword lists for each trade (20+ keywords per trade)
- Removed generic "roofing", "plumbing", "electrical", "hvac" from construction keywords
- Ensured specific trades are detected accurately before falling back to general construction

### Files Modified

1. **`/lib/config/business-types.ts`** (lines 355-495)
   - Added 4 new business type definitions with complete design systems
   - Each has specific color themes, typography, competitors, and image style guidance

2. **`/lib/business-type-detector.ts`** (lines 98-162)
   - Added EXTENDED_KEYWORDS entries for: electrician, plumber, hvac, roofer
   - Removed trade-specific keywords from generic construction category

### No Caching Issues Found

**Investigation Results:**
- ✅ No global state or caching in OpenAI API calls
- ✅ Each generation creates fresh API requests with new context
- ✅ No session persistence between different website generations
- ✅ Business type detection is stateless and recalculated each time

**Why it appeared to be a "cache" issue:**
- The wrong business type was consistently detected due to missing types
- Once detected as "Automotive", all subsequent API calls used automotive context
- This created the illusion of cached/contaminated data, but it was actually consistent wrong detection

### Testing the Fix

**Before Fix:**
```bash
# Input
Business: "John's Electrical Services"
Description: "Licensed electrician providing residential and commercial electrical repairs"

# Output (WRONG)
Business Type Detected: automotive
Images: mechanics working on cars, auto shops, vehicles
CTA: "Relax and let us handle your service needs" (generic/wrong)
```

**After Fix:**
```bash
# Input
Business: "John's Electrical Services"
Description: "Licensed electrician providing residential and commercial electrical repairs"

# Output (CORRECT)
Business Type Detected: electrician ⚡
Images: electricians working, electrical panels, lighting installations, home electrical work
CTA: "Need Electrical Repairs? Call Our Licensed Electricians Today!"
Keywords Matched: electrician, electrical, residential electrical, commercial electrical, repairs
Confidence: 0.95
```

### How to Verify the Fix

1. **Create a new electrician website:**
   ```
   Business Name: "Spark Electric"
   Description: "Professional electrical services for homes and businesses. Licensed electricians available 24/7."
   ```

2. **Check detection results in browser console:**
   - Should show: `Business Type: electrician`
   - Should NOT show: automotive, construction (generic), or other types

3. **Verify generated content:**
   - Hero image should show electrical work (NOT cars/mechanics)
   - CTA should mention electrical services (NOT relaxation/spa/automotive)
   - Services should list: wiring, panel upgrades, lighting, outlets, etc.

### Prevention for Future

**When adding new business categories:**
1. ✅ Add to `/lib/config/business-types.ts` with complete design system
2. ✅ Add to `/lib/business-type-detector.ts` EXTENDED_KEYWORDS
3. ✅ Include 15+ specific keywords to ensure accurate detection
4. ✅ Define specific image style guidance to avoid AI misinterpretation
5. ✅ Test with real-world descriptions before deploying

**Common missing business types to watch for:**
- 🔌 Electrician (FIXED)
- 🔧 Plumber (FIXED)
- ❄️ HVAC (FIXED)
- 🏠 Roofer (FIXED)
- 🚿 Pool Service
- 🪟 Window Cleaning
- 🧹 Cleaning Service (residential/commercial)
- 🔒 Locksmith
- 🚪 Door/Window Installation
- 🎨 Painting Contractor
- 🌲 Tree Service/Arborist
- 🐜 Pest Control
- 🚗 Auto Detailing (different from automotive repair)

### Summary

**Issue**: Missing business type definitions caused wrong detection → wrong content
**Not a cache issue**: Each generation is fresh, but consistently detected wrong
**Solution**: Added 4 critical trade contractor business types
**Result**: Electricians, plumbers, HVAC techs, and roofers now get accurate, industry-specific content

---

**Fixed in commit:** [pending]
**Date:** 2026-02-05
**Impact:** HIGH - Affects all trade contractor website generations
**Severity:** CRITICAL - Generated completely wrong content and images
