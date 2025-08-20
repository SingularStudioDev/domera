import { useState } from 'react';
import UnitFilter from './UnitFilter';
import UnitCard from './UnitCard';

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
  available: boolean;
  statusIcon: boolean | string;
}

interface AvailableUnitsProps {
  units: Unit[];
  projectId: string;
}

export default function AvailableUnits({
  units,
  projectId,
}: AvailableUnitsProps) {
  const [filters, setFilters] = useState({
    piso: 'Mostrar todo',
    tipologia: 'Mostrar todo',
    orientacion: 'Mostrar todo',
  });

  return (
    <div className="bg-neutral-100 px-4 py-4 md:px-0 md:py-10">
      <div className="container mx-auto py-10">
        <h2 className="mb-2 text-3xl font-bold text-black">
          Unidades disponibles
        </h2>
        <p className="mb-8 text-gray-600">9 Unidades disponibles</p>

        <UnitFilter filters={filters} setFilters={setFilters} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {units.map((unit) => (
            <UnitCard key={unit.id} unit={unit} projectId={projectId} />
          ))}
        </div>
      </div>
    </div>
  );
}
