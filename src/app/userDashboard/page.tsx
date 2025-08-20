'use client';

import { useState } from 'react';
import {
  BuildingIcon,
  MapPinIcon,
  BedIcon,
  FileTextIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CalendarIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  XCircleIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import Footer from '@/components/Footer';
import Header from '@/components/header/Header';

// Mock data for user properties
const mockUserProperties = [
  {
    id: 1,
    projectName: 'Torres del Río',
    unit: '2B - Piso 8',
    unitType: '2 dormitorios',
    location: 'Pocitos, Montevideo',
    purchaseDate: '2024-03-15',
    price: 145000,
    status: 'En proceso',
    additionalProperties: [
      { type: 'Cochera', identifier: 'G-12', price: 15000 },
    ],
    documents: [
      {
        name: 'Contrato de Reserva',
        status: 'Completado',
        dueDate: '2024-03-15',
        uploadDate: '2024-03-15',
      },
      {
        name: 'Boleto de Compraventa',
        status: 'Pendiente',
        dueDate: '2024-04-15',
        uploadDate: null,
      },
      {
        name: 'Escritura',
        status: 'No iniciado',
        dueDate: '2024-06-15',
        uploadDate: null,
      },
      {
        name: 'Comprobante de Pago Seña',
        status: 'Completado',
        dueDate: '2024-03-15',
        uploadDate: '2024-03-15',
      },
    ],
  },
  {
    id: 2,
    projectName: 'Urban Living Cordón',
    unit: '1A - Piso 3',
    unitType: '1 dormitorio',
    location: 'Cordón, Montevideo',
    purchaseDate: '2024-02-20',
    price: 95000,
    status: 'Confirmado',
    additionalProperties: [],
    documents: [
      {
        name: 'Contrato de Reserva',
        status: 'Completado',
        dueDate: '2024-02-20',
        uploadDate: '2024-02-20',
      },
      {
        name: 'Boleto de Compraventa',
        status: 'Completado',
        dueDate: '2024-03-20',
        uploadDate: '2024-03-18',
      },
      {
        name: 'Escritura',
        status: 'Completado',
        dueDate: '2024-05-20',
        uploadDate: '2024-05-15',
      },
      {
        name: 'Comprobante de Pago Final',
        status: 'Completado',
        dueDate: '2024-05-20',
        uploadDate: '2024-05-15',
      },
    ],
  },
  {
    id: 3,
    projectName: 'Residencial Pocitos',
    unit: '3C - Piso 12',
    unitType: '3 dormitorios',
    location: 'Pocitos, Montevideo',
    purchaseDate: '2024-01-10',
    price: 185000,
    status: 'Confirmado',
    additionalProperties: [
      { type: 'Cochera', identifier: 'G-8', price: 15000 },
      { type: 'Bodega', identifier: 'B-15', price: 8000 },
    ],
    documents: [
      {
        name: 'Contrato de Reserva',
        status: 'Completado',
        dueDate: '2024-01-10',
        uploadDate: '2024-01-10',
      },
      {
        name: 'Boleto de Compraventa',
        status: 'Completado',
        dueDate: '2024-02-10',
        uploadDate: '2024-02-08',
      },
      {
        name: 'Escritura',
        status: 'Completado',
        dueDate: '2024-04-10',
        uploadDate: '2024-04-05',
      },
      {
        name: 'Comprobante de Pago Final',
        status: 'Completado',
        dueDate: '2024-04-10',
        uploadDate: '2024-04-05',
      },
    ],
  },
];

export default function UserDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const pageSize = 10;

  // For mockup, we'll use static data
  const properties = mockUserProperties;
  const totalPages = Math.ceil(properties.length / pageSize);
  const total = properties.length;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleRowExpansion = (propertyId: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(propertyId)) {
      newExpandedRows.delete(propertyId);
    } else {
      newExpandedRows.add(propertyId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmado':
        return 'text-green-600 bg-green-50';
      case 'En proceso':
        return 'text-yellow-600 bg-yellow-50';
      case 'Pendiente':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'Completado':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'Pendiente':
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      case 'Vencido':
        return <AlertCircleIcon className="h-4 w-4 text-red-600" />;
      case 'No iniciado':
        return <XCircleIcon className="h-4 w-4 text-gray-400" />;
      default:
        return <FileTextIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'Completado':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'Pendiente':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'Vencido':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'No iniciado':
        return 'text-gray-700 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-32">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Compras</h1>
            </div>

            {/* Properties Table */}
            <Card className="w-full">
              <CardContent className="p-6">
                <div className="overflow-x-auto rounded-xl">
                  <div className="w-full overflow-hidden rounded-xl">
                    <div className="grid grid-cols-6 rounded-xl bg-[#E8EEFF]">
                      <div className="w-full px-4 py-3 text-left font-medium first:rounded-tl-xl">
                        Propiedad
                      </div>
                      <div className="px-4 py-3 text-center font-medium">
                        Tipo
                      </div>
                      <div className="px-4 py-3 text-center font-medium">
                        Ubicación
                      </div>
                      <div className="px-4 py-3 text-center font-medium">
                        Fecha Compra
                      </div>
                      <div className="px-4 py-3 text-center font-medium">
                        Precio
                      </div>
                      <div className="px-4 py-3 text-center font-medium last:rounded-tr-xl">
                        Estado
                      </div>
                    </div>
                    <div className="space-y-2">
                      {properties.map((property) => (
                        <div key={property.id} className="space-y-0">
                          {/* Main Property Row */}
                          <div
                            className={`grid cursor-pointer grid-cols-6 rounded-lg border border-t border-transparent transition-colors hover:border-[#0004FF] hover:bg-blue-50`}
                            onClick={() => toggleRowExpansion(property.id)}
                          >
                            {/* Property Info */}
                            <div className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {expandedRows.has(property.id) ? (
                                  <ChevronDownIcon className="h-5 w-5 text-[#C6C6C6]" />
                                ) : (
                                  <ChevronRightIcon className="h-5 w-5 text-[#C6C6C6]" />
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <BuildingIcon className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium text-gray-900">
                                      {property.projectName}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    {property.unit}
                                  </p>
                                  {property.additionalProperties.length > 0 && (
                                    <div className="mt-1 flex items-center gap-1">
                                      {property.additionalProperties.map(
                                        (addon, index) => (
                                          <span
                                            key={index}
                                            className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
                                          >
                                            {addon.type} {addon.identifier}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Unit Type */}
                            <div className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <BedIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-700">
                                  {property.unitType}
                                </span>
                              </div>
                            </div>

                            {/* Location */}
                            <div className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <MapPinIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-700">
                                  {property.location}
                                </span>
                              </div>
                            </div>

                            {/* Purchase Date */}
                            <div className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <CalendarIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-700">
                                  {property.purchaseDate}
                                </span>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <CreditCardIcon className="h-4 w-4 text-gray-400" />
                                <span className="font-semibold text-gray-900">
                                  USD ${property.price.toLocaleString()}
                                </span>
                              </div>
                              {property.additionalProperties.length > 0 && (
                                <div className="mt-1 text-xs text-gray-500">
                                  + USD $
                                  {property.additionalProperties
                                    .reduce(
                                      (sum, addon) => sum + addon.price,
                                      0
                                    )
                                    .toLocaleString()}
                                </div>
                              )}
                            </div>

                            {/* Status */}
                            <div className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(property.status)}`}
                              >
                                {property.status}
                              </span>
                            </div>
                          </div>

                          {/* Expanded Document Status Table */}
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              expandedRows.has(property.id)
                                ? 'max-h-96 opacity-100'
                                : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className="rounded-b-lg border-r border-b border-l border-gray-200 bg-gray-50">
                              <div className="p-4">
                                <h4 className="mb-4 flex items-center gap-2 font-medium text-gray-900">
                                  <FileTextIcon className="h-4 w-4" />
                                  Estado de Documentos
                                </h4>

                                {/* Document Table */}
                                <div className="overflow-hidden rounded-lg border bg-white">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="border-b bg-[#E8EEFF]">
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-700 uppercase">
                                          Documento
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-700 uppercase">
                                          Estado
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-700 uppercase">
                                          Vencimiento
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-700 uppercase">
                                          Fecha Subida
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {property.documents.map((doc, index) => (
                                        <tr
                                          key={index}
                                          className="transition-colors duration-150 hover:bg-gray-50"
                                          style={{
                                            animation: expandedRows.has(
                                              property.id
                                            )
                                              ? `slideInUp 0.3s ease-out ${index * 0.1}s both`
                                              : 'none',
                                          }}
                                        >
                                          <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                              {getDocumentStatusIcon(
                                                doc.status
                                              )}
                                              <span className="font-medium text-gray-900">
                                                {doc.name}
                                              </span>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3">
                                            <span
                                              className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${getDocumentStatusColor(doc.status)}`}
                                            >
                                              {doc.status}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 text-sm text-gray-600">
                                            {doc.dueDate}
                                          </td>
                                          <td className="px-4 py-3 text-sm text-gray-600">
                                            {doc.uploadDate || '-'}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Mostrando {(currentPage - 1) * pageSize + 1} a{' '}
                      {Math.min(currentPage * pageSize, total)} de {total}{' '}
                      propiedades
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
        </div>
      </div>
      <Footer />
    </>
  );
}
