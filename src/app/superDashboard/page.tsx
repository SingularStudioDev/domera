'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SuperDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/superLogin');
      return;
    }

    // Verify super admin status
    const userRoles = session.user.roles || [];
    const isSuperAdmin = userRoles.some(role => 
      role.role === 'admin' && !role.organizationId
    );

    if (!isSuperAdmin) {
      router.push('/superLogin');
      return;
    }

    // Redirect to organizations page
    router.push('/superDashboard/organizations');
  }, [session, status, router]);

  return null;
}