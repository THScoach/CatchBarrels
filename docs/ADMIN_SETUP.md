# Admin User Setup Guide

## Overview

This guide explains how to create and configure admin users for the CatchBarrels application. Admin users have access to the Coach Control Room at `/admin` where they can view all athletes, sessions, and analytics.

---

## Required Environment Variables

Before creating an admin user, you must set the following environment variables in your `.env` file:

### `ADMIN_EMAIL`
- **Required**: Yes
- **Description**: The email address for the admin user
- **Example**: `ADMIN_EMAIL="admin@catchbarrels.app"`

### `ADMIN_PASSWORD`
- **Required**: Yes
- **Description**: A secure password for the admin user
- **Example**: `ADMIN_PASSWORD="YourSecurePassword123!"`
- **Security Note**: Use a strong password with:
  - At least 12 characters
  - Mix of uppercase and lowercase letters
  - Numbers and special characters
  - No dictionary words

---

## Creating an Admin User

### Step 1: Set Environment Variables

Add these lines to your `.env` file in the `nextjs_space` directory:

```bash
# Admin Credentials
ADMIN_EMAIL="coach@catchbarrels.app"
ADMIN_PASSWORD="CoachBarrels2024!"
```

**Note**: These are the production admin credentials. Keep them secure and do not share publicly.

### Step 2: Run the Admin Seed Script

From the `nextjs_space` directory, run:

```bash
yarn tsx scripts/seed-admin.ts
```

**OR** if you prefer ts-node:

```bash
yarn ts-node scripts/seed-admin.ts
```

### Step 3: Verify Success

You should see output similar to:

```
🔧 Admin User Seeding Script
================================

📧 Admin Email: admin@catchbarrels.app
🔑 Password: ******************** (hidden)

✅ Admin user created successfully!

📊 User Details:
   ID: abc123-def456-...
   Email: admin@catchbarrels.app
   Username: admin@catchbarrels.app
   Role: admin
   Is Coach: true
   Membership: elite

✅ Admin seeding complete!

🚀 Next Steps:
   1. Visit https://catchbarrels.app/auth/login
   2. Click "Admin" tab
   3. Login with: admin@catchbarrels.app
   4. You will be redirected to /admin
```

### Step 4: Test Admin Login

1. Go to https://catchbarrels.app/auth/login
2. Click the **"Admin"** tab (shield icon)
3. Enter your admin email and password
4. Click **"Admin Sign In"**
5. You should be redirected to `/admin` (Coach Control Room)

---

## Updating an Existing Admin User

If you need to update the admin password or promote an existing user to admin:

1. Update the `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your `.env` file
2. Run the seed script again:
   ```bash
   yarn tsx scripts/seed-admin.ts
   ```
3. The script will detect the existing user and update their credentials and role

---

## Troubleshooting

### Error: "Missing required environment variables"

**Solution**: Make sure both `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in your `.env` file.

### Error: "Can't reach database server"

**Solution**: Ensure your `DATABASE_URL` is correctly configured in `.env` and the database is running.

### Error: "Login failed" after creating admin

**Solution**:
1. Verify the admin user was created successfully
2. Check that you're using the **Admin** tab on the login page
3. Make sure you're entering the exact email from `ADMIN_EMAIL`
4. Try the quick login "Admin" button for testing

### Admin redirected to /dashboard instead of /admin

**Solution**:
1. Check that the user's `role` field is set to `admin` or `coach`
2. Clear your browser cache and cookies
3. Try logging out and back in

---

## Security Best Practices

1. **Strong Passwords**: Always use strong, unique passwords for admin accounts
2. **Environment Variables**: Never commit `.env` files to version control
3. **Production Secrets**: Use different credentials for production vs development
4. **Access Logging**: Monitor `/admin` access in production logs
5. **Regular Updates**: Change admin passwords periodically
6. **Least Privilege**: Only grant admin access to users who absolutely need it

---

## Admin Features

Once logged in as admin, you have access to:

- **Coach Control Room** (`/admin`) - Dashboard with athlete overview
- **Session Analysis** (`/admin/session/[id]`) - Deep dive into individual sessions
- **Assessment Management** (`/admin/assessments`) - View all assessments
- **Knowledge Base** (`/admin/knowledge-base`) - Content management
- **Model Videos** (`/admin/model-videos`) - Reference swing library
- **Coaching Calls** (`/admin/coaching`) - Schedule and manage calls

---

## Removing Admin Access

To revoke admin access from a user:

1. Connect to your database
2. Run this SQL:
   ```sql
   UPDATE "User" 
   SET role = 'player', "isCoach" = false 
   WHERE email = 'user@example.com';
   ```
3. The user will be redirected to `/dashboard` on their next login

---

## Notes

- The seed script is **idempotent** - you can run it multiple times safely
- Admin users automatically get `elite` membership tier
- Admin users bypass Whop product gating checks
- The `admin` role includes all `coach` permissions plus additional system access

---

## Support

For issues or questions:
1. Check this documentation
2. Review `/docs/ADMIN_LOGIN_FLOW.md` for technical details
3. Contact the development team
