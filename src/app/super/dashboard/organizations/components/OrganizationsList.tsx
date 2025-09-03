"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Building,
  Edit,
  Globe,
  Mail,
  MapPin,
  Phone,
  Search,
  Trash2,
} from "lucide-react";

import { getOrganizationsAction } from "@/lib/actions/organizations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Organization {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  websiteUrl?: string;
  status: "active" | "inactive" | "pending_approval";
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Updated to match the actual DAL response structure
interface OrganizationsData {
  data: Organization[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function OrganizationsList() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "pending_approval"
  >("all");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  // Ensure organizations is always an array
  const safeOrganizations = organizations || [];
  const safePagination = pagination || {
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  };

  // Debug current state
  console.log("🎯 [OrganizationsList] Current component state:", {
    organizationsCount: safeOrganizations.length,
    isLoading,
    error,
    searchTerm,
    statusFilter,
    pagination: safePagination,
    organizationsPreview: safeOrganizations
      .slice(0, 2)
      .map((org) => ({ id: org.id, name: org.name, status: org.status })),
  });

  const fetchOrganizations = useCallback(async () => {
    console.log(
      "🔍 [OrganizationsList] Starting fetchOrganizations with params:",
      {
        page: pagination?.page || 1,
        pageSize: pagination?.pageSize || 10,
        search: searchTerm || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      },
    );

    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "🚀 [OrganizationsList] About to call getOrganizationsAction...",
      );

      const result = await getOrganizationsAction({
        page: pagination?.page || 1,
        pageSize: pagination?.pageSize || 10,
        search: searchTerm || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });

      console.log(
        "🎯 [OrganizationsList] getOrganizationsAction completed with result:",
        {
          success: result.success,
          hasData: !!result.data,
          error: result.error,
        },
      );

      console.log("📊 [OrganizationsList] Server action result:", {
        success: result.success,
        hasData: !!result.data,
        error: result.error,
        dataType: typeof result.data,
        dataKeys: result.data ? Object.keys(result.data) : null,
      });

      if (result.success && result.data) {
        const data = result.data as OrganizationsData;
        console.log("📋 [OrganizationsList] Parsed data structure:", {
          dataArray: Array.isArray(data.data),
          dataLength: data.data?.length || 0,
          count: data.count,
          page: data.page,
          pageSize: data.pageSize,
          totalPages: data.totalPages,
          firstOrganization: data.data?.[0],
        });

        setOrganizations(data.data || []);
        setPagination({
          page: data.page,
          pageSize: data.pageSize,
          totalCount: data.count,
          totalPages: data.totalPages,
        });
      } else {
        console.error(
          "❌ [OrganizationsList] Server action failed:",
          result.error,
        );
        setError(result.error || "Error cargando organizaciones");
      }
    } catch (err) {
      console.error("💥 [OrganizationsList] Unexpected error:", err);

      // Log detailed error information
      if (err instanceof Error) {
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
      }

      setError(
        `Error inesperado cargando organizaciones: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      console.log(
        "✅ [OrganizationsList] fetchOrganizations completed, isLoading set to false",
      );
      setIsLoading(false);
    }
  }, [pagination?.page, pagination?.pageSize, searchTerm, statusFilter]);

  useEffect(() => {
    console.log(
      "🔄 [OrganizationsList] useEffect triggered with dependencies:",
      {
        page: pagination?.page,
        statusFilter,
      },
    );

    // Component is now properly executing
    fetchOrganizations();
  }, [pagination?.page, statusFilter, fetchOrganizations]);

  const handleSearch = () => {
    console.log(
      "🔍 [OrganizationsList] Search triggered with term:",
      searchTerm,
    );
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchOrganizations();
  };

  const handleStatusChange = (newStatus: typeof statusFilter) => {
    console.log("📊 [OrganizationsList] Status filter changed to:", newStatus);
    setStatusFilter(newStatus);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const getStatusBadge = (status: Organization["status"]) => {
    const statusConfig = {
      active: { label: "Activa", variant: "default" as const },
      inactive: { label: "Inactiva", variant: "secondary" as const },
      pending_approval: { label: "Pendiente", variant: "destructive" as const },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Remove the early return that hides the UI during loading
  // We'll show a loading state within the component instead

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Organizaciones Existentes
        </CardTitle>
        <CardDescription>
          Lista de todas las organizaciones registradas (
          {safePagination.totalCount} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {/* Search */}
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Buscar
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Buscar por nombre, email o slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:min-w-[200px]">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  handleStatusChange(e.target.value as typeof statusFilter)
                }
                className="border-input bg-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="all">Todas</option>
                <option value="active">Activas</option>
                <option value="pending_approval">Pendientes</option>
                <option value="inactive">Inactivas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Organizations List */}
        {isLoading && safeOrganizations.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <Building className="mx-auto mb-4 h-12 w-12 animate-pulse text-gray-400" />
            <p>Cargando organizaciones...</p>
          </div>
        ) : safeOrganizations.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <Building className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p>No se encontraron organizaciones</p>
            {searchTerm && (
              <p className="text-sm">
                Intenta modificar los filtros de búsqueda
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {safeOrganizations.map((org) => (
              <div
                key={org.id}
                className="bg-card rounded-lg border p-6 transition-shadow hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{org.name}</h3>
                        <p className="text-muted-foreground text-sm">
                          @{org.slug}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(org.status)}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{org.email}</span>
                      </div>

                      {org.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{org.phone}</span>
                        </div>
                      )}

                      {org.websiteUrl && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <a
                            href={org.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Sitio web
                          </a>
                        </div>
                      )}

                      {org.address && (
                        <div className="flex items-center gap-2 text-sm md:col-span-2 lg:col-span-3">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{org.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="text-muted-foreground flex items-center gap-4 text-xs">
                      <span>
                        Creada:{" "}
                        {new Date(org.createdAt).toLocaleDateString("es-UY")}
                      </span>
                      {org.taxId && <span>RUT: {org.taxId}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {(pagination?.totalPages || 0) > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              Página {pagination?.page || 1} de {pagination?.totalPages || 1}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={(pagination?.page || 1) <= 1}
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: (prev?.page || 1) - 1,
                  }))
                }
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  (pagination?.page || 1) >= (pagination?.totalPages || 1)
                }
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: (prev?.page || 1) + 1,
                  }))
                }
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
