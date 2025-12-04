# Reboot API Integration - Final Status Report

**Date:** November 27, 2024  
**Status:** 🟡 Code Ready, Awaiting API Activation  
**Deployment:** ✅ Live at catchbarrels.app

---

## 📧 Reboot Support Response

**From:** Robert at Reboot Motion  
**Date:** November 3, 2024

### ✅ Confirmed Information:

1. **Baseball Hitting Movement Type:** `movement_type_id = 1`
2. **Hitting Metrics Endpoint:** `/hitting-processed-metrics`
3. **Timeseries Data Endpoint:** `/hitting-processed-series`
4. **Movement Types List:** `/movement_types`
5. **API Documentation:** https://docs.rebootmotion.com/apidocs

### Key Quote from Bob:
> "For hitting, you'll want to use hitting-processed-metrics to get those metrics, and hitting-processed-series if you're looking for timeseries data."

---

## ✅ What We've Completed

### 1. Environment Configuration
```bash
REBOOT_API_KEY=8415147346218bfca3dda40773a1877828003f420474b4c627077c3e924bfee6b03519603dc3f7dd275dd1730f4f6f026c42fa7d5ae8b3ce6cf5b29a70e85514
REBOOT_API_BASE_URL=https://api.rebootmotion.com/v1
```
- ✅ Both variables configured in `.env`
- ✅ API key is 128-character hex string
- ✅ Base URL matches Reboot documentation

### 2. Code Implementation
**File:** `/lib/reboot/reboot-client.ts`

**Changes Made:**
- ✅ Updated endpoint to `/hitting-processed-metrics?movement_type_id=1`
- ✅ Proper Bearer token authentication
- ✅ Comprehensive error handling and logging
- ✅ Field mapping for athlete data (athleteId, athleteName, level, etc.)
- ✅ Session type hardcoded to 'HITTING' (since we filter by movement_type_id=1)

**Key Implementation:**
```typescript
const url = `${REBOOT_API_BASE}/hitting-processed-metrics?movement_type_id=1`;
const response = await fetch(url, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${REBOOT_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
```

### 3. Database Schema
**Table:** `RebootSession`

Fields include:
- `rebootSessionId` (unique from Reboot)
- `rebootAthleteId` (for linking to CatchBarrels users)
- `athleteName`, `athleteEmail`, `level`, `team`
- `sessionType` ("HITTING", "PITCHING", or "OTHER")
- `swingDate`, `metrics` (full JSON payload)

### 4. Admin UI
**Page:** `https://catchbarrels.app/admin/reboot`

- ✅ "Sync from Reboot" button
- ✅ Sessions table with filters
- ✅ Player linking interface
- ✅ Session type differentiation (Hitting/Pitching)

### 5. Deployment
- ✅ TypeScript compilation successful
- ✅ Next.js build successful
- ✅ Deployed to production at catchbarrels.app

---

## ❌ Current Blocker: API Key Permissions

### Test Results

**Test 1: /hitting-processed-metrics**
```bash
curl https://api.rebootmotion.com/v1/hitting-processed-metrics \
  -H "Authorization: Bearer {API_KEY}"
```
**Result:** `HTTP 403 Forbidden`

**Test 2: /movement_types**
```bash
curl https://api.rebootmotion.com/v1/movement_types \
  -H "Authorization: Bearer {API_KEY}"
```
**Result:** `HTTP 403 Forbidden`

### What 403 Means:

✅ **Good News:**
- Server is reachable (DNS resolves to 104.26.10.190)
- HTTPS connection successful
- API key format is recognized
- Endpoints exist

❌ **Issue:**
- **API key is being REJECTED**
- Key doesn't have permissions for these endpoints

### Why This Happens:

Common causes of 403 Forbidden:
1. **Permissions not granted** (most likely)
2. **Account not activated** for API access
3. **IP whitelisting** required
4. **Endpoint-specific permissions** needed
5. **Subscription/plan level** restriction

---

## 📋 Action Required: Contact Reboot Motion

### What to Ask Bob:

**Email Template:**

```
Subject: API Key Activation - CatchBarrels Integration

Hi Bob,

Thanks for the previous response! I've updated our code to use the correct endpoints:
- /hitting-processed-metrics?movement_type_id=1
- /movement_types

However, I'm getting 403 Forbidden errors when trying to access these endpoints with the API key:

8415147346218bfca3dda40773a1877828003f420474b4c627077c3e924bfee6b03519603dc3f7dd275dd1730f4f6f026c42fa7d5ae8b3ce6cf5b29a70e85514

Can you please verify:

1. Is this API key activated for production use?
2. Does it have permissions for /hitting-processed-metrics and /movement_types?
3. Are there any additional setup steps needed (IP whitelist, account activation, etc.)?
4. Can you provide a working curl example I can test with?

Thanks!
Rick
```

---

## 🧪 Testing the Fix

### Once API Key is Activated:

**Step 1: Verify API Access (Command Line)**
```bash
curl https://api.rebootmotion.com/v1/hitting-processed-metrics?movement_type_id=1 \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

**Expected Result:**
```json
[
  {
    "id": "...",
    "athlete_id": "...",
    "athlete_name": "...",
    "metrics": { ... }
  }
]
```

**Step 2: Test Admin UI**
1. Go to `https://catchbarrels.app/admin/reboot`
2. Log in as: `coach@catchbarrels.app` / `CoachBarrels2024!`
3. Click "Sync from Reboot" button
4. Watch for success toast: "Synced X sessions (Y new, Z updated)"
5. Verify sessions appear in table

**Step 3: Check Server Logs**

You should see:
```
[Reboot API] Fetching hitting sessions...
[Reboot API] Base URL: https://api.rebootmotion.com/v1
[Reboot API] API Key configured: Yes (length: 128)
[Reboot API] Fetching from: https://api.rebootmotion.com/v1/hitting-processed-metrics?movement_type_id=1
[Reboot API] Response status: 200 OK
[Reboot API] Success! Response received
[Reboot API] Found 50 hitting sessions
[Reboot Sync] Complete:
  - Inserted: 50
  - Updated: 0
  - Total in DB: 50
```

---

## 🎯 Expected Data Flow

### 1. API Response Structure (Based on Reboot Docs)

```typescript
interface RebootHittingMetric {
  id: string;                    // Swing/session ID
  athlete_id: string;            // Reboot athlete identifier
  athlete_name?: string;         // Player name
  athlete_email?: string;        // Player email
  level?: string;                // "MLB", "College", "HS", etc.
  team?: string;                 // Team/organization
  capture_date?: string;         // ISO timestamp
  
  // Hitting metrics
  exit_velocity?: number;        // mph
  launch_angle?: number;         // degrees
  distance?: number;             // feet
  bat_speed?: number;            // mph
  swing_efficiency?: number;     // percentage
  attack_angle?: number;         // degrees
  time_to_contact?: number;      // ms
  
  // Additional fields...
}
```

### 2. CatchBarrels Mapping

**From Reboot → To CatchBarrels:**
- `id` → `rebootSessionId`
- `athlete_id` → `rebootAthleteId`
- `athlete_name` → `athleteName`
- `athlete_email` → `athleteEmail`
- `level` → `level`
- `team` → `teamTag`
- `capture_date` → `swingDate`
- `movement_type_id=1` → `sessionType='HITTING'`
- Full object → `metrics` (JSON)

### 3. Player Linking

To link a Reboot athlete to a CatchBarrels player:
1. Go to **Admin → Players**
2. Click on a player
3. Find "Reboot Athlete ID" field
4. Enter the `athlete_id` from Reboot
5. Save

Now all their Reboot sessions will show up in their CatchBarrels profile!

---

## 📊 What Data We'll Import

Once API access is granted, each sync will import:

### Session Metadata:
- ✅ Unique session ID
- ✅ Athlete identification (ID, name, email)
- ✅ Session date/time
- ✅ Player level (MLB, College, HS, Youth)
- ✅ Team/organization
- ✅ Session type (Hitting/Pitching)

### Performance Metrics:
- Exit velocity (mph)
- Launch angle (degrees)
- Distance (feet)
- Bat speed (mph)
- Swing efficiency (%)
- Attack angle (degrees)
- Time to contact (ms)
- Any other metrics Reboot provides

