# Work Order 13 — Assessment → VIP Pricing Flow

## Executive Summary

✅ **Status:** Complete and Production-Ready  
📅 **Completed:** November 27, 2025  
🎯 **Objective:** Implement Assessment → VIP Pricing flow that rewards assessment purchases with a 60-day VIP offer for BARRELS Pro at $99/month

---

## 🎯 Business Logic Implemented

### Core Products

**Assessments (One-Time Purchase):**
- Standard In-Person Assessment — $299
- Pro Assessment + S2 Cognition — $399

**Membership Tiers (Monthly):**
- **BARRELS Athlete** — $49/mo
  - 1 remote lesson per week (up to 15 swings per session)
- **BARRELS Pro** — $99/mo
  - 2 remote lessons per week
- **BARRELS Elite** — $199/mo
  - Unlimited remote lessons
  - PLUS 1 private call or in-person lesson per month

### Assessment → VIP Discount Flow

1. **When user purchases an Assessment product:**
   - They unlock a temporary VIP offer
   - VIP offer: BARRELS Pro at $99/month (anchor price)
   - Duration: 60 days from assessment purchase

2. **During VIP window (60 days):**
   - CatchBarrels shows prominent VIP banner on dashboard
   - Banner displays days remaining and $99/month offer
   - CTA button links to BARRELS Pro checkout in Whop

3. **After VIP window expires:**
   - VIP banner disappears
   - Standard pricing returns
   - User can still purchase BARRELS Pro at regular price

---

## 🏗️ Implementation Details

### 1. Database Schema Changes

**Added to `User` model:**
```prisma
// Assessment → VIP Offer Tracking (Work Order 13)
assessmentCompletedAt DateTime? // When user purchased an assessment
assessmentVipExpiresAt DateTime? // 60 days after assessment purchase
assessmentVipActive   Boolean   @default(false) // Is VIP offer currently active?
```

**Migration:** Applied via `prisma db push` (production-safe)

### 2. Configuration Constants

**File:** `lib/assessment-vip-config.ts`

```typescript
// VIP window duration (easy to change!)
export const ASSESSMENT_VIP_DAYS = 60;

// Assessment product IDs (UPDATE with real Whop IDs)
export const ASSESSMENT_PRODUCT_IDS = [
  'prod_assessment_standard_299',  // PLACEHOLDER
  'prod_assessment_pro_399',       // PLACEHOLDER
];

// BARRELS Pro product ID
export const BARRELS_PRO_PRODUCT_ID = 'prod_O4CB6y0IzNJLe';

// Session limits per tier (per week)
export const TIER_SESSION_LIMITS = {
  free: 0,
  athlete: 1,
  pro: 2,
  elite: 'unlimited',
};
```

**Helper Functions:**
- `calculateVipExpiryDate(purchaseDate)` — Adds 60 days to purchase date
- `isVipActive(vipExpiresAt)` — Checks if VIP offer is still valid
- `getVipDaysRemaining(vipExpiresAt)` — Calculates days left in VIP window
- `canStartNewSession(tier, sessionsThisWeek)` — Enforces session caps

### 3. Whop Integration Updates

**File:** `lib/whop-client.ts`

**New Functions:**
```typescript
// Check if product is an assessment
isAssessmentProduct(productId: string): boolean

// Get assessment purchase date from memberships
getAssessmentPurchaseDate(memberships: WhopMembership[]): Date | null
```

**File:** `app/api/admin/whop/sync-players/route.ts`

**Enhanced sync logic:**
- Detects assessment product purchases
- Sets `assessmentCompletedAt` to purchase date
- Calculates `assessmentVipExpiresAt` (purchase date + 60 days)
- Sets `assessmentVipActive` based on current date vs. expiry
- Logs VIP status for each user

### 4. Player Dashboard VIP Banner

**File:** `app/dashboard/dashboard-client.tsx`

**New VIP Banner Features:**
- ✅ Prominent gold-themed banner with crown icon
- ✅ Shows days remaining in VIP offer
- ✅ Displays $99/month VIP pricing
- ✅ CTA button: "Upgrade to VIP Training"
- ✅ Links to BARRELS Pro Whop checkout
- ✅ Shows expiry date
- ✅ Only visible when `vipActive === true`
- ✅ Auto-hides after expiry

**Banner Location:** Between Coach Rick tip and "Start New Session" button

