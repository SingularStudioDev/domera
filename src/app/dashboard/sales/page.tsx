'use client';

import { useState, useEffect } from 'react';
import { BuildingIcon, MapPinIcon, BedIcon, CarIcon, ShoppingCartIcon, ChevronRightIcon } from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import Link from 'next/link';

// Mock data for the table
const mockProjects = [
  {
    id: 1,
    name: "Torres del Río",
    soldPercentage: 85,
    sales: {
      studios: 12,
      oneBedroom: 8,
      twoBedroom: 15,
      threeBedroom: 6,
      parking: 23,
      commercial: 3
    }
  },
  {
    id: 2,
    name: "Urban Living Cordón",
    soldPercentage: 42,
    sales: {
      studios: 5,
      oneBedroom: 12,
      twoBedroom: 8,
      threeBedroom: 2,
      parking: 18,
      commercial: 1
    }
  },
  {
    id: 3,
    name: "Residencial Pocitos",
    soldPercentage: 73,
    sales: {
      studios: 0,
      oneBedroom: 6,
      twoBedroom: 14,
      threeBedroom: 9,
      parking: 20,
      commercial: 0
    }
  },
  {
    id: 4,
    name: "Vista al Puerto",
    soldPercentage: 28,
    sales: {
      studios: 3,
      oneBedroom: 4,
      twoBedroom: 2,
      threeBedroom: 1,
      parking: 7,
      commercial: 2
    }
  },
  {
    id: 5,
    name: "Carrasco Premium",
    soldPercentage: 91,
    sales: {
      studios: 0,
      oneBedroom: 0,
      twoBedroom: 8,
      threeBedroom: 12,
      parking: 15,
      commercial: 0
    }
  }
];

export default function SalesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // For mockup, we'll use static data
  const projects = mockProjects;
  const totalPages = Math.ceil(projects.length / pageSize);
  const total = projects.length;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    if (percentage >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Ventas por proyecto</h1>
        <div className="text-sm text-gray-500">
          Total: {total} proyecto{total !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Projects Sales Table */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="overflow-x-auto rounded-xl">
            <div className="w-full overflow-hidden rounded-xl">
              <div className="bg-[#E8EEFF] grid grid-cols-8 rounded-xl">
                <div className="px-4 py-3 w-full text-left font-medium first:rounded-tl-xl">
                  Proyecto
                </div>
                <div className="px-4 py-3 text-center font-medium">
                  % Venta
                </div>
                <div className="px-4 py-3 text-center font-medium">
                  <div className="flex items-center justify-center gap-1">
                    <BedIcon className="h-4 w-4" />
                    <span>0</span>
                  </div>
                </div>
                <div className="px-4 py-3 text-center font-medium">
                  <div className="flex items-center justify-center gap-1">
                    <BedIcon className="h-4 w-4" />
                    <span>1</span>
                  </div>
                </div>
                <div className="px-4 py-3 text-center font-medium">
                  <div className="flex items-center justify-center gap-1">
                    <BedIcon className="h-4 w-4" />
                    <span>2</span>
                  </div>
                </div>
                <div className="px-4 py-3 text-center font-medium">
                  <div className="flex items-center justify-center gap-1">
                    <BedIcon className="h-4 w-4" />
                    <span>3</span>
                  </div>
                </div>
                <div className="px-4 py-3 text-center font-medium">
                  <div className="flex items-center justify-center gap-1">
                    <CarIcon className="h-4 w-4" />
                  </div>
                </div>
                <div className="px-4 py-3 text-center font-medium last:rounded-tr-xl">
                  <div className="flex items-center justify-center gap-1">
                    <ShoppingCartIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>
              <div className='space-y-2'>
                {projects.map((project, index) => (
                  <Link 
                    key={project.id} 
                    href={`/dashboard/sales/${project.id}`}
                    className={`border border-t border-transparent rounded-lg hover:border-[#0004FF] hover:bg-blue-50 transition-colors grid grid-cols-8 cursor-pointer`}
                  >
                    {/* Project Name */}
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-3">
                          <ChevronRightIcon className="h-5 w-5 text-[#C6C6C6]" />
                        <span className="font-medium text-gray-900">
                          {project.name}
                        </span>
                      </div>
                    </div>

                    {/* Sales Percentage */}
                    <div className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getPercentageColor(project.soldPercentage)}`}>
                        {project.soldPercentage}%
                      </span>
                    </div>

                    {/* Studio Sales (0 bedrooms) */}
                    <div className="px-4 py-3 text-center">
                      <span className="text-lg font-semibold text-gray-700">
                        {project.sales.studios}
                      </span>
                    </div>

                    {/* 1 Bedroom Sales */}
                    <div className="px-4 py-3 text-center">
                      <span className="text-lg font-semibold text-gray-700">
                        {project.sales.oneBedroom}
                      </span>
                    </div>

                    {/* 2 Bedroom Sales */}
                    <div className="px-4 py-3 text-center">
                      <span className="text-lg font-semibold text-gray-700">
                        {project.sales.twoBedroom}
                      </span>
                    </div>

                    {/* 3 Bedroom Sales */}
                    <div className="px-4 py-3 text-center">
                      <span className="text-lg font-semibold text-gray-700">
                        {project.sales.threeBedroom}
                      </span>
                    </div>

                    {/* Parking Sales */}
                    <div className="px-4 py-3 text-center">
                      <span className="text-lg font-semibold text-gray-700">
                        {project.sales.parking}
                      </span>
                    </div>

                    {/* Commercial Sales */}
                    <div className="px-4 py-3 text-center">
                      <span className="text-lg font-semibold text-gray-700">
                        {project.sales.commercial}
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
                Mostrando {(currentPage - 1) * pageSize + 1} a{' '}
                {Math.min(currentPage * pageSize, total)} de {total} proyectos
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
