// =============================================================================
// OPERATIONS PAGE
// User dashboard for managing real estate operations
// =============================================================================

'use client';

import { useActiveOperation } from '@/hooks/useActiveOperation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { createOperation, cancelOperation } from '@/lib/actions/operations';

export default function OperationsPage() {
  const { data: session, status } = useSession();
  const {
    activeOperation,
    hasActiveOperation,
    canStartNewOperation,
    loading,
    error,
    refreshActiveOperation,
  } = useActiveOperation();

  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  if (status === 'loading') {
    return <div>Cargando...</div>;
  }

  if (!session) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Acceso Denegado</h1>
        <p>Debes iniciar sesión para ver tus operaciones.</p>
        <a href="/login">Iniciar Sesión</a>
      </div>
    );
  }

  const handleCreateOperation = async () => {
    if (selectedUnits.length === 0) {
      setActionError('Debes seleccionar al menos una unidad');
      return;
    }

    setIsCreating(true);
    setActionError(null);

    try {
      const result = await createOperation({
        unitIds: selectedUnits,
        notes: 'Operación creada desde dashboard',
      });

      if (result.success) {
        setSelectedUnits([]);
        await refreshActiveOperation();
      } else {
        setActionError(result.error || 'Error al crear operación');
      }
    } catch (error) {
      setActionError('Error interno del servidor');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelOperation = async () => {
    if (!activeOperation) return;

    setIsCancelling(true);
    setActionError(null);

    try {
      const result = await cancelOperation(
        activeOperation.id,
        'Cancelada por el usuario desde dashboard'
      );

      if (result.success) {
        await refreshActiveOperation();
      } else {
        setActionError(result.error || 'Error al cancelar operación');
      }
    } catch (error) {
      setActionError('Error interno del servidor');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Cargando operaciones...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1>Mis Operaciones</h1>
        <p>
          Bienvenido, {session.user.firstName} {session.user.lastName}
        </p>
      </header>

      {error && (
        <div
          style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '4px',
          }}
        >
          ❌ {error}
        </div>
      )}

      {actionError && (
        <div
          style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '4px',
          }}
        >
          ❌ {actionError}
        </div>
      )}

      {/* Active Operation Section */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Operación Activa</h2>

        {hasActiveOperation ? (
          <div
            style={{
              border: '1px solid #ddd',
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9',
            }}
          >
            <h3>Operación #{activeOperation!.id.slice(0, 8)}</h3>
            <p>
              <strong>Estado:</strong> {activeOperation!.status}
            </p>
            <p>
              <strong>Monto Total:</strong> {activeOperation!.currency} $
              {activeOperation!.totalAmount.toLocaleString()}
            </p>
            <p>
              <strong>Iniciada:</strong>{' '}
              {new Date(activeOperation!.startedAt).toLocaleDateString()}
            </p>

            <h4>Unidades Reservadas:</h4>
            <ul>
              {activeOperation!.operationUnits.map((ou) => (
                <li key={ou.unit.id}>
                  {ou.unit.project.name} - Unidad {ou.unit.unitNumber}
                  (${ou.priceAtReservation.toLocaleString()})
                </li>
              ))}
            </ul>

            <h4>Pasos del Proceso:</h4>
            <ol>
              {activeOperation!.steps.map((step) => (
                <li
                  key={step.id}
                  style={{
                    color:
                      step.status === 'completed'
                        ? 'green'
                        : step.status === 'in_progress'
                          ? 'orange'
                          : 'gray',
                  }}
                >
                  {step.stepName} - {step.status}
                </li>
              ))}
            </ol>

            <div style={{ marginTop: '20px' }}>
              <button
                onClick={handleCancelOperation}
                disabled={isCancelling}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isCancelling ? 'not-allowed' : 'pointer',
                }}
              >
                {isCancelling ? 'Cancelando...' : 'Cancelar Operación'}
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              border: '1px solid #ddd',
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: '#f0f8ff',
            }}
          >
            <p>✅ No tienes ninguna operación activa.</p>
            <p>
              Puedes iniciar una nueva operación seleccionando unidades
              disponibles.
            </p>
          </div>
        )}
      </section>

      {/* New Operation Section */}
      <section>
        <h2>Iniciar Nueva Operación</h2>

        {canStartNewOperation ? (
          <div
            style={{
              border: '1px solid #ddd',
              padding: '20px',
              borderRadius: '8px',
            }}
          >
            {/* TODO: Frontend developers should implement proper unit selection UI */}
            {/* This is a basic implementation for testing the business logic */}
            <div style={{ marginBottom: '20px' }}>
              <h4>
                Seleccionar Unidades (DEMO - TODO: Implementar UI completa)
              </h4>
              <p>Para testing, puedes usar estos IDs de unidades de ejemplo:</p>
              <input
                type="text"
                placeholder="ID de unidad (ej: unit-uuid-here)"
                value={selectedUnits.join(',')}
                onChange={(e) =>
                  setSelectedUnits(e.target.value.split(',').filter(Boolean))
                }
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <small>Ingresa IDs de unidades separados por comas</small>
            </div>

            <button
              onClick={handleCreateOperation}
              disabled={isCreating || selectedUnits.length === 0}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor:
                  isCreating || selectedUnits.length === 0
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              {isCreating ? 'Creando...' : 'Iniciar Operación'}
            </button>
          </div>
        ) : (
          <div
            style={{
              border: '1px solid #fcc',
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: '#fee',
            }}
          >
            <p>❌ No puedes iniciar una nueva operación.</p>
            <p>
              Ya tienes una operación activa. Debes completarla o cancelarla
              antes de iniciar una nueva.
            </p>
          </div>
        )}
      </section>

      {/* TODO: Frontend developers should add:
          - Proper unit browser/selector component
          - Better styling and responsive design
          - Loading states and animations
          - Progress indicators for operation steps
          - Document upload areas
          - Professional assignment interface
          - Payment integration interface
      */}
    </div>
  );
}
