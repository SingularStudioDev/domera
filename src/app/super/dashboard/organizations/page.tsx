'use client';

import { useState } from 'react';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import CreateOrganizationForm from './components/CreateOrganizationForm';
import OrganizationsList from './components/OrganizationsList';

export default function OrganizationsPage() {
  const { isLoading: isSessionLoading, isAuthenticated } = useSuperAdmin();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleOrganizationCreated = () => {
    // Trigger refresh of the organizations list
    setRefreshKey(prev => prev + 1);
    // Hide the form after successful creation
    setShowCreateForm(false);
  };

  if (isSessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Redirigiendo al login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="dashboard-title">Gestión de Organizaciones</h1>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2"
          >
            {showCreateForm ? (
              <>
                <X className="h-4 w-4" />
                Cancelar
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Crear Organización Nueva
              </>
            )}
          </Button>
        </div>

        {/* Create Organization Form - Conditional Rendering */}
        {showCreateForm && (
          <CreateOrganizationForm onSuccess={handleOrganizationCreated} />
        )}

        {/* Organizations List */}
        <OrganizationsList key={refreshKey} />
      </div>
    </div>
  );
}
