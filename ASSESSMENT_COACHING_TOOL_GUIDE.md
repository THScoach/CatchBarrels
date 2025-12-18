# Assessment Coaching Tool - Implementation Guide

## Overview
The Assessment system has been expanded from an enforcement gate into a practical coaching tool, optimized for Coach Rick's between-pod workflow. The system now supports Reboot Motion data as the highest authority and provides comprehensive history tracking.

## Key Features Implemented

### 1. ✅ Enhanced Admin Assessment Workflow
**Goal:** Make assessment management fast enough for between-pod updates

**Features:**
- **Streamlined 2-column layout** - Main form (left), Sidebar tools (right)
- **Quick-access grid** for core fields:
  - Swing Identity + Confidence Level (row 1)
  - Training Lane + Status (row 2)
- **Keyboard-optimized** form fields for rapid data entry
- **Visual indicators** for locked identity status
- **Change notes** field for documenting context on updates

**Usage:**
```
/admin/player-assessments/[id] → Enhanced edit UI
```

### 2. ✅ Reboot Motion-Driven Assessments
**Goal:** Support Reboot Motion data as highest authority

**Features:**
- **File upload** for Reboot Motion files (.csv, .json, .pdf)
- **Reboot confidence score** field (0-100)
- **Gold Standard badge** displayed prominently
- **Auto-lock identity** when marked as `reboot_verified`
- **Admin unlock capability** (with explicit unlock action)
- **Data authority enforcement**: Reboot > Coach > Automated

**Database Changes:**
```sql
-- New field in player_assessments table
rebootDerivedIdentityConfidence DOUBLE PRECISION

-- Reboot files stored as JSON array in existing field
rebootMotionFiles JSONB
```

**API Endpoints:**
```typescript
// Upload Reboot files
POST /api/player-assessment/{id}/upload-reboot
Body: FormData with files[] and rebootDerivedConfidence

// Update with history tracking
PATCH /api/player-assessment/{id}
Body: UpdatePlayerAssessmentInput
```

**Data Authority Rules:**
1. If `identityLocked = true` → Cannot change `swingIdentity` unless explicitly unlocking
2. Setting `status = 'reboot_verified'` → Auto-locks identity
3. Lower authority data **cannot** overwrite higher authority data

### 3. ✅ Assessment History Tracking
**Goal:** Give Coach Rick context on how assessments evolve

**Features:**
- **Change tracking** for all key fields:
  - Swing Identity changes
  - Confidence level updates
  - Status transitions
  - Constraints modifications
  - Training lane changes
  - System statement updates
  - Identity lock/unlock events
  - Reboot file uploads
- **Timeline view** in admin UI (collapsible)
- **Coach notes** per change
- **Before/after values** stored as JSON
- **Changed by** user tracking

**Database Schema:**
```prisma
model AssessmentHistory {
  id              String   @id @default(uuid())
  assessmentId    String
  assessment      PlayerAssessment @relation(...)
  changedBy       String
  changedByUser   User @relation(...)
  changeType      String   // "swing_identity_updated", "reboot_verified", etc.
  previousValues  Json?
  newValues       Json?
  notes           String?  @db.Text
  createdAt       DateTime @default(now())
  
  @@index([assessmentId, createdAt])
  @@map("assessment_history")
}
```

**Change Types:**
- `created` - Initial assessment creation
- `swing_identity_updated` - Identity changed
- `confidence_updated` - Confidence level changed
- `status_updated` - Status workflow change
- `constraints_updated` - Constraints modified
- `training_lane_updated` - Lane assignment changed
- `system_statement_updated` - Coach statement modified
- `reboot_verified` - Marked as Reboot verified
- `reboot_files_uploaded` - Reboot files added
- `identity_locked` - Identity locked
- `identity_unlocked` - Identity unlocked

### 4. ✅ Enhanced Athlete View
**Goal:** Clear, prominent, coach-friendly assessment display

**Features:**
- **Gold Standard banner** for Reboot-verified assessments
  - Animated gradient header with star icons
  - Shows Reboot confidence score
