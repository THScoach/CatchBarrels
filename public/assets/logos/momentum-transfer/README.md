# CatchBarrels Momentum Transfer Logo Assets

Generated: November 26, 2025

## Overview
This directory contains all 8 logo variants for the CatchBarrels "Momentum Transfer" brand, featuring the signature golden neon line-art baseball hitter with dynamic energy flow ribbons in red-orange, gold, and blue gradients.

## Brand Colors
- **Primary Gold**: #E8B14E (Electric Gold)
- **Energy Ribbons**: Red-orange, Gold, Blue gradients
- **Background**: Dark charcoal to black (or transparent)

## Assets

### 1. Primary Horizontal Logo
**File**: `logo-horizontal-primary.png`  
**Size**: 1376×400px  
**Format**: PNG with transparency  
**Use**: Main brand logo for websites, presentations, marketing materials

### 2. Header Logo
**File**: `logo-header.png`  
**Size**: 600×150px  
**Format**: PNG with transparency  
**Use**: Website header, compact horizontal spaces

### 3. App Icon (512×512)
**File**: `app-icon-512.png`  
**Size**: 512×512px  
**Format**: PNG with transparency  
**Use**: PWA manifest icon, high-resolution app icon

### 4. App Icon (192×192)
**File**: `app-icon-192.png`  
**Size**: 192×192px  
**Format**: PNG with transparency  
**Use**: PWA manifest icon, standard app icon size

### 5. Favicon
**File**: `favicon-32.png`  
**Size**: 32×32px  
**Format**: PNG with transparency  
**Use**: Browser favicon, ultra-small icon displays

### 6. Apple Touch Icon
**File**: `apple-touch-icon-180.png`  
**Size**: 180×180px  
**Format**: PNG with solid black background  
**Use**: iOS home screen icon, follows Apple design guidelines with padding

### 7. Splash Screen
**File**: `splash-screen.png`  
**Size**: 2732×2732px  
**Format**: PNG with dark gradient background  
**Use**: PWA installation splash screen, loading screens

### 8. Watermark/Monochrome
**File**: `watermark-512.png`  
**Size**: 512×512px  
**Format**: PNG with transparency (30% opacity)  
**Use**: Video watermarks, subtle branding overlays, background elements

## Integration Guide

### Next.js 14 PWA Manifest
```json
{
  "icons": [
    {
      "src": "/assets/logos/momentum-transfer/app-icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/assets/logos/momentum-transfer/app-icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### HTML Head Tags
```html
<!-- Favicon -->
<link rel="icon" type="image/png" sizes="32x32" href="/assets/logos/momentum-transfer/favicon-32.png">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/assets/logos/momentum-transfer/apple-touch-icon-180.png">

<!-- PWA Splash Screen -->
<link rel="apple-touch-startup-image" href="/assets/logos/momentum-transfer/splash-screen.png">
```

### React/Next.js Component
```tsx
import Image from 'next/image';

// Header Logo
<Image 
  src="/assets/logos/momentum-transfer/logo-header.png"
  alt="CatchBarrels Momentum Transfer"
  width={600}
  height={150}
  priority
/>

// Watermark Overlay
<div className="absolute top-4 right-4 opacity-30">
  <Image 
    src="/assets/logos/momentum-transfer/watermark-512.png"
    alt=""
    width={128}
    height={128}
  />
</div>
```

## Design Notes

### Style Characteristics
- **Golden neon line-art**: Smooth, glowing edges with electric gold color
- **Dynamic energy ribbons**: Flowing momentum trails in gradient colors
- **Kinetic aesthetic**: Captures the "flow of energy" concept
- **Dark mode optimized**: Designed for dark backgrounds

### Usage Guidelines
- Always use on dark backgrounds for maximum impact
- Maintain adequate padding around logos (minimum 20px)
- Do not alter colors or proportions
- For light backgrounds, use the watermark version with adjusted opacity
- Ensure sufficient contrast for accessibility

## File Sizes
- Primary Horizontal: 564KB
- Header Logo: 112KB
- Splash Screen: 3.5MB
- App Icon 512: 412KB
- App Icon 192: 54KB
- Apple Touch Icon: 28KB
- Favicon: 2.3KB
- Watermark: 283KB

## Technical Specifications
- All files are PNG format with RGBA color space
- Transparent backgrounds where specified
- Optimized for web delivery
- High-quality anti-aliasing for smooth edges
- Compatible with all modern browsers and devices

## Version History
- v1.0 (Nov 26, 2025): Initial generation of all 8 variants based on reference design

---

For questions or custom variations, contact the design team.
