import Link from 'next/link';
import {
  Home,
  Compass,
  Bath,
  Bed,
  Square,
  Calendar,
  StarIcon,
  ArrowRight,
} from 'lucide-react';

interface UnitInfoProps {
  unitNumber: string;
  floor: number | null;
  facing: string | null;
  orientation: string | null;
  bathrooms: number;
  bedrooms: number;
  area: string;
  completion: string;
  formattedPrice: string;
}

const UnitInfo = ({ 
  unitNumber, 
  floor, 
  facing, 
  orientation, 
  bathrooms, 
  bedrooms, 
  area, 
  completion, 
  formattedPrice 
}: UnitInfoProps) => {
  return (
    <div className="space-y-6">
      {/* Unit Title and Star */}
      <div className="flex items-center justify-start gap-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
          <StarIcon className="h-7 w-7 text-primaryColor" />
        </div>
        <h1 className="text-4xl font-bold text-black">
          Unidad {unitNumber} - Piso {floor || 'N/A'}
        </h1>
      </div>

      {/* Unit Details Grid */}
      <div className="space-y-4">
        {/* Location Row */}
        <div className="flex gap-4">
          <div className="flex flex-1 items-center gap-4">
            <Home className="h-5 w-5 text-black" />
            <span className="text-xl text-black">Ubicación:</span>
            <span className="text-xl text-black">{facing || orientation || 'N/A'}</span>
          </div>
        </div>

        {/* Orientation Row */}
        <div className="flex gap-4">
          <div className="flex flex-1 items-center gap-4">
            <Compass className="h-5 w-5 text-black" />
            <span className="text-xl text-black">Orientación:</span>
            <span className="text-xl text-black">{orientation || 'N/A'}</span>
          </div>
        </div>

        {/* Bathrooms Row */}
        <div className="flex gap-4">
          <div className="flex flex-1 items-center gap-4">
            <Bath className="h-5 w-5 text-black" />
            <span className="text-xl text-black">Baños:</span>
            <span className="text-xl text-black">{bathrooms}</span>
          </div>
        </div>

        {/* Bedrooms Row */}
        <div className="flex gap-4">
          <div className="flex flex-1 items-center gap-4">
            <Bed className="h-5 w-5 text-black" />
            <span className="text-xl text-black">Dormitorios:</span>
            <span className="text-xl text-black">{bedrooms}</span>
          </div>
        </div>

        {/* Area Row */}
        <div className="flex gap-4">
          <div className="flex flex-1 items-center gap-4">
            <Square className="h-5 w-5 text-black" />
            <span className="text-xl text-black">Área:</span>
            <span className="text-xl text-black">{area}</span>
          </div>
        </div>

        {/* Completion Row */}
        <div className="flex gap-4">
          <div className="flex flex-1 items-center gap-4">
            <Calendar className="h-5 w-5 text-black" />
            <span className="text-xl text-black">Finalización:</span>
            <span className="text-xl text-black">{completion}</span>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="mt-8">
        <h2 className="text-5xl font-bold text-black">{formattedPrice}</h2>
      </div>

      {/* CTA Button */}
      <div className="mt-8">
        <Link
          href="/checkout"
          className="flex w-full items-center justify-center rounded-full bg-primaryColor px-12 py-4 text-xl font-medium text-white transition-colors hover:bg-blue-700"
        >
          Comprar unidad
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  );
};

export default UnitInfo;