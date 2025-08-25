'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Header from '@/components/header/Header';
import Footer from '@/components/Footer';
import { ProjectHeroForm } from './ProjectHeroForm';
import { ProjectDescriptionForm } from './ProjectDescriptionForm';
import { ProjectDetailsForm } from './ProjectDetailsForm';
import { ImageCarouselForm } from './ImageCarouselForm';
import { LocationFormComponent } from './LocationForm';
import { ProgressFormComponent } from './ProgressForm';
import { ProjectFormData } from '@/types/project-form';
import { projectFormSchema } from '@/lib/validations/project-form';

interface ProjectFormMainProps {
  initialData?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  isEditing?: boolean;
  organizationId: string;
}

export const ProjectFormMain: React.FC<ProjectFormMainProps> = ({
  initialData,
  onSubmit,
  isEditing = false,
  organizationId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    organizationId,
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
    resolver: zodResolver(projectFormSchema),
    defaultValues,
  });

  const watchedValues = watch();

  const handleFormSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
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
      className="min-h-screen bg-white"
    >
      <Header />

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

        {/* PROJECT INFO - Estático como el original */}
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

            {/* LOCATION FORM */}
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

      <Footer />
    </form>
  );
};
