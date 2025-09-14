"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { Button } from "@/components/ui/button";

import EditOrganizationForm from "./components/EditOrganizationForm";

export default function EditOrganizationPage() {
  const { isLoading: isSessionLoading, isAuthenticated } = useSuperAdmin();
  const params = useParams();
  const router = useRouter();
  const organizationId = params?.id as string;

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
        {/* Header */}
        <div className="mb-4 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <h1 className="dashboard-title">Editar Organización</h1>
        </div>

        {/* Edit Form */}
        <EditOrganizationForm organizationId={organizationId} />
      </div>
    </div>
  );
}