# CatchBarrels Branding Assets Guide

## 📁 Asset Structure

All branding assets for the CatchBarrels PWA should be placed in the following directory structure:

```
/public/branding/
├── logo-primary-dark.png       (Horizontal logo for dark backgrounds)
├── logo-primary-light.png      (Horizontal logo for light backgrounds - optional)
├── logo-mark-icon.png          (Square icon/app icon - 512x512px)
├── logo-horizontal.png         (Wide lockup for headers - 240x60px)
├── social-card-default.png     (Social media OG image - 1200x630px)
└── favicon.ico                 (Browser favicon - 32x32px)
```

---

## 🎨 Asset Specifications

### 1. `logo-horizontal.png`
**Purpose**: Main header logo across desktop views  
**Dimensions**: 240px × 60px (recommended)  
**Format**: PNG with transparent background  
**Used in**:
- `/components/layout/BarrelsHeader.tsx` (desktop navigation)
- `/app/auth/login` (login page header)
- `/app/dashboard` (dashboard header)

**Design Notes**:
- Should include "CatchBarrels" wordmark
- Optimized for dark backgrounds (#000000)
- Gold accent color: #E8B14E

---

### 2. `logo-mark-icon.png`
**Purpose**: Square app icon for mobile, PWA, and small spaces  
**Dimensions**: 512px × 512px (master), also generate 192px × 192px  
**Format**: PNG with transparent or solid background  
**Used in**:
- `/public/manifest.json` (PWA icons)
- `/components/layout/BarrelsHeader.tsx` (mobile header)
- `/app/layout.tsx` (Apple touch icon)
- Favicon generation

**Design Notes**:
- Icon-only version (no text)
- Should work at small sizes (32px)
- Consistent with brand identity

---

### 3. `logo-primary-dark.png`
**Purpose**: Full logo for dark background contexts  
**Dimensions**: Flexible (typically 300px wide)  
**Format**: PNG with transparent background  
**Used in**:
- `/app/auth/login` (hero section)
- `/app/welcome` (onboarding)
- Splash screens

**Design Notes**:
- Full lockup with icon + wordmark
- Optimized for black backgrounds
- High contrast for readability

---

### 4. `logo-primary-light.png` (Optional)
**Purpose**: Full logo for light background contexts  
**Dimensions**: Flexible (typically 300px wide)  
**Format**: PNG with transparent background  
**Used in**:
- Email templates
- Print materials
- External integrations

**Design Notes**:
- Alternative colorway for light backgrounds
- Maintain brand consistency

---

### 5. `social-card-default.png`
**Purpose**: Default Open Graph image for social sharing  
**Dimensions**: 1200px × 630px (required by Facebook/Twitter)  
**Format**: PNG or JPG  
**Used in**:
- `/app/layout.tsx` (OpenGraph metadata)
- Default for all pages without custom OG images
- Link previews on social media

**Design Notes**:
- Include CatchBarrels logo
- Tagline: "Track your momentum, not just your stats."
- Safe area: avoid text in outer 100px on all sides
- File size: < 5MB

---

### 6. `favicon.ico`
**Purpose**: Browser tab icon  
**Dimensions**: 32px × 32px (multi-resolution ICO file)  
**Format**: ICO (contains 16x16, 32x32, 48x48)  
**Used in**:
- `/app/layout.tsx` (favicon link)
- Browser tabs
- Bookmarks

**Design Notes**:
- Simplified version of logo mark
- High contrast for visibility at small size
- Should be recognizable at 16px

---

## 🔗 Where Each Asset Is Used

### Header Navigation
- **Desktop**: `logo-horizontal.png` (240×60px)
- **Mobile**: `logo-mark-icon.png` (40×40px)
- **Component**: `/components/layout/BarrelsHeader.tsx`

### Authentication Pages
- **Login Header**: `logo-horizontal.png`
- **Hero Section**: `logo-primary-dark.png`
- **Component**: `/app/auth/login/login-client.tsx`

### Dashboard
- **Header**: `logo-horizontal.png` (via BarrelsHeader)
- **Hero Badge**: `logo-mark-icon.png` (optional, ghosted)
- **Component**: `/app/dashboard/dashboard-client.tsx`

### PWA Manifest
- **Icons**: `logo-mark-icon.png` (192×192, 512×512)
- **File**: `/public/manifest.json`

### Browser Metadata
- **Favicon**: `favicon.ico` (32×32)
- **Apple Touch Icon**: `logo-mark-icon.png` (192×192)
- **File**: `/app/layout.tsx`

### Social Sharing
- **Default OG Image**: `social-card-default.png` (1200×630)
- **Twitter Card**: Same as OG image
- **File**: `/app/layout.tsx` metadata

---

## 📥 Upload Instructions

### For Coach Rick:

1. **Export from NanoBanana Pro** at the specified dimensions above

2. **Rename files** to match the exact names in this document:
   - `logo-horizontal.png`
   - `logo-mark-icon.png`
   - `logo-primary-dark.png`
   - `social-card-default.png`
   - `favicon.ico`

3. **Upload to**: `/public/branding/` directory in the project

4. **Verify**:
   - All files use the exact names above
   - PNG files have transparent backgrounds
   - Dimensions match specifications
   - File sizes are reasonable (< 500KB each, except social card < 5MB)

---

## 🎨 Brand Color Reference

For consistency with existing theme:

| Color | Hex | Usage |
|-------|-----|-------|
| **Electric Gold** | `#E8B14E` | Primary brand color, CTAs, accents |
| **Gold Light** | `#F5C978` | Gradients, hover states |
| **Pure Black** | `#000000` | Backgrounds, header |
| **Black Light** | `#1A1A1A` | Cards, panels |
| **Neutral Gray** | `#A0A0A0` | Secondary text |

**Logo colors should align with this palette.**

---

## ✅ Verification Checklist

After uploading assets, verify:

- [ ] Header logo appears on all pages
- [ ] Mobile header shows icon correctly
- [ ] Login page displays branded logo
- [ ] Dashboard hero includes branding
- [ ] Browser tab shows new favicon
- [ ] PWA install uses new icons
- [ ] Shared links show new OG image
- [ ] All images load without 404 errors
- [ ] No old logo references remain

---

## 🔄 Future Asset Additions

The following assets may be added later:

- `logo-vertical.png` - Stacked lockup for tall spaces
- `logo-white.png` - Monochrome white version
- `logo-black.png` - Monochrome black version
- `splash-screen.png` - PWA splash screen (2048×2732)
- Custom OG images for specific pages (video detail, assessments, etc.)

---

## 📞 Support

If you encounter issues uploading or assets aren't displaying correctly:

1. Check file names match **exactly** (case-sensitive)
2. Verify files are in `/public/branding/` directory
3. Clear browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
4. Check browser console for 404 errors
5. Rebuild app: `yarn build`

---

**Last Updated**: November 26, 2025  
**Version**: 1.0  
**Status**: Ready for Asset Upload  
**Next Step**: Upload NanoBanana exports to `/public/branding/`
