"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeftIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { ProjectFormData } from "@/types/project-form";
import {
  ImageType,
  type ImageTypeValue,
  type ProjectImage,
} from "@/types/project-images";
import { getOrganizationsAction } from "@/lib/actions/organizations";
import { checkSlugAvailabilityAction } from "@/lib/actions/projects";
import { uploadProjectImages } from "@/lib/actions/storage";
import { ProjectImagesManager } from "@/lib/utils/project-images";
import { generateSlug } from "@/lib/utils/slug";
import { CreateProjectCarousel } from "@/components/create-project-form/project-carousel/CreateProjectCarousel";
import { CreateProjectDescription } from "@/components/create-project-form/project-description/CreateProjectDescription";
import { ProjectDetailsForm } from "@/components/create-project-form/project-details/ProjectDetailsForm";
import { CreateProjectHeroForm } from "@/components/create-project-form/project-hero/CreateProjectHeroForm";
import { CreateProjectLocation } from "@/components/create-project-form/project-location/CreateProjectLocation";
import { CreateProjectProgress } from "@/components/create-project-form/project-progress/CreateProjectProgress";
import { ProjectMainImageForm } from "@/components/create-project-form/project-upload/CreateProjectUpload";
import Footer from "@/components/Footer";
import Header from "@/components/header/Header";

