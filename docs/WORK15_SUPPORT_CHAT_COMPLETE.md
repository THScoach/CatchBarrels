# WORK 15 - In-App Support Chat + Screenshot Upload (Beta) ✅

**Date**: November 26, 2024  
**Status**: ✅ Complete & Ready for Deployment  
**Feature**: In-app bug reporting with screenshot upload

---

## 🎯 Objective

Add a simple in-app "Help" feature so athletes can report bugs inside CatchBarrels by:
- Opening a support panel
- Describing what broke
- Uploading a screenshot
- Submitting a support ticket

The system captures enough context for you (Rick) or an AI agent to debug and fix issues later.

---

## ✅ What Was Implemented

### 1️⃣ Database Model

**File**: `prisma/schema.prisma`

**New Model**: `SupportTicket`
```prisma
model SupportTicket {
  id              String   @id @default(cuid())
  userId          String?
  user            User?    @relation("UserSupportTickets", fields: [userId], references: [id], onDelete: SetNull)
  userEmail       String?
  role            String?  // "admin", "coach", "player"
  
  // Ticket details
  whereHappened   String   // "Dashboard", "New Lesson", "History", etc.
  description     String   @db.Text
  screenshotUrl   String?  // S3 key for screenshot
  
  // Context for debugging
  userAgent       String?
  pageUrl         String?
  extraContext    Json?    // Additional debug info (device, browser, etc.)
  
  // Status tracking
  status          String   @default("open") // "open", "in_progress", "resolved"
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@map("support_tickets")
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}
```

**Migration**: Auto-generated and applied ✅

---

### 2️⃣ API Endpoints

#### POST /api/support/tickets

**File**: `app/api/support/tickets/route.ts`

**Purpose**: Submit a new support ticket

**Request**:
```typescript
FormData {
  whereHappened: string (required)
  description: string (required)
  screenshot: File (optional)
  pageUrl: string (auto-captured)
  includeDebug: boolean (default: true)
}
```

**Response**:
```json
{
  "success": true,
  "ticketId": "clXXXXXXXXXX",
  "message": "Support ticket submitted successfully"
}
```

**Features**:
- ✅ Authentication required
- ✅ File type validation (PNG, JPEG, HEIC)
- ✅ File size validation (max 10MB)
- ✅ Screenshot upload to S3
- ✅ Debug context collection
- ✅ Comprehensive error handling
- ✅ Logging for debugging

---

#### GET /api/support/tickets

**File**: `app/api/support/tickets/route.ts`

**Purpose**: Get all support tickets (admin only)

**Response**:
```json
{
  "tickets": [
    {
      "id": "clXXXXXXXXXX",
      "userEmail": "athlete@example.com",
      "role": "player",
      "whereHappened": "Dashboard",
      "description": "Upload button doesn't work",
      "screenshotUrl": "support/1234567890-screenshot.png",
      "screenshotSignedUrl": "https://i.ytimg.com/vi/CLZVk5l0uGc/sddefault.jpg",
      "pageUrl": "https://catchbarrels.app/dashboard",
      "status": "open",
      "createdAt": "2024-11-26T...",
      "user": { ... }
    }
  ]
}
```

**Features**:
- ✅ Admin/coach only access
- ✅ Last 100 tickets
- ✅ Ordered by most recent
- ✅ Includes user details
- ✅ Auto-generates signed URLs for screenshots

---

#### PATCH /api/support/tickets/[id]

**File**: `app/api/support/tickets/[id]/route.ts`

**Purpose**: Update ticket status (admin only)

**Request**:
```json
{
  "status": "open" | "in_progress" | "resolved"
}
```

**Response**:
```json
{
  "success": true,
  "ticket": { ... },
  "message": "Ticket status updated successfully"
}
```

**Features**:
- ✅ Admin/coach only access
- ✅ Status validation
- ✅ Error handling for invalid ticket IDs

---

### 3️⃣ UI Components

#### Support Button

**File**: `components/support-button.tsx`

**Features**:
- ✅ Floating button (bottom-right)
- ✅ BARRELS gold styling
- ✅ "Need help?" text label
- ✅ Opens support panel on click
- ✅ Hover animations

**Design**:
```tsx
<button>
  <MessageCircle className="w-5 h-5" />
  <span>Need help?</span>
</button>
```

**Positioning**: 
- Bottom-right corner
- Above bottom navigation (z-index: 40)
- Fixed position

---

#### Support Panel

**File**: `components/support-panel.tsx`

**Features**:
- ✅ Right-side drawer (Sheet component)
- ✅ Form with validation
- ✅ Screenshot upload with drag-and-drop
- ✅ Debug info toggle
- ✅ Success confirmation
- ✅ Auto-close after submission
- ✅ Loading states
- ✅ Error handling

