"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useCheckoutStore } from "@/stores/checkoutStore";
import { formatCurrency } from "@/utils/utils";

import { checkIsFavoriteAction } from "@/lib/actions/favourites";
import { getUnitByIdAction } from "@/lib/actions/units";
import { hasActiveOperationAction } from "@/lib/actions/operations";
import { formatUnitType } from "@/lib/utils";
import { useFeatureParser, useImageParser } from "@/hooks/useJsonArrayParser";
import { useProjectHeroImage } from "@/hooks/useProjectImages";
import { useShowError } from "@/hooks/useShowError";
import MainButton from "@/components/custom-ui/MainButton";
import Footer from "@/components/Footer";
import Header from "@/components/header/Header";

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

export default function UnitDetailPage() {
  const params = useParams();
  const projectSlug = params.slug as string;
  const unitId = params.unitId as string;
  const router = useRouter();
  const { addItem } = useCheckoutStore();
  const showError = useShowError();

  const [unit, setUnit] = useState<UnitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasActiveOperation, setHasActiveOperation] = useState(false);

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

        // Check for active operation (don't block if this fails - user might not be authenticated)
        try {
          const activeOperationResult = await hasActiveOperationAction();
          setHasActiveOperation(activeOperationResult.success && activeOperationResult.data === true);
        } catch (operationError) {
          console.log(
            "Could not check active operation status (user might not be authenticated)",
          );
          setHasActiveOperation(false);
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
  const { imageUrl: projectHeroImage } = useProjectHeroImage(
    unit?.project?.images,
  );

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

  const handleAddToCheckout = () => {
    // Check if unit is not available
    if (unit.status !== "available") {
      const statusMessage = unit.status === "reserved" ? "reservada" : unit.status === "sold" ? "vendida" : "no disponible";
      showError(`Esta unidad está ${statusMessage} y no puede ser comprada.`);
      return;
    }

    // Check if user has active operation that blocks new purchases
    if (hasActiveOperation) {
      router.push("/userDashboard/shopping");
      return;
    }

    if (!unit.project.id || !unit.project.name) {
      showError("Información del proyecto no disponible");
      return;
    }

    // Extraer el precio numérico del string formateado
    const numericPrice = parseInt(formattedPrice.replace(/[^\d]/g, ""));

    const checkoutItem = {
      id: unit.id,
      projectId: unit.project.id || unit.project.slug,
      projectName: unit.project.name,
      projectHeroImage: projectHeroImage,
      unitId: unit.id,
      unitTitle: `${formatUnitType(unit.unitType)} ${unit.unitNumber}`,
      image: firstImage || `/images/unit-${unit.unitNumber}-main.png`,
      bathrooms: unit.bathrooms,
      bedrooms: unit.bedrooms,
      builtArea: area,
      completion: completion,
      price: numericPrice,
    };

    const result = addItem(checkoutItem);

    switch (result) {
      case "success":
        router.push("/checkout");
        break;
      case "already_exists":
        router.push("/checkout");
        break;
      case "different_project":
        showError(
          "Solo puedes agregar unidades del mismo proyecto al checkout.",
        );
        break;
      case "max_units_reached":
        showError(
          "No puedes agregar más de 2 unidades a tu carrito de compras. Para obtener más información sobre la compra de unidades adicionales, contacta con nuestro equipo.",
        );
        break;
    }
  };

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
              projectHeroImage={projectHeroImage}
              onAddToCheckout={handleAddToCheckout}
              isAvailable={unit.status === "available"}
              unitStatus={unit.status}
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

          <div className="flex w-full items-center justify-center pb-10">
            {unit.status === "available" ? (
              <MainButton variant="fill" showArrow onClick={handleAddToCheckout}>
                Comprar unidad
              </MainButton>
            ) : (
              <button
                disabled
                className="flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-6 py-3 text-lg font-medium text-gray-500 cursor-not-allowed"
              >
                {unit.status === "reserved" ? "Unidad Reservada" : unit.status === "sold" ? "Unidad Vendida" : "No Disponible"}
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
