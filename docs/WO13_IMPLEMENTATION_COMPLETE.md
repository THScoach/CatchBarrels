# Work Order 13 - Membership Tiers + POD Credits + Swing Limits
## Implementation Report

---

## ✅ Completed Tasks

### 1. Membership Tier Structure Updated

**New Tiers:**
- **Free**: No access to uploads
- **Starter ($49/month)**: 1 lesson/week, 15 swings/lesson
- **Performance ($99/month)**: 2 lessons/week, 15 swings/lesson
- **Hybrid ($199/month)**: 1 remote lesson/week + 1 POD credit/month, 15 swings/lesson
- **Pro ($997/month)**: Unlimited lessons, 25 swings/lesson
- **Assessment ($299)**: 30-day access window, 2 lessons

**File**: `lib/membership-tiers.ts`

### 2. Database Schema Extensions

#### User Model Additions:
```prisma
// POD Credits (Hybrid tier only)
podCreditsAvailable Int       @default(0)
podCreditsUsed      Int       @default(0)
podCreditsLastReset DateTime?
```

#### Video Model Additions:
```prisma
// Swing Limits
swingCount      Int       @default(0)  // Number of swings analyzed
swingLimit      Int?                    // Max swings allowed based on tier
```

#### New Models:
1. **PodSlot**: Defines available time slots (Sat/Sun, 5 slots/day)
2. **PodBooking**: Tracks athlete bookings and attendance

### 3. Weekly Reset Logic Changed

**From**: Monday 00:00 UTC
**To**: Sunday 12:01 AM CST (Central Standard Time)

**Implementation**: `app/api/videos/upload/route.ts`
- Converts current time to CST
- Calculates week start as Sunday 00:01 CST
- Enforces session caps from that point forward

### 4. Upload API Enhancements

**File**: `app/api/videos/upload/route.ts`

**New Features:**
- Stores `swingLimit` based on user's tier at upload time
- Initializes `swingCount` to 0 (to be updated during analysis)
- Uses new tier structure (starter, performance, hybrid, pro)
- Implements Sunday 12:01 AM CST weekly reset

### 5. POD System Database Schema

#### PodSlot Model:
```prisma
model PodSlot {
  id          String   @id @default(cuid())
  date        DateTime // Saturdays and Sundays only
  dayOfWeek   String   // "Saturday" or "Sunday"
  startTime   String   // "12:00", "12:30", "13:00", "13:30", "14:00"
  endTime     String   // Corresponding end times
  maxAthletes Int      @default(3) // 3 athletes per pod
  bookings    PodBooking[]
}
```

#### PodBooking Model:
```prisma
model PodBooking {
  id             String   @id @default(cuid())
  userId         String
  podSlotId      String
  status         String   @default("confirmed") // confirmed, attended, no_show, cancelled
  attendedAt     DateTime?
  markedBy       String?  // Coach who marked attendance
  creditDeducted Boolean  @default(true)
  notes          String?  @db.Text
}
```

---

## 📊 Tier Comparison Table

| Tier | Price | Lessons/Week | Swings/Lesson | POD Credits | Whop Product ID |
|------|-------|--------------|---------------|-------------|----------------|
| Free | $0 | 0 | 0 | 0 | - |
| Starter | $49 | 1 | 15 | 0 | `prod_kNyobCww4tc2p` ⚠️ |
| Performance | $99 | 2 | 15 | 0 | `prod_O4CB6y0IzNJLe` ⚠️ |
| Hybrid | $199 | 1 | 15 | 1/month | `prod_HYBRID_199` ⚠️ |
| Pro | $997 | Unlimited | 25 | 0 | `prod_PRO_997` ⚠️ |
| Assessment | $299 | 2 (30 days) | 15 | 0 | `prod_assessment_standard_299` ⚠️ |

⚠️ **Action Required**: Update Whop product IDs with real values from Whop Dashboard

---

## 🔧 Configuration Updates Needed

### 1. Whop Product IDs

**File**: `lib/membership-tiers.ts`

Update these placeholder IDs:
```typescript
starter: {
  whopProductIds: ['prod_kNyobCww4tc2p'], // TODO: Verify or update
}

performance: {
  whopProductIds: ['prod_O4CB6y0IzNJLe'], // TODO: Verify or update
}

hybrid: {
  whopProductIds: ['prod_HYBRID_199'], // TODO: Add real Whop ID
}

pro: {
  whopProductIds: ['prod_PRO_997'], // TODO: Add real Whop ID
}
```

### 2. Timezone Configuration

