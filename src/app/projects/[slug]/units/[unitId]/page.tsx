'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUnitByIdAction } from '@/lib/actions/units';
import { formatCurrency, formatCurrencyUYU } from '@/utils/utils';
import { useImageParser, useFeatureParser } from '@/hooks/useJsonArrayParser';
import Header from '@/components/header/Header';
import Footer from '@/components/Footer';
import UnitHeader from './_components/UnitHeader';
import UnitImageDisplay from './_components/UnitImageDisplay';
import UnitInfo from './_components/UnitInfo';
import UnitDescription from './_components/UnitDescription';
import UnitFeatures from './_components/UnitFeatures';
import UnitGallery from './_components/UnitGallery';
import InvestmentSection from './_components/InvestmentSection';
import ProcessSection from './_components/ProcessSection';
import BottomCTA from './_components/BottomCTA';

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

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-20">
        <div>
          <UnitHeader projectSlug={projectSlug} />

          {/* Main Content Grid */}
          <div className="container mx-auto mb-16 grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
            <UnitImageDisplay 
              mainImage={mainImage} 
              unitNumber={unit.unitNumber} 
            />
            <UnitInfo
              unitNumber={unit.unitNumber}
              floor={unit.floor}
              facing={unit.facing}
              orientation={unit.orientation}
              bathrooms={unit.bathrooms}
              bedrooms={unit.bedrooms}
              area={area}
              completion={completion}
              formattedPrice={formattedPrice}
            />
          </div>

          {unit.description && (
            <UnitDescription description={unit.description} />
          )}

          {hasFeatures && (
            <UnitFeatures features={features} />
          )}

          {images.length > 1 && (
            <UnitGallery images={images} unitNumber={unit.unitNumber} />
          )}

          <InvestmentSection 
            unitType={unit.unitType} 
            status={unit.status} 
          />

          <ProcessSection />

          <BottomCTA />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UnitDetailPage;