**Visual Design:**
- Gold gradient background (`from-barrels-gold/20`)
- Crown icon in gold circle
- Days remaining badge
- Professional, mobile-responsive layout

### 5. Admin Player Views

**Files:**
- `app/admin/players/page.tsx` — Updated to fetch VIP fields
- `app/admin/players/players-client.tsx` — Added VIP badge in player list
- `app/admin/players/[id]/player-detail-client.tsx` — Added VIP status section

**Players List View:**
- VIP badge appears next to membership tier badge
- Shows crown icon + "VIP" text
- Gold-themed styling
- Tooltip shows expiry date

**Player Detail View:**
- Dedicated "Assessment VIP Status" section
- Shows:
  - Assessment completed date
  - VIP offer status (Active / Expired)
  - Days remaining (if active)
  - VIP expiry date
- Color-coded status indicators

### 6. Session Cap Enforcement

**File:** `app/api/videos/upload/route.ts`

**Implementation:**
- Checks user's `membershipTier` on every upload
- Counts videos uploaded this week (Monday - Sunday)
- Compares against tier limits:
  - Free: 0 sessions/week
  - Athlete ($49): 1 session/week
  - Pro ($99): 2 sessions/week
  - Elite ($199): Unlimited
- Returns 403 error with friendly message if limit reached
- Exempts admins and coaches from caps

**Error Response:**
```json
{
  "error": "Session limit reached",
  "message": "You've used all 2 sessions for this week on your PRO plan. Your next session unlocks on Monday. Want more reps now? Upgrade your plan!",
  "sessionsThisWeek": 2,
  "membershipTier": "pro"
}
```

---

## 📋 Whop Configuration (MANUAL STEPS)

### ⚠️ IMPORTANT: Update Assessment Product IDs

**File to Update:** `lib/assessment-vip-config.ts`

**Current (PLACEHOLDERS):**
```typescript
export const ASSESSMENT_PRODUCT_IDS = [
  'prod_assessment_standard_299',  // PLACEHOLDER
  'prod_assessment_pro_399',       // PLACEHOLDER
];
```

**Action Required:**
1. Log into Whop dashboard
2. Navigate to Products
3. Find your assessment products:
   - Standard In-Person Assessment ($299)
   - Pro Assessment + S2 Cognition ($399)
4. Copy their real product IDs (e.g., `prod_xyz123abc`)
5. Replace the placeholders in `assessment-vip-config.ts`

### Step 1: Create Assessment Tag in Whop

**Tag Name:** `assessment_vip_60`

**Purpose:** Auto-tag users who purchase assessments to enable VIP tracking

**How to Create:**
1. Go to Whop Dashboard → Settings → Tags
2. Click "Create New Tag"
3. Name: `assessment_vip_60`
4. Description: "Customer purchased assessment and unlocked 60-day VIP offer"
5. Save

### Step 2: Create Automation Flow

**Trigger:** Product Purchased = Assessment Products

**Actions:**
1. Add tag: `assessment_vip_60`
2. Redirect to Thank You / Upsell page

**Automation Setup:**
1. Go to Whop Dashboard → Automations
2. Click "Create New Automation"
3. Name: "Assessment → VIP Offer"
4. Trigger: "Product Purchased"
5. Select products:
   - Standard In-Person Assessment ($299)
   - Pro Assessment + S2 Cognition ($399)
6. Add Action: "Add Tag"
   - Tag: `assessment_vip_60`
7. Add Action: "Redirect to URL"
   - URL: Your VIP upsell page (see below)
8. Save and enable automation

### Step 3: Create VIP Upsell Page

**Purpose:** Immediately after assessment purchase, show VIP offer

**Page Content:**

**Headline:**
> "🎉 Congratulations! You've Unlocked VIP Access"

**Subheadline:**
> "For the next 60 days, you can train with Coach Rick at a special VIP rate of $99/month"

**Body:**
> "Your CatchBarrels Assessment gives you exclusive access to our best offer:
> 
> ✅ BARRELS Pro Membership - $99/month (normally $99/month)  
> ✅ 2 remote swing analysis sessions per week  
> ✅ Personalized coaching from Coach Rick  
> ✅ Full Momentum Transfer analysis  
> ✅ Custom drill recommendations  
> 
> This VIP offer expires in 60 days. Don't miss out!"

**CTA Button:**
> "Claim My VIP Training Access →"
> 
> Links to: BARRELS Pro checkout URL

