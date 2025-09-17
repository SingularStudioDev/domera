"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import {
  SearchIcon,
  FilterIcon,
  CreditCardIcon,
  DollarSignIcon,
  TrendingUpIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PlusIcon,
  UserIcon,
  BuildingIcon,
  MailIcon,
  ChevronRightIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { getClientsAction, getClientStatsAction } from "@/lib/actions/clients";
import { CreateClientModal } from "@/components/modals/CreateClientModal";
import { useAuth } from "@/hooks/useAuth";

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

export default function PurchasesPage() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [purchaseClients, setPurchaseClients] = useState<ClientData[]>([]);
  const [purchaseStats, setPurchaseStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  const loadPurchaseClients = async () => {
    try {
      setLoading(true);
      const result = await getClientsAction({
        page: currentPage,
        pageSize,
        organizationId,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: search.trim() || undefined,
      });

      // Filter only clients with purchase operations
      const purchaseOnlyClients = result.data.filter((client: ClientData) =>
        client.operations.some(operation =>
          // Check if any operation is a purchase type (not reservation)
          // For now, we'll identify purchases by having payment schedules or certain statuses
          operation.status === "completed" ||
          operation.status === "in_progress" ||
          operation.status === "pending_payment"
        )
      );

      setPurchaseClients(purchaseOnlyClients);
      setPagination({
        page: result.page,
        pageSize: result.pageSize,
        total: purchaseOnlyClients.length,
        totalPages: Math.ceil(purchaseOnlyClients.length / result.pageSize),
      });
    } catch (error) {
      console.error("Error loading purchase clients:", error);
      setPurchaseClients([]);
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

  const loadPurchaseStats = async () => {
    try {
      const stats = await getClientStatsAction({ organizationId });
      // For now showing all stats, but in real implementation
      // we would filter only purchase-type operations
      setPurchaseStats({
        ...stats,
        totalClients: Math.floor(stats.totalClients * 0.7), // Mock: ~70% are purchases
        activeClients: Math.floor(stats.activeClients * 0.6), // Mock: ~60% active purchases
      });
    } catch (error) {
      console.error("Error loading purchase stats:", error);
    }
  };

  useEffect(() => {
    loadPurchaseClients();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    loadPurchaseStats();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPurchaseClients();
  };

  const handleCreateSuccess = () => {
    loadPurchaseClients();
    loadPurchaseStats();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "in_progress":
      case "pending_payment":
        return "text-blue-600 bg-blue-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completada";
      case "in_progress":
        return "En Progreso";
      case "pending_payment":
        return "Pendiente Pago";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "in_progress":
      case "pending_payment":
        return <ClockIcon className="h-4 w-4" />;
      case "cancelled":
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
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

  if (loading && purchaseClients.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando ventas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {purchaseStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CreditCardIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Ventas</p>
                  <p className="text-2xl font-semibold">{purchaseStats.totalClients}</p>
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
                  <p className="text-sm text-gray-600">Ventas Activas</p>
                  <p className="text-2xl font-semibold">{purchaseStats.activeClients}</p>
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
                  <p className="text-2xl font-semibold">{formatCurrency(purchaseStats.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ticket Promedio</p>
                  <p className="text-2xl font-semibold">{formatCurrency(purchaseStats.averageInvestment)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Total: {pagination.total} venta{pagination.total !== 1 ? "s" : ""}
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Nueva Venta
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
                  placeholder="Buscar por cliente, proyecto..."
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
                <option value="active">Activas</option>
                <option value="completed">Completadas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchases Table */}
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
                  Monto Total
                </div>
                <div className="px-4 py-3 text-center font-medium">
                  Cuotas
                </div>
                <div className="px-4 py-3 text-center font-medium last:rounded-tr-xl">
                  Fecha
                </div>
              </div>
              <div className="space-y-2">
                {purchaseClients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <CreditCardIcon className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ventas</h3>
                    <p className="text-gray-500 text-center max-w-sm">
                      {search || statusFilter !== "all"
                        ? "No se encontraron ventas con los filtros aplicados."
                        : "Aún no hay ventas registradas en esta organización."
                      }
                    </p>
                    {search === "" && statusFilter === "all" && (
                      <Button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 flex items-center gap-2"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Crear primera venta
                      </Button>
                    )}
                  </div>
                ) : (
                  purchaseClients.map((client) => (
                    <Link
                      key={client.id}
                      href={`/dashboard/purchases/${client.id}`}
                      className={`grid cursor-pointer grid-cols-8 rounded-lg border border-t border-transparent transition-colors hover:border-[#0004FF] hover:bg-blue-50`}
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
                        {client.operations[0] && (
                          <Badge className={getStatusColor(client.operations[0].status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(client.operations[0].status)}
                              {getStatusText(client.operations[0].status)}
                            </div>
                          </Badge>
                        )}
                      </div>

                      {/* Total Amount */}
                      <div className="px-4 py-3 text-center">
                        <span className="text-sm font-semibold text-gray-700">
                          {formatCurrency(client.totalInvestment)}
                        </span>
                      </div>

                      {/* Payment Installments - Mock for now */}
                      <div className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-600">
                          {Math.floor(Math.random() * 24) + 1}/24
                        </span>
                      </div>

                      {/* Last Operation Date */}
                      <div className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-600">
                          {formatDate(client.lastOperationDate.toISOString())}
                        </span>
                      </div>
                    </Link>
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
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total} ventas
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

      {/* Create Purchase Modal */}
      <CreateClientModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        organizationId={organizationId}
        createdBy={user?.id || organizationId}
        onSuccess={handleCreateSuccess}
        defaultOperationType="purchase" // Force purchase type for this page
      />
    </div>
  );
}