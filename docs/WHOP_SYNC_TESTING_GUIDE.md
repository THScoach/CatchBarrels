# Whop Sync Testing Guide

## Quick Start

### Step 1: Log in as Admin

1. Go to https://catchbarrels.app/auth/admin-login
2. Email: `coach@catchbarrels.app`
3. Password: `CoachBarrels2024!`

### Step 2: Access Players Page

1. After login, you'll be on `/admin` (Coach Home)
2. Click "Players" in the top navigation
3. Or go directly to https://catchbarrels.app/admin/players

### Step 3: Run the Sync

1. Click the gold "Sync from Whop" button (top right)
2. Watch for the loading spinner
3. Wait for the success toast (2-10 seconds depending on customer count)

### Step 4: Review Results

The toast will show:
```
Successfully synced 12 Whop customers!
✓ Created 10 new player accounts
✓ Updated 2 existing players
```

The page will automatically refresh to show all synced players.

## What to Check

### In Admin UI

**Players Table** should show:
- ✅ All Whop customers listed
- ✅ Email addresses populated
- ✅ Membership tiers (athlete/pro/elite)
- ✅ Membership status (active/inactive)
- ✅ VIP badges for assessment purchasers
- ✅ "No sessions" for new users (expected)

### In Server Logs

Check the deployment logs or console to see:

```bash
# Example successful sync
[Whop Sync] ========================================
[Whop Sync] Starting FULL player sync from Whop
[Whop Sync] ========================================
[Whop Client] ✓ Fetched 15 memberships from first page
[Whop Sync] ✓ Found 12 unique Whop users with memberships

[Whop Sync] --- Processing Whop User: user_xyz ---
[Whop Sync] Email: customer@example.com
[Whop Sync] Active memberships: 1/1
[Whop Sync] → Determined tier: pro
[Whop Sync] → User does not exist, creating new account...
[Whop Sync] ✓ Created new user customer@example.com

[Whop Sync] SYNC COMPLETE
[Whop Sync] ✓ Created: 10 new users
[Whop Sync] ✓ Updated: 2 existing users
```

### In Database (Optional)

If you have database access:

```sql
SELECT 
  email,
  name,
  username,
  whopUserId,
  membershipTier,
  membershipStatus,
  password,
  createdAt
FROM "User"
WHERE whopUserId IS NOT NULL
ORDER BY createdAt DESC;
```

You should see:
- ✅ `whopUserId` is populated (e.g., `user_abc123xyz`)
- ✅ `password` is NULL (users log in via Whop OAuth)
- ✅ `membershipTier` matches their Whop product
- ✅ `email` and `name` from Whop
- ✅ Recent `createdAt` timestamps

## Testing Login Flow

### Test Customer Login

1. **Open incognito window**: https://catchbarrels.app/auth/login
2. **Click "Log in with Whop"**
3. **Use a test customer's credentials**:
   - Email: (one of the synced customers)
   - Password: (their Whop password)
4. **Should redirect to Whop**: You'll see Whop's OAuth page
5. **Authorize CatchBarrels**: Click "Allow" or "Continue"
6. **Should redirect to dashboard**: You land on `/dashboard`

### Expected Behavior

✅ **Success Flow**:
```
1. User clicks "Log in with Whop"
2. → Redirects to https://whop.com/oauth
3. User logs in on Whop
4. → Redirects to https://catchbarrels.app/api/auth/callback/whop
5. → Processes OAuth callback
6. → Redirects to https://catchbarrels.app/dashboard
7. User sees their dashboard with name/email populated
```

❌ **If login fails**:
- Check server logs for errors
- Verify `WHOP_CLIENT_ID` and `WHOP_CLIENT_SECRET` in `.env`
- Verify redirect URL in Whop dashboard: `https://catchbarrels.app/api/auth/callback/whop`
- See troubleshooting section below

## Common Issues

### Issue 1: "No memberships found"

**Toast Message**: `No memberships found in Whop. Please verify your Whop configuration.`

**Cause**: Either no customers exist, or `WHOP_API_KEY` is incorrect.

**Fix**:
1. Check Whop dashboard: Do you have any customers?
2. Verify `WHOP_API_KEY` in `.env` matches Whop dashboard
3. Test API key:
```bash
curl -H "Authorization: Bearer apik_..." \
  https://api.whop.com/api/v2/memberships
```

### Issue 2: "Sync failed" or timeout

**Toast Message**: `Failed to sync players from Whop. Check console for details.`

**Cause**: Network error or Whop API issue.

**Fix**:
1. Check server logs for detailed error
2. Try again (transient network issues)
3. Verify Whop API is up: https://status.whop.com/

### Issue 3: Users synced but can't log in

**Symptom**: Admin panel shows users, but "Log in with Whop" fails.

**Cause**: Whop OAuth misconfiguration.

**Fix**:
1. Verify redirect URL in Whop:
   - Go to Whop Dashboard → Developers → Apps → CatchBarrels
   - OAuth Redirect URLs should have: `https://catchbarrels.app/api/auth/callback/whop`
   - Remove any other URLs (like `/auth/login`)
