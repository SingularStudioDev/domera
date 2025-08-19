'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  ArrowLeftIcon,
  UserIcon,
  CalendarIcon,
  CreditCardIcon,
  MapPinIcon,
  HomeIcon,
  BedIcon,
  CarIcon,
  StoreIcon,
} from 'lucide-react';
import Link from 'next/link';

// Mock data for specific project
const projectDetails = {
  1: {
    name: 'Torres del Río',
    location: 'Pocitos, Montevideo',
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
      commercial: 3,
    },
    buyers: [
      {
        id: 1,
        name: 'María González',
        email: 'maria.gonzalez@email.com',
        unit: '2B - Piso 8',
        unitType: '2 dormitorios',
        apartments: 1,
        garages: 1,
        purchaseDate: '2024-03-15',
        paymentMethod: 'Financiamiento',
        price: 145000,
        status: 'Confirmado',
        currentStage: 'Documentación',
        stageProgress: 75,
      },
      {
        id: 2,
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@email.com',
        unit: '3A - Piso 12',
        unitType: '3 dormitorios',
        apartments: 1,
        garages: 2,
        purchaseDate: '2024-03-18',
        paymentMethod: 'Contado',
        price: 185000,
        status: 'En proceso',
        currentStage: 'Firma',
        stageProgress: 45,
      },
      {
        id: 3,
        name: 'Ana Silva',
        email: 'ana.silva@email.com',
        unit: '1C - Piso 4',
        unitType: '1 dormitorio',
        apartments: 1,
        garages: 0,
        purchaseDate: '2024-03-20',
        paymentMethod: 'Financiamiento',
        price: 95000,
        status: 'Confirmado',
        currentStage: 'Entrega',
        stageProgress: 90,
      },
      {
        id: 4,
        name: 'Roberto Méndez',
        email: 'roberto.mendez@email.com',
        unit: 'Studio - Piso 6',
        unitType: 'Studio',
        apartments: 1,
        garages: 1,
        purchaseDate: '2024-03-22',
        paymentMethod: 'Contado',
        price: 75000,
        status: 'Pendiente',
        currentStage: 'Reserva',
        stageProgress: 25,
      },
      {
        id: 5,
        name: 'Lucía Fernández',
        email: 'lucia.fernandez@email.com',
        unit: '2A - Piso 10',
        unitType: '2 dormitorios',
        apartments: 1,
        garages: 1,
        purchaseDate: '2024-03-25',
        paymentMethod: 'Financiamiento',
        price: 155000,
        status: 'Confirmado',
        currentStage: 'Construcción',
        stageProgress: 60,
      },
    ],
  },
};

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
];

