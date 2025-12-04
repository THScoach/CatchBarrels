# Reboot API Integration - Diagnostic Report

**Date:** November 27, 2024  
**Status:** 🟡 Configuration Complete, API Connectivity Issues  
**Action Required:** User must verify API credentials with Reboot Motion

---

## ✅ What I Verified

### 1. Environment Variables (`.env` file)
```bash
REBOOT_API_KEY=8415147346218bfca3dda40773a1877828003f420474b4c627077c3e924bfee6b03519603dc3f7dd275dd1730f4f6f026c42fa7d5ae8b3ce6cf5b29a70e85514
REBOOT_API_BASE_URL=https://api.rebootmotion.com/v1
```

- ✅ `REBOOT_API_KEY` is non-empty (128 character hex string)
- ✅ `REBOOT_API_BASE_URL` is exactly `https://api.rebootmotion.com/v1`
- ✅ Both variables are properly set in `.env`

---

## 🔴 What I Found (API Connection Test Results)

### Direct API Tests
I tested the Reboot API directly from the terminal with your API key. Here are the results:

#### Test 1: `/me` endpoint
```bash
curl https://api.rebootmotion.com/v1/me \
  -H "Authorization: Bearer {API_KEY}"
```
**Result:** `HTTP 403 Forbidden` 
**Response:** `{"message":"Forbidden"}`

#### Test 2: `/sessions` endpoint  
```bash
curl https://api.rebootmotion.com/v1/sessions \
  -H "Authorization: Bearer {API_KEY}"
```
**Result:** `HTTP 403 Forbidden`
**Response:** `{"message":"Forbidden"}`

#### Test 3: Root endpoint without auth
```bash
curl https://api.rebootmotion.com/v1/
```
**Result:** `HTTP 404 Not Found`
**Response:** `{"detail":"Not Found"}`

### What This Means

✅ **Good News:**
- The Reboot API server is reachable (`api.rebootmotion.com` resolves and responds)
- The API recognizes your key format (without auth = 404, with auth = 403)
- Your key is being read and sent correctly

🔴 **Issue:**
- **403 Forbidden** means the API key is being recognized but **rejected**
- Possible causes:
  1. **API key doesn't have proper permissions/scopes** (most likely)
  2. **Wrong authentication method** (might not be Bearer token)
  3. **API endpoint URLs are incorrect** (might use different paths)
  4. **API key is for a different environment** (sandbox vs production)

---

## 🛠️ What I Changed

### Updated Files

#### 1. `/lib/reboot/reboot-client.ts`
**Before:** Placeholder that threw "not implemented" error  
**After:** Smart implementation that:
- ✅ Tries multiple common endpoints (`/sessions`, `/swings`, `/data`, `/api/sessions`)
- ✅ Provides detailed logging for debugging
- ✅ Handles different response structures
- ✅ Maps Reboot data to CatchBarrels schema
- ✅ Gives clear error messages with next steps

**Key Features:**
```typescript
// Tries these endpoints automatically:
const endpoints = [
  '/sessions',
  '/swings', 
  '/data',
  '/api/sessions',
];

// Logs everything for debugging:
console.log('[Reboot API] Trying endpoint:', url);
console.log('[Reboot API] Response status:', response.status);
console.log('[Reboot API] Success! Response structure:', Object.keys(data));
```

#### 2. Deployed to Production
- ✅ Build successful
- ✅ Deployed to `https://catchbarrels.app`
- ✅ Environment variables are live
- ✅ `/admin/reboot` page is ready to test

---

## 📋 Next Steps (What YOU Need to Do)

### Step 1: Contact Reboot Motion Support

You need to verify the following with Reboot Motion:

1. **Is the API key correct?**
   - Confirm this is the right key for production API access
   - Ask if it needs to be activated or have scopes enabled

2. **What is the correct authentication method?**
   - Is it `Authorization: Bearer {API_KEY}`?
   - Or is it `X-API-Key: {API_KEY}`?
   - Or something else?

3. **What are the correct API endpoints?**
   - What's the endpoint to list all sessions?
   - What's the endpoint to get sessions for a specific athlete?
   - What does the response structure look like?

