// =============================================================================
// ACTIVE OPERATION HOOK
// Client-side hook to manage user's active operation state
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getUserActiveOperation } from '@/lib/actions/operations';

export interface ActiveOperation {
  id: string;
  status: string;
  totalAmount: number;
  currency: string;
  startedAt: Date;
  notes?: string;
  operationUnits: Array<{
    unit: {
      id: string;
      unitNumber: string;
      price: number;
      project: {
        name: string;
        slug: string;
      };
    };
    priceAtReservation: number;
  }>;
  steps: Array<{
    id: string;
    stepName: string;
    stepOrder: number;
    status: string;
    startedAt?: Date;
    completedAt?: Date;
  }>;
}

export function useActiveOperation() {
  const { data: session, status } = useSession();
  const [activeOperation, setActiveOperation] =
    useState<ActiveOperation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActiveOperation() {
      if (status === 'loading') return;

      if (!session?.user?.id) {
        setActiveOperation(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const operation = await getUserActiveOperation(session.user.id);
        setActiveOperation(operation);
      } catch (err) {
        console.error('Error fetching active operation:', err);
        setError('Error al cargar la operación activa');
      } finally {
        setLoading(false);
      }
    }

    fetchActiveOperation();
  }, [session, status]);

  const refreshActiveOperation = async () => {
    if (!session?.user?.id) return;

    try {
      setError(null);
      const operation = await getUserActiveOperation(session.user.id);
      setActiveOperation(operation);
    } catch (err) {
      console.error('Error refreshing active operation:', err);
      setError('Error al actualizar la operación activa');
    }
  };

  const hasActiveOperation = Boolean(activeOperation);

  const canStartNewOperation = !hasActiveOperation;

  return {
    activeOperation,
    hasActiveOperation,
    canStartNewOperation,
    loading,
    error,
    refreshActiveOperation,
  };
}
