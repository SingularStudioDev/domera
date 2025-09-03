// =============================================================================
// NEXTAUTH TYPE EXTENSIONS FOR DOMERA PLATFORM
// Extended types for user session and JWT tokens
// Created: August 2025
// =============================================================================

import "next-auth";
import "next-auth/jwt";

import type { UserRole } from "./database";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      firstName: string;
      lastName: string;
      roles: UserRoleData[];
      isActive: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    firstName: string;
    lastName: string;
    roles: UserRoleData[];
    isActive: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstName: string;
    lastName: string;
    roles: UserRoleData[];
    isActive: boolean;
  }
}

// Extended role data with organization info
export interface UserRoleData {
  role: UserRole;
  organizationId: string | null;
  isActive: boolean;
  organization?: {
    name: string;
    slug: string;
  } | null;
}