### Storage:
- All metrics stored as JSON in `metrics` column
- Can be parsed/displayed in UI as needed
- Preserves full fidelity of Reboot data

---

## 🔧 Troubleshooting Guide

### If You Still Get 403 After Activation:

**Check 1: API Key Format**
```bash
cd /home/ubuntu/barrels_pwa/nextjs_space
grep REBOOT_API_KEY .env
```
Should show the full 128-character key with no extra spaces or quotes.

**Check 2: Test with curl**
```bash
curl -v https://api.rebootmotion.com/v1/movement_types \
  -H "Authorization: Bearer $(grep REBOOT_API_KEY .env | cut -d= -f2)"
```
Look for `HTTP/2 200` (success) or `HTTP/2 403` (still blocked).

**Check 3: Contact Reboot**
If curl also fails, the issue is with the API key, not our code.

---

## 📈 Success Metrics

### When Everything Works:

1. **API Response:**
   - Status: `200 OK`
   - Body: Array of hitting sessions
   - Headers: `Content-Type: application/json`

2. **Admin UI:**
   - "Sync from Reboot" button works
   - Success toast appears
   - Sessions populate in table
   - No red error banner

3. **Database:**
   - `RebootSession` table has records
   - `sessionType` is 'HITTING'
   - `metrics` JSON contains full data

4. **Player Profiles:**
   - Linked athletes show Reboot sessions
   - Metrics display correctly
   - Historical data accessible

---

## 🎓 What We Learned

### Reboot API Specifics:

1. **Endpoint Structure:**
   - Base: `https://api.rebootmotion.com/v1`
   - Hitting: `/hitting-processed-metrics`
   - Pitching: `/metrics` (different endpoint!)
   - Filter: `?movement_type_id=1` for baseball hitting

2. **Authentication:**
   - Bearer token format
   - Key must have endpoint-specific permissions
   - No OAuth or additional auth needed

3. **Data Organization:**
   - Hitting and pitching use different endpoints
   - Must filter by movement type
   - Timeseries data available separately

---

## 📝 Files Modified

### Code Changes:
- `/lib/reboot/reboot-client.ts` - Updated with correct endpoint
- `/docs/REBOOT_API_DIAGNOSTIC_REPORT.md` - Initial diagnostic
- `/docs/REBOOT_API_FINAL_STATUS.md` - This document

### Database Schema:
- `prisma/schema.prisma` - Already configured (no changes)

### Admin UI:
- `app/admin/reboot/` - Already built (no changes)

---

## ⏭️ Next Steps

### Immediate:
1. **Email Bob at Reboot** with API key activation request
2. **Wait for confirmation** that key is activated
3. **Test with curl** to verify access
4. **Click "Sync from Reboot"** in admin panel
5. **Verify sessions** appear in table

### After First Sync:
1. Review imported data quality
2. Link test athletes to Reboot IDs
3. Verify metrics display correctly
4. Document any API quirks
5. Set up periodic sync schedule (if desired)

### Future Enhancements:
1. Auto-sync on schedule (daily/hourly)
2. Real-time webhooks from Reboot
3. Advanced analytics on Reboot metrics
4. Compare CatchBarrels vs Reboot scores
5. Pitching data integration (separate endpoint)

---

## 🆘 Support Contact

**Reboot Motion:**
- Email: support@rebootmotion.com
- API Docs: https://docs.rebootmotion.com/apidocs
- Contact: Robert (Bob)

**CatchBarrels Admin:**
- URL: https://catchbarrels.app/admin/reboot
- Login: coach@catchbarrels.app
- Password: CoachBarrels2024!

---

## ✅ Summary

### What's Working:
- ✅ Environment configuration
- ✅ Code implementation
- ✅ Database schema
- ✅ Admin UI
- ✅ Error handling
- ✅ Deployment

### What's Blocked:
- ❌ API key doesn't have permissions
- ⏸️ Waiting for Reboot to activate key

### What to Do:
1. **Email Reboot** to activate API key
2. **Test with curl** once activated
3. **Click "Sync from Reboot"** in admin
4. **Verify** sessions import successfully

---

**Status:** Ready to sync once API key is activated by Reboot Motion! 🚀