interface ProjectFormMainProps {
  initialData?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  isEditing?: boolean;
  organizationId?: string;
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
  showBackButton = false,
  onBack,
}: ProjectFormMainProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [pendingImagesByType, setPendingImagesByType] = useState<{
    hero: File[];
    card: File[];
    carousel: File[];
    progress: File[];
  }>({
    hero: [],
    card: [],
    carousel: [],
    progress: [],
  });
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
    hasParking: false,
    hasStudio: false,
    has1Bedroom: false,
    has2Bedroom: false,
    has3Bedroom: false,
    has4Bedroom: false,
    has5Bedroom: false,
    hasCommercial: false,
    isEditing,
    ...initialData,
  };

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
    mode: "onSubmit",
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
            const data = result.data as { data: Organization[] };
            const orgs = data.data || [];
            setOrganizations(orgs);
          }
        } catch (error: unknown) {
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
    } catch (error: unknown) {
      setSlugCheckResult({ error: "Error de conexión al verificar slug" });
    }
  };

  // Helper function to manage image files by type
  const updateImagesByType = (type: ImageTypeValue, files: File[]) => {
    setPendingImagesByType((prev) => ({
      ...prev,
      [type]: files,
    }));

    // Create immediate preview URLs for hero and carousel images
    if (type === ImageType.HERO) {
      const imageManager = new ProjectImagesManager(watchedValues.images || []);
      // Remove existing HERO images manually
      const filteredImages = imageManager
        .getAllImages()
        .filter((img) => img.type !== ImageType.HERO);
      const newImageManager = new ProjectImagesManager(filteredImages);

      // Add new preview URLs
      if (files.length > 0) {
        const previewUrls = files.map((file) => URL.createObjectURL(file));

        // Create proper ProjectImage objects for the preview URLs
        let updatedManager = newImageManager;
        previewUrls.forEach((url, index) => {
          updatedManager = updatedManager.addImage(url, ImageType.HERO, index, {
            isMain: true,
            uploadedAt: new Date().toISOString(),
            altText: `Imagen hero (preview)`,
          });
        });

        setValue("images", updatedManager.toLegacyStringArray());
      } else {
        setValue("images", newImageManager.toLegacyStringArray());
      }
    }

    // Same logic for CAROUSEL images
    if (type === ImageType.CAROUSEL) {
      const imageManager = new ProjectImagesManager(watchedValues.images || []);
      // Remove existing CAROUSEL images manually
      const filteredImages = imageManager
        .getAllImages()
        .filter((img) => img.type !== ImageType.CAROUSEL);
      const newImageManager = new ProjectImagesManager(filteredImages);

      // Add new preview URLs
      if (files.length > 0) {
        const previewUrls = files.map((file) => URL.createObjectURL(file));

        // Create proper ProjectImage objects for the preview URLs
        let updatedManager = newImageManager;
        previewUrls.forEach((url, index) => {
          updatedManager = updatedManager.addImage(
            url,
            ImageType.CAROUSEL,
            index,
            {
              isMain: false,
              uploadedAt: new Date().toISOString(),
              altText: `Imagen carousel ${index + 1} (preview)`,
            },
          );
        });

        setValue("images", updatedManager.toLegacyStringArray());
      } else {
        setValue("images", newImageManager.toLegacyStringArray());
      }
    }

    // Same logic for PROGRESS images
    if (type === ImageType.PROGRESS) {
      const imageManager = new ProjectImagesManager(watchedValues.images || []);
      // Remove existing PROGRESS images manually
      const filteredImages = imageManager
        .getAllImages()
        .filter((img) => img.type !== ImageType.PROGRESS);
      const newImageManager = new ProjectImagesManager(filteredImages);

      // Add new preview URLs
      if (files.length > 0) {
        const previewUrls = files.map((file) => URL.createObjectURL(file));

        // Create proper ProjectImage objects for the preview URLs
        let updatedManager = newImageManager;
        previewUrls.forEach((url, index) => {
          updatedManager = updatedManager.addImage(
            url,
            ImageType.PROGRESS,
            index,
            {
              isMain: false,
              uploadedAt: new Date().toISOString(),
              altText: `Avance de obra ${index + 1} (preview)`,
            },
          );
        });

        setValue("images", updatedManager.toLegacyStringArray());
      } else {
        setValue("images", newImageManager.toLegacyStringArray());
      }
    }
  };

  const handleFormSubmit = async (data: ProjectFormData) => {
    try {
      console.log("=== FORM SUBMIT DEBUG ===");
      console.log("Initial data.images:", data.images);
      console.log(
        "pendingImagesByType:",
        JSON.stringify(pendingImagesByType, null, 2),
      );

      // Create ProjectImagesManager from existing data
      const imageManager = new ProjectImagesManager(data.images || []);
      console.log("Initial imageManager state:");
      console.log("- All images:", imageManager.getAllImages());
      console.log(
        "- Hero images:",
        imageManager.getImagesByType(ImageType.HERO),
      );
      console.log("- Hero count:", imageManager.getImageCount(ImageType.HERO));
      console.log("- Has hero image:", imageManager.hasHeroImage());

      // Upload images by type and create ProjectImage objects
      const processImagesByType = async (
        files: File[],
        type: ImageTypeValue,
      ): Promise<ProjectImage[]> => {
        if (files.length === 0) return [];

        console.log(`Processing ${files.length} files for type ${type}`);

        const formData = new FormData();
        files.forEach((file, index) => {
          console.log(`- File ${index}: ${file.name}, size: ${file.size}`);
          formData.append(`image-${index}`, file);
        });

        const tempProjectId = crypto.randomUUID();
        const uploadResult = await uploadProjectImages(formData, tempProjectId);

        if (!uploadResult.success || !uploadResult.images) {
          throw new Error(uploadResult.error || "Error al subir imágenes");
        }

        return uploadResult.images.map((img, index) => ({
          url: img.url,
          type,
          order: index,
          metadata: {
            uploadedAt: new Date().toISOString(),
            isMain: type === ImageType.HERO || type === ImageType.CARD,
            altText: `Imagen ${type} ${index + 1}`,
          },
        }));
      };

      // Process each type of image
      let updatedManager = imageManager;

      // Upload and add hero images
      if (pendingImagesByType.hero.length > 0) {
        console.log(
          `About to process ${pendingImagesByType.hero.length} hero images`,
        );
        console.log(
          "Current hero count before processing:",
          updatedManager.getImageCount(ImageType.HERO),
        );

        // Remove existing hero images first to avoid conflicts
        const existingHeroImages = updatedManager.getImagesByType(
          ImageType.HERO,
        );
        existingHeroImages.forEach((existingImg) => {
          console.log("Removing existing hero image:", existingImg.url);
          updatedManager = updatedManager.removeImage(
            existingImg.url,
            ImageType.HERO,
          );
        });
        console.log(
          "Hero count after cleanup:",
          updatedManager.getImageCount(ImageType.HERO),
        );

        const heroImages = await processImagesByType(
          pendingImagesByType.hero,
          ImageType.HERO,
        );
        console.log("Processed hero images:", heroImages);

        heroImages.forEach((img, index) => {
          console.log(`Adding hero image ${index + 1}:`, {
            url: img.url,
            type: img.type,
            order: img.order,
            currentHeroCount: updatedManager.getImageCount(ImageType.HERO),
          });
          try {
            updatedManager = updatedManager.addImage(
              img.url,
              img.type,
              img.order,
              img.metadata,
            );
            console.log(`Successfully added hero image ${index + 1}`);
          } catch (error) {
            console.error(`Error adding hero image ${index + 1}:`, error);
            throw error;
          }
        });
      }

      // Upload and add card images
      if (pendingImagesByType.card.length > 0) {
        console.log(
          `About to process ${pendingImagesByType.card.length} card images`,
        );

        // Remove existing card images first to avoid conflicts
        const existingCardImages = updatedManager.getImagesByType(
          ImageType.CARD,
        );
        existingCardImages.forEach((existingImg) => {
          console.log("Removing existing card image:", existingImg.url);
          updatedManager = updatedManager.removeImage(
            existingImg.url,
            ImageType.CARD,
          );
        });

        const cardImages = await processImagesByType(
          pendingImagesByType.card,
          ImageType.CARD,
        );
        cardImages.forEach((img) => {
          updatedManager = updatedManager.addImage(
            img.url,
            img.type,
            img.order,
            img.metadata,
          );
        });
      }

      // Upload and add carousel images
      if (pendingImagesByType.carousel.length > 0) {
        console.log(
          `About to process ${pendingImagesByType.carousel.length} carousel images`,
        );

        // Remove existing carousel images first to avoid conflicts
        const existingCarouselImages = updatedManager.getImagesByType(
          ImageType.CAROUSEL,
        );
        existingCarouselImages.forEach((existingImg) => {
          console.log("Removing existing carousel image:", existingImg.url);
          updatedManager = updatedManager.removeImage(
            existingImg.url,
            ImageType.CAROUSEL,
          );
        });

        const carouselImages = await processImagesByType(
          pendingImagesByType.carousel,
          ImageType.CAROUSEL,
        );
        carouselImages.forEach((img) => {
          updatedManager = updatedManager.addImage(
            img.url,
            img.type,
            img.order,
            img.metadata,
          );
        });
      }

      // Upload and add progress images
      if (pendingImagesByType.progress.length > 0) {
        console.log(
          `About to process ${pendingImagesByType.progress.length} progress images`,
        );

        // Remove existing progress images first to avoid conflicts
        const existingProgressImages = updatedManager.getImagesByType(
          ImageType.PROGRESS,
        );
        existingProgressImages.forEach((existingImg) => {
          console.log("Removing existing progress image:", existingImg.url);
          updatedManager = updatedManager.removeImage(
            existingImg.url,
            ImageType.PROGRESS,
          );
        });

        const progressImages = await processImagesByType(
          pendingImagesByType.progress,
          ImageType.PROGRESS,
        );
        progressImages.forEach((img) => {
          updatedManager = updatedManager.addImage(
            img.url,
            img.type,
            img.order,
            img.metadata,
          );
        });
      }

      // For compatibility during transition, convert back to legacy string array format
      // TODO: In future, change createProjectAction to accept ProjectImage[]
      const finalImages = updatedManager.toLegacyStringArray();
      console.log("finalImages", finalImages);

      // Prepare final data
      const processedData = {
        ...data,
        images: finalImages, // This maintains compatibility with current system
      };

      await onSubmit(processedData as ProjectFormData);
    } catch (error: unknown) {
      // Don't log Next.js redirect "errors" - they are expected behavior
      if (error instanceof Error && error.message === "NEXT_REDIRECT") {
        return;
      }
      // Show user-friendly error message
      console.error("Error submitting form:", error);
      console.error(
        `Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
      );
    }
  };

  // Helper function to get current images by type for form components
  const getImagesByType = (type: ImageTypeValue): string[] => {
    const imageManager = new ProjectImagesManager(watchedValues.images || []);
    return imageManager.getImagesByType(type).map((img) => img.url);
  };

  // Formatear datos hero - solo imagen HERO específica
  const heroData = {
    name: watchedValues.name || "",
    basePrice: watchedValues.basePrice ?? null,
    neighborhood: watchedValues.neighborhood || "",
    city: watchedValues.city || "",
    estimatedCompletion: watchedValues.estimatedCompletion ?? null,
    images: getImagesByType(ImageType.HERO), // Solo imágenes HERO
  };

  // Formatear datos descripción
  const descriptionData = {
    description: watchedValues.description || "",
    shortDescription: watchedValues.shortDescription || "",
    address: watchedValues.address || "",
  };

  // Formatear datos detalles
  const detailsData = {
    amenities: watchedValues.amenities || [],
    detalles: watchedValues.detalles || [],
    details: watchedValues.details || [],
  };

  // Formatear datos ubicación
  const locationData = {
    latitude: watchedValues.latitude ?? null,
    longitude: watchedValues.longitude ?? null,
    masterPlanFiles: watchedValues.masterPlanFiles || [],
  };

  // Formatear datos carousel - solo imágenes CAROUSEL específicas
  const carouselData = {
    images: getImagesByType(ImageType.CAROUSEL), // Solo imágenes CAROUSEL
  };

  // Formatear datos imagen principal
  const mainImageData = {
    images: watchedValues.images || [],
    name: watchedValues.name || "",
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="min-h-screen bg-white"
    >
      <Header />

      <main>
        {/* PROJECT HERO FORM - Gestión específica de imágenes HERO */}
        <CreateProjectHeroForm
          value={heroData}
          onChange={(newHeroData) => {
            setValue("name", newHeroData.name);
            setValue("basePrice", newHeroData.basePrice);
            setValue("neighborhood", newHeroData.neighborhood);
            setValue("city", newHeroData.city);
            setValue("estimatedCompletion", newHeroData.estimatedCompletion);
            // NO actualizamos images aquí, se maneja con onHeroImageChange
          }}
          onHeroImageChange={(files) =>
            updateImagesByType(ImageType.HERO, files)
          }
          currency={watchedValues.currency || "USD"}
          disabled={isSubmitting}
          error={errors.name?.message || errors.basePrice?.message}
        />

        {/* PROJECT INFO - Botón de volver para dashboard */}
        {showBackButton && onBack && (
          <div className="container mx-auto mb-10 flex h-[10dvh] flex-col items-start justify-between gap-4 px-4 md:flex-row md:items-center md:gap-0 md:px-0">
            <Link
              href="/super"
              className="text-primaryColor hover:text-shadow-primaryColor-hover inline-flex items-center gap-2 font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Volver a lista de proyectos
            </Link>

            <div className="font-medium text-neutral-400">Creando proyecto</div>
          </div>
        )}

        {/* IMAGEN PRINCIPAL FORM - Solo para modo dashboard */}

        <div className="mb-10">
          <div className="container mx-auto px-4 md:px-0">
            <ProjectMainImageForm
              value={mainImageData}
              onChange={(newMainImageData) => {
                setValue("images", newMainImageData.images);
              }}
              onCardImageChange={(files) =>
                updateImagesByType(ImageType.CARD, files)
              }
              masterPlanFiles={watchedValues.masterPlanFiles || []}
              onMasterPlanFilesChange={(files) =>
                setValue("masterPlanFiles", files)
              }
              disabled={isSubmitting}
              error={errors.images?.message}
              projectId={tempProjectId || "temp"}
            />
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL - Exactamente igual al layout original */}
        <div className="container mx-auto flex w-full flex-col gap-10 px-4 md:flex-row md:px-0">
          <div className="flex w-full flex-col gap-5">
            {/* PROJECT DESCRIPTION FORM */}
            <CreateProjectDescription
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
            {/* IMAGE CAROUSEL FORM - Gestión específica de imágenes CAROUSEL */}
            <CreateProjectCarousel
              value={carouselData}
              onChange={() => {
                // NO actualizamos images aquí, se maneja con onCarouselImagesChange
              }}
              onCarouselImagesChange={(files) =>
                updateImagesByType(ImageType.CAROUSEL, files)
              }
              projectName={watchedValues.name || "Proyecto"}
              disabled={isSubmitting}
              error={errors.images?.message}
              className="py-5 md:py-10"
              projectId={tempProjectId || "temp"}
            />
            {/* LOCATION FORM - Mapa para dashboard */}
            <CreateProjectLocation
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
            {/* PROGRESS FORM - Gestión específica de imágenes PROGRESS */}
            <CreateProjectProgress
              progressImages={getImagesByType(ImageType.PROGRESS)}
              onProgressImagesChange={(files) =>
                updateImagesByType(ImageType.PROGRESS, files)
              }
              onChange={(imageUrls) => {
                // No necesitamos hacer nada aquí porque updateImagesByType ya maneja
                // la actualización inmediata de las URLs de preview
              }}
              disabled={isSubmitting}
              projectId={tempProjectId || "temp"}
            />
          </div>
        </div>

        {/* Configuración del proyecto - MOVIDO ANTES DE LOS BOTONES */}
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
                  onChange={(e) =>
                    setValue("priority", parseInt(e.target.value) || 0)
                  }
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

        {/* TIPOS DE UNIDADES - Checkboxes para tipos de unidades disponibles */}
        <div className="container mx-auto px-4 pb-10 md:px-0">
          <div className="rounded-lg bg-gray-50 p-6">
            <h3 className="mb-4 font-semibold text-gray-900">
              Tipos de unidades disponibles
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={watchedValues.hasParking}
                  onChange={(e) => setValue("hasParking", e.target.checked)}
                  disabled={isSubmitting}
                  className="text-primaryColor focus:ring-primaryColor h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Estacionamiento</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={watchedValues.hasStudio}
                  onChange={(e) => setValue("hasStudio", e.target.checked)}
                  disabled={isSubmitting}
                  className="text-primaryColor focus:ring-primaryColor h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Monoambiente</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={watchedValues.has1Bedroom}
                  onChange={(e) => setValue("has1Bedroom", e.target.checked)}
                  disabled={isSubmitting}
                  className="text-primaryColor focus:ring-primaryColor h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">1 Dormitorio</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={watchedValues.has2Bedroom}
                  onChange={(e) => setValue("has2Bedroom", e.target.checked)}
                  disabled={isSubmitting}
                  className="text-primaryColor focus:ring-primaryColor h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">2 Dormitorios</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={watchedValues.has3Bedroom}
                  onChange={(e) => setValue("has3Bedroom", e.target.checked)}
                  disabled={isSubmitting}
                  className="text-primaryColor focus:ring-primaryColor h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">3 Dormitorios</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={watchedValues.has4Bedroom}
                  onChange={(e) => setValue("has4Bedroom", e.target.checked)}
                  disabled={isSubmitting}
                  className="text-primaryColor focus:ring-primaryColor h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">4 Dormitorios</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={watchedValues.has5Bedroom}
                  onChange={(e) => setValue("has5Bedroom", e.target.checked)}
                  disabled={isSubmitting}
                  className="text-primaryColor focus:ring-primaryColor h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">5 Dormitorios</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={watchedValues.hasCommercial}
                  onChange={(e) => setValue("hasCommercial", e.target.checked)}
                  disabled={isSubmitting}
                  className="text-primaryColor focus:ring-primaryColor h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Comercial</span>
              </label>
            </div>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN - AHORA DESPUÉS DE LA CONFIGURACIÓN */}
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
      </main>

      <Footer />
    </form>
  );
}
