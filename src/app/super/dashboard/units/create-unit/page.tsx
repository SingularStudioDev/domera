"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getProjectsAction } from "@/lib/actions/projects";
import { createUnitAction } from "@/lib/actions/units";
import { CreateUnitSchema } from "@/lib/validations/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OptimizedImageUpload } from "@/components/create-project-form/OptimizedImageUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type CreateUnitForm = z.infer<typeof CreateUnitSchema>;

const UNIT_TYPE_OPTIONS = [
  { value: "apartment", label: "Apartamento" },
  { value: "commercial_space", label: "Local Comercial" },
  { value: "garage", label: "Garage" },
  { value: "storage", label: "Depósito" },
  { value: "office", label: "Oficina" },
] as const;

const UNIT_STATUS_OPTIONS = [
  { value: "available", label: "Disponible" },
  { value: "reserved", label: "Reservada" },
  { value: "sold", label: "Vendida" },
  { value: "in_process", label: "En Proceso" },
] as const;

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" },
  { value: "UYU", label: "UYU" },
] as const;

interface Project {
  id: string;
  name: string;
  address: string;
  city: string;
}

export default function CreateUnitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateUnitForm>({
    resolver: zodResolver(CreateUnitSchema),
    defaultValues: {
      bedrooms: 0,
      bathrooms: 0,
      currency: "USD" as const,
      features: [],
      images: [],
      price: 0,
    },
  });

  const selectedProjectId = watch("project_id");

  // Load projects on component mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const result = await getProjectsAction({ page: 1, pageSize: 100 });
        if (result.success && result.data) {
          const projectsData = (result.data as any).data || [];
          setProjects(projectsData);
        }
      } catch (error) {
        console.error("Error loading projects:", error);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  // Handle URL error parameter
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      const updatedFeatures = [...features, newFeature.trim()];
      setFeatures(updatedFeatures);
      setValue("features", updatedFeatures);
      setNewFeature("");
    }
  };

  const removeFeature = (featureToRemove: string) => {
    const updatedFeatures = features.filter((f) => f !== featureToRemove);
    setFeatures(updatedFeatures);
    setValue("features", updatedFeatures);
  };

  const handleImagesChange = (newImages: string[]) => {
    setUploadedImages(newImages);
    setValue("images", newImages);
  };

  const onSubmit = async (data: CreateUnitForm) => {
    setError(null);

    startTransition(async () => {
      try {
        // Map schema fields to DAL expected format
        const unitInput = {
          projectId: data.project_id,
          unitNumber: data.unit_number,
          unitType: data.unit_type,
          status: "available" as any, // Default status
          floor: data.floor || 0,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          area: data.total_area || 0, // Maps to totalArea in DAL
          price: data.price,
          orientation: data.orientation,
          balcony: false, // Default values for missing boolean fields
          terrace: false,
          features: data.features || [],
          images: uploadedImages || [],
        };

        const result = await createUnitAction(unitInput);

        if (result.success) {
          router.push("/super/dashboard/units");
          router.refresh();
        } else {
          setError(result.error || "Error desconocido");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        setError("Error interno del servidor");
      }
    });
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground text-sm">
          Crear Nueva Unidad
        </span>
      </div>

      {/* Header */}
      <div className="mb-10">
        <h1 className="dashboard-title mb-3">Crear Nueva Unidad</h1>
        <p className="text-muted-foreground text-lg">
          Completa la información de la unidad para agregarla al proyecto
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/5 border-destructive/20 mb-8 rounded-xl border p-4">
          <div className="flex items-start gap-3">
            <div className="bg-destructive/10 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
              <X className="text-destructive h-3 w-3" />
            </div>
            <div className="flex-1">
              <h3 className="text-destructive mb-1 text-sm font-medium">
                Error al crear la unidad
              </h3>
              <p className="text-destructive/80 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Project Selection */}
              <div className="md:col-span-2">
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Proyecto <span className="text-destructive">*</span>
                </label>
                {loadingProjects ? (
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-500">
                      Cargando proyectos...
                    </span>
                  </div>
                ) : (
                  <Select
                    onValueChange={(value) => setValue("project_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name} - {project.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.project_id && (
                  <p className="text-destructive mt-2 flex items-start gap-1.5 text-sm">
                    <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    {errors.project_id.message}
                  </p>
                )}
              </div>

              {/* Unit Number */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Número de Unidad <span className="text-destructive">*</span>
                </label>
                <Input
                  {...register("unit_number")}
                  placeholder="Ej: 101, A1, PH-1"
                />
                {errors.unit_number && (
                  <p className="text-destructive mt-2 flex items-start gap-1.5 text-sm">
                    <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    {errors.unit_number.message}
                  </p>
                )}
              </div>

              {/* Unit Type */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Tipo de Unidad <span className="text-destructive">*</span>
                </label>
                <Select
                  onValueChange={(value) => setValue("unit_type", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.unit_type && (
                  <p className="text-destructive mt-2 flex items-start gap-1.5 text-sm">
                    <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    {errors.unit_type.message}
                  </p>
                )}
              </div>

              {/* Floor */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Piso
                </label>
                <Input
                  {...register("floor", { valueAsNumber: true })}
                  type="number"
                  min="-10"
                  max="100"
                  placeholder="Ej: 1, -1"
                />
                {errors.floor && (
                  <p className="text-destructive mt-2 flex items-start gap-1.5 text-sm">
                    <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    {errors.floor.message}
                  </p>
                )}
              </div>

              {/* Bedrooms */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Dormitorios
                </label>
                <Input
                  {...register("bedrooms", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  max="10"
                  placeholder="0"
                />
                {errors.bedrooms && (
                  <p className="text-destructive mt-2 flex items-start gap-1.5 text-sm">
                    <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    {errors.bedrooms.message}
                  </p>
                )}
              </div>

              {/* Bathrooms */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Baños
                </label>
                <Input
                  {...register("bathrooms", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  max="10"
                  placeholder="0"
                />
                {errors.bathrooms && (
                  <p className="text-destructive mt-2 flex items-start gap-1.5 text-sm">
                    <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    {errors.bathrooms.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Dimensiones y Precio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Total Area */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Área Total (m²)
                </label>
                <Input
                  {...register("total_area", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ej: 85.5"
                />
                {errors.total_area && (
                  <p className="text-destructive mt-2 flex items-start gap-1.5 text-sm">
                    <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    {errors.total_area.message}
                  </p>
                )}
              </div>

              {/* Built Area */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Área Construida (m²)
                </label>
                <Input
                  {...register("built_area", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ej: 75.0"
                />
                {errors.built_area && (
                  <p className="text-destructive mt-2 flex items-start gap-1.5 text-sm">
                    <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    {errors.built_area.message}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Precio <span className="text-destructive">*</span>
                </label>
                <Input
                  {...register("price", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ej: 150000"
                />
                {errors.price && (
                  <p className="text-destructive mt-2 flex items-start gap-1.5 text-sm">
                    <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    {errors.price.message}
                  </p>
                )}
              </div>

              {/* Currency */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Moneda
                </label>
                <Select
                  defaultValue="USD"
                  onValueChange={(value) => setValue("currency", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p className="text-destructive mt-2 flex items-start gap-1.5 text-sm">
                    <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    {errors.currency.message}
                  </p>
                )}
              </div>

              {/* Orientation */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Orientación
                </label>
                <Input
                  {...register("orientation")}
                  placeholder="Ej: Norte, Sur, Este-Oeste"
                />
                {errors.orientation && (
                  <p className="text-destructive mt-2 flex items-start gap-1.5 text-sm">
                    <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    {errors.orientation.message}
                  </p>
                )}
              </div>

              {/* Facing */}
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Frente
                </label>
                <Input
                  {...register("facing")}
                  placeholder="Ej: Calle principal, Patio interno"
                />
                {errors.facing && (
                  <p className="text-destructive mt-2 flex items-start gap-1.5 text-sm">
                    <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    {errors.facing.message}
                  </p>
                )}
              </div>

              {/* Dimensions */}
              <div className="md:col-span-2">
                <label className="text-foreground mb-2 block text-sm font-medium">
                  Dimensiones
                </label>
                <Input
                  {...register("dimensions")}
                  placeholder="Ej: 8x10m, 12x15m"
                />
                {errors.dimensions && (
                  <p className="text-destructive mt-2 flex items-start gap-1.5 text-sm">
                    <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    {errors.dimensions.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Descripción y Características
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Description */}
            <div className="mb-6">
              <label className="text-foreground mb-2 block text-sm font-medium">
                Descripción
              </label>
              <Textarea
                {...register("description")}
                rows={4}
                placeholder="Describe las características principales de la unidad..."
                className="resize-vertical"
              />
              {errors.description && (
                <p className="text-destructive mt-2 flex items-start gap-1.5 text-sm">
                  <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Features */}
            <div>
              <label className="text-foreground mb-3 block text-sm font-medium">
                Características
              </label>
              <div className="mb-4 flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Ej: Balcón, Terraza, Parrillero..."
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addFeature())
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFeature}
                  disabled={!newFeature.trim()}
                  className="px-3"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {features.map((feature, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="hover:bg-secondary/80 flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(feature)}
                        className="hover:bg-secondary-foreground/10 ml-1 rounded-sm p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              {features.length === 0 && (
                <p className="text-muted-foreground text-sm italic">
                  No se han agregado características aún
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Imágenes y Planos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Images Upload */}
            <div className="mb-6">
              <label className="mb-4 block text-sm font-medium text-gray-700">
                Imágenes de la Unidad
              </label>
              <OptimizedImageUpload
                value={uploadedImages}
                onChange={handleImagesChange}
                entityType="unit"
                entityId={selectedProjectId}
                maxImages={15}
                placeholder="Subir imágenes de la unidad"
                disabled={isSubmitting || isPending}
                aspectRatio="aspect-video"
                showUploadButton={true}
              />
            </div>

            {/* Floor Plan */}
            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">
                URL del Plano de Planta
              </label>
              <Input
                {...register("floor_plan_url")}
                type="url"
                placeholder="https://ejemplo.com/plano.pdf"
              />
              {errors.floor_plan_url && (
                <p className="text-destructive mt-2 flex items-start gap-1.5 text-sm">
                  <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  {errors.floor_plan_url.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex flex-col justify-end gap-4 pt-6 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending || isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isPending || isSubmitting || !selectedProjectId}
            className="min-w-[140px]"
          >
            {isPending || isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Unidad"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
