# Whop OAuth Callback Error - Troubleshooting Guide

**Date:** November 28, 2025  
**Error:** `OAuthCallback` error when logging in with Whop  
**Status:** 🔍 Investigating

---

## 🔴 Current Issue

Users attempting to log in with Whop are being redirected to:  
```
https://catchbarrels.app/auth/login?callbackUrl=https%3A%2F%2Fcatchbarrels.app%2Fdashboard&error=OAuthCallback
```

This indicates the OAuth callback processing is failing after Whop redirects back to the app.

---

## ✅ What We've Fixed

### 1. PWA Deprecation Warning
- **Fixed:** Replaced deprecated `apple-mobile-web-app-capable` with `mobile-web-app-capable`
- **File:** `app/layout.tsx`
- **Impact:** Eliminates browser console warning

---

## 🔍 Diagnostic Steps Required

The app has **extensive logging** built into the OAuth flow. To diagnose the exact failure point, we need to check server logs.

### Where to Find Logs

When you attempt a Whop login, the server console will show detailed logs like:

```
[Whop OAuth] ========== TOKEN EXCHANGE START ==========
[Whop OAuth] Callback URL: https://catchbarrels.app/api/auth/callback/whop
[Whop OAuth] Code present: true
[Whop OAuth] Client ID: Present
[Whop OAuth] Client Secret: Present
[Whop OAuth] Token response status: 200
[Whop OAuth] ✅ Token exchange SUCCESS
```

OR

```
[Whop OAuth] ❌ Token exchange FAILED
[Whop OAuth] Status: 403
[Whop OAuth] Error body: {"error":"invalid_client"}
```

---

## 🎯 Most Common Causes

### 1. **Redirect URL Mismatch**

✅ **What Should Be Registered in Whop:**
```
https://catchbarrels.app/api/auth/callback/whop
```

❌ **Common Mistakes:**
- `https://catchbarrels.app/auth/callback/whop` (wrong path)
- `https://catchbarrels.app/api/auth/callback/whop/` (trailing slash)
- `http://` instead of `https://`
- Multiple redirect URLs registered (Whop may get confused)

**Action:** Verify in Whop Developer Dashboard that ONLY the correct URL above is registered.

---

### 2. **Invalid or Expired Authorization Code**

The OAuth code from Whop may have expired or already been used.

**Action:** Try clearing browser cache/cookies and logging in again in an incognito window.

---

### 3. **Whop API Key Permissions**

The `WHOP_CLIENT_SECRET` must have the correct permissions.

**Current Configuration:**
```env
WHOP_CLIENT_ID=app_WklQSIhlx1uL6d
WHOP_CLIENT_SECRET=apik_JYqngRfc3G5TC_A2019140...
WHOP_API_KEY=apik_JYqngRfc3G5TC_A2019140...
WHOP_COMPANY_ID=biz_4f4wiRWwiEZfIF
```

**Note:** For Whop OAuth, `WHOP_CLIENT_SECRET` should equal `WHOP_API_KEY`. This is correct.

**Action:** Verify the API key has these permissions in Whop:
- `openid`
- `email`
- `profile`

---

## 🧪 Testing Steps

### Test 1: Incognito Browser Login

1. Open incognito/private browsing window
2. Go to: `https://catchbarrels.app/auth/login`
3. Click "Log in with Whop"
4. Approve on Whop's consent screen
5. **Expected:** Redirect to dashboard
6. **Actual:** Error page shows

### Test 2: Check Server Logs

**Where to check:**
- Vercel Dashboard → CatchBarrels Project → Functions → Logs
- OR: Local development console if running `yarn dev`

**What to look for:**
```
[Whop OAuth] ❌ Token exchange FAILED
```
OR
```
[Whop OAuth] ❌ Userinfo fetch FAILED
```
OR
```
[Whop OAuth] ❌ CRITICAL: Profile missing required "id" field
```

---

## 🔧 Quick Fixes to Try

### Fix 1: Verify Whop Redirect URL

1. Go to: https://dev.whop.com/
2. Navigate to: **Your Apps → CatchBarrels → OAuth Settings**
3. Ensure **ONLY** this URL is listed:
   ```
   https://catchbarrels.app/api/auth/callback/whop
   ```
4. Remove any other redirect URLs
5. Save changes

### Fix 2: Reinstall CatchBarrels App in Whop

This clears Whop's cached OAuth credentials:

1. Go to: https://whop.com/hub/
2. Navigate to: **Settings → Apps**
3. Find "CatchBarrels" and click **Uninstall**
4. Go back to: https://dev.whop.com/
5. Find CatchBarrels app and click **Install to Business**
6. Approve permissions
7. Try logging in again

### Fix 3: Clear Browser State

```bash
# In Chrome DevTools Console:
localStorage.clear();
sessionStorage.clear();
```

Then close and reopen the browser.

---

## 📋 Information Needed for Diagnosis

If the issue persists after trying the above, please provide:

### 1. Screenshot of Whop OAuth Settings
- Show the registered redirect URLs
- Redact any sensitive API keys

### 2. Server Logs
- Copy all `[Whop OAuth]` log entries from the server console
- These will show exactly where the flow is failing

### 3. Browser Network Tab
- Open DevTools → Network tab
- Attempt login
- Filter for requests to `whop.com` and `api.whop.com`
- Screenshot any failed requests (status 4xx or 5xx)

### 4. Confirmation
- [ ] Verified only one redirect URL is registered in Whop
- [ ] Tried incognito browser test
- [ ] Cleared browser cache/cookies
- [ ] Reinstalled CatchBarrels app in Whop business dashboard

---

## ✅ Expected Success Flow

When working correctly, you should see:

```
[Whop OAuth] ========== TOKEN EXCHANGE START ==========
[Whop OAuth] Token response status: 200
[Whop OAuth] ✅ Token exchange SUCCESS
[Whop OAuth] ========== USERINFO FETCH START ==========
[Whop OAuth] Userinfo response status: 200
[Whop OAuth] ✅ Userinfo fetch SUCCESS
[Whop OAuth] ========== PROFILE MAPPING START ==========
[Whop OAuth] ✅ Profile mapped successfully
[NextAuth JWT] ✅ New user created in DB
[NextAuth JWT] ✅ User membership updated
[NextAuth Redirect] Redirecting to: /dashboard
```

---

## 📚 Related Documentation

- `docs/WHOP_SSO_FIX_COMPLETE.md` - Previous OAuth fixes
- `docs/WO12_WHOP_OAUTH_REDIRECT_LOOP_FIX.md` - Redirect loop resolution
- `docs/WO14_WHOP_SSO_LOGIN_LOOP_FIX.md` - Login loop fix
- `docs/WO15_WHOP_OAUTHSIGNIN_DEBUG.md` - OAuth debugging guide
- `docs/WHOP_OAUTH_CALLBACK_DIAGNOSTIC.md` - Detailed diagnostic steps

---

## 🚀 Next Steps

1. **User Action:** Try the Quick Fixes above
2. **User Action:** If still failing, provide server logs and screenshots
3. **DeepAgent:** Once logs are provided, identify exact failure point and implement fix

---

**Status:** Awaiting server logs to pinpoint exact failure point in OAuth callback processing.
