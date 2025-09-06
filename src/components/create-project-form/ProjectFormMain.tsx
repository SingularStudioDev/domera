"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ProjectFormData } from "@/types/project-form";
import { getOrganizationsAction } from "@/lib/actions/organizations";
import { checkSlugAvailabilityAction } from "@/lib/actions/projects";
import { generateSlug } from "@/lib/utils/slug";
import { projectFormSchema } from "@/lib/validations/project-form";
import { ImageCarouselForm } from "@/components/create-project-form/project-images/ImageCarouselForm";
import { LocationFormComponent } from "@/components/create-project-form/project-location/LocationForm";
import { MapSelector } from "@/components/create-project-form/project-location/MapSelector";
import { ProgressFormComponent } from "@/components/create-project-form/project-forms/ProgressForm";
import { ProjectDescriptionForm } from "@/components/create-project-form/project-forms/ProjectDescriptionForm";
import { ProjectDetailsForm } from "@/components/create-project-form/project-forms/ProjectDetailsForm";
import { ProjectHeroForm } from "@/components/create-project-form/project-forms/ProjectHeroForm";
import { ProjectMainImageForm } from "@/components/create-project-form/project-images/ProjectMainImageForm";
import { CoordinatesForm } from "@/components/create-project-form/project-location/CoordinatesForm";
import Footer from "@/components/Footer";
import Header from "@/components/header/Header";

interface ProjectFormMainProps {
  initialData?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  isEditing?: boolean;
  organizationId?: string;
  hideHeaderFooter?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
}

