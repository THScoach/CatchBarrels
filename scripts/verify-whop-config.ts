#!/usr/bin/env tsx

/**
 * Whop OAuth Configuration Verification Script
 * 
 * This script checks your Whop OAuth setup and provides diagnostic information.
 * Run with: yarn tsx scripts/verify-whop-config.ts
 */

import 'dotenv/config';

const REQUIRED_ENV_VARS = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'WHOP_CLIENT_ID',
  'WHOP_CLIENT_SECRET',
  'WHOP_API_KEY',
];

const EXPECTED_REDIRECT_URL = 'https://catchbarrels.app/api/auth/callback/whop'; // ONLY THIS ONE IS NEEDED

const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[36m',
  RESET: '\x1b[0m',
};

function log(color: string, message: string) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

function checkEnvVar(varName: string): { exists: boolean; value: string | null; masked: string | null } {
  const value = process.env[varName];
  if (!value) {
    return { exists: false, value: null, masked: null };
  }
  
  // Mask sensitive values
  const masked = value.length > 10 
    ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
    : '********';
  
  return { exists: true, value, masked };
}

function main() {
  console.log('\n' + '='.repeat(70));
  log(COLORS.BLUE, '🔍 WHOP OAUTH CONFIGURATION VERIFICATION');
  console.log('='.repeat(70) + '\n');

  let hasErrors = false;
  let hasWarnings = false;

  // Check 1: Environment Variables
  console.log('1️⃣  Checking Environment Variables:\n');
  
  const envResults: Record<string, ReturnType<typeof checkEnvVar>> = {};
  
  for (const varName of REQUIRED_ENV_VARS) {
    const result = checkEnvVar(varName);
    envResults[varName] = result;
    
    if (result.exists) {
      log(COLORS.GREEN, `   ✅ ${varName}: ${result.masked}`);
    } else {
      log(COLORS.RED, `   ❌ ${varName}: NOT SET`);
      hasErrors = true;
    }
  }

  console.log('');

  // Check 2: Client Secret vs API Key
  console.log('2️⃣  Checking Client Secret vs API Key:\n');
  
  const clientSecret = envResults.WHOP_CLIENT_SECRET?.value;
  const apiKey = envResults.WHOP_API_KEY?.value;
  
  if (clientSecret && apiKey) {
    if (clientSecret === apiKey) {
      log(COLORS.GREEN, '   ✅ Client Secret matches API Key');
      log(COLORS.BLUE, '   ℹ️  Note: Whop uses the same value for both Client Secret and API Key.');
      log(COLORS.BLUE, '   ℹ️  This is correct for Whop OAuth implementation.');
    } else {
      log(COLORS.YELLOW, '   ⚠️  Client Secret is different from API Key');
      log(COLORS.YELLOW, '   ⚠️  This is unusual for Whop. Double-check your configuration.');
      hasWarnings = true;
    }
  } else {
    log(COLORS.YELLOW, '   ⚠️  Cannot compare - one or both values missing');
    hasWarnings = true;
  }

  console.log('');

  // Check 3: Client ID Format
  console.log('3️⃣  Checking Client ID Format:\n');
  
  const clientId = envResults.WHOP_CLIENT_ID?.value;
  
  if (clientId) {
    if (clientId.startsWith('app_')) {
      log(COLORS.GREEN, `   ✅ Client ID format looks correct: ${envResults.WHOP_CLIENT_ID?.masked}`);
    } else {
      log(COLORS.YELLOW, `   ⚠️  Client ID format unusual: ${envResults.WHOP_CLIENT_ID?.masked}`);
      log(COLORS.YELLOW, '   ⚠️  Expected format: app_XXXXXXXXXXXX');
      hasWarnings = true;
    }
  }

  console.log('');

  // Check 4: NextAuth URL
  console.log('4️⃣  Checking NextAuth URL:\n');
  
  const nextAuthUrl = envResults.NEXTAUTH_URL?.value;
  
  if (nextAuthUrl) {
    if (nextAuthUrl === 'https://catchbarrels.app') {
      log(COLORS.GREEN, `   ✅ NEXTAUTH_URL is correct: ${nextAuthUrl}`);
    } else {
      log(COLORS.YELLOW, `   ⚠️  NEXTAUTH_URL is: ${nextAuthUrl}`);
      log(COLORS.YELLOW, '   ⚠️  Expected: https://catchbarrels.app');
      hasWarnings = true;
    }
  }

  console.log('');

  // Check 5: Required Redirect URL
  console.log('5️⃣  Required Redirect URL (must be in Whop Dashboard):\n');
  
  log(COLORS.BLUE, `   🔗 ${EXPECTED_REDIRECT_URL}`);
  log(COLORS.BLUE, '\n   ℹ️  ONLY THIS ONE URL IS NEEDED - DO NOT ADD OTHERS');

  console.log('');
  log(COLORS.YELLOW, '   ⚠️  You must manually verify this is registered in Whop Developer Dashboard');
  log(COLORS.YELLOW, '   ⚠️  Go to: https://dev.whop.com/ → Your Apps → CatchBarrels → OAuth Settings');
  log(COLORS.YELLOW, '   ⚠️  Remove any other URLs (like /auth/login, /auth/callback, etc.)');

  console.log('\n' + '='.repeat(70));

  // Summary
  console.log('\n📋 SUMMARY:\n');
  
  if (hasErrors) {
    log(COLORS.RED, '❌ ERRORS FOUND - OAuth will NOT work until fixed');
    console.log('');
    log(COLORS.YELLOW, 'NEXT STEPS:');
    log(COLORS.YELLOW, '1. Go to Whop Developer Dashboard (https://dev.whop.com/)');
    log(COLORS.YELLOW, '2. Find CatchBarrels app → OAuth Settings');
    log(COLORS.YELLOW, '3. Verify Client ID and Client Secret');
    log(COLORS.YELLOW, '4. Update .env file with correct credentials');
    log(COLORS.YELLOW, '5. Redeploy the app');
    log(COLORS.YELLOW, '6. Reinstall CatchBarrels app in Whop business');
  } else if (hasWarnings) {
    log(COLORS.YELLOW, '⚠️  WARNINGS FOUND - Please verify configuration');
    console.log('');
    log(COLORS.YELLOW, 'RECOMMENDED STEPS:');
    log(COLORS.YELLOW, '1. Double-check credentials in Whop Dashboard');
    log(COLORS.YELLOW, '2. Verify redirect URL is registered');
    log(COLORS.YELLOW, '3. Test login at https://catchbarrels.app/auth/login');
  } else {
    log(COLORS.GREEN, '✅ ALL CHECKS PASSED - Configuration looks good!');
    console.log('');
    log(COLORS.BLUE, 'READY TO TEST:');
    log(COLORS.BLUE, '1. Deploy the app to production');
    log(COLORS.BLUE, '2. Test browser login at https://catchbarrels.app/auth/login');
    log(COLORS.BLUE, '3. Test WAP mobile login via Whop app');
    log(COLORS.BLUE, '4. If still failing, try reinstalling app in Whop business');
  }

  console.log('\n' + '='.repeat(70) + '\n');

  process.exit(hasErrors ? 1 : 0);
}

main();