- **Prominent swing identity** display (large, bold text)
- **Lock indicator** when identity is locked
- **Coach statement** in dedicated section with blue accent
- **Constraints section** with red warning accent
- **Status badges** (Coach Verified, Reboot Verified, Automated)
- **Coach-clear language** throughout

**Visual Hierarchy:**
1. Gold Standard banner (if applicable)
2. Swing Identity (largest, most prominent)
3. Training Lane
4. Coach System Statement
5. Constraints (What NOT to Chase)
6. Bottom summary

**Component:**
```tsx
<YourSystemToday assessment={playerAssessment} />
```

## Usage Workflows

### Workflow A: Quick Between-Pod Update
1. Navigate to `/admin/player-assessments`
2. Click player name to edit
3. Update core fields in top grid (Identity, Confidence, Lane, Status)
4. Add constraints or coach statement as needed
5. Optionally add change note
6. Click "Save Changes"
7. History entry auto-created

**Time Target:** < 30 seconds

### Workflow B: Reboot Motion Upload
1. Open assessment edit page
2. Upload Reboot files in right sidebar
3. Enter Reboot-derived confidence score (0-100)
4. Click "Upload Reboot Files"
5. Set status to "Reboot Verified" in main form
6. Identity auto-locks, Gold Standard badge appears
7. Save changes

### Workflow C: View Assessment History
1. Open assessment edit page
2. Click "Show History" button (top right)
3. View timeline of all changes
4. See who made changes and when
5. Read coach notes for context

### Workflow D: Unlock Locked Identity
1. Open assessment edit page
2. Toggle "Lock Swing Identity" switch to OFF
3. Identity field becomes editable
4. Make changes as needed
5. Re-lock if desired
6. Save changes

## Data Authority Hierarchy

```
Reboot Motion (reboot_verified)
    ↓ (highest authority)
Coach Verification (coach_verified)
    ↓
Automated/Onboarding (automated)
    ↓ (lowest authority)
```

**Rules:**
- Reboot data **cannot** be overwritten by coach or automated data
- Coach data **cannot** be overwritten by automated data
- Locked identities require explicit unlock action
- All changes are tracked in history

## API Documentation

### GET /api/player-assessment/{id}
**Returns:** Assessment with history (for admins)

```typescript
{
  assessment: {
    id: string;
    swingIdentity: string;
    identityLocked: boolean;
    rebootDerivedIdentityConfidence: number | null;
    // ... other fields
    history?: AssessmentHistory[]; // Admin only
  }
}
```

### PATCH /api/player-assessment/{id}
**Updates:** Assessment with history tracking

```typescript
Body: {
  swingIdentity?: string;
  confidenceLevel?: string;
  identityLocked?: boolean;
  status?: string;
  // ... other fields
  historyNote?: string; // Optional context note
}

Response: {
  assessment: PlayerAssessment;
}
```

**Behavior:**
- Tracks all changes in previousValues/newValues
- Creates history entry for each change type
- Enforces identity lock rules
- Auto-locks on reboot_verified status

### POST /api/player-assessment/{id}/upload-reboot
**Uploads:** Reboot Motion files

```typescript
Body: FormData {
  files: File[];
  rebootDerivedConfidence?: string; // "95.5"
}

Response: {
  success: boolean;
  uploadedFiles: RebootMotionFile[];
  assessment: PlayerAssessment;
}
```

**Behavior:**
- Validates file types (.csv, .json, .pdf)
- Uploads to S3 under `reboot-motion/{assessmentId}/`
- Updates assessment with file references
- Creates history entry for upload

## Database Migration

**File:** `prisma/migrations/20251218_add_assessment_history_and_reboot_fields/migration.sql`

**Changes:**
1. Add `rebootDerivedIdentityConfidence` to `player_assessments`
2. Create `assessment_history` table with indexes
3. Add foreign key relations

**To Apply:**
```bash
npx prisma migrate deploy
```

## TypeScript Types

