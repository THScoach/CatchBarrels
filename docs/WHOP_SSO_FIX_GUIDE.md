# 🚨 WHOP SSO INVALID_CLIENT FIX GUIDE

**Error:** `{"error":"invalid_client","error_description":"client authentication failed..."}`

**Root Cause:** Whop OAuth cannot authenticate CatchBarrels app due to credential mismatch or redirect URL issues.

---

## 📋 CURRENT ENVIRONMENT VARIABLES

```env
NEXTAUTH_URL=https://catchbarrels.app
NEXT_PUBLIC_BASE_URL=https://catchbarrels.app
NEXT_PUBLIC_APP_ORIGIN=https://catchbarrels.app

WHOP_CLIENT_ID=app_WklQSIhlx1uL6d
WHOP_CLIENT_SECRET=apik_JYqngRfc3G5TC_A2019140_ce44952c40b5ccff900a73df7fc239400bb6e9af6d0e8b309ce0a791073f36a6
WHOP_API_KEY=apik_JYqngRfc3G5TC_A2019140_ce44952c40b5ccff900a73df7fc239400bb6e9af6d0e8b309ce0a791073f36a6
WHOP_APP_ID=app_WklQSIhlx1uL6d
```

⚠️ **ISSUE DETECTED:** `WHOP_CLIENT_SECRET` appears to be the same as `WHOP_API_KEY`. This is likely incorrect.

---

## ✅ STEP-BY-STEP FIX

### **STEP 1: Verify Whop OAuth Credentials**

1. **Go to Whop Developer Dashboard:**
   - URL: https://dev.whop.com/
   - Navigate to **Your Apps** → **CatchBarrels**

2. **Find OAuth Credentials Section:**
   - Look for "OAuth Settings" or "Credentials"
   - You should see:
     - **Client ID** (starts with `app_`)
     - **Client Secret** (different from API Key, usually starts with `cs_` or similar)

3. **CRITICAL:** The Client Secret is NOT the same as your API Key!
   - API Key (`WHOP_API_KEY`): Used for server-to-server API calls
   - Client Secret (`WHOP_CLIENT_SECRET`): Used for OAuth authentication flow

4. **Copy the CORRECT Client Secret**

---

### **STEP 2: Verify Redirect URLs in Whop**

1. **In Whop Developer Dashboard → OAuth Settings:**
   - Find "Redirect URIs" or "Authorized Redirect URLs"

2. **Ensure ALL of these are registered:**

```
https://catchbarrels.app/api/auth/callback/whop
https://catchbarrels.app/auth/whop-redirect
```

3. **If using Web Application settings:**
   - Set **App URL:** `https://catchbarrels.app`
   - Set **Redirect URL (Post-Login):** `https://catchbarrels.app/auth/whop-redirect`

---

### **STEP 3: Update Environment Variables**

**If you found the Client Secret was wrong:**

1. **Update `.env` file:**

```bash
cd /home/ubuntu/barrels_pwa/nextjs_space
```

2. **Edit `.env`:**

```env
# Replace with ACTUAL Client Secret from Whop Dashboard
WHOP_CLIENT_SECRET=YOUR_REAL_CLIENT_SECRET_HERE
```

3. **Verify it's different from API Key:**

```bash
cat .env | grep WHOP_CLIENT_SECRET
cat .env | grep WHOP_API_KEY
```

They should be DIFFERENT values.

---

### **STEP 4: Redeploy the App**

**Environment variables only take effect after redeployment:**

```bash
cd /home/ubuntu/barrels_pwa/nextjs_space
yarn build
```

**Then use the DeepAgent UI to deploy the app.**

---

### **STEP 5: Reinstall CatchBarrels App in Whop**

**This is CRITICAL because Whop caches client credentials:**

1. **Go to Whop Dashboard (Business Side):**
   - URL: https://dash.whop.com/
   - Navigate to **Apps** or **Integrations**

2. **Find CatchBarrels App:**
   - Click **Uninstall** or **Remove**

3. **Reinstall the App:**
   - Go back to Whop Developer Dashboard
   - Click **Install to Business**
   - Select "The Hitting Skool" business
   - Confirm installation

---

### **STEP 6: Test the Login Flow**

#### **Test 1: Direct Browser Login**

1. **Open in incognito/private window:**
   ```
   https://catchbarrels.app/auth/login
   ```

2. **Click "Sign in with Whop"**

3. **Expected behavior:**
   - Redirects to Whop OAuth page
   - Shows "CatchBarrels wants to access your account"
   - After authorization, redirects back to `https://catchbarrels.app/dashboard`

#### **Test 2: WAP Mobile Login**

1. **Open Whop mobile app**

2. **Navigate to CatchBarrels product**

3. **Click "Open App" or similar**

