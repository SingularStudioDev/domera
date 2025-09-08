"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { formatCurrency } from "@/utils/utils";

import { checkIsFavoriteAction } from "@/lib/actions/favourites";
import { getUnitByIdAction } from "@/lib/actions/units";
import { useFeatureParser, useImageParser } from "@/hooks/useJsonArrayParser";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";
import Header from "@/components/header/Header";

import BottomCTA from "./_components/BottomCTA";
import InvestmentSection from "./_components/InvestmentSection";
import ProcessSection from "./_components/ProcessSection";
import UnitDescription from "./_components/UnitDescription";
import UnitGallery from "./_components/UnitGallery";
import UnitHeader from "./_components/UnitHeader";
import UnitImageDisplay from "./_components/UnitImageDisplay";
import UnitInfo from "./_components/UnitInfo";
import { UnitPageSkeleton } from "./_components/UnitPageSkeleton";

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
    id?: string;
    name: string;
    slug: string;
    estimatedCompletion: Date | null;
    images?: string[] | string | null;
  };
}

const UnitDetailPage = () => {
  const params = useParams();
  const projectSlug = params.slug as string;
  const unitId = params.unitId as string;

  const [unit, setUnit] = useState<UnitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    async function fetchUnitAndFavoriteStatus() {
      try {
        setLoading(true);

        // Fetch unit data
        const unitResult = await getUnitByIdAction(unitId);

        if (unitResult.success && unitResult.data) {
          setUnit(unitResult.data as UnitData);
          setError(null);
        } else {
          setError(unitResult.error || "Error cargando unidad");
          return;
        }

        // Fetch favorite status (don't block if this fails - user might not be authenticated)
        try {
          const favoriteStatus = await checkIsFavoriteAction(unitId);
          setIsFavorite(favoriteStatus);
        } catch (favoriteError) {
          // If favorites fail to load, continue without them (user might not be logged in)
          console.log(
            "Could not load favorite status (user might not be authenticated)",
          );
          setIsFavorite(false);
        }
      } catch (err) {
        setError("Error inesperado cargando unidad");
        console.error("Error fetching unit:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUnitAndFavoriteStatus();
  }, [unitId]);

  // Parse JSON fields using hooks - must be called before any early returns
  const { images, firstImage } = useImageParser(unit?.images);
  const { features, hasFeatures } = useFeatureParser(unit?.features);
  const { images: projectImages, firstImage: projectFirstImage } =
    useImageParser(unit?.project?.images);

  // Loading state
  if (loading) {
    return <UnitPageSkeleton />;
  }

  // Error state
  if (error || !unit) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto flex items-center justify-center py-20">
            <p className="text-red-600">{error || "Unidad no encontrada"}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Format unit data (unit is guaranteed to exist here)
  const formattedPrice = `${unit.currency} ${formatCurrency(unit.price)}`;

  const area = unit.totalArea
    ? `${unit.totalArea}m²`
    : unit.builtArea
      ? `${unit.builtArea}m²`
      : unit.dimensions || "N/A";

  const completion = unit.project.estimatedCompletion
    ? new Intl.DateTimeFormat("es-UY", {
        month: "long",
        year: "numeric",
      }).format(unit.project.estimatedCompletion)
    : "A definir";

  const mainImage = firstImage || "/placeholder-unit.jpg";

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-24">
        <div>
          <UnitHeader projectSlug={projectSlug} />

          {/* Main Content Grid */}
          <div className="container mx-auto grid w-full grid-cols-1 gap-10 lg:grid-cols-2 lg:items-stretch">
            <UnitImageDisplay
              mainImage={mainImage}
              unitNumber={unit.unitNumber}
            />
            <UnitInfo
              unitId={unit.id}
              unitNumber={unit.unitNumber}
              unitType={unit.unitType}
              unitFirstImage={firstImage}
              floor={unit.floor}
              facing={unit.facing}
              orientation={unit.orientation}
              bathrooms={unit.bathrooms}
              bedrooms={unit.bedrooms}
              area={area}
              completion={completion}
              formattedPrice={formattedPrice}
              isFavorite={isFavorite}
              projectId={unit.project.id || unit.project.slug}
              projectName={unit.project.name}
              projectFirstImage={projectFirstImage}
            />
          </div>

          {unit.description && (
            <UnitDescription
              description={unit.description}
              features={features}
            />
          )}

          {images.length > 1 && (
            <UnitGallery images={images} unitNumber={unit.unitNumber} />
          )}

          <InvestmentSection unitType={unit.unitType} status={unit.status} />

          <ProcessSection />

          <BottomCTA />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UnitDetailPage;
