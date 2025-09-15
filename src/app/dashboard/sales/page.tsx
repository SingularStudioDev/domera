"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import {
  ArrowDown01Icon,
  BedDoubleIcon,
  CarFrontIcon,
  ChevronRightIcon,
  SearchIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { getProjectsAction } from "@/lib/actions/projects";

export default function SalesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const result = await getProjectsAction({
          page: currentPage,
          pageSize: 100, // Get all projects for the organization
        });

        if (result.success && result.data) {
          setProjects(result.data.data || []);
        } else {
          setError(result.error || "Error cargando proyectos");
        }
      } catch (err) {
        setError("Error inesperado cargando proyectos");
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentPage]);

  // Filter projects based on search term
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredProjects.length / pageSize);
  const total = filteredProjects.length;

  // Get current page projects
  const startIndex = (currentPage - 1) * pageSize;
  const currentPageProjects = filteredProjects.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-50";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-50";
    if (percentage >= 40) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  // Calculate project sales statistics (mock data for now - will be replaced with real operations data)
  const getProjectStats = (project: any) => {
    // TODO: Replace with real operations data
    return {
      soldPercentage: Math.floor(Math.random() * 100),
      sales: {
        studios: Math.floor(Math.random() * 20),
        oneBedroom: Math.floor(Math.random() * 15),
        twoBedroom: Math.floor(Math.random() * 25),
        threeBedroom: Math.floor(Math.random() * 15),
        parking: Math.floor(Math.random() * 30),
        commercial: Math.floor(Math.random() * 5),
      },
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="dashboard-title w-full">Ventas por proyecto</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="dashboard-title w-full">Ventas por proyecto</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="mb-2 text-red-600">❌ {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:underline"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="dashboard-title w-full">Ventas por proyecto</h1>

        <div className="flex w-full items-center justify-end gap-5">
          <div className="text-black">
            {total} proyecto{total !== 1 ? "s" : ""}
          </div>

          {/* Search Input */}
          <div className="relative w-full max-w-xs">
            <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white py-5 pl-10"
            />
          </div>
        </div>
      </div>

      {/* Projects Sales Table */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="overflow-x-auto rounded-xl">
            <div className="w-full overflow-hidden rounded-xl">
              <div className="flex rounded-xl bg-[#E8EEFF]">
                <div className="flex-1 px-4 py-3 text-left font-semibold first:rounded-tl-xl">
                  Proyecto
                </div>
                <div className="flex w-36 cursor-pointer items-center justify-center px-4 py-3 text-center font-semibold">
                  Procentaje
                  <ArrowDown01Icon className="ml-2 h-5 w-5 opacity-30" />
                </div>
                <div className="w-24 cursor-pointer px-4 py-3 text-center font-semibold">
                  <div className="flex items-center justify-center">
                    <span>0</span>
                    <BedDoubleIcon className="h-5 w-5" />
                    <ArrowDown01Icon className="ml-2 h-5 w-5 opacity-30" />
                  </div>
                </div>
                <div className="w-24 cursor-pointer px-4 py-3 text-center font-semibold">
                  <div className="flex items-center justify-center">
                    <span>1</span>
                    <BedDoubleIcon className="h-5 w-5" />
                    <ArrowDown01Icon className="ml-2 h-5 w-5 opacity-30" />
                  </div>
                </div>
                <div className="w-24 cursor-pointer px-4 py-3 text-center font-semibold">
                  <div className="flex items-center justify-center">
                    <span>2</span>
                    <BedDoubleIcon className="h-5 w-5" />
                    <ArrowDown01Icon className="ml-2 h-5 w-5 opacity-30" />
                  </div>
                </div>
                <div className="w-24 cursor-pointer px-4 py-3 text-center font-semibold">
                  <div className="flex items-center justify-center">
                    <span>3</span>
                    <BedDoubleIcon className="h-5 w-5" />
                    <ArrowDown01Icon className="ml-2 h-5 w-5 opacity-30" />
                  </div>
                </div>
                <div className="flex w-24 cursor-pointer items-center justify-center px-4 py-3 text-center font-semibold">
                  <div className="flex items-center justify-center">
                    <CarFrontIcon className="h-5 w-5" />
                    <ArrowDown01Icon className="ml-2 h-5 w-5 opacity-30" />
                  </div>
                </div>
                <div className="w-24 cursor-pointer px-4 py-3 text-center font-semibold last:rounded-tr-xl">
                  <div className="flex items-center justify-center">
                    Local
                    <ArrowDown01Icon className="ml-2 h-5 w-5 opacity-30" />
                  </div>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                {currentPageProjects.map((project) => {
                  const stats = getProjectStats(project);
                  return (
                    <Link
                      key={project.id}
                      href={`/dashboard/sales/${project.id}`}
                      className={`flex cursor-pointer rounded-lg border border-t border-transparent transition-colors hover:border-[#0004FF] hover:bg-blue-50`}
                    >
                      {/* Project Name */}
                      <div className="flex-1 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ChevronRightIcon className="h-5 w-5 text-[#C6C6C6]" />
                          <span className="font-medium text-gray-900">
                            {project.name}
                          </span>
                        </div>
                      </div>

                      {/* Sales Percentage */}
                      <div className="flex w-32 items-center justify-center px-4 py-3 text-center">
                        <span
                          className={`inline-flex w-full items-center justify-center rounded-full px-3 py-1 text-sm font-semibold ${getPercentageColor(stats.soldPercentage)}`}
                        >
                          {stats.soldPercentage}%
                        </span>
                      </div>

                      {/* Studio Sales (0 bedrooms) */}
                      <div className="w-24 px-4 py-3 text-center">
                        <span className="text-lg font-semibold text-gray-700">
                          {stats.sales.studios}
                        </span>
                      </div>

                      {/* 1 Bedroom Sales */}
                      <div className="w-24 px-4 py-3 text-center">
                        <span className="text-lg font-semibold text-gray-700">
                          {stats.sales.oneBedroom}
                        </span>
                      </div>

                      {/* 2 Bedroom Sales */}
                      <div className="w-24 px-4 py-3 text-center">
                        <span className="text-lg font-semibold text-gray-700">
                          {stats.sales.twoBedroom}
                        </span>
                      </div>

                      {/* 3 Bedroom Sales */}
                      <div className="w-24 px-4 py-3 text-center">
                        <span className="text-lg font-semibold text-gray-700">
                          {stats.sales.threeBedroom}
                        </span>
                      </div>

                      {/* Parking Sales */}
                      <div className="w-24 px-4 py-3 text-center">
                        <span className="text-lg font-semibold text-gray-700">
                          {stats.sales.parking}
                        </span>
                      </div>

                      {/* Commercial Sales */}
                      <div className="w-24 px-4 py-3 text-center">
                        <span className="text-lg font-semibold text-gray-700">
                          {stats.sales.commercial}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
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