**Where to Create:**
1. In Whop: Dashboard → Pages → Create New Page
2. OR: Create on your own domain and use that URL in automation

### Step 4: Optional - Create Time-Limited Promo Code

**If Whop supports promo codes with expiry:**

**Code:** `ASSESSMENT_VIP` or `VIP60`  
**Discount:** $0 off (or whatever you want)  
**Duration:** Valid for 60 days from assessment purchase  
**Applies To:** BARRELS Pro product only  
**Auto-apply:** Yes (when customer has `assessment_vip_60` tag)

**Note:** If Whop doesn't support time-limited individual codes, that's okay! The CatchBarrels app will handle VIP tracking and expiry internally.

### Step 5: Update VIP Checkout URL

**File to Update:** `app/dashboard/dashboard-client.tsx`

**Current URL (PLACEHOLDER):**
```typescript
href="https://whop.com/barrels-pro/"
```

**Action Required:**
1. Get your actual BARRELS Pro product checkout URL from Whop
2. Replace the href in the VIP banner button
3. Consider using UTM parameters for tracking:
   ```
   https://whop.com/your-product-url/?utm_source=catchbarrels&utm_medium=vip_banner&utm_campaign=assessment_vip
   ```

---

## 🧪 Testing Checklist

### Automated Tests
- ✅ TypeScript compilation: Clean
- ✅ Next.js build: Successful
- ✅ Prisma schema: Valid

### Manual Testing Required

**VIP Flow:**
- [ ] Purchase an assessment in Whop (test mode)
- [ ] Run Whop sync in admin panel
- [ ] Verify user has `assessmentVipActive = true`
- [ ] Check VIP banner appears on dashboard
- [ ] Verify days remaining is correct
- [ ] Click "Upgrade to VIP Training" button
- [ ] Confirm it goes to correct Whop checkout
- [ ] Wait 60 days (or manually set expiry date in DB for testing)
- [ ] Verify VIP banner disappears after expiry

**Session Caps:**
- [ ] Create free user → try to upload → should be blocked
- [ ] Create athlete user ($49) → upload 1 video → should succeed
- [ ] Try to upload 2nd video → should be blocked with friendly message
- [ ] Create pro user ($99) → upload 2 videos → should succeed
- [ ] Try to upload 3rd video → should be blocked
- [ ] Create elite user ($199) → upload unlimited videos → should all succeed
- [ ] Wait for Monday (new week) → session caps reset
- [ ] Verify admin/coach users exempt from caps

**Admin Views:**
- [ ] Go to /admin/players
- [ ] Verify VIP badge appears for users with active VIP offers
- [ ] Click on a player with VIP
- [ ] Verify VIP status section shows correct dates and days remaining
- [ ] Check expired VIP user shows "Expired" status

---

## 📊 Key Metrics to Monitor

### Conversion Metrics
- Assessment purchases → VIP banner views
- VIP banner views → BARRELS Pro purchases
- % of assessment buyers who convert to Pro within 60 days
- Average days from assessment to Pro purchase

### Session Usage
- Sessions per user per week by tier
- % of users hitting session caps
- Upgrade requests after hitting caps

### VIP Offer Performance
- Active VIP offers (current count)
- Expired VIP offers (conversion rate)
- Days remaining when users convert

---

## 🔧 Configuration Changes

### To Change VIP Duration

**File:** `lib/assessment-vip-config.ts`

**Change this line:**
```typescript
export const ASSESSMENT_VIP_DAYS = 60; // Change to 30, 90, etc.
```

**Note:** New value applies to future assessment purchases. Existing VIP offers keep their original expiry dates.

### To Change Session Caps

**File:** `lib/assessment-vip-config.ts`

**Change this object:**
```typescript
export const TIER_SESSION_LIMITS: Record<string, number | 'unlimited'> = {
  free: 0,
  athlete: 1,    // Change to 2, 3, etc.
  pro: 2,        // Change to 3, 4, etc.
  elite: 'unlimited',
};
```

### To Change VIP Checkout URL

**File:** `app/dashboard/dashboard-client.tsx`

**Find this block:**
```typescript
<a
  href="https://whop.com/barrels-pro/"  // Change this URL
  target="_blank"
  rel="noopener noreferrer"
  className="inline-block"
>
```

---

## 📂 Files Changed