2. Verify environment variables:
   - `WHOP_CLIENT_ID=app_...`
   - `WHOP_CLIENT_SECRET=apik_...`
   - `NEXTAUTH_URL=https://catchbarrels.app`
3. Check server logs during login attempt:
```
[Whop OAuth] Token exchange starting...
[Whop OAuth] Token response status: 200
[Whop OAuth] Token exchange successful
```

### Issue 4: Some customers missing

**Symptom**: Sync shows "10 customers" but you have 12 in Whop.

**Cause**: Customers might not have email addresses.

**Fix**:
1. Check sync logs for:
```
[Whop Sync] ⚠️  Skipped 2 users (no email)
```
2. These users need to complete their Whop profile
3. Once they add an email, re-run sync to pick them up

### Issue 5: Duplicate users

**Symptom**: Same person has multiple accounts.

**Cause**: User has different emails in Whop vs. a previously created account.

**Fix**:
1. Identify duplicates:
```sql
SELECT email, COUNT(*) 
FROM "User" 
GROUP BY email 
HAVING COUNT(*) > 1;
```
2. Manually merge:
   - Keep the one with `whopUserId` set
   - Delete the duplicate without `whopUserId`
   - Or update the old one to have the correct `whopUserId`

## Verifying Product Tier Mapping

### Check Current Mappings

Open `lib/whop-client.ts` and find:

```typescript
export function getWhopProductTier(productId: string): string {
  const productMapping: Record<string, string> = {
    "prod_kNyobCww4tc2p": "athlete",  // $49/mo
    "prod_O4CB6y0IzNJLe": "pro",      // $99/mo
    "prod_vCV6UQH3K18QZ": "elite",    // $199/mo
    "prod_zH1wnZs0JKKfd": "elite",    // $997 one-time
  };
  return productMapping[productId] || "free";
}
```

### Get Product IDs from Whop

1. Go to Whop Dashboard
2. Click "Products" in sidebar
3. Click on a product (e.g., "BARRELS Pro")
4. Copy the Product ID (starts with `prod_`)
5. Verify it matches the mapping above

### If Product IDs Changed

1. Update `lib/whop-client.ts` with correct IDs
2. Rebuild:
```bash
cd /home/ubuntu/barrels_pwa/nextjs_space
yarn build
```
3. Re-run sync to apply new mappings

## Advanced: Manual Sync via API

If you want to trigger sync programmatically:

```bash
# Get admin auth token first (via login)
ADMIN_TOKEN="your_session_token_here"

# Trigger sync
curl -X POST https://catchbarrels.app/api/admin/whop/sync-players \
  -H "Cookie: next-auth.session-token=$ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

Response:
```json
{
  "success": true,
  "syncedCount": 12,
  "createdCount": 10,
  "updatedCount": 2,
  "skippedCount": 0,
  "totalWhopUsers": 12
}
```

## Monitoring

### Regular Checks

Run sync:
- ✅ After each new Whop purchase
- ✅ Once daily for the first week
- ✅ Weekly thereafter
- ✅ After any Whop configuration changes

### Success Indicators

- ✅ All Whop customers in `/admin/players`
- ✅ No errors in sync logs
- ✅ Users can log in via Whop OAuth
- ✅ Membership tiers match Whop products
- ✅ Session limits enforced correctly

### Red Flags

- ❌ Customers synced < Whop customers count
- ❌ Multiple sync errors in logs
- ❌ Users report "can't log in"
- ❌ Membership tiers don't match Whop
- ❌ Duplicate accounts appearing

## Next Steps

### 1. Test with Real Customer

1. Have a test customer purchase on Whop
2. Run sync
3. Have them log in
4. Verify they can upload videos
5. Check session limits work

### 2. Email Existing Customers

Once sync is verified working:

```
Subject: Your CatchBarrels PWA is Ready! 🎯

Hey [Name],

Great news! Your CatchBarrels account is now active.

To access the app:
1. Go to https://catchbarrels.app/auth/login
2. Click "Log in with Whop"
3. Use the same email you used to purchase

You'll land on your dashboard and can start uploading swing videos immediately!

Need help? Reply to this email or check our docs.

- The CatchBarrels Team
```

### 3. Set Up Automated Sync

Consider:
- Whop webhook for real-time sync when purchases happen
- Daily cron job to catch any missed syncs
- Monitoring alerts for sync failures

## Summary

The Whop sync is now production-ready:

- ✅ Fetches **ALL** Whop customers (not just existing users)
- ✅ Creates accounts automatically with correct membership tiers
- ✅ Updates existing accounts with latest Whop data
- ✅ Handles pagination for large customer lists
- ✅ Comprehensive error handling and logging
- ✅ Users can log in via Whop OAuth (passwordless)
- ✅ Properly prevents duplicate accounts
- ✅ Syncs VIP offers for assessment purchasers

**Status**: ✅ Ready for production use

**Documentation**: See `/docs/WHOP_SYNC_COMPLETE.md` for full technical details
