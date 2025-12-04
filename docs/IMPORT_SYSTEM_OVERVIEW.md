# HitTrax + Sensor Import System - Complete Guide

## WO-IMPORT-01 Implementation Overview

This document provides a comprehensive guide to the Smart HitTrax + Bat Sensor (Blast/Diamond Kinetics) Import System for CatchBarrels.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Import Workflows](#import-workflows)
5. [File Format Expectations](#file-format-expectations)
6. [Matching Logic](#matching-logic)
7. [API Reference](#api-reference)
8. [Configuration](#configuration)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## System Overview

### Purpose

The import system allows coaches to:
- Upload HitTrax CSV files (ball flight data)
- Upload bat sensor CSV files (Blast Motion or Diamond Kinetics)
- Automatically match swings by timestamp
- Store combined data for enhanced analysis

### Key Features

✅ **Two Import Modes**:
- **Per-Player Import**: Upload files from player profile, auto-assign to that player
- **Bulk Import**: Upload multiple CSVs/ZIP, auto-match to players by name

✅ **Flexible CSV Parsing**:
- Configurable column name mapping
- Supports multiple timestamp formats
- Handles missing/malformed data gracefully

✅ **Timestamp Matching**:
- Matches HitTrax swings to sensor swings within ±300ms window
- One-to-one matching (no reuse)
- Match quality scoring (exact/good/fair)

✅ **Unassigned Data Handling**:
- Flags swings that can't be auto-assigned
- Admin UI for manual player assignment (future)

---

## Architecture

### Component Structure

```
lib/import/
├── types.ts                   # TypeScript type definitions
├── config.ts                  # Configuration (column mappings, thresholds)
├── parsers/
│   ├── csvUtils.ts            # CSV parsing utilities
│   ├── parseHitTraxCsv.ts     # HitTrax parser
│   ├── parseBlastCsv.ts       # Blast Motion parser
│   ├── parseDiamondKineticsCsv.ts  # Diamond Kinetics parser
│   └── index.ts               # Parser exports
├── matching.ts                # Timestamp-based matching algorithm
└── service.ts                 # Import orchestration service

app/api/players/[id]/imports/
└── route.ts                   # Per-player import API

docs/
├── IMPORT_SCHEMA_PROPOSAL.md  # Database design
└── IMPORT_SYSTEM_OVERVIEW.md  # This file
```

### Data Flow

```
1. File Upload → S3 Storage
2. CSV Content → Parser (HitTrax/Blast/DK)
3. Parsed Swings → Timestamp Matcher
4. Matched Data → Database (HitTraxSession, HitTraxEvent, SensorSwing)
5. Summary → Client Response
```

---

## Database Schema

### New Models

#### ImportSession
Tracks each import operation.

```prisma
model ImportSession {
  id                String   @id @default(uuid())
  userId            String   // Coach who initiated
  importType        String   // "per_player" | "bulk"
  sourceTypes       String[] // ["hittrax", "blast", "dk"]
  
  fileNames         String[]
  fileCount         Int
  
  totalSwings       Int
  matchedSwings     Int
  unmatchedSwings   Int
  playersDetected   Int
  
  status            String   // "processing" | "completed" | "failed"
  errorMessage      String?
  
  hittraxSessions   HitTraxSession[]
  sensorSwings      SensorSwing[]
  
  createdAt         DateTime
  completedAt       DateTime?
}
```

#### SensorSwing
Stores bat sensor data (Blast or Diamond Kinetics).

```prisma
model SensorSwing {
  id                String   @id @default(uuid())
  userId            String?  // Player
  importSessionId   String?
  
  sensorType        String   // "blast" | "diamond_kinetics"
  sensorDeviceId    String?
  sensorTimestamp   DateTime
  
  // Matching to HitTrax
  hittraxEventId    String?  @unique
  matchTimeDelta    Float?   // ms
  
  // Core metrics
  batSpeed          Float?
  attackAngle       Float?
  timeToContact     Float?
  peakHandSpeed     Float?
  
  // Sensor-specific
  blastFactor       Float?
  powerOutput       Float?
  rotationMetric    Float?
  
  rawDataJson       Json?
  
  assigned          Boolean
  assignedAt        DateTime?
  assignedBy        String?
  
  createdAt         DateTime
}
```

### Updated Models

- **HitTraxSession**: Added `importSessionId` relation
- **HitTraxEvent**: Added `sensorSwing` one-to-one relation
- **User**: Added `importSessions` and `sensorSwings` relations

---

## Import Workflows

### Per-Player Import

**Use Case**: Coach has HitTrax + sensor files for one player.

**Steps**:

1. Navigate to player profile (`/admin/players/[id]`)
2. Find "Import Session Data" card
3. Upload HitTrax CSV and/or sensor CSV
4. Click "Import Session"
5. View import summary

**API**: `POST /api/players/[id]/imports`

**Request**:
```
Content-Type: multipart/form-data

file1: hittrax.csv
file2: blast.csv
```

**Response**:
```json
{
  "success": true,
  "summary": {
    "importSessionId": "...",
    "totalSwings": 52,
    "matchedSwings": 44,
    "unmatchedSwings": 8,
    "players": [...]
  }
}
```

### Bulk Import

**Use Case**: Coach uploads multiple files from a nightly training session.

**Steps**:

1. Navigate to `/admin/imports` (future)
2. Upload ZIP file or multiple CSVs
3. System auto-detects players from file names/data
4. Assigns swings automatically
5. Flags unassigned swings for manual assignment

**Status**: API endpoint ready, UI pending

---

## File Format Expectations

### HitTrax CSV

**Required Columns** (flexible names):
- Row number: `row`, `rownum`, `#`, `swing_number`
- Timestamp: `timestamp`, `time`, `swing_time`
- Batter: `batter`, `batter_name`, `player`, `player_name`

**Ball Data Columns**:
- Exit velocity: `velo`, `exit_velo`, `exit_velocity`, `ev`
- Launch angle: `la`, `launch_angle`, `angle`
- Distance: `dist`, `distance`, `d`
- Result: `res`, `result`, `outcome`

**Example**:
```csv
Row,Date,Time,Batter,Velo,LA,Dist,Res
1,11/28/2024,14:30:12,John Doe,92.5,25.3,350,1B-8
2,11/28/2024,14:30:45,John Doe,88.2,18.7,280,GB-6
```

### Blast Motion CSV

**Required Columns**:
- Timestamp: `timestamp`, `time`, `date_time`
- Player: `player`, `player_name`, `user`
- Bat speed: `bat_speed`, `speed`
- Attack angle: `attack_angle`, `angle`, `aa`

**Example**:
```csv
Timestamp,Player,Bat Speed,Attack Angle,Blast Factor
11/28/2024 14:30:12,John Doe,72.5,15.3,85.2
11/28/2024 14:30:45,John Doe,70.1,12.8,82.7
```

### Diamond Kinetics CSV

**Required Columns**:
- Timestamp: `timestamp`, `time`
- Player: `player`, `athlete`, `athlete_name`
- Bat speed: `bat_speed`, `peak_bat_speed`
- Attack angle: `attack_angle`, `approach_angle`

**Example**:
```csv
Timestamp,Athlete,Bat Speed,Attack Angle,Rotation
11/28/2024 14:30:12,John Doe,71.8,14.9,88.5
11/28/2024 14:30:45,John Doe,69.5,13.2,85.3
```

---

## Matching Logic

### Timestamp Matching Algorithm

1. **Parse Timestamps**: Convert all timestamp strings to `Date` objects
2. **Sort Arrays**: Sort HitTrax and sensor swings by timestamp
3. **Find Best Match**: For each HitTrax swing:
   - Search sensor swings within ±TIME_WINDOW_MS (default: 300ms)
   - Select closest match
   - Mark sensor swing as "used" (one-to-one constraint)
4. **Calculate Match Quality**:
   - Exact: ≤50ms
   - Good: ≤150ms
   - Fair: ≤300ms
5. **Store Results**: Save matched and unmatched swings

### Configuration

**Time Window** (adjust in `lib/import/config.ts`):
```typescript
export const TIME_WINDOW_MS = 300; // ±300ms
```

**Match Quality Thresholds**:
```typescript
export const MATCH_QUALITY_THRESHOLDS = {
  exact: 50,   // ≤50ms
  good: 150,   // ≤150ms
  fair: 300,   // ≤300ms
};
```

---

## API Reference

### POST /api/players/[id]/imports

**Description**: Import HitTrax + sensor data for a specific player.

**Auth**: Coach or Admin only

**Request**:
```
POST /api/players/123/imports
Content-Type: multipart/form-data

file1: hittrax_john_doe.csv
file2: blast_john_doe.csv
```

**Response**:
```json
{
  "success": true,
  "summary": {
    "importSessionId": "uuid",
    "importType": "per_player",
    "status": "completed",
    "filesProcessed": 2,
    "fileNames": ["hittrax_john_doe.csv", "blast_john_doe.csv"],
    "totalSwings": 52,
    "matchedSwings": 44,
    "unmatchedSwings": 8,
    "playersDetected": 1,
    "players": [
      {
        "playerId": "123",
        "playerName": "John Doe",
        "hittraxSessionId": "uuid",
        "swingsImported": 52,
        "swingsMatched": 44,
        "sources": ["hittrax", "blast"]
      }
    ],
    "startedAt": "2024-11-28T14:30:00Z",
    "completedAt": "2024-11-28T14:30:15Z",
    "durationMs": 15000
  }
}
```

---

## Configuration

### Adjusting Column Names

Edit `lib/import/config.ts`:

```typescript
export const HITTRAX_COLUMNS = {
  exitVelocity: ['velo', 'exit_velo', 'exit_velocity', 'ev', 'YOUR_CUSTOM_NAME'],
  // Add your column names to the array
};
```

### Adjusting Time Window

Edit `lib/import/config.ts`:

```typescript
export const TIME_WINDOW_MS = 500; // Increase to ±500ms
```

### Timezone Configuration

Edit `lib/import/config.ts`:

```typescript
export const DEFAULT_TIMEZONE = 'America/Los_Angeles'; // Change timezone
```

---

## Testing

### Manual Testing Checklist

#### Per-Player Import

- [ ] Upload HitTrax only → Creates HitTraxSession + events
- [ ] Upload sensor only → Creates SensorSwings, assigned to player
- [ ] Upload both → Swings matched by timestamp
- [ ] View import summary → All counts correct
- [ ] Check database → ImportSession created, status "completed"

#### Matching Logic

- [ ] Exact timestamps (same ms) → Match quality "exact"
- [ ] Close timestamps (±100ms) → Match quality "good"
- [ ] Far timestamps (±250ms) → Match quality "fair"
- [ ] No matches (>300ms) → Swings unmatched
- [ ] One-to-one constraint → Each sensor swing used once

#### Error Handling

- [ ] Bad CSV format → Returns clear error message
- [ ] Missing columns → Skips rows, logs errors
- [ ] No timestamp → Swing skipped
- [ ] Unauthorized user → Returns 401/403

### Unit Tests

**Location**: `lib/import/__tests__/matching.test.ts` (pending)

**Coverage**:
- Exact timestamp matches
- Near-miss matches
- No matches scenario
- One-to-one constraint enforcement
- Edge cases (empty arrays, duplicate timestamps)

---

## Troubleshooting

### Common Issues

#### "No data rows found in CSV"

**Cause**: CSV is empty or has no header row.

**Fix**: Verify CSV has headers and data rows.

#### "Missing or invalid timestamp"

**Cause**: Timestamp column not recognized or format unsupported.

**Fix**:
1. Check `lib/import/config.ts` for column name mapping
2. Add your timestamp column name to `HITTRAX_COLUMNS.timestamp`
3. If format is unusual, update `parseTimestamp()` in `csvUtils.ts`

#### "Could not parse file X"

**Cause**: CSV has malformed structure (e.g., quotes, special characters).

**Fix**:
1. Open CSV in text editor
2. Check for unclosed quotes or weird characters
3. Re-export from original system with standard settings

#### No matches found

**Cause**: Timestamps don't align within ±300ms window.

**Fix**:
1. Check if HitTrax and sensor clocks are synchronized
2. Increase `TIME_WINDOW_MS` in `config.ts` (e.g., to 500ms or 1000ms)
3. Verify timestamp formats are parsed correctly

#### Import API returns 500 error

**Cause**: Database connection issue or parsing exception.

**Fix**:
1. Check server logs for detailed error
2. Verify database connection (Prisma)
3. Ensure S3 credentials are valid

---

## Future Enhancements

### Phase 2 (Planned)

- [ ] **Bulk Import UI**: Admin page for multi-file/multi-player uploads
- [ ] **Unassigned Swing Management**: Admin UI to manually assign unmatched sensor swings to players
- [ ] **ZIP File Support**: Auto-extract and process multiple CSVs from ZIP
- [ ] **Player Name Matching**: Fuzzy matching for player names (e.g., "John Doe" = "Doe, John")
- [ ] **Import History Dashboard**: View all past imports, re-run failed imports
- [ ] **Email Notifications**: Notify coaches when import completes
- [ ] **Advanced Analytics**: Visualize matched vs. unmatched swings, sensor vs. ball flight correlation

### Phase 3 (Future)

- [ ] **Real-time Import**: WebSocket-based progress updates
- [ ] **Automatic Retry**: Retry failed file uploads
- [ ] **Drag-and-Drop UI**: Enhanced file upload UX
- [ ] **Import Templates**: Save column mappings for reuse
- [ ] **Data Validation Rules**: Custom rules for accepting/rejecting swings

---

## Key Files Reference

### Core Logic

| File | Purpose |
|------|---------|
| `lib/import/types.ts` | Type definitions |
| `lib/import/config.ts` | Configuration (columns, thresholds) |
| `lib/import/parsers/csvUtils.ts` | CSV parsing utilities |
| `lib/import/parsers/parseHitTraxCsv.ts` | HitTrax parser |
| `lib/import/parsers/parseBlastCsv.ts` | Blast parser |
| `lib/import/parsers/parseDiamondKineticsCsv.ts` | DK parser |
| `lib/import/matching.ts` | Timestamp matching algorithm |
| `lib/import/service.ts` | Import orchestration |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/players/[id]/imports` | POST | Per-player import |

### Database

| Model | Purpose |
|-------|---------|
| `ImportSession` | Track import operations |
| `SensorSwing` | Store sensor data |
| `HitTraxSession` | Group HitTrax events (existing) |
| `HitTraxEvent` | Individual HitTrax swings (existing) |

---

## Summary

The HitTrax + Sensor Import System provides a flexible, automated way to combine ball flight data (HitTrax) with biomechanical data (Blast/Diamond Kinetics). The system:

- ✅ Parses multiple CSV formats with flexible column mapping
- ✅ Matches swings by timestamp (±300ms window, configurable)
- ✅ Stores data in relational database (PostgreSQL)
- ✅ Provides per-player import API
- ✅ Handles errors gracefully with detailed logging
- ✅ Ready for future bulk import and admin UI enhancements

**Status**: Core functionality complete, ready for testing and UI development.

---

**End of Documentation**
