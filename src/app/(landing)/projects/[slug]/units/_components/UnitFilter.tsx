import { ChevronDown } from "lucide-react";

interface UnitFilterProps {
  filters: {
    piso: string;
    tipologia: string;
    orientacion: string;
  };
  setFilters: (filters: any) => void;
}

export default function UnitFilter({ filters, setFilters }: UnitFilterProps) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Piso
        </label>
        <div className="relative">
          <select
            value={filters.piso}
            onChange={(e) => setFilters({ ...filters, piso: e.target.value })}
            className="w-full appearance-none rounded border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="Mostrar todo">Mostrar todo</option>
            <option value="Planta baja">Planta baja</option>
            <option value="Piso 1-3">Piso 1-3</option>
            <option value="Piso 4-6">Piso 4-6</option>
            <option value="Piso 7-8">Piso 7-8</option>
          </select>
          <ChevronDown className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
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
          <ChevronDown className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
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
          <ChevronDown className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
