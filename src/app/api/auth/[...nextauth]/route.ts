// =============================================================================
// NEXTAUTH API ROUTE HANDLER
// Handles all NextAuth.js authentication routes
// Created: August 2025
// =============================================================================

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/config';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };