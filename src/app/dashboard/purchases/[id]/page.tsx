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
  AlertCircleIcon,
  TrendingUpIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

interface PaymentInstallment {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: Date;
  status: "pending" | "paid" | "overdue" | "cancelled";
  paidDate?: Date;
  paidAmount?: number;
}

export default function PurchaseDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [client, setClient] = useState<ClientData | null>(null);
  const [payments, setPayments] = useState<PaymentInstallment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Get organization ID from session/context
  const organizationId = "b15320a4-7416-4fc3-b238-0e9d31fe1bf0";

  useEffect(() => {
    const loadPurchaseDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const clientId = params.id as string;
        const result = await getClientDetailsAction({
          clientId,
          organizationId,
        });

        setClient(result);

        // Generate mock payment schedule (in real implementation, fetch from database)
        if (result.operations.length > 0) {
          const operation = result.operations[0];
          const mockPayments: PaymentInstallment[] = [];
          const totalAmount = operation.totalAmount;
          const installments = 24; // Mock: 24 installments
          const monthlyAmount = totalAmount / installments;

          for (let i = 1; i <= installments; i++) {
            const dueDate = new Date(operation.startedAt);
            dueDate.setMonth(dueDate.getMonth() + i - 1);

            const status: PaymentInstallment["status"] =
              i <= 3 ? "paid" :
              i === 4 ? "overdue" :
              i <= 6 ? "pending" : "pending";

            mockPayments.push({
              id: `payment-${i}`,
              installmentNumber: i,
              amount: Math.round(monthlyAmount * 100) / 100,
              dueDate,
              status,
              paidDate: status === "paid" ? new Date(dueDate.getTime() - 86400000) : undefined,
              paidAmount: status === "paid" ? Math.round(monthlyAmount * 100) / 100 : undefined,
            });
          }

          setPayments(mockPayments);
        }
      } catch (error) {
        console.error("Error loading purchase details:", error);
        setError(error instanceof Error ? error.message : "Error al cargar compra");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadPurchaseDetails();
    }
  }, [params.id, organizationId]);

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Pagada";
      case "pending":
        return "Pendiente";
      case "overdue":
        return "Vencida";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "pending":
        return <ClockIcon className="h-4 w-4" />;
      case "overdue":
        return <AlertCircleIcon className="h-4 w-4" />;
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
            href="/dashboard/purchases"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Volver a ventas
          </Link>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando venta...</p>
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
            href="/dashboard/purchases"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Volver a ventas
          </Link>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <CreditCardIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar venta</h3>
            <p className="text-gray-500 mb-4">
              {error || "No se pudo encontrar la venta solicitada"}
            </p>
            <Button asChild>
              <Link href="/dashboard/purchases">Volver a ventas</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const paidPayments = payments.filter(p => p.status === "paid");
  const totalPaid = paidPayments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  const paymentProgress = (totalPaid / client.totalInvestment) * 100;
  const overduePayments = payments.filter(p => p.status === "overdue");
  const nextPayment = payments.find(p => p.status === "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/purchases"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver a ventas
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
            <div className="text-sm text-gray-600">Monto Total</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(client.totalInvestment)}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5" />
            Progreso de Pagos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Pagado: {formatCurrency(totalPaid)}</span>
              <span>Restante: {formatCurrency(client.totalInvestment - totalPaid)}</span>
            </div>
            <Progress value={paymentProgress} className="h-3" />
            <div className="text-center text-sm text-gray-600">
              {Math.round(paymentProgress)}% completado
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cuotas Pagadas</p>
                <p className="text-2xl font-semibold">{paidPayments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircleIcon className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cuotas Vencidas</p>
                <p className="text-2xl font-semibold">{overduePayments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Próximo Vencimiento</p>
                <p className="text-lg font-semibold">
                  {nextPayment ? formatDate(nextPayment.dueDate) : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <DollarSignIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Próxima Cuota</p>
                <p className="text-lg font-semibold">
                  {nextPayment ? formatCurrency(nextPayment.amount) : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Details */}
      {client.operations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BuildingIcon className="h-5 w-5" />
              Detalles de la Propiedad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Proyecto</div>
                <div className="font-medium text-gray-900">
                  {client.operations[0].units[0]?.project.name || "N/A"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Unidad</div>
                <div className="font-medium text-gray-900">
                  {client.operations[0].units[0]?.unitNumber || "N/A"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Fecha de Inicio</div>
                <div className="font-medium text-gray-900">
                  {formatDate(client.operations[0].startedAt)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Estado</div>
                <Badge className="bg-blue-100 text-blue-800">
                  {client.operations[0].status === "completed" ? "Completada" : "En Progreso"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Plan de Pagos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium text-gray-900">
                    Cuota #{payment.installmentNumber}
                  </div>
                  <Badge className={getPaymentStatusColor(payment.status)}>
                    <div className="flex items-center gap-1">
                      {getPaymentStatusIcon(payment.status)}
                      {getPaymentStatusText(payment.status)}
                    </div>
                  </Badge>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <div className="text-gray-600">Vencimiento</div>
                    <div className="font-medium">{formatDate(payment.dueDate)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-600">Monto</div>
                    <div className="font-semibold">{formatCurrency(payment.amount)}</div>
                  </div>
                  {payment.paidDate && (
                    <div className="text-right">
                      <div className="text-gray-600">Fecha de Pago</div>
                      <div className="font-medium text-green-600">
                        {formatDate(payment.paidDate)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}