"use client";

import { useState } from "react";
import Link from "next/link";

import { BuildingIcon, ChevronRightIcon, MailIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";

// Mock data for the clients table
const mockClients = [
  {
    id: 1,
    name: "María González",
    email: "maria.gonzalez@email.com",
    phone: "+598 99 123 456",
    project: "Torres del Río",
    unitType: "2 dormitorios",
    status: "Activo",
    operationDate: "2024-12-15",
    totalInvestment: 180000,
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@email.com",
    phone: "+598 99 234 567",
    project: "Urban Living Cordón",
    unitType: "1 dormitorio",
    status: "En proceso",
    operationDate: "2025-01-10",
    totalInvestment: 120000,
  },
  {
    id: 3,
    name: "Ana Martín",
    email: "ana.martin@email.com",
    phone: "+598 99 345 678",
    project: "Residencial Pocitos",
    unitType: "3 dormitorios",
    status: "Completado",
    operationDate: "2024-11-20",
    totalInvestment: 250000,
  },
  {
    id: 4,
    name: "Roberto Silva",
    email: "roberto.silva@email.com",
    phone: "+598 99 456 789",
    project: "Vista al Puerto",
    unitType: "Studio",
    status: "Activo",
    operationDate: "2025-02-05",
    totalInvestment: 95000,
  },
  {
    id: 5,
    name: "Laura Fernández",
    email: "laura.fernandez@email.com",
    phone: "+598 99 567 890",
    project: "Carrasco Premium",
    unitType: "3 dormitorios",
    status: "En proceso",
    operationDate: "2024-12-28",
    totalInvestment: 320000,
  },
  {
    id: 6,
    name: "Diego Pérez",
    email: "diego.perez@email.com",
    phone: "+598 99 678 901",
    project: "Torres del Río",
    unitType: "1 dormitorio",
    status: "Activo",
    operationDate: "2025-01-18",
    totalInvestment: 140000,
  },
];

export default function ClientesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // For mockup, we'll use static data
  const clients = mockClients;
  const totalPages = Math.ceil(clients.length / pageSize);
  const total = clients.length;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completado":
        return "text-green-600 bg-green-50";
      case "activo":
        return "text-primaryColor bg-blue-50";
      case "en proceso":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <div className="text-sm text-gray-500">
          Total: {total} cliente{total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Clients Table */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="overflow-x-auto rounded-xl">
            <div className="w-full overflow-hidden rounded-xl">
              <div className="grid grid-cols-7 rounded-xl bg-[#E8EEFF]">
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
                <div className="px-4 py-3 text-center font-medium last:rounded-tr-xl">
                  Fecha
                </div>
              </div>
              <div className="space-y-2">
                {clients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/dashboard/clients/${client.id}`}
                    className={`grid cursor-pointer grid-cols-7 rounded-lg border border-t border-transparent transition-colors hover:border-[#0004FF] hover:bg-blue-50`}
                  >
                    {/* Client Name */}
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ChevronRightIcon className="h-5 w-5 text-[#C6C6C6]" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {client.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {client.phone}
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
                        {client.project}
                      </span>
                    </div>

                    {/* Unit Type */}
                    <div className="px-4 py-3 text-center">
                      <span className="text-sm text-gray-700">
                        {client.unitType}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(client.status)}`}
                      >
                        {client.status}
                      </span>
                    </div>

                    {/* Total Investment */}
                    <div className="px-4 py-3 text-center">
                      <span className="text-sm font-semibold text-gray-700">
                        {formatCurrency(client.totalInvestment)}
                      </span>
                    </div>

                    {/* Operation Date */}
                    <div className="px-4 py-3 text-center">
                      <span className="text-sm text-gray-600">
                        {formatDate(client.operationDate)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
                {Math.min(currentPage * pageSize, total)} de {total} clientes
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
