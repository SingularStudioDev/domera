"use client";

import { useEffect, useState } from "react";

import { useCheckoutStore } from "@/stores/checkoutStore";
import { formatCurrency} from "@/utils/utils";
import { ChevronDownIcon } from "lucide-react";

import { getAvailableUnitsForCheckoutAction } from "@/lib/actions/units";
import UnitCard from "@/app/projects/[slug]/units/_components/UnitCard";

interface DatabaseUnit {
  id: string;
  projectId: string;
  unitNumber: string;
  floor: number | null;
  unitType: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  totalArea: number | null;
  builtArea: number | null;
  orientation: string | null;
  facing: string | null;
  price: number;
  currency: string;
  description: string | null;
  features: any;
  images: any;
  floorPlanUrl: string | null;
  dimensions: string | null;
  project?: {
    name: string;
    slug: string;
  };
}

interface Unit {
  id: string;
  title: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  orientation: string;
  price: string;
  type: string;
  image: string;
  unitNumber: string;
  available: boolean;
  statusIcon: boolean;
  isFavorite: boolean;
}

export default function AdditionalPage() {
  const [filters, setFilters] = useState({
    piso: "Mostrar todo",
    tipologia: "Mostrar todo",
    orientacion: "Mostrar todo",
  });
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  const { currentProject, items } = useCheckoutStore();

  // Transform database unit to UI unit format
  const transformUnit = (dbUnit: DatabaseUnit): Unit => {
    const unitTypeMap: Record<string, string> = {
      apartment: `${dbUnit.bedrooms} Dormitorio${dbUnit.bedrooms !== 1 ? "s" : ""}`,
      commercial_space: "Local comercial",
      garage: "Cochera",
      storage: "Depósito",
      office: "Oficina",
    };

    return {
      id: dbUnit.id,
      title: `Unidad ${dbUnit.unitNumber}${dbUnit.floor ? ` - Piso ${dbUnit.floor}` : ""}`,
      description: dbUnit.description || "Sin descripción disponible",
      bedrooms: dbUnit.bedrooms,
      bathrooms: dbUnit.bathrooms,
      area: dbUnit.builtArea
        ? `${dbUnit.builtArea}m²`
        : dbUnit.totalArea
          ? `${dbUnit.totalArea}m²`
          : "N/A",
      orientation: dbUnit.orientation || "N/A",
      price: formatCurrency(dbUnit.price),
      type: unitTypeMap[dbUnit.unitType] || dbUnit.unitType,
      image:
        Array.isArray(dbUnit.images) && dbUnit.images.length > 0
          ? dbUnit.images[0]
          : "/cart-unit-1-29f3e6.png",
      unitNumber: dbUnit.unitNumber,
      available: dbUnit.status === "available",
      statusIcon: dbUnit.status === "available",
      isFavorite: false, // TODO: Implement favorites logic
    };
  };

  // Fetch available units for the current project
  useEffect(() => {
    const fetchUnits = async () => {
      if (!currentProject?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get unit IDs already in checkout to exclude them
        const excludeUnitIds = items.map((item) => item.unitId);

        const result = await getAvailableUnitsForCheckoutAction(
          currentProject.id,
          excludeUnitIds,
        );

        if (result.success && result.data) {
          const transformedUnits = (result.data as DatabaseUnit[]).map(
            transformUnit,
          );
          setAvailableUnits(transformedUnits);
        } else {
          console.error("Error fetching units:", result.error);
          setAvailableUnits([]);
        }
      } catch (error) {
        console.error("Error fetching available units:", error);
        setAvailableUnits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [currentProject?.id, items]);

  // Filter units based on current filters
  const filteredUnits = availableUnits.filter((unit) => {
    if (filters.piso !== "Mostrar todo") {
      const unitFloor = parseInt(unit.title.match(/Piso (\d+)/)?.[1] || "0");
      switch (filters.piso) {
        case "Planta baja":
          if (unitFloor !== 0) return false;
          break;
        case "Piso 1-3":
          if (unitFloor < 1 || unitFloor > 3) return false;
          break;
        case "Piso 4-6":
          if (unitFloor < 4 || unitFloor > 6) return false;
          break;
        case "Piso 7-8":
          if (unitFloor < 7 || unitFloor > 8) return false;
          break;
      }
    }

    if (filters.tipologia !== "Mostrar todo") {
      if (!unit.type.toLowerCase().includes(filters.tipologia.toLowerCase())) {
        return false;
      }
    }

    if (filters.orientacion !== "Mostrar todo") {
      if (unit.orientation !== filters.orientacion) {
        return false;
      }
    }

    return true;
  });

  if (!currentProject) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-center text-gray-600">
          No hay proyecto seleccionado en el checkout
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Unidades disponibles */}
      <div>
        <div className="container mx-auto">
          <h2 className="mb-2 text-3xl font-bold text-black">
            Unidades disponibles
          </h2>
          <p className="mb-4 text-gray-600">
            {loading
              ? "Cargando..."
              : `${filteredUnits.length} Unidades disponibles`}
          </p>

          {/* Filters */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Piso
              </label>
              <div className="relative">
                <select
                  value={filters.piso}
                  onChange={(e) =>
                    setFilters({ ...filters, piso: e.target.value })
                  }
                  className="w-full appearance-none rounded border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Mostrar todo">Mostrar todo</option>
                  <option value="Planta baja">Planta baja</option>
                  <option value="Piso 1-3">Piso 1-3</option>
                  <option value="Piso 4-6">Piso 4-6</option>
                  <option value="Piso 7-8">Piso 7-8</option>
                </select>
                <ChevronDownIcon className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Tipología
              </label>
              <div className="relative">
                <select
                  value={filters.tipologia}
                  onChange={(e) =>
                    setFilters({ ...filters, tipologia: e.target.value })
                  }
                  className="w-full appearance-none rounded border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Mostrar todo">Mostrar todo</option>
                  <option value="Monoambiente">Monoambiente</option>
                  <option value="1 dormitorio">1 dormitorio</option>
                  <option value="2 dormitorios">2 dormitorios</option>
                  <option value="3 dormitorios">3 dormitorios</option>
                  <option value="Local comercial">Local comercial</option>
                  <option value="Cochera">Cochera</option>
                </select>
                <ChevronDownIcon className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Orientación
              </label>
              <div className="relative">
                <select
                  value={filters.orientacion}
                  onChange={(e) =>
                    setFilters({ ...filters, orientacion: e.target.value })
                  }
                  className="w-full appearance-none rounded border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Mostrar todo">Mostrar todo</option>
                  <option value="Norte">Norte</option>
                  <option value="Sur">Sur</option>
                  <option value="Este">Este</option>
                  <option value="Oeste">Oeste</option>
                </select>
                <ChevronDownIcon className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Units Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-64 w-full rounded-lg bg-gray-300"></div>
                </div>
              ))}
            </div>
          ) : filteredUnits.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredUnits.map((unit) => (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  projectSlug={currentProject?.id || ""}
                  showCheckoutButton={true}
                  projectId={currentProject?.id}
                  projectName={currentProject?.name}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-600">
                No se encontraron unidades disponibles con los filtros
                seleccionados.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