4. **Expected behavior:**
   - Opens CatchBarrels in WAP
   - Auto-logs you in via Whop SSO
   - Lands on Dashboard

#### **Test 3: Check for Errors**

**If you still see `invalid_client`:**

1. **Check server logs:**
   ```bash
   # Look for Whop OAuth errors
   grep -i "whop" /path/to/logs
   ```

2. **Check browser console:**
   - Open DevTools → Console
   - Look for OAuth-related errors

---

## 🔍 DEBUGGING CHECKLIST

### **If Still Failing:**

- [ ] Client ID matches Whop Dashboard exactly
- [ ] Client Secret is DIFFERENT from API Key
- [ ] Client Secret matches Whop Dashboard exactly
- [ ] All redirect URLs registered in Whop
- [ ] `.env` file updated with correct credentials
- [ ] App redeployed after env changes
- [ ] CatchBarrels app reinstalled in Whop business
- [ ] Tested in incognito browser window
- [ ] Tested in WAP mobile app

---

## 📞 COMMON ISSUES & FIXES

### **Issue: "Redirect URI mismatch"**

**Fix:** Add missing redirect URL to Whop Dashboard:
```
https://catchbarrels.app/api/auth/callback/whop
```

### **Issue: "Client authentication failed"**

**Fix:** Double-check Client Secret is correct and different from API Key.

### **Issue: "Blank page after login"**

**Fix:** Check that `NEXTAUTH_URL` is set correctly:
```env
NEXTAUTH_URL=https://catchbarrels.app
```

### **Issue: "User not found after login"**

**Fix:** This is a different issue. The OAuth flow is working, but user creation/lookup failed. Check database and logs.

---

## 🎯 EXPECTED OAUTH FLOW

### **Correct Flow:**

1. User clicks "Sign in with Whop" on `https://catchbarrels.app/auth/login`
2. Browser redirects to `https://data.whop.com/api/v3/oauth/authorize?...`
3. User authorizes CatchBarrels
4. Whop redirects back to `https://catchbarrels.app/api/auth/callback/whop?code=...`
5. NextAuth exchanges code for access token using Client ID + Client Secret
6. NextAuth fetches user info from Whop
7. NextAuth creates/updates user in CatchBarrels database
8. User is redirected to `https://catchbarrels.app/dashboard`

### **Where It's Failing (Step 5):**

When NextAuth tries to exchange the authorization code for an access token, Whop's OAuth server checks:
- Does the Client ID match?
- Does the Client Secret match?
- Is the redirect URI registered?

If ANY of these fail, Whop returns `invalid_client`.

---

## 🚀 POST-FIX VERIFICATION

### **Success Indicators:**

- ✅ Browser login with Whop works
- ✅ WAP mobile login works
- ✅ User lands on Dashboard after login
- ✅ No `invalid_client` errors in logs
- ✅ User data synced from Whop (membership tier, etc.)

### **Monitor These:**

- Server logs for OAuth errors
- Browser console for redirect issues
- Database for new user creation
- Whop webhook logs (if applicable)

---

## 📁 FILES TO CHECK (Already Correct in Code)

### **✅ Auth Configuration: `lib/auth-options.ts`**

```typescript
{
  id: 'whop',
  name: 'Whop',
  type: 'oauth',
  clientId: process.env.WHOP_CLIENT_ID,  // ✅ Correct
  clientSecret: process.env.WHOP_CLIENT_SECRET,  // ✅ Correct
  wellKnown: 'https://data.whop.com/api/v3/oauth/.well-known/openid-configuration',  // ✅ Correct
  ...
}
```

### **✅ NextAuth URL: `.env`**

```env
NEXTAUTH_URL=https://catchbarrels.app  # ✅ Correct
```

### **✅ Middleware: `middleware.ts`**

- OAuth callback routes are PUBLIC (not blocked)
- `/api/auth/callback/whop` is accessible

---

## 🎓 SUMMARY

### **What's Wrong:**

1. `WHOP_CLIENT_SECRET` is likely incorrect (same as API Key)
2. Redirect URLs may not be registered in Whop
3. App may need reinstallation to clear Whop cache

### **What to Do:**

1. Get CORRECT Client Secret from Whop Developer Dashboard
2. Verify redirect URLs in Whop OAuth Settings
3. Update `.env` with correct Client Secret
4. Redeploy CatchBarrels
5. Reinstall CatchBarrels app in "The Hitting Skool" business
6. Test login in browser and WAP

### **Who Needs to Do This:**

- **Rick (or whoever has Whop Dashboard access):** Steps 1-2, 5
- **DeepAgent (or developer):** Steps 3-4, 6

---

**Status:** Ready for Rick to verify credentials in Whop and provide correct Client Secret.

**Next Step:** Get the REAL Client Secret from Whop Developer Dashboard and update `.env`.
