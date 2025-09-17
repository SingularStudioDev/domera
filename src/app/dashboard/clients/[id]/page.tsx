"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeftIcon,
  BuildingIcon,
  CalendarIcon,
  CreditCardIcon,
  FileTextIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
  MapPinIcon,
  DollarSignIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getClientDetailsAction } from "@/lib/actions/clients";
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

export default function ClientDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Get organization ID from session/context
  // For now using the DOM Desarrollos organization ID
  const organizationId = "b15320a4-7416-4fc3-b238-0e9d31fe1bf0";

  useEffect(() => {
    const loadClientDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const clientId = params.id as string;
        const result = await getClientDetailsAction({
          clientId,
          organizationId,
        });

        setClient(result);
      } catch (error) {
        console.error("Error loading client details:", error);
        setError(error instanceof Error ? error.message : "Error al cargar cliente");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadClientDetails();
    }
  }, [params.id, organizationId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending_user_acceptance":
        return "bg-yellow-100 text-yellow-800";
      case "initiated":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completada";
      case "pending_user_acceptance":
        return "Pendiente de Aceptación";
      case "initiated":
        return "Iniciada";
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
      case "pending_user_acceptance":
        return <ClockIcon className="h-4 w-4" />;
      case "initiated":
        return <ClockIcon className="h-4 w-4" />;
      case "cancelled":
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("es-UY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/clients"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Volver a clientes
          </Link>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando cliente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/clients"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Volver a clientes
          </Link>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <UserIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar cliente</h3>
            <p className="text-gray-500 mb-4">
              {error || "No se pudo encontrar el cliente solicitado"}
            </p>
            <Button asChild>
              <Link href="/dashboard/clients">Volver a clientes</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/clients"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver a clientes
        </Link>
      </div>

      {/* Client Info Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {client.firstName} {client.lastName}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MailIcon className="h-4 w-4" />
                  {client.email}
                </div>
                {client.phone && (
                  <div className="flex items-center gap-1">
                    <PhoneIcon className="h-4 w-4" />
                    {client.phone}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Inversión Total</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(client.totalInvestment)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileTextIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Operaciones</p>
                <p className="text-2xl font-semibold">{client.totalOperations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Operaciones Activas</p>
                <p className="text-2xl font-semibold">{client.activeOperations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Última Operación</p>
                <p className="text-lg font-semibold">
                  {formatDate(client.lastOperationDate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Operaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {client.operations.length === 0 ? (
            <div className="text-center py-8">
              <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sin operaciones</h3>
              <p className="text-gray-500">Este cliente no tiene operaciones registradas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {client.operations.map((operation) => (
                <div
                  key={operation.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getStatusColor(operation.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(operation.status)}
                            {getStatusText(operation.status)}
                          </div>
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {formatDate(operation.startedAt)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Unidades</div>
                          {operation.units.map((unit, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <BuildingIcon className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{unit.project.name}</span>
                              <span className="text-gray-600">- Unidad {unit.unitNumber}</span>
                            </div>
                          ))}
                        </div>

                        <div>
                          <div className="text-sm text-gray-600 mb-1">Monto Total</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(operation.totalAmount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}