### New Types
```typescript
// Assessment History
interface AssessmentHistory {
  id: string;
  assessmentId: string;
  changedBy: string;
  changeType: AssessmentChangeType;
  previousValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  notes: string | null;
  createdAt: Date;
  changedByUser?: {
    id: string;
    name: string | null;
    username: string;
  };
}

type AssessmentChangeType =
  | 'created'
  | 'swing_identity_updated'
  | 'confidence_updated'
  | 'status_updated'
  | 'constraints_updated'
  | 'training_lane_updated'
  | 'system_statement_updated'
  | 'reboot_verified'
  | 'reboot_files_uploaded'
  | 'identity_locked'
  | 'identity_unlocked';

// Helper Functions
function formatHistoryChange(history: AssessmentHistory): string;
const CHANGE_TYPE_LABELS: Record<AssessmentChangeType, string>;
```

## Testing Checklist

### Admin UI Tests
- [ ] Create new assessment
- [ ] Edit assessment (quick fields)
- [ ] Upload Reboot files
- [ ] View assessment history
- [ ] Lock/unlock identity
- [ ] Set status to reboot_verified (auto-locks)
- [ ] Add change notes
- [ ] Delete assessment

### Data Authority Tests
- [ ] Try changing locked identity (should reject)
- [ ] Unlock identity, then change (should work)
- [ ] Set reboot_verified status (should auto-lock)
- [ ] Upload Reboot files with confidence score

### Athlete View Tests
- [ ] View assessment with reboot_verified (Gold Standard banner)
- [ ] View assessment with coach_verified
- [ ] View assessment with locked identity (lock icon shown)
- [ ] View constraints and coach statement
- [ ] Verify read-only (no edit buttons)

### History Tests
- [ ] Make changes, verify history entries created
- [ ] Check previousValues/newValues populated
- [ ] View history timeline in admin UI
- [ ] Add change notes, verify in history

## Performance Considerations

- History table will grow over time
  - Add index on `(assessmentId, createdAt)` ✅ Done
  - Consider archiving old entries after 1 year
- S3 file uploads are async
  - Show loading states in UI
  - Handle upload failures gracefully
- Assessment history loaded only for admins
  - Conditional include in Prisma queries ✅ Done

## Future Enhancements

### Potential Additions
1. **Bulk Assessment Updates** - Update multiple athletes at once
2. **Assessment Templates** - Pre-filled templates for common identities
3. **File Preview** - View Reboot files inline (CSV tables, PDF viewer)
4. **Export History** - Download assessment history as CSV
5. **Notifications** - Alert coaches when assessments need review
6. **Comparison View** - Compare before/after assessments
7. **Assessment Search** - Filter by identity, lane, status, etc.

## Deployment Notes

### Environment Variables
No new environment variables required. Uses existing:
- `DATABASE_URL` - PostgreSQL connection
- AWS S3 credentials (via aws-config.ts)

### Database Migration
```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy
```

### Rollback Plan
If issues arise:
1. Revert database migration
2. Restore previous git commit
3. Redeploy application

## Support & Documentation

**Created:** December 18, 2025  
**Feature Branch:** `feature/assessment-enforcement-layer`  
**Commits:** 5 focused commits with clear messages  

**Key Files:**
- `prisma/schema.prisma` - Database schema
- `types/player-assessment.ts` - TypeScript types
- `app/api/player-assessment/[id]/route.ts` - Update API
- `app/api/player-assessment/[id]/upload-reboot/route.ts` - Upload API
- `app/admin/player-assessments/[id]/edit-assessment-enhanced-client.tsx` - Admin UI
- `components/assessment/your-system-today.tsx` - Athlete view

**Contact:** For questions or issues, reference this guide and the git commit history.

---

## Summary

The Assessment system is now a **practical coaching tool** optimized for:
✅ Fast between-pod updates  
✅ Reboot Motion data integration (Gold Standard)  
✅ Complete change history tracking  
✅ Clear, coach-friendly athlete view  
✅ Data authority enforcement  

**Mission Accomplished:** Assessment feels like a coaching tool, not just a gate.
