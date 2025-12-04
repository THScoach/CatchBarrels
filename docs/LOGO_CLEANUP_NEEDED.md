# Logo Cleanup - Old Files to Remove

## ⚠️ Status: Pending Asset Upload

**Before removing old files**, ensure all new branding assets have been uploaded to `/public/branding/`.

---

## 🗑️ Files Safe to Remove

### Root Level (`/public/`)
These files are OLD and should be removed once new branding is in place:

```
/public/catchbarrels-logo-192.png     → REMOVE (replaced by /branding/logo-mark-icon.png)
/public/catchbarrels-logo-512.png     → REMOVE (replaced by /branding/logo-mark-icon.png)
/public/favicon.png                   → REMOVE (replaced by /branding/favicon.ico)
/public/apple-touch-icon.png          → REMOVE (replaced by /branding/logo-mark-icon.png)
```

### Old Momentum Transfer Assets
These were from a previous branding iteration. They can be kept as backup or removed:

```
/public/assets/logos/momentum-transfer/
├── logo-horizontal-primary.png        → BACKUP/REMOVE (superseded)
├── logo-header.png                   → BACKUP/REMOVE (superseded)
├── apple-touch-icon-180.png          → BACKUP/REMOVE (superseded)
├── app-icon-192.png                  → BACKUP/REMOVE (superseded)
├── logo-horizontal.png               → BACKUP/REMOVE (superseded)
├── favicon-32.png                    → BACKUP/REMOVE (superseded)
├── app-icon-512.png                  → BACKUP/REMOVE (superseded)
└── logo-icon-512.png                 → BACKUP/REMOVE (superseded)
```

**Note**: Social media assets in `/public/assets/social/` are GENERATED content and should be KEPT.

---

## ✅ Code References Updated

All code now points to `/branding/` paths:

- ✅ `/components/layout/BarrelsHeader.tsx` → Uses `/branding/logo-horizontal.png` and `/branding/logo-mark-icon.png`
- ✅ `/app/layout.tsx` → Uses `/branding/favicon.ico`, `/branding/logo-mark-icon.png`, `/branding/social-card-default.png`
- ✅ `/app/auth/login/login-client.tsx` → Uses `/branding/logo-primary-dark.png`
- ✅ `/public/manifest.json` → Uses `/branding/logo-mark-icon.png`

---

## 📋 Cleanup Procedure

### Step 1: Verify New Assets Are in Place
```bash
ls -lh /public/branding/
# Should show:
# - logo-horizontal.png
# - logo-mark-icon.png
# - logo-primary-dark.png
# - social-card-default.png
# - favicon.ico
```

### Step 2: Test App Locally
```bash
cd /home/ubuntu/barrels_pwa/nextjs_space
yarn dev
# Open http://localhost:3000
# Verify all logos display correctly
# Check browser tab icon (favicon)
# Test login page logo
# Check dashboard branding
```

### Step 3: Remove Old Files (Manual)
```bash
# After confirming new branding works:
rm /public/catchbarrels-logo-192.png
rm /public/catchbarrels-logo-512.png
rm /public/favicon.png
rm /public/apple-touch-icon.png

# Optional - remove old momentum transfer assets:
rm -rf /public/assets/logos/momentum-transfer/
```

### Step 4: Rebuild & Verify
```bash
yarn build
# Ensure no 404 errors for missing images
```

---

## 👁️ Visual Verification Checklist

After cleanup, verify these pages:

- [ ] **Dashboard** (`/dashboard`) - Header shows new logo
- [ ] **Login Page** (`/auth/login`) - New logo in hero section
- [ ] **Video Pages** (`/video/[id]`) - Header logo correct
- [ ] **Mobile View** - Icon-only logo on mobile header
- [ ] **Browser Tab** - New favicon displays
- [ ] **PWA Install** - New app icon shows during install
- [ ] **Social Share** - Link previews use new OG image

---

## 🔍 Search for Remaining References

If unsure whether old files are still referenced:

```bash
# Search for old logo references:
grep -r "catchbarrels-logo" /home/ubuntu/barrels_pwa/nextjs_space/app/
grep -r "momentum-transfer" /home/ubuntu/barrels_pwa/nextjs_space/app/
grep -r "favicon.png" /home/ubuntu/barrels_pwa/nextjs_space/app/

# Should return NO results (all updated to /branding/ paths)
```

---

## ⚠️ Important Notes

1. **Do NOT remove** `/public/assets/social/` → These are generated social media assets
2. **Do NOT remove** `/public/branding/` → This is the NEW branding folder
3. **Test thoroughly** before removing old files
4. **Keep backups** of old logos if unsure
5. **Clear browser cache** after cleanup to see new branding

---

**Created**: November 26, 2025  
**Status**: Waiting for NanoBanana asset upload  
**Next Step**: Upload branding assets, then run cleanup