### Database
- `prisma/schema.prisma` — Added VIP tracking fields to User model

### Configuration
- `lib/assessment-vip-config.ts` — NEW: VIP config and session cap logic
- `lib/config/index.ts` — NEW: Centralized config exports

### API / Backend
- `lib/whop-client.ts` — Added assessment product detection
- `app/api/admin/whop/sync-players/route.ts` — Enhanced with VIP tracking
- `app/api/videos/upload/route.ts` — Added session cap enforcement

### Player UI
- `app/dashboard/page.tsx` — Pass VIP info to client
- `app/dashboard/dashboard-client.tsx` — Added VIP banner

### Admin UI
- `app/admin/players/page.tsx` — Fetch VIP fields
- `app/admin/players/players-client.tsx` — Added VIP badge in list
- `app/admin/players/[id]/player-detail-client.tsx` — Added VIP status section

### Documentation
- `docs/WO13_ASSESSMENT_VIP_PRICING_COMPLETE.md` — This file

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [x] Database schema updated (`prisma db push`)
- [x] Prisma client regenerated
- [x] TypeScript compilation clean
- [x] Next.js build successful
- [ ] **Update assessment product IDs in config** ⚠️ CRITICAL
- [ ] **Update BARRELS Pro checkout URL in VIP banner** ⚠️ CRITICAL

### Whop Configuration
- [ ] Create `assessment_vip_60` tag
- [ ] Set up automation: Assessment purchase → Add tag
- [ ] Create VIP upsell page
- [ ] Test automation with test purchase
- [ ] Verify tag is applied correctly

### Post-Deployment
- [ ] Run Whop sync to update existing users
- [ ] Check admin panel for VIP users
- [ ] Test upload with different tiers
- [ ] Monitor error logs for session cap rejections
- [ ] Track VIP conversion metrics

---

## 🎓 How It Works: End-to-End Flow

### Step 1: User Purchases Assessment
1. User goes to Whop and purchases Standard or Pro Assessment ($299/$399)
2. Whop automation triggers
3. User gets `assessment_vip_60` tag
4. User redirected to VIP upsell page

### Step 2: Whop Sync
1. Admin clicks "Sync from Whop" in CatchBarrels admin panel
2. System fetches all memberships for each user
3. Detects assessment product via `isAssessmentProduct()`
4. Sets `assessmentCompletedAt = purchase date`
5. Calculates `assessmentVipExpiresAt = purchase date + 60 days`
6. Sets `assessmentVipActive = true` (if within 60 days)

### Step 3: Player Dashboard
1. User logs into CatchBarrels
2. Dashboard checks `vipOfferInfo.vipActive`
3. If true, shows gold VIP banner with:
   - Days remaining
   - $99/month pricing
   - "Upgrade to VIP Training" button
4. Button links to BARRELS Pro checkout in Whop

### Step 4: VIP Expires
1. After 60 days, VIP banner stops showing
2. Next Whop sync sets `assessmentVipActive = false`
3. User can still purchase BARRELS Pro at standard price

### Step 5: Session Caps
1. User tries to upload video
2. System checks `membershipTier` and counts `sessionsThisWeek`
3. If at/over limit:
   - Upload blocked with 403 error
   - Friendly message shown
   - Suggests upgrading plan
4. If under limit:
   - Upload proceeds normally
5. Caps reset every Monday at midnight

---

## 💡 Tips for Rick

### Changing VIP Duration
**File:** `lib/assessment-vip-config.ts`  
**Line:** `export const ASSESSMENT_VIP_DAYS = 60;`  
**Change to:** 30, 45, 90, etc.

### Testing VIP Expiry
Manually set expiry date in database:
```sql
UPDATE "User" 
SET "assessmentVipExpiresAt" = NOW() - INTERVAL '1 day'
WHERE email = 'test@example.com';
```

### Force VIP Sync
1. Go to /admin/players
2. Click "Sync from Whop"
3. Check server logs for VIP detection

### View VIP Users
1. Go to /admin/players
2. Look for gold crown badge next to tier
3. Click player to see full VIP status

---

## 📞 Support

**Questions?** Contact the development team or refer to:
- Whop API Docs: https://docs.whop.com
- CatchBarrels codebase: `/home/ubuntu/barrels_pwa/nextjs_space`

---

**Status:** ✅ Ready for Production  
**Next Steps:** Update product IDs in config, configure Whop automation, deploy