**Form Fields**:
1. **Where did this happen?** (Dropdown)
   - Dashboard
   - New Lesson
   - History
   - Momentum Transfer Card
   - Video Upload
   - Profile
   - Settings
   - Other

2. **What went wrong?** (Textarea)
   - Required
   - Multi-line
   - Placeholder: "Describe what happened..."

3. **Add screenshot** (File upload)
   - Optional but recommended
   - PNG, JPEG, HEIC
   - Max 10MB
   - Preview after selection

4. **Include debug info** (Toggle)
   - Default: ON
   - Captures device and browser details

**States**:
- Submitting: Shows spinner, disables inputs
- Success: Shows checkmark, displays ticket ID
- Error: Shows toast notification

---

#### Main Layout Integration

**File**: `components/layout/MainLayout.tsx`

**Changes**:
```tsx
import { SupportButton } from "@/components/support-button";

export function MainLayout({ children }: MainLayoutProps) {
  // ...
  return (
    <>
      {!shouldHideHeader && <BarrelsHeader />}
      {children}
      {!shouldHideHeader && <SupportButton />}
    </>
  );
}
```

**Visibility**:
- ✅ Shows on all authenticated pages
- ❌ Hidden on auth pages (/auth/login, /auth/signup, /welcome, /onboarding)

---

### 4️⃣ Admin Support Page

#### Server Component

**File**: `app/admin/support/page.tsx`

**Features**:
- ✅ Admin-only access
- ✅ Page metadata (title, description)
- ✅ Suspense for loading state
- ✅ Clean header with emoji

---

#### Client Component

**File**: `app/admin/support/support-tickets-client.tsx`

**Features**:

**Stats Cards**:
- 🔴 Open tickets count
- 🟡 In Progress tickets count
- 🟢 Resolved tickets count

**Tickets Table**:
| Created | User | Where | Description | Screenshot | Status |
|---------|------|-------|-------------|------------|--------|
| X min ago | name<br/>email | Badge | Text + Page Link | View Button | Dropdown |

**Table Features**:
- ✅ Sortable by date (most recent first)
- ✅ User information (name + email)
- ✅ Location badge
- ✅ Description with line clamp (2 lines)
- ✅ Page URL link (external)
- ✅ Screenshot view button
- ✅ Status dropdown (open, in_progress, resolved)
- ✅ Color-coded status badges
- ✅ Real-time status updates

**Interactions**:
- Click screenshot "View" button → Opens screenshot in new tab
- Change status dropdown → Updates ticket status
- Click page URL → Opens page in new tab

**Empty State**:
- Shows when no tickets exist
- Checkmark icon
- "No support tickets yet" message

---

## 🔒 Security & Access Control

### Authentication
- ✅ All endpoints require authentication
- ✅ 401 Unauthorized for unauthenticated requests

### Authorization
- ✅ **POST /api/support/tickets**: Any authenticated user
- ✅ **GET /api/support/tickets**: Admin/coach only
- ✅ **PATCH /api/support/tickets/[id]**: Admin/coach only
- ✅ **/admin/support page**: Admin/coach only (enforced by middleware)

### Data Privacy
- ✅ Screenshot URLs are signed (expire in 1 hour)
- ✅ S3 keys stored in database, not public URLs
- ✅ User data includes only necessary fields
- ✅ Tickets linked to user via optional relation (prevents cascade deletion issues)

---

## 📊 Data Captured

### Required Fields
- `whereHappened`: Location in app
- `description`: Bug description

### Optional Fields
- `screenshot`: Image file
- `pageUrl`: Current URL
- `userAgent`: Browser/device info
- `extraContext`: Additional debug data

### Auto-Captured
- `userId`: From session
- `userEmail`: From session
- `role`: From session
- `status`: Default "open"
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Debug Context (if enabled)
```json
{
  "browser": "Chrome",
  "platform": "Windows 10",
  "timestamp": "2024-11-26T..."
}
```

---

## 🎨 Design Details

### Colors
- **Primary**: BARRELS gold (`#E8B14E`)
- **Background**: Dark gray (`#1a2332`, `#gray-900`)
- **Text**: White (`#ffffff`)
- **Muted**: Gray (`#gray-400`)

### Status Colors
- **Open**: Red (`bg-red-500/20 text-red-400`)
- **In Progress**: Yellow (`bg-yellow-500/20 text-yellow-400`)
- **Resolved**: Green (`bg-green-500/20 text-green-400`)

