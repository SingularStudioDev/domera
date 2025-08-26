'use client';

import {
  ArrowLeft,
  Home,
  Compass,
  Bath,
  Bed,
  Square,
  Calendar,
  CircleDollarSign,
  Wallet,
  ListCheck,
  MousePointer,
  ArrowRight,
  StarIcon,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUnitByIdAction } from '@/lib/actions/units';
import { formatCurrency, formatCurrencyUYU } from '@/utils/utils';
import { useImageParser, useFeatureParser } from '@/hooks/useJsonArrayParser';
import Header from '@/components/header/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';

interface UnitData {
  id: string;
  unitNumber: string;
  description: string | null;
  bedrooms: number;
  bathrooms: number;
  totalArea: number | null;
  builtArea: number | null;
  orientation: string | null;
  facing: string | null;
  price: number;
  currency: string;
  features: string[] | string | null;
  images: string[] | string | null;
  floor: number | null;
  unitType: string;
  status: string;
  dimensions: string | null;
  floorPlanUrl: string | null;
  project: {
    name: string;
    slug: string;
    estimatedCompletion: Date | null;
  };
}

const UnitDetailPage = () => {
  const params = useParams();
  const projectSlug = params.slug as string;
  const unitId = params.unitId as string;
  
  const [unit, setUnit] = useState<UnitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUnit() {
      try {
        setLoading(true);
        const result = await getUnitByIdAction(unitId);
        
        if (result.success && result.data) {
          setUnit(result.data as UnitData);
          setError(null);
        } else {
          setError(result.error || 'Error cargando unidad');
        }
      } catch (err) {
        setError('Error inesperado cargando unidad');
        console.error('Error fetching unit:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUnit();
  }, [unitId]);

  // Parse JSON fields using hooks - must be called before any early returns
  const { images, firstImage } = useImageParser(unit?.images);
  const { features, hasFeatures } = useFeatureParser(unit?.features);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto flex items-center justify-center py-20">
            <p className="text-gray-600">Cargando unidad...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !unit) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto flex items-center justify-center py-20">
            <p className="text-red-600">{error || 'Unidad no encontrada'}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Format unit data (unit is guaranteed to exist here)
  const formattedPrice = `${unit.currency} ${
    unit.currency === 'USD' ? formatCurrency(unit.price) : formatCurrencyUYU(unit.price)
  }`;
  
  const area = unit.totalArea 
    ? `${unit.totalArea}m²` 
    : unit.builtArea 
    ? `${unit.builtArea}m²` 
    : unit.dimensions || 'N/A';

  const completion = unit.project.estimatedCompletion
    ? new Intl.DateTimeFormat('es-UY', {
        month: 'long',
        year: 'numeric',
      }).format(unit.project.estimatedCompletion)
    : 'A definir';

  const mainImage = firstImage || '/placeholder-unit.jpg';

  // Process steps
  const steps = [
    {
      icon: Home,
      title: 'Selecciona tu propiedad',
    },
    {
      icon: MousePointer,
      title: 'Hacé click en comprar',
    },
    {
      icon: ListCheck,
      title: 'Completa tu boleto de reserva',
    },
    {
      icon: CircleDollarSign,
      title: 'Hace el deposito y espera la escritura',
    },
    {
      icon: Wallet,
      title: 'En 30 días recibirás el boleto de compra',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-20">
        <div>
          {/* Back Button */}
          <div className="container mx-auto w-full py-6">
            <Link
              href={`/projects/${projectSlug}`}
              className="inline-flex items-center gap-2 text-primaryColor hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a lista de proyectos
            </Link>
          </div>

          {/* Main Content Grid */}
          <div className="container mx-auto mb-16 grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left Column - Main Image */}
            <div>
              <Image
                src={mainImage}
                alt={`Unidad ${unit.unitNumber}`}
                width={640}
                height={564}
                className="h-[564px] w-full rounded-3xl border border-gray-300 object-cover"
              />
            </div>

            {/* Right Column - Unit Info */}
            <div className="space-y-6">
              {/* Unit Title and Star */}
              <div className="flex items-center justify-start gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                  <StarIcon className="h-7 w-7 text-primaryColor" />
                </div>
                <h1 className="text-4xl font-bold text-black">
                  Unidad {unit.unitNumber} - Piso {unit.floor || 'N/A'}
                </h1>
              </div>

              {/* Unit Details Grid */}
              <div className="space-y-4">
                {/* Location Row */}
                <div className="flex gap-4">
                  <div className="flex flex-1 items-center gap-4">
                    <Home className="h-5 w-5 text-black" />
                    <span className="text-xl text-black">Ubicación:</span>
                    <span className="text-xl text-black">{unit.facing || unit.orientation || 'N/A'}</span>
                  </div>
                </div>

                {/* Orientation Row */}
                <div className="flex gap-4">
                  <div className="flex flex-1 items-center gap-4">
                    <Compass className="h-5 w-5 text-black" />
                    <span className="text-xl text-black">Orientación:</span>
                    <span className="text-xl text-black">{unit.orientation || 'N/A'}</span>
                  </div>
                </div>

                {/* Bathrooms Row */}
                <div className="flex gap-4">
                  <div className="flex flex-1 items-center gap-4">
                    <Bath className="h-5 w-5 text-black" />
                    <span className="text-xl text-black">Baños:</span>
                    <span className="text-xl text-black">{unit.bathrooms}</span>
                  </div>
                </div>

                {/* Bedrooms Row */}
                <div className="flex gap-4">
                  <div className="flex flex-1 items-center gap-4">
                    <Bed className="h-5 w-5 text-black" />
                    <span className="text-xl text-black">Dormitorios:</span>
                    <span className="text-xl text-black">{unit.bedrooms}</span>
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
          </div>

          {/* Unit Description */}
          {unit.description && (
            <div className="container mx-auto mb-16">
              <h3 className="mb-6 text-3xl font-bold text-black">Descripción</h3>
              <div className="whitespace-pre-line text-lg text-gray-700">
                {unit.description}
              </div>
            </div>
          )}

          {/* Features */}
          {hasFeatures && (
            <div className="container mx-auto mb-16">
              <h3 className="mb-6 text-3xl font-bold text-black">Características</h3>
              <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                  <li key={index} className="text-lg text-gray-700">
                    • {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Gallery */}
          {images.length > 1 && (
            <div className="container mx-auto mb-16">
              <h3 className="mb-6 text-3xl font-bold text-black">Galería</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {images.slice(1).map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`Unidad ${unit.unitNumber} - Imagen ${index + 2}`}
                    width={400}
                    height={300}
                    className="h-64 w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Investment Section - Placeholder */}
          <div className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="rounded-l-3xl bg-gray-100 p-8 pl-48">
                <h3 className="mb-6 text-3xl font-bold text-black">
                  Inversión
                </h3>
                <div className="text-lg text-gray-700">
                  <p>Información sobre inversión disponible próximamente.</p>
                  <p>Tipo de unidad: {unit.unitType}</p>
                  <p>Estado: {unit.status === 'available' ? 'Disponible' : 'No disponible'}</p>
                </div>
              </div>
              <div className="rounded-r-3xl bg-gray-200 p-8 pr-48">
                <h3 className="mb-6 text-3xl font-bold text-black">
                  Boleto de reserva
                </h3>
                <div className="text-lg text-gray-700">
                  <p>Al acceder al boleto de reserva, el comprador se compromete formalmente a adquirir la unidad.</p>
                  <p>Contacta con nuestro equipo de ventas para obtener más información sobre el proceso de reserva.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Proceso Section */}
          <section className="py-16">
            <div className="container mx-auto">
              {/* Section Header */}
              <div className="flex flex-col gap-10 text-start">
                <h2 className="text-3xl font-bold text-black">Proceso</h2>
              </div>

              {/* Process Steps */}
              <div className="grid w-full grid-cols-1 gap-8 pt-20 pb-10 md:grid-cols-3 lg:grid-cols-5">
                {steps.map((step) => {
                  const IconComponent = step.icon;
                  return (
                    <div key={step.title} className="text-center">
                      {/* Icon */}
                      <div className="bg-domera-blue mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                        <IconComponent className="h-12 w-12 text-[#0040FF]" />
                      </div>

                      {/* Content */}
                      <h3 className="mx-auto max-w-[150px] text-lg text-black">
                        {step.title}
                      </h3>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <div className="mb-16 flex w-full items-center justify-center text-center">
            <Link
              href="/checkout"
              className="flex w-fit items-center justify-center rounded-full bg-primaryColor px-12 py-4 text-xl font-medium text-white transition-colors hover:bg-blue-700"
            >
              Comprar unidad
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UnitDetailPage;