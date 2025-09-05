"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { formatCurrency } from "@/utils/utils";
import {
  Building2,
  Calendar,
  DollarSign,
  Edit,
  Mail,
  MapPin,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import { getOrganizationsAction } from "@/lib/actions/organizations";
import { getProjectsAction } from "@/lib/actions/projects";
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

interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  location: string;
  startDate: string;
  estimatedEndDate?: string;
  totalUnits: number;
  soldUnits: number;
  availableUnits: number;
  basePrice: number;
  status: "planning" | "pre_sale" | "construction" | "completed" | "delivered";
  organizationId: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProjectsData {
  data: Project[];
  count: number;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
}

export default function ProjectsList() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "planning" | "pre_sale" | "construction" | "completed" | "delivered"
  >("all");
  const [organizationFilter, setOrganizationFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  // Ensure projects is always an array
  const safeProjects = projects || [];
  const safePagination = pagination || {
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  };

  const fetchOrganizations = useCallback(async () => {
    try {
      const result = await getOrganizationsAction({
        page: 1,
        pageSize: 100, // Get all organizations for filter
      });

      if (result.success && result.data) {
        const data = result.data as any;
        setOrganizations(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching organizations:", err);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getProjectsAction({
        page: pagination?.page || 1,
        pageSize: pagination?.pageSize || 10,
        search: searchTerm || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        organizationId:
          organizationFilter === "all" ? undefined : organizationFilter,
      });

      if (result.success && result.data) {
        const data = result.data as ProjectsData;
        setProjects(data.data);

        // Calculate pagination
        const totalPages = Math.ceil(data.count / (pagination?.pageSize || 10));
        setPagination((prev) => ({
          ...prev,
          totalCount: data.count,
          totalPages,
        }));
      } else {
        setError(result.error || "Error cargando proyectos");
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Error inesperado cargando proyectos");
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination?.page,
    pagination?.pageSize,
    searchTerm,
    statusFilter,
    organizationFilter,
  ]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusChange = (newStatus: typeof statusFilter) => {
    setStatusFilter(newStatus);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleOrganizationChange = (newOrgId: string) => {
    setOrganizationFilter(newOrgId);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const getStatusBadge = (status: Project["status"]) => {
    const statusConfig = {
      planning: { label: "Planificación", variant: "secondary" as const },
      pre_sale: { label: "Pre-venta", variant: "default" as const },
      construction: { label: "En Construcción", variant: "default" as const },
      completed: { label: "Completado", variant: "outline" as const },
      delivered: { label: "Entregado", variant: "outline" as const },
    };

    const config = statusConfig[status];
    if (!config) {
      return <Badge variant="secondary">Desconocido</Badge>;
    }
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calculateProgress = (project: Project) => {
    if (project.totalUnits === 0) return 0;
    return Math.round((project.soldUnits / project.totalUnits) * 100);
  };

  if (isLoading && safeProjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proyectos Existentes</CardTitle>
          <CardDescription>
            Lista de todos los proyectos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="text-gray-500">Cargando proyectos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Proyectos Existentes
        </CardTitle>
        <CardDescription>
          Lista de todos los proyectos registrados ({safePagination.totalCount}{" "}
          total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Search */}
            <div className="lg:col-span-1">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Buscar
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Buscar por nombre o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Organization Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Organización
              </label>
              <select
                value={organizationFilter}
                onChange={(e) => handleOrganizationChange(e.target.value)}
                className="border-input bg-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="all">Todas las organizaciones</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
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
                <option value="all">Todos</option>
                <option value="planning">Planificación</option>
                <option value="pre_sale">Pre-venta</option>
                <option value="construction">En Construcción</option>
                <option value="completed">Completado</option>
                <option value="delivered">Entregado</option>
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

        {/* Projects List */}
        {safeProjects.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p>No se encontraron proyectos</p>
            {(searchTerm ||
              statusFilter !== "all" ||
              organizationFilter !== "all") && (
              <p className="text-sm">
                Intenta modificar los filtros de búsqueda
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {safeProjects.map((project) => (
              <div
                key={project.id}
                className="bg-card rounded-lg border p-6 transition-shadow hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {project.name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          @{project.slug} • {project.organization.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(project.status)}
                      </div>
                    </div>

                    {/* Description */}
                    {project.description && (
                      <p className="text-sm text-gray-600">
                        {project.description}
                      </p>
                    )}

                    {/* Project Info */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{project.location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>Desde {formatCurrency(project.basePrice)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{project.totalUnits} unidades</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          Inicio:{" "}
                          {new Date(project.startDate).toLocaleDateString(
                            "es-UY",
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso de ventas</span>
                        <span>{calculateProgress(project)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-blue-600 transition-all"
                          style={{ width: `${calculateProgress(project)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{project.soldUnits} vendidas</span>
                        <span>{project.availableUnits} disponibles</span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="text-muted-foreground flex items-center gap-4 text-xs">
                      <span>
                        Creado:{" "}
                        {new Date(project.createdAt).toLocaleDateString(
                          "es-UY",
                        )}
                      </span>
                      {project.estimatedEndDate && (
                        <span>
                          Finalización estimada:{" "}
                          {new Date(
                            project.estimatedEndDate,
                          ).toLocaleDateString("es-UY")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/super/edit-project/${project.id}`)}
                    >
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