export default function SalesDetailPage() {
  const params = useParams();
  const salesId = Number(params.salesId);
  const project = projectDetails[salesId as keyof typeof projectDetails];

  if (!project) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Proyecto no encontrado</p>
      </div>
    );
  }

  // Prepare data for percentage progress indicators
  const progressData = [
    {
      name: 'Studio',
      sold: project.sales.studios,
      total: 15,
      percentage: (project.sales.studios / 15) * 100,
      icon: HomeIcon,
    },
    {
      name: '1 Dormitorio',
      sold: project.sales.oneBedroom,
      total: 12,
      percentage: (project.sales.oneBedroom / 12) * 100,
      icon: BedIcon,
    },
    {
      name: '2 Dormitorios',
      sold: project.sales.twoBedroom,
      total: 20,
      percentage: (project.sales.twoBedroom / 20) * 100,
      icon: BedIcon,
    },
    {
      name: '3 Dormitorios',
      sold: project.sales.threeBedroom,
      total: 10,
      percentage: (project.sales.threeBedroom / 10) * 100,
      icon: BedIcon,
    },
    {
      name: 'Parking',
      sold: project.sales.parking,
      total: 30,
      percentage: (project.sales.parking / 30) * 100,
      icon: CarIcon,
    },
    {
      name: 'Comercial',
      sold: project.sales.commercial,
      total: 5,
      percentage: (project.sales.commercial / 5) * 100,
      icon: StoreIcon,
    },
  ];

  const pieChartData = [
    { name: 'Studio', value: project.sales.studios },
    { name: '1 Dormitorio', value: project.sales.oneBedroom },
    { name: '2 Dormitorios', value: project.sales.twoBedroom },
    { name: '3 Dormitorios', value: project.sales.threeBedroom },
    { name: 'Parking', value: project.sales.parking },
    { name: 'Comercial', value: project.sales.commercial },
  ].filter((item) => item.value > 0);

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
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/sales"
          className="text-primaryColor hover:text-primaryColor-hover flex h-10 w-10 items-center justify-center transition-colors"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="dashboard-title">{project.name}</h1>
        </div>
      </div>

      {/* Sales Overview */}
      <div className="grid grid-cols-2 gap-6">
        {/* Progress Indicators */}
        <Card>
          <CardContent className="flex h-full flex-col p-6">
            <CardTitle className="dashboard-subtitle mb-6">
              Unidades vendidas por la plataforma
            </CardTitle>
            <div className="mb-6 flex w-full items-center justify-start gap-20">
              <div>
                <p className="text-gray-400">Unidades</p>
                <h3 className="mb-2 text-3xl font-bold text-gray-900">
                  112/142
                </h3>
              </div>

              <div>
                <p className="text-gray-400">Ingresos</p>
                <h3 className="mb-2 text-3xl font-bold text-gray-900">
                  USD ${project.totalRevenue.toLocaleString()}
                </h3>
              </div>
            </div>

            <div className="flex flex-1 items-end">
              <div className="grid w-full grid-cols-6 gap-4">
                {progressData.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={index}
                      className="flex h-full flex-col items-center justify-end"
                    >
                      <div className="relative h-32 w-6 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="absolute bottom-0 w-full rounded-full bg-[#2563eb] transition-all duration-300"
                          style={{
                            height: `${Math.min(item.percentage, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="mt-3">
                        <IconComponent className="h-6 w-6 text-gray-600" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardContent className="p-6">
            <CardTitle className="dashboard-subtitle">
              Ventas por tipología
            </CardTitle>
            <div className="flex items-center gap-8">
              {/* Donut Chart */}
              <div className="relative flex-1">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      innerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center percentage */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {project.soldPercentage}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-2">
                {pieChartData.map((entry, index) => {
                  const totalSales = pieChartData.reduce(
                    (sum, item) => sum + item.value,
                    0
                  );
                  const percentage = ((entry.value / totalSales) * 100).toFixed(
                    1
                  );
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span className="text-sm text-gray-700">
                        {entry.name} ({percentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buyers Table */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto rounded-xl">
            <div className="w-full overflow-hidden rounded-xl">
              <div className="grid grid-cols-5 rounded-xl bg-[#E8EEFF]">
                <div className="px-4 py-3 font-medium first:rounded-tl-xl">
                  Cliente
                </div>
                <div className="px-4 py-3 font-medium">Tipología</div>
                <div className="px-4 py-3 font-medium">Fecha Iniciación</div>
                <div className="px-4 py-3 font-medium">Método Pago</div>
                <div className="px-4 py-3 font-medium last:rounded-tr-xl">
                  Progreso
                </div>
              </div>
              <div className="space-y-2 pt-2">
                {project.buyers.map((buyer) => (
                  <div
                    key={buyer.id}
                    className="grid grid-cols-5 rounded-lg border border-t border-transparent hover:border-[#0004FF]"
                  >
                    {/* Cliente */}
                    <div className="px-4 py-3">
                      <span className="font-medium text-gray-900">
                        {buyer.name}
                      </span>
                    </div>

                    {/* Tipología */}
                    <div className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <HomeIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {buyer.apartments}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CarIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {buyer.garages}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Fecha Iniciación */}
                    <div className="px-4 py-3">
                      <span className="text-gray-700">
                        {buyer.purchaseDate}
                      </span>
                    </div>

                    {/* Método Pago */}
                    <div className="px-4 py-3">
                      <span className="text-gray-700">
                        {buyer.paymentMethod}
                      </span>
                    </div>

                    {/* Progreso */}
                    <div className="px-4 py-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            {buyer.currentStage}
                          </span>
                          <span className="text-sm text-gray-500">
                            {buyer.stageProgress}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-[#2563eb] transition-all duration-300"
                            style={{ width: `${buyer.stageProgress}%` }}
                          ></div>
                        </div>
                      </div>
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
