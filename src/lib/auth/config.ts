// =============================================================================
// NEXTAUTH CONFIGURATION
// Integrated with Supabase and custom role-based authentication
// =============================================================================

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { LoginSchema } from '@/lib/validations/schemas';
import type { UserRoleData } from '@/types/next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos');
        }

        try {
          // Validate input format
          const validatedCredentials = LoginSchema.parse(credentials);

          // Get user from database using singleton Prisma client
          console.log('🔍 Attempting to connect to database...');
          console.log('validatedCredentials', validatedCredentials);
          const user = await prisma.user.findFirst({
            where: {
              email: validatedCredentials.email,
              isActive: true,
            },
            select: {
              id: true,
              email: true,
              password: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              isActive: true,
              userRoles: {
                where: { isActive: true },
                select: {
                  role: true,
                  organizationId: true,
                  isActive: true,
                  organization: {
                    select: {
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          });

          if (!user) {
            console.error('User not found in database');
            throw new Error('Credenciales inválidas');
          }

          // Verify password
          const isValidPassword = await verifyPassword(
            validatedCredentials.password,
            user.password
          );

          if (!isValidPassword) {
            console.error('Invalid password for user:', user.email);
            throw new Error('Credenciales inválidas');
          }

          // Successful authentication
          console.log('User authenticated successfully:', user.email);

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            image: user.avatarUrl,
            // Custom properties
            firstName: user.firstName,
            lastName: user.lastName,
            roles: user.userRoles || [],
            isActive: user.isActive,
          };
        } catch (error) {
          console.error('Auth error:', error);

          // Return user-friendly error messages
          if (error instanceof Error) {
            if (error.message.includes('validation')) {
              throw new Error('Formato de email o contraseña inválido');
            }
            throw new Error(error.message);
          }

          throw new Error('Error de autenticación');
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // TODO: PABLO -> Revisar la seguridad de esto, mas que nada el password esta raro
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔐 SignIn callback triggered:', { 
        provider: account?.provider, 
        userEmail: user?.email,
        hasProfile: !!profile 
      });

      // Handle Google OAuth sign in
      if (account?.provider === 'google' && profile) {
        try {
          // Check if user already exists
          const existingUser = await prisma.user.findFirst({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // Create new user from Google profile
            const googleProfile = profile as Record<string, any>;
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                firstName: googleProfile.given_name || user.name?.split(' ')[0] || 'Usuario',
                lastName: googleProfile.family_name || user.name?.split(' ').slice(1).join(' ') || '',
                avatarUrl: user.image || null,
                password: 'oauth_user', // Placeholder for OAuth users
                isActive: true,
                // Create default user role
                userRoles: {
                  create: {
                    role: 'user',
                    isActive: true,
                  },
                },
              },
              include: {
                userRoles: {
                  where: { isActive: true },
                  include: {
                    organization: true,
                  },
                },
              },
            });

            // Update user object with database info
            user.id = newUser.id;
            (user as Record<string, any>).firstName = newUser.firstName;
            (user as Record<string, any>).lastName = newUser.lastName;
            (user as Record<string, any>).roles = newUser.userRoles;
            (user as Record<string, any>).isActive = newUser.isActive;
          } else {
            // Update existing user with Google profile info if missing
            const googleProfile = profile as Record<string, any>;
            const updatedUser = await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                ...(existingUser.firstName ? {} : { firstName: googleProfile.given_name || user.name?.split(' ')[0] || 'Usuario' }),
                ...(existingUser.lastName ? {} : { lastName: googleProfile.family_name || user.name?.split(' ').slice(1).join(' ') || '' }),
                ...(existingUser.avatarUrl ? {} : { avatarUrl: user.image || null }),
                lastLogin: new Date(),
              },
              include: {
                userRoles: {
                  where: { isActive: true },
                  include: {
                    organization: true,
                  },
                },
              },
            });

            // Update user object with database info
            user.id = updatedUser.id;
            (user as Record<string, any>).firstName = updatedUser.firstName;
            (user as Record<string, any>).lastName = updatedUser.lastName;
            (user as Record<string, any>).roles = updatedUser.userRoles;
            (user as Record<string, any>).isActive = updatedUser.isActive;
          }
        } catch (error) {
          console.error('Error handling Google sign in:', error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.roles = (user as any).roles || [];
        token.isActive = (user as any).isActive;
      }

      // Refresh user roles on each token refresh (every request)
      if (token.email) {
        try {
          const user = await prisma.user.findFirst({
            where: {
              email: token.email,
              isActive: true,
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              isActive: true,
              userRoles: {
                where: { isActive: true },
                select: {
                  role: true,
                  organizationId: true,
                  isActive: true,
                  organization: {
                    select: {
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          });

          if (user) {
            token.id = user.id;
            token.firstName = user.firstName;
            token.lastName = user.lastName;
            token.roles = user.userRoles || [];
            token.isActive = user.isActive;
          }
        } catch (error) {
          console.error('Error refreshing user roles:', error);
          // Keep existing token data if refresh fails
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.roles = token.roles as any[];
        session.user.isActive = token.isActive as boolean;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  events: {
    async signIn({ user }) {
      console.log('User signed in:', { user: user.email });

      // Update last login timestamp
      if (user.id) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });
        } catch (error) {
          console.error('Error updating last login:', error);
        }
      }
    },

    async signOut({ token }) {
      console.log('User signed out:', token?.email);
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

// =============================================================================
// AUTH UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if user has specific role
 */
export function hasRole(
  userRoles: any[],
  role: string,
  organizationId?: string
): boolean {
  if (!userRoles || userRoles.length === 0) return false;

  // Admin role has access to everything
  if (userRoles.some((ur: any) => ur.role === 'admin')) return true;

  // Check for specific role
  if (organizationId) {
    return userRoles.some(
      (ur: any) => ur.role === role && ur.organizationId === organizationId
    );
  } else {
    return userRoles.some((ur: any) => ur.role === role);
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(userRoles: any[]): boolean {
  return hasRole(userRoles, 'admin');
}

/**
 * Check if user belongs to organization
 */
export function belongsToOrganization(
  userRoles: any[],
  organizationId: string
): boolean {
  if (isAdmin(userRoles)) return true;
  return userRoles.some((ur: any) => ur.organizationId === organizationId);
}

/**
 * Get user's organizations
 */
export function getUserOrganizationIds(userRoles: any[]): string[] {
  return userRoles
    .filter((ur: any) => ur.organizationId)
    .map((ur: any) => ur.organizationId);
}

/**
 * Check if user can access resource
 */
export function canAccessResource(
  userRoles: any[],
  requiredRole: string,
  organizationId?: string
): boolean {
  // Admin can access everything
  if (isAdmin(userRoles)) return true;

  // Check specific role and organization
  return hasRole(userRoles, requiredRole, organizationId);
}
