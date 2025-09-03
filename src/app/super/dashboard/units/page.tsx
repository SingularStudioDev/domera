"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { formatCurrency } from "@/utils/utils";
import { getUnitsAction } from "@/lib/actions/units";
import type { UnitStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Plus, Search, Filter, Eye, Edit } from "lucide-react";

interface Unit {
  id: string;
  unitNumber: string;
  unitType: string;
  status: string;
  floor: number | null;
  bedrooms: number;
  bathrooms: number;
  totalArea: number | null;
  builtArea: number | null;
  orientation: string | null;
  price: number;
  currency: string;
  createdAt: string;
  project: {
    id: string;
    name: string;
    city: string;
    organization: {
      name: string;
    };
  };
}

interface PaginatedResult {
  data: Unit[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const UNIT_STATUS_MAP = {
  available: { label: "Disponible", variant: "default" as const },
  reserved: { label: "Reservada", variant: "secondary" as const },
  sold: { label: "Vendida", variant: "destructive" as const },
  in_process: { label: "En Proceso", variant: "outline" as const },
};

const UNIT_TYPE_MAP = {
  apartment: "Apartamento",
  commercial_space: "Local Comercial",
  garage: "Garage",
  storage: "Dep�sito",
  office: "Oficina",
};

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    unitType: "all",
    status: "all" as UnitStatus | "all",
    projectId: "",
  });

  const fetchUnits = async (page = 1, currentFilters = filters) => {
    try {
      setLoading(true);
      setError(null);

      const filtersForApi = {
        page,
        pageSize: 20,
        ...(currentFilters.unitType && currentFilters.unitType !== "all" && { unitType: currentFilters.unitType }),
        ...(currentFilters.status && currentFilters.status !== "all" && { status: currentFilters.status as UnitStatus }),
        ...(currentFilters.projectId && { projectId: currentFilters.projectId }),
      };

      const result = await getUnitsAction(filtersForApi);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Error cargando unidades");
      }

      const paginatedData = result.data as PaginatedResult;
      
      // Filter by search term on client side for unitNumber
      let filteredUnits = paginatedData.data;
      if (currentFilters.search) {
        filteredUnits = paginatedData.data.filter((unit) =>
          unit.unitNumber.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
          unit.project.name.toLowerCase().includes(currentFilters.search.toLowerCase())
        );
      }

      setUnits(filteredUnits);
      setPagination({
        page: paginatedData.page,
        pageSize: paginatedData.pageSize,
        total: paginatedData.total,
        totalPages: paginatedData.totalPages,
      });
    } catch (err) {
      console.error("Error fetching units:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits(1);
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchUnits(1, newFilters);
  };

  const handlePageChange = (newPage: number) => {
    fetchUnits(newPage, filters);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-UY", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && units.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Cargando unidades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="dashboard-title">Gesti�n de Unidades</h1>
          <p className="text-muted-foreground text-lg">
            Administra todas las unidades de los proyectos
          </p>
        </div>
        <Button asChild className="sm:w-auto">
          <Link href="/super/dashboard/units/create-unit">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Unidad
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por n�mero o proyecto..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Unit Type Filter */}
            <Select
              value={filters.unitType}
              onValueChange={(value) => handleFilterChange("unitType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de unidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="apartment">Apartamento</SelectItem>
                <SelectItem value="commercial_space">Local Comercial</SelectItem>
                <SelectItem value="garage">Garage</SelectItem>
                <SelectItem value="storage">Dep�sito</SelectItem>
                <SelectItem value="office">Oficina</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="reserved">Reservada</SelectItem>
                <SelectItem value="sold">Vendida</SelectItem>
                <SelectItem value="in_process">En Proceso</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                const emptyFilters = {
                  search: "",
                  unitType: "all",
                  status: "all" as UnitStatus | "all",
                  projectId: "",
                };
                setFilters(emptyFilters);
                fetchUnits(1, emptyFilters);
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => fetchUnits(pagination.page, filters)}
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Units Grid */}
      {units.length > 0 ? (
        <>
          <div className="grid gap-6">
            {units.map((unit) => (
              <Card key={unit.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Unit Info */}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start gap-3">
                        <div>
                          <h3 className="text-lg font-semibold">
                            Unidad {unit.unitNumber}
                          </h3>
                          <p className="text-muted-foreground">
                            {unit.project.name} - {unit.project.city}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {unit.project.organization.name}
                          </p>
                        </div>
                        <Badge 
                          variant={UNIT_STATUS_MAP[unit.status as keyof typeof UNIT_STATUS_MAP]?.variant || "default"}
                        >
                          {UNIT_STATUS_MAP[unit.status as keyof typeof UNIT_STATUS_MAP]?.label || unit.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>
                          Tipo: {UNIT_TYPE_MAP[unit.unitType as keyof typeof UNIT_TYPE_MAP] || unit.unitType}
                        </span>
                        {unit.floor !== null && (
                          <span>Piso: {unit.floor}</span>
                        )}
                        <span>{unit.bedrooms} dorm.</span>
                        <span>{unit.bathrooms} ba�os</span>
                        {unit.totalArea && (
                          <span>{unit.totalArea} m�</span>
                        )}
                        {unit.orientation && (
                          <span>Orient: {unit.orientation}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-lg font-semibold">
                            {unit.currency} {formatCurrency(unit.price)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Creada: {formatDate(unit.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 lg:flex-col">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/super/dashboard/units/${unit.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/super/dashboard/units/${unit.id}/edit`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {units.length} de {pagination.total} unidades
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1 || loading}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-3 py-1 text-sm">
                  P�gina {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages || loading}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        !loading && (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No se encontraron unidades</h3>
              <p className="text-muted-foreground mb-6">
                {filters.search || (filters.unitType !== "all") || (filters.status !== "all")
                  ? "Intenta ajustar los filtros o crear una nueva unidad."
                  : "Crea tu primera unidad para comenzar."}
              </p>
              <Button asChild>
                <Link href="/super/dashboard/units/create-unit">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Unidad
                </Link>
              </Button>
            </CardContent>
          </Card>
        )
      )}

      {/* Loading overlay for filter changes */}
      {loading && units.length > 0 && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Aplicando filtros...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}