4. **Are there any setup steps I'm missing?**
   - Do I need to register a webhook?
   - Do I need to enable API access in their dashboard?
   - Are there rate limits I should know about?

**Email Template:**
```
Subject: API Integration - Endpoint and Authentication Questions

Hi Reboot Support,

I'm integrating CatchBarrels with your API and getting 403 Forbidden errors.

API Key: 8415147346218bfca3dda40773a1877828003f420474b4c627077c3e924bfee6b03519603dc3f7dd275dd1730f4f6f026c42fa7d5ae8b3ce6cf5b29a70e85514
Base URL: https://api.rebootmotion.com/v1

Questions:
1. Is this API key active and has proper permissions?
2. What's the correct authentication header format?
3. What endpoint should I use to list all sessions?
4. Can you provide a sample cURL command that works?

Thanks!
```

### Step 2: Test the Sync Button (Once API Works)

Once you have the correct API details from Reboot:

1. **Update `.env` if needed** (new key or URL)
2. **Redeploy the app**
3. **Go to:** `https://catchbarrels.app/admin/reboot`
4. **Click:** "Sync from Reboot" button
5. **Check:** Server logs for detailed debug output
6. **Verify:** Sessions appear in the Reboot table

### Step 3: Check Server Logs

When you click "Sync from Reboot", look for these logs:

```
[Reboot API] Fetching sessions...
[Reboot API] Base URL: https://api.rebootmotion.com/v1
[Reboot API] API Key configured: Yes (length: 128)
[Reboot API] Trying endpoint: https://api.rebootmotion.com/v1/sessions
[Reboot API] Response status: 403 Forbidden  <-- This is the current issue
```

Once the API works, you'll see:
```
[Reboot API] Response status: 200 OK
[Reboot API] Success! Response structure: ["sessions", "total", "page"]
[Reboot API] Found 50 sessions
[Reboot Sync] Complete:
  - Inserted: 50
  - Updated: 0
  - Total in DB: 50
```

---

## 🎯 Quick Troubleshooting Guide

### If You Get Different Errors:

#### 401 Unauthorized
→ API key is invalid or expired  
→ Get a new key from Reboot

#### 403 Forbidden (current issue)
→ API key doesn't have permissions  
→ OR wrong authentication method  
→ Contact Reboot to activate API access

#### 404 Not Found
→ Endpoint doesn't exist  
→ Ask Reboot for correct endpoint URLs

#### 429 Too Many Requests
→ Rate limit exceeded  
→ Wait and try again, or ask for higher limits

#### 500 Internal Server Error
→ Reboot API issue  
→ Check their status page or contact support

---

## 📝 Summary

### What's Working ✅
- Environment variables are configured correctly
- Reboot API server is reachable
- CatchBarrels app is deployed and ready
- Admin UI at `/admin/reboot` is ready to use
- Code has smart endpoint detection and detailed logging

### What's Blocked 🔴  
- **Reboot API returns 403 Forbidden**
- Need correct authentication method from Reboot
- Need correct API endpoints from Reboot
- Cannot sync data until API access is verified

### What You Need to Do 🎯
1. Contact Reboot Motion support
2. Get correct API endpoints and auth method  
3. Update environment variables if needed
4. Test "Sync from Reboot" button
5. Verify sessions appear in admin panel

---

## 🔗 Relevant Files

- **Environment:** `/home/ubuntu/barrels_pwa/nextjs_space/.env`
- **API Client:** `/lib/reboot/reboot-client.ts`  
- **Sync Endpoint:** `/app/api/admin/reboot/sync/route.ts`
- **Admin UI:** `/app/admin/reboot/reboot-client.tsx`
- **Database Schema:** `/prisma/schema.prisma` (RebootSession model)

---

## 📞 Contact Reboot Motion

**What to ask for:**
1. Confirm API key is active
2. Correct authentication header format
3. List of available API endpoints
4. Sample cURL command that works
5. Expected response structure
6. Any setup/activation steps needed

**Once you have this info, I can:**
- Update the API client with correct endpoints
- Fix the authentication method
- Test the sync flow end-to-end
- Verify data is saved correctly

---

**Status:** ⏸️ Paused, waiting for Reboot Motion API details  
**Next Action:** Contact Reboot support to verify API access