### Typography
- Headings: Bold, white
- Body: Regular, gray-300
- Labels: Medium, gray-300
- Descriptions: Small, gray-400

### Spacing
- Button: `bottom-24 right-6` (above bottom nav)
- Panel: Full height drawer
- Form gaps: `space-y-6`
- Table padding: `p-4`

---

## 🧪 Testing Checklist

### Athlete Flow ✅
- [x] Log in as athlete
- [x] See "Need help?" button on dashboard
- [x] Click button → drawer opens
- [x] Select "Where did this happen?" → Dashboard
- [x] Type description → "Upload button doesn't work"
- [x] Upload screenshot → Valid PNG file
- [x] Toggle debug info → ON/OFF
- [x] Click "Send to Coach Rick" → Submits successfully
- [x] See success message with ticket ID
- [x] Drawer auto-closes after 3 seconds

### Admin Flow ✅
- [x] Log in as admin (coach@catchbarrels.app)
- [x] Navigate to `/admin/support`
- [x] See stats cards (Open, In Progress, Resolved)
- [x] See tickets table with athlete's ticket
- [x] See user email and name
- [x] See description and page URL
- [x] Click "View" screenshot button → Opens in new tab
- [x] Change status dropdown → "In Progress" → Updates successfully
- [x] Change status again → "Resolved" → Updates successfully
- [x] Toast notification shows on status change

### Error Handling ✅
- [x] Invalid file type → Shows error toast
- [x] File too large (>10MB) → Shows error toast
- [x] Missing "where" field → Shows validation error
- [x] Missing description → Shows validation error
- [x] Network error → Shows network error toast
- [x] Screenshot upload fails → Shows upload error

### Edge Cases ✅
- [x] No screenshot → Ticket submits successfully
- [x] Debug info OFF → Ticket submits without extra context
- [x] Long description → Text wraps in table, line clamp works
- [x] No page URL → Shows ticket without page link
- [x] Invalid ticket ID → Returns 404 error

---

## 📁 Files Changed

### New Files

1. **Database**
   - `prisma/schema.prisma` (added SupportTicket model)
   - `prisma/migrations/[timestamp]_add_support_tickets/` (auto-generated)

2. **API Routes**
   - `app/api/support/tickets/route.ts` (POST, GET)
   - `app/api/support/tickets/[id]/route.ts` (PATCH)

3. **Components**
   - `components/support-button.tsx` (floating button)
   - `components/support-panel.tsx` (drawer form)

4. **Admin Pages**
   - `app/admin/support/page.tsx` (server component)
   - `app/admin/support/support-tickets-client.tsx` (client component)

5. **Documentation**
   - `docs/WORK15_SUPPORT_CHAT_COMPLETE.md` (this file)

### Modified Files

1. **Layout**
   - `components/layout/MainLayout.tsx` (added SupportButton)

2. **Database**
   - `prisma/schema.prisma` (added supportTickets relation to User model)

---

## 🚀 How to Access

### For Athletes
1. Log in to https://catchbarrels.app
2. Look for gold "Need help?" button in bottom-right corner
3. Click to open support panel
4. Fill out form and submit

### For Admin/Coach
1. Log in as `coach@catchbarrels.app`
2. Navigate to `/admin/support`
3. View all tickets in table
4. Update ticket status as needed
5. Click "View" to see screenshots

---

## 📧 Email Notifications (Optional)

**Status**: Not implemented (documented only)

**How to Add**:

1. **Choose email service**:
   - SendGrid
   - AWS SES
   - Resend
   - Postmark

2. **Add environment variables**:
   ```env
   SUPPORT_EMAIL_ENABLED=true
   SUPPORT_EMAIL_TO=coach@catchbarrels.app
   SUPPORT_EMAIL_FROM=noreply@catchbarrels.app
   EMAIL_API_KEY=your_api_key_here
   ```

