import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { OAuthConfig, OAuthUserConfig } from 'next-auth/providers/oauth';
// import { PrismaAdapter } from '@next-auth/prisma-adapter'; // Not used with CredentialsProvider + JWT
import { prisma } from './db';
import bcrypt from 'bcryptjs';
import { getWhopUserMemberships, getWhopProductTier } from './whop-client';

// PHASE 5: Whop OAuth integration for subscription management

export const authOptions: NextAuthOptions = {
  // Note: PrismaAdapter is incompatible with CredentialsProvider + JWT strategy
  // adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    // Admin Credentials Provider - Requires admin role
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        // Verify role is admin
        if (user.role !== 'admin' && user.role !== 'coach') {
          console.log(`Admin login rejected: User ${user.email} has role ${user.role}`);
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          isCoach: user.isCoach || false,
          role: user.role || 'player',
        };
      },
    }),
    // Regular Credentials Provider (for athletes/testing)
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.password) {
          return null;
        }

        // Accept either username or email
        const identifier = credentials.username || credentials.email;
        if (!identifier) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: identifier },
        });

        if (!user) {
          return null;
        }

        // Handle optional password (for future Whop OAuth users)
        if (!user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          isCoach: user.isCoach || false,
          role: user.role || 'player',
        };
      },
    }),
    // Whop OAuth Provider - Using manual endpoints (wellKnown was causing issues)
    {
      id: 'whop',
      name: 'Whop',
      type: 'oauth',
      clientId: process.env.WHOP_CLIENT_ID,
      clientSecret: process.env.WHOP_CLIENT_SECRET,
      authorization: {
        url: 'https://whop.com/oauth',
        params: {
          scope: 'openid email profile',
          response_type: 'code',
        },
      },
      token: {
        url: 'https://api.whop.com/api/v2/oauth/token',
        async request(context) {
          console.log('[Whop OAuth] ========== TOKEN EXCHANGE START ==========');
          console.log('[Whop OAuth] Callback URL:', `${process.env.NEXTAUTH_URL}/api/auth/callback/whop`);
          console.log('[Whop OAuth] Code present:', !!context.params.code);
          console.log('[Whop OAuth] Code value (first 20 chars):', context.params.code ? (context.params.code as string).substring(0, 20) + '...' : 'MISSING');
          console.log('[Whop OAuth] Client ID:', context.provider.clientId ? 'Present' : 'MISSING');
          console.log('[Whop OAuth] Client Secret:', context.provider.clientSecret ? 'Present' : 'MISSING');

          try {
            const requestBody = new URLSearchParams({
              grant_type: 'authorization_code',
              code: context.params.code as string,
              redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/whop`,
              client_id: context.provider.clientId as string,
              client_secret: context.provider.clientSecret as string,
            });
            
            console.log('[Whop OAuth] Request body params:', Array.from(requestBody.keys()).join(', '));

            const response = await fetch('https://api.whop.com/api/v2/oauth/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: requestBody,
            });

            console.log('[Whop OAuth] Token response status:', response.status);
            console.log('[Whop OAuth] Token response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('[Whop OAuth] ❌ Token exchange FAILED');
              console.error('[Whop OAuth] Status:', response.status);
              console.error('[Whop OAuth] Error body:', errorText);
              throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
            }

            const tokens = await response.json();
            console.log('[Whop OAuth] ✅ Token exchange SUCCESS');
            console.log('[Whop OAuth] Received token keys:', Object.keys(tokens));
            console.log('[Whop OAuth] Access token present:', !!tokens.access_token);
            console.log('[Whop OAuth] Token type:', tokens.token_type);
            console.log('[Whop OAuth] ========== TOKEN EXCHANGE END ==========');
            return { tokens };
          } catch (error) {
            console.error('[Whop OAuth] ❌ Token exchange EXCEPTION:', error);
            console.error('[Whop OAuth] Error name:', (error as Error).name);
            console.error('[Whop OAuth] Error message:', (error as Error).message);
            console.error('[Whop OAuth] Error stack:', (error as Error).stack);
            throw error;
          }
        },
      },
      userinfo: {
        url: 'https://api.whop.com/api/v2/me',
        async request(context) {
          console.log('[Whop OAuth] ========== USERINFO FETCH START ==========');
          console.log('[Whop OAuth] Access token:', context.tokens.access_token ? 'Present (length: ' + (context.tokens.access_token as string).length + ')' : 'MISSING');
          console.log('[Whop OAuth] Token type:', context.tokens.token_type || 'not specified');

          try {
            const response = await fetch('https://api.whop.com/api/v2/me', {
              headers: {
                Authorization: `Bearer ${context.tokens.access_token}`,
              },
            });

            console.log('[Whop OAuth] Userinfo response status:', response.status);
            console.log('[Whop OAuth] Userinfo response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));

            if (!response.ok) {
              const errorText = await response.text();
              console.error('[Whop OAuth] ❌ Userinfo fetch FAILED');
              console.error('[Whop OAuth] Status:', response.status);
              console.error('[Whop OAuth] Error body:', errorText);
              throw new Error(`Userinfo fetch failed: ${response.status} - ${errorText}`);
            }

            const profile = await response.json();
            console.log('[Whop OAuth] ✅ Userinfo fetch SUCCESS');
            console.log('[Whop OAuth] Profile keys:', Object.keys(profile));
            console.log('[Whop OAuth] Profile.id:', profile.id || 'MISSING');
            console.log('[Whop OAuth] Profile.email:', profile.email || 'MISSING');
            console.log('[Whop OAuth] Profile.name:', profile.name || 'MISSING');
            console.log('[Whop OAuth] ========== USERINFO FETCH END ==========');
            return profile;
          } catch (error) {
            console.error('[Whop OAuth] ❌ Userinfo fetch EXCEPTION:', error);
            console.error('[Whop OAuth] Error name:', (error as Error).name);
            console.error('[Whop OAuth] Error message:', (error as Error).message);
            throw error;
          }
        },
      },
      checks: ['state'],
      profile(profile: any) {
        console.log('[Whop OAuth] ========== PROFILE MAPPING START ==========');
        console.log('[Whop OAuth] Raw profile data:', JSON.stringify(profile, null, 2));
        
        if (!profile.id) {
          console.error('[Whop OAuth] ❌ CRITICAL: Profile missing required "id" field');
          console.error('[Whop OAuth] Available profile keys:', Object.keys(profile));
          throw new Error('Whop profile missing required "id" field');
        }

        const mappedProfile = {
          id: profile.id,
          name: profile.name || profile.username || 'Whop User',
          email: profile.email,
          username: profile.username || profile.email,
          whopUserId: profile.id,
        };

        console.log('[Whop OAuth] ✅ Profile mapped successfully');
        console.log('[Whop OAuth] Mapped profile:', JSON.stringify(mappedProfile, null, 2));
        console.log('[Whop OAuth] ========== PROFILE MAPPING END ==========');
        return mappedProfile;
      },
    } as OAuthConfig<any>,
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error', // Dedicated error page to show actual error messages
    newUser: '/dashboard', // Redirect new users here after first OAuth sign-in
  },
  debug: true, // TEMPORARY: Enable debug mode to diagnose OAuthSignin error
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('[NextAuth JWT Callback] ========== JWT CALLBACK START ==========');
      console.log('[NextAuth JWT Callback] Has user:', !!user);
      console.log('[NextAuth JWT Callback] Has account:', !!account);
      console.log('[NextAuth JWT Callback] Account provider:', account?.provider);
      console.log('[NextAuth JWT Callback] Token ID:', token.id);

      try {
        if (user) {
          console.log('[NextAuth JWT] Processing user data from profile');
          console.log('[NextAuth JWT] User keys:', Object.keys(user));
          console.log('[NextAuth JWT] User.id:', user.id);
          console.log('[NextAuth JWT] User.email:', user.email);
          
          token.id = user.id;
          token.username = (user as any).username;
          token.whopUserId = (user as any).whopUserId;
          token.isCoach = (user as any).isCoach || false;
          token.role = (user as any).role || 'player';
          
          console.log('[NextAuth JWT] Token updated with user data');
        }
        
        // If this is a Whop OAuth login, sync membership data
        if (account?.provider === 'whop' && token.whopUserId) {
          console.log('[NextAuth JWT] ========== WHOP MEMBERSHIP SYNC START ==========');
          console.log('[NextAuth JWT] Whop User ID:', token.whopUserId);
          
          try {
            // Find or create user in database
            let dbUser = await prisma.user.findUnique({
              where: { whopUserId: token.whopUserId as string },
            });

            if (!dbUser) {
              console.log('[NextAuth JWT] User not found in DB, creating new user');
              // Create new user from Whop OAuth data
              dbUser = await prisma.user.create({
                data: {
                  username: token.username as string || token.email as string || `whop_${token.whopUserId}`,
                  email: token.email as string,
                  name: token.name as string,
                  whopUserId: token.whopUserId as string,
                  membershipTier: 'free',
                  membershipStatus: 'inactive',
                  profileComplete: false,
                },
              });
              console.log('[NextAuth JWT] ✅ New user created in DB:', dbUser.id);
            } else {
              console.log('[NextAuth JWT] ✅ Existing user found in DB:', dbUser.id);
            }

            // Sync membership data from Whop
            console.log('[NextAuth JWT] Fetching Whop memberships...');
            const memberships = await getWhopUserMemberships(token.whopUserId as string);
            console.log('[NextAuth JWT] Found memberships:', memberships.length);
            
            const activeMemberships = memberships.filter((m) => m.valid);
            console.log('[NextAuth JWT] Active memberships:', activeMemberships.length);

            if (activeMemberships.length > 0) {
              // Get highest tier membership
              const tierPriority: Record<string, number> = {
                elite: 3,
                pro: 2,
                athlete: 1,
                free: 0,
              };

              let highestTier = 'free';
              let highestMembership = activeMemberships[0];

              for (const membership of activeMemberships) {
                const tier = getWhopProductTier(membership.productId);
                console.log('[NextAuth JWT] Membership:', membership.id, 'Tier:', tier);
                if (tierPriority[tier] > tierPriority[highestTier]) {
                  highestTier = tier;
                  highestMembership = membership;
                }
              }

              console.log('[NextAuth JWT] Highest tier:', highestTier);
              
              // Update user with membership info
              await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                  whopMembershipId: highestMembership.id,
                  membershipTier: highestTier,
                  membershipStatus: 'active',
                  membershipExpiresAt: highestMembership.expiresAt
                    ? new Date(highestMembership.expiresAt)
                    : null,
                  lastWhopSync: new Date(),
                },
              });

              console.log('[NextAuth JWT] ✅ User membership updated');
              
              token.membershipTier = highestTier;
              token.membershipStatus = 'active';
            } else {
              console.log('[NextAuth JWT] ⚠️  No active memberships found');
            }

            token.id = dbUser.id;
            console.log('[NextAuth JWT] ========== WHOP MEMBERSHIP SYNC END ==========');
          } catch (syncError) {
            console.error('[NextAuth JWT] ❌ Error syncing Whop membership:', syncError);
            console.error('[NextAuth JWT] Error details:', {
              name: (syncError as Error).name,
              message: (syncError as Error).message,
              stack: (syncError as Error).stack,
            });
            // Don't throw - allow login to proceed even if sync fails
          }
        }
        
        console.log('[NextAuth JWT] ========== JWT CALLBACK END ==========');
        console.log('[NextAuth JWT] Final token:', { id: token.id, role: token.role, membershipTier: token.membershipTier });
        return token;
        
      } catch (error) {
        console.error('[NextAuth JWT] ❌ CRITICAL ERROR in JWT callback:', error);
        console.error('[NextAuth JWT] Error details:', {
          name: (error as Error).name,
          message: (error as Error).message,
          stack: (error as Error).stack,
        });
        // Return token as-is to prevent complete auth failure
        return token;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).whopUserId = token.whopUserId;
        (session.user as any).membershipTier = token.membershipTier;
        (session.user as any).membershipStatus = token.membershipStatus;
        (session.user as any).isCoach = token.isCoach || false;
        (session.user as any).role = token.role || 'player';
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('[NextAuth Redirect] ========== REDIRECT START ==========');
      console.log('[NextAuth Redirect] url:', url);
      console.log('[NextAuth Redirect] baseUrl:', baseUrl);
      
      try {
        // Case 1: Relative path (starts with /)
        if (url.startsWith('/')) {
          const fullUrl = `${baseUrl}${url}`;
          console.log('[NextAuth Redirect] Relative path detected, returning:', fullUrl);
          return fullUrl;
        }
        
        // Case 2: Absolute URL - check if same origin
        const urlObj = new URL(url);
        if (urlObj.origin === baseUrl) {
          console.log('[NextAuth Redirect] Same origin URL, allowing:', url);
          // IMPORTANT: Don't redirect back to login page (causes loop)
          // BUT: Allow redirects to /auth/error (that's where errors should go!)
          if (urlObj.pathname === '/auth/login') {
            console.log('[NextAuth Redirect] Avoiding login loop, redirecting to dashboard instead');
            return `${baseUrl}/dashboard`;
          }
          return url;
        }
        
        // Case 3: Different origin - reject and go to dashboard
        console.log('[NextAuth Redirect] Different origin detected, redirecting to dashboard');
        return `${baseUrl}/dashboard`;
        
      } catch (error) {
        console.error('[NextAuth Redirect] Error parsing URL:', error);
        console.log('[NextAuth Redirect] Falling back to dashboard');
        return `${baseUrl}/dashboard`;
      } finally {
        console.log('[NextAuth Redirect] ========== REDIRECT END ==========');
      }
    },
  },
};
