'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getOrganizationsAction } from '@/lib/actions/organizations';
import Header from '@/components/header/Header';
import Footer from '@/components/Footer';
import { ProjectHeroForm } from '@/components/create-project-form/ProjectHeroForm';
import { ProjectDescriptionForm } from '@/components/create-project-form/ProjectDescriptionForm';
import { ProjectDetailsForm } from '@/components/create-project-form/ProjectDetailsForm';
import { ImageCarouselForm } from '@/components/create-project-form/ImageCarouselForm';
import { LocationFormComponent } from '@/components/create-project-form/LocationForm';
import { ProgressFormComponent } from '@/components/create-project-form/ProgressForm';
import { MapSelector } from '@/components/create-project-form/MapSelector';
import { ProjectFormData } from '@/types/project-form';
import { projectFormSchema } from '@/lib/validations/project-form';

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

export const ProjectFormMain: React.FC<ProjectFormMainProps> = ({
  initialData,
  onSubmit,
  isEditing = false,
  organizationId,
  hideHeaderFooter = false,
  showBackButton = false,
  onBack,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);

  const defaultValues: ProjectFormData = {
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    address: '',
    neighborhood: '',
    city: '',
    latitude: null,
    longitude: null,
    basePrice: null,
    currency: 'USD',
    estimatedCompletion: null,
    organizationId: organizationId || undefined,
    status: 'planning',
    images: [],
    masterPlanFiles: [],
    amenities: [],
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
            setOrganizations(data.data || []);
          }
        } catch (error) {
          console.error('Error loading organizations:', error);
        } finally {
          setLoadingOrganizations(false);
        }
      };
      loadOrganizations();
    } else {
      setLoadingOrganizations(false);
    }
  }, [organizationId]);

  const handleFormSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      // Don't log Next.js redirect "errors" - they are expected behavior
      if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
        // Let the redirect happen, don't show as error
        return;
      }
      console.error('Error submitting form:', error);
      // Here you could show a toast notification or error message to user
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={hideHeaderFooter ? 'space-y-6' : 'min-h-screen bg-white'}
    >
      {!hideHeaderFooter && <Header />}

      <main>
        {/* PROJECT HERO FORM - Exactamente igual al layout original */}
        <ProjectHeroForm
          value={heroData}
          onChange={(newHeroData) => {
            setValue('name', newHeroData.name);
            setValue('basePrice', newHeroData.basePrice);
            setValue('neighborhood', newHeroData.neighborhood);
            setValue('city', newHeroData.city);
            setValue('estimatedCompletion', newHeroData.estimatedCompletion);
            setValue('images', newHeroData.images);
          }}
          currency={watchedValues.currency}
          disabled={isSubmitting}
          error={errors.name?.message || errors.basePrice?.message}
        />

        {/* PROJECT INFO - Botón de volver para dashboard */}
        {showBackButton && onBack && (
          <div className="mt-5 mb-20">
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
                    {isEditing ? 'Editando Proyecto' : 'Creando Nuevo Proyecto'}
                  </span>
                </div>
              </div>
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
                setValue('description', newDescriptionData.description);
                setValue(
                  'shortDescription',
                  newDescriptionData.shortDescription
                );
                setValue('address', newDescriptionData.address);
              }}
              disabled={isSubmitting}
              error={errors.description?.message || errors.address?.message}
            />

            {/* PROJECT DETAILS FORM */}
            <ProjectDetailsForm
              value={detailsData}
              onChange={(newDetailsData) => {
                setValue('amenities', newDetailsData.amenities);
              }}
              disabled={isSubmitting}
              error={errors.amenities?.message}
            />

            {/* IMAGE CAROUSEL FORM */}
            <ImageCarouselForm
              value={carouselData}
              onChange={(newCarouselData) => {
                setValue('images', newCarouselData.images);
              }}
              projectName={watchedValues.name || 'Proyecto'}
              disabled={isSubmitting}
              error={errors.images?.message}
              className="py-5 md:py-10"
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
                    setValue('latitude', lat);
                    setValue('longitude', lng);
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
                  setValue('latitude', newLocationData.latitude);
                  setValue('longitude', newLocationData.longitude);
                  setValue('masterPlanFiles', newLocationData.masterPlanFiles);
                }}
                projectName={watchedValues.name || 'Proyecto'}
                disabled={isSubmitting}
                error={errors.latitude?.message || errors.longitude?.message}
              />
            )}

            {/* PROGRESS FORM - Nota: Este será manejado como una sección separada */}
            <ProgressFormComponent
              progressImages={[]}
              onProgressImagesChange={() => {}}
              disabled={isSubmitting}
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
                  ? 'Actualizando...'
                  : 'Creando...'
                : isEditing
                  ? 'Actualizar Proyecto'
                  : 'Crear Proyecto'}
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
                    onChange={(e) => setValue('organizationId', e.target.value)}
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
                <input
                  type="text"
                  value={watchedValues.slug}
                  onChange={(e) => setValue('slug', e.target.value)}
                  placeholder="slug-del-proyecto"
                  disabled={isSubmitting}
                  className="focus:ring-primaryColor w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-transparent focus:ring-2 disabled:opacity-50"
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.slug.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Estado del proyecto
                </label>
                <select
                  value={watchedValues.status}
                  onChange={(e) =>
                    setValue(
                      'status',
                      e.target.value as
                        | 'planning'
                        | 'pre_sale'
                        | 'construction'
                        | 'completed'
                        | 'delivered'
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
            </div>
          </div>
        </div>
      </main>

      {!hideHeaderFooter && <Footer />}
    </form>
  );
};
