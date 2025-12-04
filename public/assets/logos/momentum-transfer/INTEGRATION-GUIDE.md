# CatchBarrels Momentum Transfer - Integration Guide

## Quick Start

All logo assets are now available in `/public/assets/logos/momentum-transfer/`

## 1. Update PWA Manifest

Edit `public/manifest.json`:

```json
{
  "name": "CatchBarrels - Momentum Transfer System",
  "short_name": "CatchBarrels",
  "description": "Baseball swing analysis with the Momentum Transfer System",
  "theme_color": "#E8B14E",
  "background_color": "#0a0a0a",
  "display": "standalone",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/assets/logos/momentum-transfer/app-icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/assets/logos/momentum-transfer/app-icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## 2. Update HTML Head Tags

Edit `app/layout.tsx` or your root layout:

```tsx
export const metadata: Metadata = {
  title: 'CatchBarrels - Momentum Transfer System',
  description: 'Baseball swing analysis with the Momentum Transfer System',
  icons: {
    icon: '/assets/logos/momentum-transfer/favicon-32.png',
    apple: '/assets/logos/momentum-transfer/apple-touch-icon-180.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CatchBarrels',
    startupImage: '/assets/logos/momentum-transfer/splash-screen.png',
  },
}
```

## 3. Header Logo Component

Create or update your header component:

```tsx
// components/Header.tsx
import Image from 'next/image';

export function Header() {
  return (
    <header className="bg-black border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <Image
          src="/assets/logos/momentum-transfer/logo-header.png"
          alt="CatchBarrels Momentum Transfer"
          width={600}
          height={150}
          className="h-12 w-auto"
          priority
        />
      </div>
    </header>
  );
}
```

## 4. Splash Screen Component

Create a loading/splash screen component:

```tsx
// components/SplashScreen.tsx
import Image from 'next/image';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black to-gray-900 flex items-center justify-center z-50">
      <div className="relative w-64 h-64">
        <Image
          src="/assets/logos/momentum-transfer/splash-screen.png"
          alt="CatchBarrels"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
```

## 5. Video Watermark Component

Add watermark to video analysis:

```tsx
// components/VideoPlayer.tsx
import Image from 'next/image';

export function VideoPlayer({ src }: { src: string }) {
  return (
    <div className="relative">
      <video src={src} controls className="w-full" />
      
      {/* Watermark overlay */}
      <div className="absolute top-4 right-4 pointer-events-none">
        <Image
          src="/assets/logos/momentum-transfer/watermark-512.png"
          alt=""
          width={128}
          height={128}
          className="opacity-30"
        />
      </div>
    </div>
  );
}
```

## 6. Full-Width Hero Logo

For landing pages or hero sections:

```tsx
// components/Hero.tsx
import Image from 'next/image';

export function Hero() {
  return (
    <section className="bg-gradient-to-br from-black to-gray-900 py-20">
      <div className="container mx-auto px-4 text-center">
        <Image
          src="/assets/logos/momentum-transfer/logo-horizontal-primary.png"
          alt="CatchBarrels Momentum Transfer System"
          width={1376}
          height={400}
          className="mx-auto max-w-full h-auto"
          priority
        />
        <p className="mt-8 text-xl text-gray-300">
          Master the Flow of Energy in Your Swing
        </p>
      </div>
    </section>
  );
}
```

## 7. Favicon Setup

Add to `app/layout.tsx` head section:

```tsx
<link rel="icon" type="image/png" sizes="32x32" href="/assets/logos/momentum-transfer/favicon-32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/assets/logos/momentum-transfer/apple-touch-icon-180.png" />
```

## 8. PWA Installation Prompt

Create a custom install prompt:

```tsx
// components/InstallPrompt.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-black border border-[#E8B14E] rounded-lg p-4 shadow-xl z-50">
      <div className="flex items-center gap-4">
        <Image
          src="/assets/logos/momentum-transfer/app-icon-192.png"
          alt="CatchBarrels"
          width={64}
          height={64}
          className="rounded-lg"
        />
        <div className="flex-1">
          <h3 className="font-bold text-[#E8B14E]">Install CatchBarrels</h3>
          <p className="text-sm text-gray-300">
            Get the full app experience with offline access
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="bg-[#E8B14E] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#d4a03d] transition"
        >
          Install
        </button>
      </div>
    </div>
  );
}
```

## 9. Loading States

Use the watermark for loading states:

```tsx
// components/LoadingSpinner.tsx
import Image from 'next/image';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative w-24 h-24 animate-pulse">
        <Image
          src="/assets/logos/momentum-transfer/watermark-512.png"
          alt="Loading..."
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
}
```

## 10. Email Signatures & Marketing

For email templates:

```html
<img 
  src="https://momentumintegrated.com/wp-content/uploads/2025/07/Full-colour-2.svg" 
  alt="CatchBarrels Momentum Transfer System"
  width="600"
  style="max-width: 100%; height: auto;"
/>
```

## Brand Guidelines

### Colors
- **Primary Gold**: `#E8B14E`
- **Dark Background**: `#0a0a0a` to `#1a1a1a`
- **Text on Dark**: `#ffffff` or `#f5f5f5`

### Spacing
- Minimum padding around logos: 20px
- Recommended logo height in headers: 48-64px
- Icon sizes: Use exact dimensions (192px, 512px, etc.)

### Usage Rules
1. Always use on dark backgrounds for maximum impact
2. Never alter colors or proportions
3. Maintain aspect ratios when scaling
4. Use watermark version for light backgrounds
5. Ensure sufficient contrast for accessibility

## File Paths Reference

```
/public/assets/logos/momentum-transfer/
├── logo-horizontal-primary.png    (1376×400)
├── logo-header.png                (600×150)
├── app-icon-512.png               (512×512)
├── app-icon-192.png               (192×192)
├── favicon-32.png                 (32×32)
├── apple-touch-icon-180.png       (180×180)
├── splash-screen.png              (2732×2732)
└── watermark-512.png              (512×512)
```

## Testing Checklist

- [ ] PWA installs correctly on iOS
- [ ] PWA installs correctly on Android
- [ ] Favicon appears in browser tabs
- [ ] Apple touch icon appears on iOS home screen
- [ ] Splash screen displays during app launch
- [ ] Header logo displays correctly on all pages
- [ ] Watermark is visible but not intrusive on videos
- [ ] All logos scale properly on different screen sizes
- [ ] Dark mode compatibility verified
- [ ] Accessibility contrast ratios meet WCAG standards

## Support

For custom variations or additional sizes, refer to the generation scripts or contact the design team.

---

**Version**: 1.0  
**Last Updated**: November 26, 2025
