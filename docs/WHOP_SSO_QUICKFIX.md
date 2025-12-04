# 🚀 Whop SSO Quick Fix Guide

## 🚨 TL;DR - Do These 3 Things:

### 1️⃣ Register Redirect URL in Whop
**Go to:** https://dev.whop.com/ → Apps → CatchBarrels → OAuth Settings

**Add this EXACT URL:**
```
https://catchbarrels.app/api/auth/callback/whop
```

**Remove:** Any other URLs (like `/auth/login`, `/auth/callback`)

---

### 2️⃣ Reinstall CatchBarrels App
**Go to:** https://dash.whop.com/ → Apps → CatchBarrels → Uninstall

**Then:** https://dev.whop.com/ → Your Apps → CatchBarrels → Install to Business

---

### 3️⃣ Test Login
**Browser:** https://catchbarrels.app/auth/login → Click "Sign in with Whop"

**Mobile:** Whop App → BARRELS Pro → Open App

---

## ✅ What's Already Correct

```
✅ NEXTAUTH_URL = https://catchbarrels.app
✅ WHOP_CLIENT_ID = app_WklQSIhlx1uL6d
✅ WHOP_CLIENT_SECRET = apik_JYqng...
✅ Code configuration
✅ Middleware
```

---

## ❌ What's Likely Wrong

```
❌ Redirect URL not registered in Whop
❌ App needs reinstallation in Whop Business
```

---

## 📸 Screenshots Needed (if still failing)

1. Whop Developer Dashboard → OAuth Settings (showing registered URLs)
2. Browser Console (F12) when clicking "Sign in with Whop"
3. Network tab (F12) showing the failed request

---

## 📞 Still Not Working?

Check the full guide: `docs/WO13_WHOP_SSO_FIX_FINAL.md`