3. **Update API route** (`app/api/support/tickets/route.ts`):
   ```typescript
   // After creating ticket
   if (process.env.SUPPORT_EMAIL_ENABLED === 'true') {
     await sendEmail({
       to: process.env.SUPPORT_EMAIL_TO,
       from: process.env.SUPPORT_EMAIL_FROM,
       subject: `New Support Ticket #${ticket.id.slice(0, 8)}`,
       html: `
         <h2>New Bug Report</h2>
         <p><strong>From:</strong> ${ticket.userEmail}</p>
         <p><strong>Where:</strong> ${ticket.whereHappened}</p>
         <p><strong>Description:</strong> ${ticket.description}</p>
         <p><strong>Page:</strong> ${ticket.pageUrl}</p>
         <p><strong>Screenshot:</strong> ${ticket.screenshotUrl ? 'Yes' : 'No'}</p>
         <p><a href="https://catchbarrels.app/admin/support">View All Tickets</a></p>
       `,
     });
   }
   ```

**Benefits**:
- Instant notification when bugs are reported
- Email includes ticket summary
- Link to admin dashboard

**Current Workaround**:
- Check `/admin/support` page regularly
- Stats cards show open ticket count at a glance

---

## 🔧 Configuration

### Environment Variables

**Required** (already configured):
```env
AWS_BUCKET_NAME=abacusai-apps-49d7a751a42c8b2c554254da-us-west-2
AWS_FOLDER_PREFIX=12705/
AWS_REGION=us-west-2
AWS_PROFILE=hosted_storage
```

**Optional** (for email notifications):
```env
SUPPORT_EMAIL_ENABLED=false
SUPPORT_EMAIL_TO=coach@catchbarrels.app
SUPPORT_EMAIL_FROM=noreply@catchbarrels.app
EMAIL_API_KEY=
```

### Feature Flags

None required - feature is always enabled for authenticated users.

---

## 📈 Metrics to Track

### Usage Metrics
- Tickets submitted per day/week
- Average time to resolution
- Most common "whereHappened" locations
- Screenshot attachment rate
- Debug info opt-in rate

### Performance Metrics
- API response times
- Screenshot upload success rate
- S3 signed URL generation time

### User Satisfaction
- Ticket submission success rate
- Admin response time
- Ticket resolution rate

---

## 🐛 Troubleshooting

### Issue: "Need help?" button not showing

**Possible causes**:
- User is on auth page (/auth/login, /auth/signup)
- User is not authenticated

**Solution**:
- Check that user is logged in
- Navigate to authenticated page (e.g., /dashboard)

---

### Issue: Screenshot upload fails

**Possible causes**:
- File too large (>10MB)
- Invalid file type (not PNG/JPEG/HEIC)
- S3 credentials issue

**Solution**:
1. Check file size and type
2. Verify S3 credentials in `.env`
3. Check server logs for S3 errors

---

### Issue: Admin can't see tickets

**Possible causes**:
- User is not admin/coach role
- Database connection issue

**Solution**:
1. Verify user role: `coach@catchbarrels.app` has `role=admin`
2. Check database connection
3. Check server logs for errors

---

### Issue: Screenshot button doesn't open image

**Possible causes**:
- Signed URL expired (1 hour expiry)
- S3 key incorrect

**Solution**:
1. Refresh the admin page to regenerate signed URLs
2. Check S3 key in database matches actual file
3. Verify S3 bucket permissions

---

## 🔮 Future Enhancements

### Phase 2 Features
- [ ] Email notifications (SendGrid/SES)
- [ ] Slack webhook integration
- [ ] Coach Rick AI auto-responder
- [ ] Ticket search and filtering
- [ ] Ticket comments/notes
- [ ] Auto-categorization (AI-powered)
- [ ] Video recording instead of screenshot
- [ ] Browser console error capture
- [ ] Session replay integration

### Phase 3 Features
- [ ] Athlete ticket history
- [ ] Ticket analytics dashboard
- [ ] SLA tracking
- [ ] Custom ticket fields
- [ ] Multi-language support
- [ ] Mobile app integration

---

## 📋 Summary

### What Was Built
- ✅ Database model for support tickets
- ✅ API endpoints (POST, GET, PATCH)
- ✅ Floating "Need help?" button
- ✅ Support panel with form
- ✅ Screenshot upload to S3
- ✅ Admin support tickets page
- ✅ Status management
- ✅ Signed URL generation for screenshots

### Key Features
- 🎯 Simple, intuitive UI
- 📸 Screenshot upload
- 🔧 Debug context collection
- 👤 User identification
- 📊 Admin dashboard
- ✅ Status tracking
- 🔒 Secure access control

### Impact
- **Before**: No way for athletes to report bugs
- **After**: Athletes can easily report bugs with screenshots

### Production Ready
- ✅ TypeScript compilation: No errors
- ✅ Build: Successful
- ✅ Testing: All flows verified
- ✅ Documentation: Complete
- ✅ Security: Proper access control
- ✅ Performance: Optimized

---

## 🎉 Success!

The in-app support chat system is **complete** and **ready for deployment**!

Athletes can now easily report bugs with screenshots, and you (Coach Rick) can manage all tickets from the admin dashboard at `/admin/support`.

**Next Steps**:
1. Deploy to production ✅
2. Monitor for new tickets 📊
3. (Optional) Set up email notifications 📧
4. (Future) Add Coach Rick AI auto-responder 🤖

---

**Status**: 🎊 **WORK 15 COMPLETE**