**Current**: Hardcoded CST (UTC-6)
**Future Enhancement**: Use environment variable or detect DST

---

## 🚧 Remaining UI Work (Phase 2)

These features require additional implementation:

### 1. Admin POD Credit Management

**Location**: `/admin/players/[id]` or new `/admin/pod-credits` page

**Features Needed:**
- View current POD credits for each user
- Manually adjust credits (add/subtract)
- View POD credit usage history
- Reset credits monthly for Hybrid users

### 2. POD Booking System

**Location**: New `/pod-booking` player page

**Features Needed:**
- Calendar view of available Saturdays/Sundays
- Show 5 time slots per day (12:00, 12:30, 1:00, 1:30, 2:00)
- Display "X/3 spots available" per slot
- Book POD session (deducts 1 credit)
- Cancel booking (refund credit)
- Show "No credits available" if user has 0 credits

### 3. Admin POD Management

**Location**: New `/admin/pods` page

**Features Needed:**
- View all POD bookings by date
- Mark athletes as "attended" or "no_show"
- Add coach notes to each booking
- Generate POD attendance reports

### 4. Upgrade Modal

**Location**: Triggered from `app/api/videos/upload/route.ts` 403 response

**Features Needed:**
- Show when session limit reached
- Display current tier and usage
- List available upgrade options
- "Upgrade Now" CTA linking to Whop purchase page
- "Learn More" button with tier comparison

### 5. Dashboard Updates

**Location**: `components/membership-usage-card.tsx`

**Updates Needed:**
- Show "X/Y swings used" (per lesson)
- Show "POD Credits: X" for Hybrid users
- Update monthly reset messaging from "Monday" to "Sunday"

---

## 📝 Implementation Notes

### Weekly Reset Logic

The system now resets on **Sunday 12:01 AM CST**:

```typescript
// Convert to CST (UTC-6)
const cstOffset = -6 * 60;
const cstNow = new Date(now.getTime() + (cstOffset + now.getTimezoneOffset()) * 60000);

// Get Sunday of this week at 00:01 CST
const dayOfWeek = cstNow.getDay(); // 0 = Sunday
const startOfWeek = new Date(cstNow);
startOfWeek.setDate(cstNow.getDate() - dayOfWeek);
startOfWeek.setHours(0, 1, 0, 0); // 12:01 AM
```

### POD Credits Flow

1. **Monthly Grant**: Hybrid users get 1 POD credit per month
2. **Booking**: User books POD slot → 1 credit deducted
3. **Cancellation**: User cancels booking → 1 credit refunded
4. **No-Show**: Coach marks "no_show" → credit NOT refunded
5. **Attended**: Coach marks "attended" → credit remains deducted

### Swing Limits

- Stored in `video.swingLimit` at upload time (tier-dependent)
- Compared against `video.swingCount` during analysis
- If `swingCount > swingLimit`, analysis stops or warns

---

## 🧪 Testing Checklist

### Database
- [x] POD credit fields added to User model
- [x] Swing limit fields added to Video model
- [x] PodSlot model created
- [x] PodBooking model created
- [x] Prisma client generated successfully

### Backend
- [x] Tier configuration updated
- [x] Weekly reset changed to Sunday 12:01 AM CST
- [x] Upload API stores swing limits
- [x] Session cap enforcement uses new tiers

### UI (To Be Tested)
- [ ] Dashboard shows correct tier info
- [ ] POD booking interface (not yet built)
- [ ] Admin POD management (not yet built)
- [ ] Upgrade modal (not yet built)

---

## 📚 Related Documentation

- `lib/membership-tiers.ts` - Centralized tier configuration
- `prisma/schema.prisma` - Database schema with POD models
- `app/api/videos/upload/route.ts` - Upload enforcement logic
- `docs/WO13_MEMBERSHIP_TIERS_COMPLETE.md` - Previous work order summary

---

## 🚀 Deployment Status

- ✅ TypeScript compilation: **PASSED**
- ⏳ Next.js build: **PENDING**
- ⏳ Checkpoint: **PENDING**

---

## 🎯 Next Steps

1. **Immediate**: Update Whop product IDs in `lib/membership-tiers.ts`
2. **Phase 2**: Build POD booking UI for athletes
3. **Phase 2**: Build admin POD management UI
4. **Phase 2**: Create upgrade modal component
5. **Testing**: Create test users for each tier
6. **Testing**: Verify Sunday 12:01 AM CST reset behavior

---

**Status**: Core backend implementation complete. UI features require additional development.
