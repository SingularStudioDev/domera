'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeftIcon, UserIcon, CalendarIcon, CreditCardIcon, MapPinIcon } from 'lucide-react';
import Link from 'next/link';

// Mock data for specific project
const projectDetails = {
  1: {
    name: "Torres del Río",
    location: "Pocitos, Montevideo",
    soldPercentage: 85,
    totalUnits: 67,
    soldUnits: 57,
    totalRevenue: 8500000,
    sales: {
      studios: 12,
      oneBedroom: 8,
      twoBedroom: 15,
      threeBedroom: 6,
      parking: 23,
      commercial: 3
    },
    buyers: [
      {
        id: 1,
        name: "María González",
        email: "maria.gonzalez@email.com",
        unit: "2B - Piso 8",
        unitType: "2 dormitorios",
        purchaseDate: "2024-03-15",
        price: 145000,
        status: "Confirmado"
      },
      {
        id: 2,
        name: "Carlos Rodríguez",
        email: "carlos.rodriguez@email.com",
        unit: "3A - Piso 12",
        unitType: "3 dormitorios",
        purchaseDate: "2024-03-18",
        price: 185000,
        status: "En proceso"
      },
      {
        id: 3,
        name: "Ana Silva",
        email: "ana.silva@email.com",
        unit: "1C - Piso 4",
        unitType: "1 dormitorio",
        purchaseDate: "2024-03-20",
        price: 95000,
        status: "Confirmado"
      },
      {
        id: 4,
        name: "Roberto Méndez",
        email: "roberto.mendez@email.com",
        unit: "Studio - Piso 6",
        unitType: "Studio",
        purchaseDate: "2024-03-22",
        price: 75000,
        status: "Pendiente"
      },
      {
        id: 5,
        name: "Lucía Fernández",
        email: "lucia.fernandez@email.com",
        unit: "2A - Piso 10",
        unitType: "2 dormitorios",
        purchaseDate: "2024-03-25",
        price: 155000,
        status: "Confirmado"
      }
    ]
  }
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function SalesDetailPage() {
  const params = useParams();
  const salesId = Number(params.salesId);
  const project = projectDetails[salesId as keyof typeof projectDetails];

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Proyecto no encontrado</p>
      </div>
    );
  }

  // Prepare data for charts
  const barChartData = [
    { name: 'Studio', ventas: project.sales.studios },
    { name: '1 Dorm', ventas: project.sales.oneBedroom },
    { name: '2 Dorm', ventas: project.sales.twoBedroom },
    { name: '3 Dorm', ventas: project.sales.threeBedroom },
    { name: 'Parking', ventas: project.sales.parking },
    { name: 'Comercial', ventas: project.sales.commercial },
  ];

  const pieChartData = [
    { name: 'Studio', value: project.sales.studios },
    { name: '1 Dormitorio', value: project.sales.oneBedroom },
    { name: '2 Dormitorios', value: project.sales.twoBedroom },
    { name: '3 Dormitorios', value: project.sales.threeBedroom },
    { name: 'Parking', value: project.sales.parking },
    { name: 'Comercial', value: project.sales.commercial },
  ].filter(item => item.value > 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmado':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'En proceso':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Pendiente':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/sales"
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600 flex items-center gap-2">
            <MapPinIcon className="h-4 w-4" />
            {project.location}
          </p>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">% Vendido</p>
                <p className="text-2xl font-bold text-gray-900">{project.soldPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unidades Vendidas</p>
                <p className="text-2xl font-bold text-gray-900">{project.soldUnits}/{project.totalUnits}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Compradores</p>
                <p className="text-2xl font-bold text-gray-900">{project.buyers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">USD ${project.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardContent className="p-6">
            <CardTitle className="text-lg font-semibold mb-4">Ventas por Tipo de Unidad</CardTitle>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ventas" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardContent className="p-6">
            <CardTitle className="text-lg font-semibold mb-4">Distribución de Ventas</CardTitle>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Buyers Table */}
      <Card>
        <CardContent className="p-6">
          <CardTitle className="text-lg font-semibold mb-4">Lista de Compradores</CardTitle>
          <div className="overflow-x-auto rounded-xl">
            <div className="w-full overflow-hidden rounded-xl">
              <div className="bg-[#E8EEFF] grid grid-cols-6 rounded-xl">
                <div className="px-4 py-3 font-medium first:rounded-tl-xl">
                  Comprador
                </div>
                <div className="px-4 py-3 font-medium">
                  Unidad
                </div>
                <div className="px-4 py-3 font-medium">
                  Tipo
                </div>
                <div className="px-4 py-3 font-medium">
                  Fecha de Compra
                </div>
                <div className="px-4 py-3 font-medium">
                  Precio
                </div>
                <div className="px-4 py-3 font-medium last:rounded-tr-xl">
                  Estado
                </div>
              </div>
              <div className="space-y-2">
                {project.buyers.map((buyer) => (
                  <div 
                    key={buyer.id} 
                    className="border border-t border-transparent rounded-lg hover:border-[#0004FF] grid grid-cols-6"
                  >
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{buyer.name}</p>
                          <p className="text-sm text-gray-500">{buyer.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <span className="font-medium text-gray-900">{buyer.unit}</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-gray-700">{buyer.unitType}</span>
                    </div>
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{buyer.purchaseDate}</span>
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CreditCardIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">USD ${buyer.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border ${getStatusColor(buyer.status)}`}>
                        {buyer.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}