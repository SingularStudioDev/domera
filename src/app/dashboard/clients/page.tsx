"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import {
  BuildingIcon,
  ChevronRightIcon,
  MailIcon,
  SearchIcon,
  FilterIcon,
  UsersIcon,
  DollarSignIcon,
  TrendingUpIcon,
  PlusIcon,
  Send
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { getClientsAction, getClientStatsAction, resendClientWelcomeEmailAction } from "@/lib/actions/clients";
import { CreateClientOnlyModal } from "@/components/modals/CreateClientOnlyModal";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ClientData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  totalOperations: number;
  activeOperations: number;
  completedOperations: number;
  totalInvestment: number;
  lastOperationDate: Date;
  operations: Array<{
    id: string;
    status: string;
    totalAmount: number;
    startedAt: Date;
    units: Array<{
      unitNumber: string;
      project: {
        name: string;
        slug: string;
      };
    }>;
  }>;
}

interface ClientStats {
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  averageInvestment: number;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function ClientesPage() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  
  const pageSize = 10;
  // TODO: Get organization ID from session/context
  // For now using the DOM Desarrollos organization ID
  const organizationId = "b15320a4-7416-4fc3-b238-0e9d31fe1bf0";

  const loadClients = async () => {
    try {
      setLoading(true);
      const result = await getClientsAction({
        page: currentPage,
        pageSize,
        organizationId,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: search.trim() || undefined,
      });
      
      setClients(result.data);
      setPagination({
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      console.error("Error loading clients:", error);
      setClients([]);
      // Set empty pagination to avoid undefined issues
      setPagination({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClientStats = async () => {
    try {
      const stats = await getClientStatsAction({ organizationId });
      setClientStats(stats);
    } catch (error) {
      console.error("Error loading client stats:", error);
    }
  };

  useEffect(() => {
    loadClients();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    loadClientStats();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadClients();
  };

  const handleCreateSuccess = () => {
    loadClients();
    loadClientStats();
  };

  const handleResendEmail = async (clientId: string, clientName: string) => {
    try {
      setResendingEmail(clientId);

      await resendClientWelcomeEmailAction({
        userId: clientId,
        organizationId,
      });

      toast.success(`Email reenviado exitosamente a ${clientName}`);
    } catch (error) {
      console.error("Error resending email:", error);
      toast.error(error instanceof Error ? error.message : "Error al reenviar email");
    } finally {
      setResendingEmail(null);
    }
  };

  const getStatusColor = (client: ClientData) => {
    if (client.activeOperations > 0) {
      return "text-blue-600 bg-blue-50";
    } else if (client.completedOperations > 0) {
      return "text-green-600 bg-green-50";
    } else {
      return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusText = (client: ClientData) => {
    if (client.activeOperations > 0) {
      return "Activo";
    } else if (client.completedOperations > 0) {
      return "Completado";
    } else {
      return "Inactivo";
    }
  };

  const getMainProject = (client: ClientData) => {
    if (client.operations.length === 0) return "Sin proyectos";
    const lastOperation = client.operations[0];
    return lastOperation.units[0]?.project.name || "Sin proyecto";
  };

  const getMainUnit = (client: ClientData) => {
    if (client.operations.length === 0) return "Sin unidades";
    const lastOperation = client.operations[0];
    return lastOperation.units[0]?.unitNumber || "Sin unidad";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-UY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading && clients.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando clientes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {clientStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <UsersIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Clientes</p>
                  <p className="text-2xl font-semibold">{clientStats.totalClients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUpIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Clientes Activos</p>
                  <p className="text-2xl font-semibold">{clientStats.activeClients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <DollarSignIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-semibold">{formatCurrency(clientStats.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <DollarSignIcon className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Inversión Promedio</p>
                  <p className="text-2xl font-semibold">{formatCurrency(clientStats.averageInvestment)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Total: {pagination.total} cliente{pagination.total !== 1 ? "s" : ""}
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Crear Cliente
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </form>
            
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="completed">Completados</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="overflow-x-auto rounded-xl">
            <div className="w-full overflow-hidden rounded-xl">
              <div className="grid grid-cols-8 rounded-xl bg-[#E8EEFF]">
                <div className="w-full px-4 py-3 text-left font-medium first:rounded-tl-xl">
                  Cliente
                </div>
                <div className="px-4 py-3 text-center font-medium">
                  <div className="flex items-center justify-center gap-1">
                    <MailIcon className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                </div>
                <div className="px-4 py-3 text-center font-medium">
                  <div className="flex items-center justify-center gap-1">
                    <BuildingIcon className="h-4 w-4" />
                    <span>Proyecto</span>
                  </div>
                </div>
                <div className="px-4 py-3 text-center font-medium">Unidad</div>
                <div className="px-4 py-3 text-center font-medium">Estado</div>
                <div className="px-4 py-3 text-center font-medium">
                  Inversión
                </div>
                <div className="px-4 py-3 text-center font-medium">
                  Fecha
                </div>
                <div className="px-4 py-3 text-center font-medium last:rounded-tr-xl">
                  Acciones
                </div>
              </div>
              <div className="space-y-2">
                {clients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <UsersIcon className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clientes</h3>
                    <p className="text-gray-500 text-center max-w-sm">
                      {search || statusFilter !== "all"
                        ? "No se encontraron clientes con los filtros aplicados."
                        : "Aún no hay clientes registrados en esta organización."
                      }
                    </p>
                    {search === "" && statusFilter === "all" && (
                      <Button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 flex items-center gap-2"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Crear primer cliente
                      </Button>
                    )}
                  </div>
                ) : (
                  clients.map((client) => (
                    <div
                      key={client.id}
                      className={`grid grid-cols-8 rounded-lg border border-t border-transparent transition-colors hover:bg-gray-50`}
                    >
                      {/* Client Name */}
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ChevronRightIcon className="h-5 w-5 text-[#C6C6C6]" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {client.firstName} {client.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {client.phone || "Sin teléfono"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="px-4 py-3">
                        <div className="truncate text-sm text-gray-600">
                          {client.email}
                        </div>
                      </div>

                      {/* Project */}
                      <div className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-gray-700">
                          {getMainProject(client)}
                        </span>
                      </div>

                      {/* Unit */}
                      <div className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-700">
                          {getMainUnit(client)}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(client)}`}
                        >
                          {getStatusText(client)}
                        </span>
                      </div>

                      {/* Total Investment */}
                      <div className="px-4 py-3 text-center">
                        <span className="text-sm font-semibold text-gray-700">
                          {formatCurrency(client.totalInvestment)}
                        </span>
                      </div>

                      {/* Last Operation Date */}
                      <div className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-600">
                          {formatDate(client.lastOperationDate.toISOString())}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/dashboard/clients/${client.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Ver
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResendEmail(client.id, `${client.firstName} ${client.lastName}`);
                            }}
                            disabled={resendingEmail === client.id}
                            className="h-7 px-2"
                          >
                            {resendingEmail === client.id ? (
                              "Enviando..."
                            ) : (
                              <>
                                <Send className="h-3 w-3 mr-1" />
                                Reenviar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Mostrando {(pagination.page - 1) * pagination.pageSize + 1} a{" "}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total} clientes
              </div>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Client Modal */}
      <CreateClientOnlyModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        organizationId={organizationId}
        createdBy={user?.id || organizationId}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