export function ProjectFormMain({
  initialData,
  onSubmit,
  isEditing = false,
  organizationId,
  hideHeaderFooter = false,
  showBackButton = false,
  onBack,
}: ProjectFormMainProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [slugCheckResult, setSlugCheckResult] = useState<{
    available?: boolean;
    error?: string;
    checking?: boolean;
  }>({});

  // Generate temporary project ID for new projects
  const tempProjectId = useMemo(() => {
    if (!isEditing) {
      return crypto.randomUUID();
    }
    return undefined;
  }, [isEditing]);

  const defaultValues: ProjectFormData = {
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    address: "",
    neighborhood: "",
    city: "",
    latitude: null,
    longitude: null,
    basePrice: null,
    currency: "USD",
    estimatedCompletion: null,
    organizationId: organizationId || undefined,
    status: "planning",
    images: [],
    masterPlanFiles: [],
    amenities: [],
    detalles: [],
    details: [],
    priority: 0,
    isEditing,
    ...initialData,
  };

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema) as any,
    defaultValues,
  });

  const watchedValues = watch();
  const router = useRouter();

  // Load organizations for super admin
  useEffect(() => {
    if (!organizationId) {
      // Only load organizations if organizationId is not provided (super admin case)
      const loadOrganizations = async () => {
        try {
          setLoadingOrganizations(true);
          const result = await getOrganizationsAction({
            page: 1,
            pageSize: 100,
          });
          if (result.success && result.data) {
            const data = result.data as any;
            const orgs = data.data || [];
            setOrganizations(orgs);
          }
        } catch (error) {
          console.error("Error loading organizations:", error);
        } finally {
          setLoadingOrganizations(false);
        }
      };
      loadOrganizations();
    } else {
      setLoadingOrganizations(false);
    }
  }, [organizationId]);

  // Auto-generate slug from project name
  useEffect(() => {
    if (!slugManuallyEdited && watchedValues.name && !isEditing) {
      const generatedSlug = generateSlug(watchedValues.name);
      if (generatedSlug !== watchedValues.slug) {
        setValue("slug", generatedSlug);
      }
    }
  }, [
    watchedValues.name,
    slugManuallyEdited,
    isEditing,
    setValue,
    watchedValues.slug,
  ]);

  // Function to check slug availability
  const handleCheckSlugAvailability = async () => {
    if (!watchedValues.slug?.trim()) {
      setSlugCheckResult({ error: "Ingresa un slug para verificar" });
      return;
    }

    setSlugCheckResult({ checking: true });

    try {
      const result = await checkSlugAvailabilityAction(
        watchedValues.slug,
        organizationId || watchedValues.organizationId,
      );

      if (result.success) {
        setSlugCheckResult({
          available: result.available,
          error: result.error,
        });
      } else {
        setSlugCheckResult({
          error: result.error || "Error al verificar slug",
        });
      }
    } catch (error) {
      setSlugCheckResult({ error: "Error de conexión al verificar slug" });
    }
  };

  const handleFormSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      // Validate data before sending
      const validation = validateFormData(data);
      if (!validation.isValid) {
        console.error("Form validation errors:", validation.errors);
        console.log(`Error en el formulario:\n\n${validation.errors.join("\n")}`);
        return;
      }

      await onSubmit(validation.cleanedData);
    } catch (error) {
      // Don't log Next.js redirect "errors" - they are expected behavior
      if (error instanceof Error && error.message === "NEXT_REDIRECT") {
        // Let the redirect happen, don't show as error
        return;
      }
      // Show user-friendly error message
      console.log(
        `Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateFormData = (data: ProjectFormData) => {
    const errors: string[] = [];

    // Check required fields
    if (!data.name?.trim()) errors.push("Nombre del proyecto es requerido");
    if (!data.slug?.trim()) errors.push("Slug es requerido");
    if (!data.address?.trim()) errors.push("Dirección es requerida");
    if (!data.city?.trim()) errors.push("Ciudad es requerida");
    if (!data.organizationId?.trim()) errors.push("Organización es requerida");

    // Validate field lengths
    if (data.name && data.name.length > 255)
      errors.push("Nombre no puede exceder 255 caracteres");
    if (data.slug && data.slug.length > 255)
      errors.push("Slug no puede exceder 255 caracteres");
    if (data.description && data.description.length > 5000)
      errors.push("Descripción no puede exceder 5000 caracteres");
    if (data.shortDescription && data.shortDescription.length > 500)
      errors.push("Descripción corta no puede exceder 500 caracteres");
    if (data.address && data.address.length > 500)
      errors.push("Dirección no puede exceder 500 caracteres");
    if (data.neighborhood && data.neighborhood.length > 100)
      errors.push("Barrio no puede exceder 100 caracteres");
    if (data.city && data.city.length > 100)
      errors.push("Ciudad no puede exceder 100 caracteres");

    // Check for blob URLs
    const hasInvalidImages = data.images?.some((img) =>
      img.startsWith("blob:"),
    );
    if (hasInvalidImages) {
      errors.push("Las imágenes deben ser subidas antes de crear el proyecto");
    }

    // Validate amenities format
    const validAmenities = data.amenities?.every(
      (amenity) =>
        typeof amenity === "object" &&
        amenity.text &&
        amenity.text.length <= 255,
    );

    if (data.amenities?.length > 0 && !validAmenities) {
      errors.push(
        "Las amenidades tienen un formato incorrecto o exceden los límites",
      );
    }

    // Validate detalles format
    const validDetalles = data.detalles?.every(
      (detalle) =>
        typeof detalle === "object" &&
        detalle.text &&
        detalle.text.length <= 255,
    );

    if (data.detalles?.length > 0 && !validDetalles) {
      errors.push(
        "Las características adicionales tienen un formato incorrecto o exceden los límites",
      );
    }

    // Validate details format
    const validDetails = data.details?.every(
      (detail) => typeof detail === "string" && detail.length <= 255,
    );

    if (data.details?.length > 20) {
      errors.push("No puedes tener más de 20 detalles");
    }

    if (data.details?.length > 0 && !validDetails) {
      errors.push(
        "Los detalles exceden los límites (255 caracteres por detalle)",
      );
    }

    // Validate priority
    if (data.priority && (data.priority < 0 || data.priority > 1000)) {
      errors.push("La prioridad debe estar entre 0 y 1000");
    }

    // Clean and format data
    const cleanedData: ProjectFormData = {
      ...data,
      name: data.name?.trim() || "",
      slug: data.slug?.trim() || "",
      description: data.description?.substring(0, 5000)?.trim() || "",
      shortDescription: data.shortDescription?.substring(0, 500)?.trim() || "",
      address: data.address?.substring(0, 500)?.trim() || "",
      neighborhood: data.neighborhood?.substring(0, 100)?.trim() || "",
      city: data.city?.trim() || "",
      latitude: data.latitude,
      longitude: data.longitude,
      images: data.images?.filter((img) => !img.startsWith("blob:")) || [],
      amenities:
        data.amenities?.map((amenity) => ({
          icon: typeof amenity === "object" ? amenity.icon || "" : "",
          text:
            typeof amenity === "object"
              ? amenity.text?.substring(0, 255) || ""
              : "",
        })) || [],
      detalles:
        data.detalles?.map((detalle) => ({
          text:
            typeof detalle === "object"
              ? detalle.text?.substring(0, 255) || ""
              : "",
        })) || [],
      details: data.details?.map((detail) => detail.substring(0, 255)) || [],
      priority: data.priority || 0,
    };

    return {
      isValid: errors.length === 0,
      errors,
      cleanedData,
    };
  };

  // Formatear datos hero
  const heroData = {
    name: watchedValues.name,
    basePrice: watchedValues.basePrice,
    neighborhood: watchedValues.neighborhood,
    city: watchedValues.city,
    estimatedCompletion: watchedValues.estimatedCompletion,
    images: watchedValues.images,
  };

  // Formatear datos descripción
  const descriptionData = {
    description: watchedValues.description,
    shortDescription: watchedValues.shortDescription,
    address: watchedValues.address,
  };

  // Formatear datos detalles
  const detailsData = {
    amenities: watchedValues.amenities,
    detalles: watchedValues.detalles,
    details: watchedValues.details,
  };

  // Formatear datos ubicación
  const locationData = {
    latitude: watchedValues.latitude,
    longitude: watchedValues.longitude,
    masterPlanFiles: watchedValues.masterPlanFiles,
  };

  // Formatear datos carousel
  const carouselData = {
    images: watchedValues.images,
  };

  // Formatear datos coordenadas
  const coordinatesData = {
    latitude: watchedValues.latitude,
    longitude: watchedValues.longitude,
  };

  // Formatear datos imagen principal
  const mainImageData = {
    images: watchedValues.images,
    name: watchedValues.name,
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={hideHeaderFooter ? "space-y-6" : "min-h-screen bg-white"}
    >
      {!hideHeaderFooter && <Header />}

      <main>
        {/* PROJECT HERO FORM - Exactamente igual al layout original */}
        <ProjectHeroForm
          value={heroData}
          onChange={(newHeroData) => {
            setValue("name", newHeroData.name);
            setValue("basePrice", newHeroData.basePrice);
            setValue("neighborhood", newHeroData.neighborhood);
            setValue("city", newHeroData.city);
            setValue("estimatedCompletion", newHeroData.estimatedCompletion);
            setValue("images", newHeroData.images);
          }}
          currency={watchedValues.currency}
          disabled={isSubmitting}
          error={errors.name?.message || errors.basePrice?.message}
          projectId={tempProjectId}
        />

        {/* PROJECT INFO - Botón de volver para dashboard */}
        {showBackButton && onBack && (
          <div className="mt-5 mb-10">
            <div className="container mx-auto px-4 md:px-0">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <span>←</span>
                  <span>Volver a Proyectos</span>
                </button>
                <div className="text-gray-500">
                  <span className="text-sm">
                    {isEditing ? "Editando Proyecto" : "Creando Nuevo Proyecto"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* IMAGEN PRINCIPAL FORM - Solo para modo dashboard */}
        {hideHeaderFooter && (
          <div className="mb-10">
            <div className="container mx-auto px-4 md:px-0">
              <ProjectMainImageForm
                value={mainImageData}
                onChange={(newMainImageData) => {
                  setValue("images", newMainImageData.images);
                }}
                disabled={isSubmitting}
                error={errors.images?.message}
                projectId={tempProjectId || undefined}
              />
            </div>
          </div>
        )}

        {/* PROJECT INFO - Original para páginas públicas */}
        {!hideHeaderFooter && (
          <div className="mt-5 mb-20">
            <div className="container mx-auto px-4 md:px-0">
              <div className="text-primaryColor flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>←</span>
                  <span className="cursor-pointer hover:underline">
                    Volver a lista
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Descargar PDF</span>
                  <span>↓</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO PRINCIPAL - Exactamente igual al layout original */}
        <div className="container mx-auto flex flex-col gap-10 px-4 md:flex-row md:px-0">
          <div className="flex flex-col gap-5">
            {/* PROJECT DESCRIPTION FORM */}
            <ProjectDescriptionForm
              value={descriptionData}
              onChange={(newDescriptionData) => {
                setValue("description", newDescriptionData.description);
                setValue(
                  "shortDescription",
                  newDescriptionData.shortDescription,
                );
                setValue("address", newDescriptionData.address);
              }}
              disabled={isSubmitting}
              error={errors.description?.message || errors.address?.message}
            />

            {/* PROJECT DETAILS FORM */}
            <ProjectDetailsForm
              value={detailsData}
              onChange={(newDetailsData) => {
                setValue("amenities", newDetailsData.amenities);
                setValue("detalles", newDetailsData.detalles);
                setValue("details", newDetailsData.details);
              }}
              disabled={isSubmitting}
              error={errors.amenities?.message}
            />

            {/* IMAGE CAROUSEL FORM */}
            <ImageCarouselForm
              value={carouselData}
              onChange={(newCarouselData) => {
                setValue("images", newCarouselData.images);
              }}
              projectName={watchedValues.name || "Proyecto"}
              disabled={isSubmitting}
              error={errors.images?.message}
              className="py-5 md:py-10"
              projectId={tempProjectId}
            />

            {/* LOCATION FORM - Mapa para dashboard */}
            {hideHeaderFooter ? (
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-xl font-semibold">
                  Ubicación del Proyecto
                </h3>
                <MapSelector
                  latitude={watchedValues.latitude}
                  longitude={watchedValues.longitude}
                  address={watchedValues.address}
                  onChange={(lat, lng) => {
                    setValue("latitude", lat);
                    setValue("longitude", lng);
                  }}
                  disabled={isSubmitting}
                />
                {(errors.latitude?.message || errors.longitude?.message) && (
                  <div className="mt-2 text-sm text-red-600">
                    {errors.latitude?.message || errors.longitude?.message}
                  </div>
                )}
              </div>
            ) : (
              /* LOCATION FORM - Original para páginas públicas */
              <LocationFormComponent
                value={locationData}
                onChange={(newLocationData) => {
                  setValue("latitude", newLocationData.latitude);
                  setValue("longitude", newLocationData.longitude);
                  setValue("masterPlanFiles", newLocationData.masterPlanFiles);
                }}
                projectName={watchedValues.name || "Proyecto"}
                disabled={isSubmitting}
                error={errors.latitude?.message || errors.longitude?.message}
              />
            )}

            {/* PROGRESS FORM - Nota: Este será manejado como una sección separada */}
            <ProgressFormComponent
              progressImages={[]}
              onProgressImagesChange={() => {}}
              disabled={isSubmitting}
              projectId={tempProjectId}
            />

            {/* COORDINATES FORM - Formulario de coordenadas al final */}
            <CoordinatesForm
              value={coordinatesData}
              onChange={(newCoordinatesData) => {
                setValue("latitude", newCoordinatesData.latitude);
                setValue("longitude", newCoordinatesData.longitude);
              }}
              disabled={isSubmitting}
              error={errors.latitude?.message || errors.longitude?.message}
            />
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="container mx-auto px-4 py-10 md:px-0">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-6 py-3 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => router.back()}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primaryColor hover:bg-primaryColor/90 rounded-lg px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? isEditing
                  ? "Actualizando..."
                  : "Creando..."
                : isEditing
                  ? "Actualizar Proyecto"
                  : "Crear Proyecto"}
            </button>
          </div>
        </div>

        {/* Información adicional del formulario */}
        <div className="container mx-auto px-4 pb-10 md:px-0">
          <div className="rounded-lg bg-gray-50 p-6">
            <h3 className="mb-4 font-semibold text-gray-900">
              Configuración del proyecto
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {!organizationId && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Organización *
                  </label>
                  <select
                    value={watchedValues.organizationId}
                    onChange={(e) => setValue("organizationId", e.target.value)}
                    disabled={isSubmitting || loadingOrganizations}
                    className="focus:ring-primaryColor w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-transparent focus:ring-2 disabled:opacity-50"
                  >
                    <option value="">Seleccionar organización</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                  {errors.organizationId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.organizationId.message}
                    </p>
                  )}
                </div>
              )}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Slug del proyecto
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={watchedValues.slug}
                    onChange={(e) => {
                      const newValue = e.target.value.substring(0, 255);
                      setValue("slug", newValue);
                      setSlugManuallyEdited(true);
                      // Clear previous check result when slug changes
                      setSlugCheckResult({});
                    }}
                    placeholder="slug-del-proyecto"
                    disabled={isSubmitting}
                    maxLength={255}
                    className="focus:ring-primaryColor flex-1 rounded-lg border border-gray-300 p-3 outline-none focus:border-transparent focus:ring-2 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={handleCheckSlugAvailability}
                    disabled={
                      isSubmitting ||
                      slugCheckResult.checking ||
                      !watchedValues.slug?.trim()
                    }
                    className="rounded-lg bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
                  >
                    {slugCheckResult.checking ? "Verificando..." : "Verificar"}
                  </button>
                  {watchedValues.name && (
                    <button
                      type="button"
                      onClick={() => {
                        const generatedSlug = generateSlug(watchedValues.name);
                        setValue("slug", generatedSlug);
                        setSlugManuallyEdited(true);
                        // Clear check result when regenerating
                        setSlugCheckResult({});
                      }}
                      disabled={isSubmitting}
                      className="rounded-lg bg-gray-500 px-3 py-2 text-sm text-white hover:bg-gray-600 disabled:opacity-50"
                    >
                      Regenerar
                    </button>
                  )}
                </div>
                {/* Result of slug availability check */}
                {(slugCheckResult.available !== undefined ||
                  slugCheckResult.error) && (
                  <div
                    className={`mt-2 text-sm ${
                      slugCheckResult.error
                        ? "text-red-600"
                        : slugCheckResult.available
                          ? "text-green-600"
                          : "text-red-600"
                    }`}
                  >
                    {slugCheckResult.error ||
                      (slugCheckResult.available
                        ? "✓ Slug disponible"
                        : "✗ Slug ya está en uso")}
                  </div>
                )}
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.slug.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Se genera automáticamente desde el nombre del proyecto
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Estado del proyecto
                </label>
                <select
                  value={watchedValues.status}
                  onChange={(e) =>
                    setValue(
                      "status",
                      e.target.value as
                        | "planning"
                        | "pre_sale"
                        | "construction"
                        | "completed"
                        | "delivered",
                    )
                  }
                  disabled={isSubmitting}
                  className="focus:ring-primaryColor w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-transparent focus:ring-2 disabled:opacity-50"
                >
                  <option value="planning">Planificación</option>
                  <option value="pre_sale">Pre-venta</option>
                  <option value="construction">Construcción</option>
                  <option value="completed">Completado</option>
                  <option value="delivered">Entregado</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Prioridad del proyecto
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={watchedValues.priority || 0}
                  onChange={(e) => setValue("priority", parseInt(e.target.value) || 0)}
                  disabled={isSubmitting}
                  className="focus:ring-primaryColor w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-transparent focus:ring-2 disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Mayor número = mayor prioridad en el listado (0-1000)
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {!hideHeaderFooter && <Footer />}
    </form>
  );
}
