# Week 2 & 3 Implementation Plan

## Week 2: Accessibility Improvements

### 1. AI-Generated Descriptive Alt Text
**Current Problem:**
- Generic alt text like "Hero Background", "About us", "Feature icon"
- No context for screen reader users
- WCAG 2.1 violation

**Solution:**
- Enhance `generateSectionImage()` to return both URL and descriptive alt text
- AI generates context-aware descriptions
- Update all image-using components to use descriptive alt text

**Example:**
```typescript
// Before:
{ imageUrl: "...", altText: "Hero" }

// After:
{
  imageUrl: "...",
  altText: "Modern luxury kitchen with marble countertops, stainless steel appliances, and large windows overlooking city skyline"
}
```

### 2. ARIA Labels for Screen Readers
**Areas to Cover:**
- Icon-only buttons (hamburger menu, close buttons, etc.)
- Form inputs (already have labels, verify)
- Navigation landmarks (nav, main, footer)
- Status messages and alerts

### 3. Keyboard Navigation
**Components to Fix:**
- Mobile menu (Escape to close, Tab navigation)
- Modals and overlays (focus trap)
- Dropdowns and selects
- Custom buttons (ensure keyboard accessible)

### 4. Focus Indicators
**Implementation:**
- Add visible focus rings to all interactive elements
- Use `:focus-visible` for better UX (only keyboard users see rings)
- Ensure contrast ratio meets WCAG AA (3:1 minimum)

### 5. Skip to Main Content
**Implementation:**
- Add skip link at top of page
- Hidden by default, visible on focus
- Jumps to main content area

---

## Week 3: Performance Improvements

### 1. Reduce Framer Motion Animations
**Current Problem:**
- Every section has 3-6 motion.div elements
- Animations trigger on every scroll (whileInView)
- Heavy performance impact on mobile

**Solution:**
- Reduce to 1 animation per section (container only)
- Remove animations from nested elements
- Keep only hero and CTA sections animated
- Use `viewport={{ once: true }}` consistently

**Target:** 50% reduction in motion.div usage

### 2. Next.js Font Optimization
**Current Problem:**
- Fonts loaded client-side with useEffect
- Flash of unstyled text (FOUT)
- No preloading

**Solution:**
```typescript
import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})
```

### 3. Image Blur Placeholders
**Problem:**
- Images load without placeholders
- Cumulative Layout Shift (CLS) issues
- Poor perceived performance

**Solution:**
- Generate blur data URLs for all images
- Use Next.js Image with `placeholder="blur"`
- Add skeleton loaders during generation

### 4. Lazy Loading
**Implementation:**
- Lazy load sections below fold
- Use React.lazy() for heavy components
- Implement Intersection Observer for images
- Defer non-critical JavaScript

---

## Success Metrics

### Accessibility (WCAG 2.1 AA)
- [ ] All images have descriptive alt text
- [ ] All interactive elements have ARIA labels
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators visible on all elements
- [ ] Screen reader tested (NVDA/JAWS)

### Performance (Core Web Vitals)
- [ ] LCP < 2.5s (Largest Contentful Paint)
- [ ] FID < 100ms (First Input Delay)
- [ ] CLS < 0.1 (Cumulative Layout Shift)
- [ ] Build size reduction: 10-15%
- [ ] Lighthouse score: 90+ (Performance)

---

## Implementation Order

1. ✅ **Alt Text Generation** - AI enhancement (30 min)
2. ✅ **ARIA Labels** - Add to all interactive elements (45 min)
3. ✅ **Focus Indicators** - Global CSS (15 min)
4. ✅ **Skip Link** - Add to layout (15 min)
5. ✅ **Keyboard Navigation** - Menu and modals (30 min)
6. ✅ **Reduce Animations** - HeroSection and others (60 min)
7. ✅ **Font Optimization** - Next.js fonts (30 min)
8. ✅ **Image Placeholders** - Blur data URLs (45 min)
9. ✅ **Lazy Loading** - Below-fold sections (30 min)
10. ✅ **Testing** - Build, accessibility, performance (30 min)

**Total Estimated Time:** 5-6 hours
