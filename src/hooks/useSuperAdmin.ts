'use client';

import { useState, useEffect } from 'react';

interface SuperAdminUser {
  userId: string;
  message: string;
}

interface SuperAdminSession {
  user: SuperAdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export function useSuperAdmin(): SuperAdminSession {
  const [session, setSession] = useState<SuperAdminSession>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/auth/super-admin/session-check', {
          method: 'GET',
          credentials: 'include', // Include cookies
        });

        if (response.ok) {
          const data = await response.json();
          setSession({
            user: data.data,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });
        } else {
          // Session invalid or expired
          setSession({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: 'Sesión inválida',
          });
          
          // Redirect to super admin login
          window.location.href = '/super';
        }
      } catch (error) {
        console.error('Error checking super admin session:', error);
        setSession({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: 'Error verificando sesión',
        });
        
        // Redirect to super admin login
        window.location.href = '/super';
      }
    }

    checkSession();
  }, []);

  return session;
}