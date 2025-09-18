"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Plus, X, Upload, Download, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getProjectsAction } from "@/lib/actions/projects";
import { createUnitsInBulkAction } from "@/lib/actions/units";
import { BulkCreateUnitsSchema } from "@/lib/validations/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UnitImageUpload } from "@/components/unit-image-upload/UnitImageUpload";

type BulkCreateUnitsForm = z.infer<typeof BulkCreateUnitsSchema>;

const UNIT_TYPE_OPTIONS = [
  { value: "apartment", label: "Apartamento" },
  { value: "commercial_space", label: "Local Comercial" },
  { value: "garage", label: "Garage" },
  { value: "storage", label: "Depósito" },
  { value: "office", label: "Oficina" },
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

interface UnitFormData {
  unit_number: string;
  floor?: number;
  unit_type: string;
  bedrooms: number;
  bathrooms: number;
  total_area?: number;
  built_area?: number;
  orientation?: string;
  facing?: string;
  price: number;
  currency: string;
  description?: string;
  features: string[];
  images: string[];
  floor_plan_url?: string;
  dimensions?: string;
}

const defaultUnit: UnitFormData = {
  unit_number: "",
  unit_type: "apartment",
  bedrooms: 0,
  bathrooms: 0,
  price: 0,
  currency: "USD",
  features: [],
  images: [],
};

export default function CreateBulkUnitsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [units, setUnits] = useState<UnitFormData[]>([{ ...defaultUnit }]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const addUnit = () => {
    setUnits([...units, { ...defaultUnit }]);
  };

  const removeUnit = (index: number) => {
    if (units.length > 1) {
      setUnits(units.filter((_, i) => i !== index));
      // Remove validation error for this unit
      const newErrors = { ...validationErrors };
      delete newErrors[index];
      setValidationErrors(newErrors);
    }
  };

  const updateUnit = (index: number, field: keyof UnitFormData, value: any) => {
    const newUnits = [...units];
    newUnits[index] = { ...newUnits[index], [field]: value };
    setUnits(newUnits);

    // Clear validation error for this unit when updating
    if (validationErrors[index]) {
      const newErrors = { ...validationErrors };
      delete newErrors[index];
      setValidationErrors(newErrors);
    }
  };

  const addFeatureToUnit = (unitIndex: number, feature: string) => {
    if (feature.trim() && !units[unitIndex].features.includes(feature.trim())) {
      updateUnit(unitIndex, 'features', [...units[unitIndex].features, feature.trim()]);
    }
  };

  const removeFeatureFromUnit = (unitIndex: number, featureToRemove: string) => {
    const newFeatures = units[unitIndex].features.filter(f => f !== featureToRemove);
    updateUnit(unitIndex, 'features', newFeatures);
  };

  const validateUnits = () => {
    setValidationErrors({});
    const errors: Record<number, string> = {};

    // Check for required fields and duplicate unit numbers
    const unitNumbers = new Set<string>();

    units.forEach((unit, index) => {
      // Required field validation
      if (!unit.unit_number.trim()) {
        errors[index] = "Número de unidad es requerido";
        return;
      }

      if (!unit.unit_type) {
        errors[index] = "Tipo de unidad es requerido";
        return;
      }

      if (!unit.price || unit.price <= 0) {
        errors[index] = "Precio debe ser mayor a 0";
        return;
      }

      // Duplicate unit number validation
      const unitNumber = unit.unit_number.toLowerCase().trim();
      if (unitNumbers.has(unitNumber)) {
        errors[index] = "Número de unidad duplicado";
        return;
      }
      unitNumbers.add(unitNumber);

      // Garage validation for negative floors
      if (unit.floor !== undefined && unit.floor < 0) {
        if (!["garage", "storage"].includes(unit.unit_type)) {
          errors[index] = "Unidades en pisos negativos deben ser de tipo Garage o Depósito";
          return;
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Real-time validation for submit button state
  const isFormValid = () => {
    if (!selectedProjectId || units.length === 0) return false;

    // Check each unit has required fields
    return units.every(unit =>
      unit.unit_number.trim() &&
      unit.unit_type &&
      unit.price > 0
    );
  };

  // Get validation summary for display
  const getValidationSummary = () => {
    if (!selectedProjectId) return "Selecciona un proyecto";
    if (units.length === 0) return "Agrega al menos una unidad";

    const invalidUnits = units.filter((unit, index) =>
      !unit.unit_number.trim() ||
      !unit.unit_type ||
      unit.price <= 0
    );

    if (invalidUnits.length > 0) {
      return `${invalidUnits.length} unidad(es) tienen campos requeridos faltantes`;
    }

    return null;
  };

  const onSubmit = async () => {
    setError(null);

    if (!selectedProjectId) {
      setError("Debe seleccionar un proyecto");
      return;
    }

    if (!validateUnits()) {
      setError("Por favor corrige los errores en las unidades marcadas");
      return;
    }

    startTransition(async () => {
      try {
        const bulkData: BulkCreateUnitsForm = {
          project_id: selectedProjectId,
          units: units.map(unit => ({
            unit_number: unit.unit_number,
            floor: unit.floor,
            unit_type: unit.unit_type as any,
            bedrooms: unit.bedrooms,
            bathrooms: unit.bathrooms,
            total_area: unit.total_area,
            built_area: unit.built_area,
            orientation: unit.orientation,
            facing: unit.facing,
            price: unit.price,
            currency: unit.currency as any,
            description: unit.description,
            features: unit.features,
            images: unit.images,
            floor_plan_url: unit.floor_plan_url,
            dimensions: unit.dimensions,
          }))
        };

        const result = await createUnitsInBulkAction(bulkData);

        if (result.success) {
          router.push("/super/dashboard/units?status=pending");
          router.refresh();
        } else {
          setError(result.error || "Error desconocido");
        }
      } catch (error) {
        console.error("Error submitting bulk units:", error);
        setError("Error interno del servidor");
      }
    });
  };

  const downloadTemplate = () => {
    const csvContent = [
      "unit_number,floor,unit_type,bedrooms,bathrooms,total_area,built_area,orientation,facing,price,currency,description,dimensions,floor_plan_url",
      "101,1,apartment,2,1,85.5,75.0,Norte,Calle principal,150000,USD,Hermoso apartamento,8x10,https://ejemplo.com/plano101.pdf",
      "102,1,apartment,3,2,95.0,85.0,Sur,Patio interno,180000,USD,Apartamento espacioso,9x11,",
      "G01,-1,garage,0,0,15.0,15.0,,Garage,25000,USD,Plaza de garaje,4x4,https://ejemplo.com/garage_plan.pdf"
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_unidades.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Por favor selecciona un archivo CSV válido');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const lines = csvText.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
          setError('El archivo CSV debe contener al menos una línea de encabezado y una fila de datos');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const expectedHeaders = ['unit_number', 'floor', 'unit_type', 'bedrooms', 'bathrooms', 'total_area', 'built_area', 'orientation', 'facing', 'price', 'currency', 'description', 'dimensions', 'floor_plan_url'];

        // Validate headers
        const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
          setError(`Faltan las siguientes columnas en el CSV: ${missingHeaders.join(', ')}`);
          return;
        }

        const csvUnits: UnitFormData[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());

          if (values.length !== headers.length) {
            setError(`Error en línea ${i + 1}: número incorrecto de columnas`);
            return;
          }

          const rowData: Record<string, string> = {};
          headers.forEach((header, index) => {
            rowData[header] = values[index] || '';
          });

          const unit: UnitFormData = {
            unit_number: rowData.unit_number || '',
            floor: rowData.floor ? parseInt(rowData.floor) : undefined,
            unit_type: rowData.unit_type || 'apartment',
            bedrooms: rowData.bedrooms ? parseInt(rowData.bedrooms) : 0,
            bathrooms: rowData.bathrooms ? parseInt(rowData.bathrooms) : 0,
            total_area: rowData.total_area ? parseFloat(rowData.total_area) : undefined,
            built_area: rowData.built_area ? parseFloat(rowData.built_area) : undefined,
            orientation: rowData.orientation || undefined,
            facing: rowData.facing || undefined,
            price: rowData.price ? parseFloat(rowData.price) : 0,
            currency: rowData.currency || 'USD',
            description: rowData.description || undefined,
            features: [],
            images: [],
            floor_plan_url: rowData.floor_plan_url || undefined,
            dimensions: rowData.dimensions || undefined,
          };

          csvUnits.push(unit);
        }

        if (csvUnits.length > 0) {
          setUnits(csvUnits);
          setError(null);
          setValidationErrors({});
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        setError('Error al procesar el archivo CSV. Verifica que esté correctamente formateado.');
      }
    };

    reader.readAsText(file);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
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
          Crear Unidades en Lote
        </span>
      </div>

      {/* Header */}
      <div className="mb-10">
        <h1 className="dashboard-title mb-3">Crear Unidades en Lote</h1>
        <p className="text-muted-foreground text-lg">
          Crea múltiples unidades de forma eficiente. Las unidades se crearán como "Pendientes" para revisión.
        </p>
      </div>

      {/* CSV Template and Upload */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Descargar Plantilla CSV
        </Button>
        <Button
          variant="outline"
          onClick={triggerFileUpload}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Subir CSV
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* CSV Upload Info */}
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Cómo usar:</strong>
          <br />1. Descarga la plantilla CSV y complétala con los datos de las unidades
          <br />2. Sube el CSV para llenar automáticamente el formulario
          <br />3. En cada unidad, selecciona las imágenes correspondientes
          <br />4. Confirma la creación - todas las unidades e imágenes se suben en una sola transacción
          <br />
          <strong>Importante:</strong> Si algo falla, nada se sube. El archivo CSV debe respetar el formato exacto de la plantilla.
        </AlertDescription>
      </Alert>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Project Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Seleccionar Proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingProjects ? (
            <div className="flex items-center gap-2 rounded-md border p-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-gray-500">
                Cargando proyectos...
              </span>
            </div>
          ) : (
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
            >
              <SelectTrigger className="w-full">
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
        </CardContent>
      </Card>

      {/* Units Form */}
      <div className="space-y-6">
        {units.map((unit, index) => {
          const hasRequiredFieldsError = !unit.unit_number.trim() || !unit.unit_type || unit.price <= 0;
          const borderColor = validationErrors[index] || hasRequiredFieldsError ? "border-destructive" : "";

          return (
          <Card key={index} className={borderColor}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">
                Unidad {index + 1}
                {(validationErrors[index] || hasRequiredFieldsError) && (
                  <Badge variant="destructive" className="ml-2">
                    {validationErrors[index] ? "Error" : "Campos Requeridos"}
                  </Badge>
                )}
              </CardTitle>
              {units.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeUnit(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {validationErrors[index] && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{validationErrors[index]}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Unit Number */}
                <div>
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    Número de Unidad <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={unit.unit_number}
                    onChange={(e) => updateUnit(index, 'unit_number', e.target.value)}
                    placeholder="Ej: 101, A1, PH-1"
                  />
                </div>

                {/* Unit Type */}
                <div>
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    Tipo <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={unit.unit_type}
                    onValueChange={(value) => updateUnit(index, 'unit_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Floor */}
                <div>
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    Piso
                  </label>
                  <Input
                    type="number"
                    value={unit.floor || ""}
                    onChange={(e) => updateUnit(index, 'floor', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Ej: 1, -1"
                  />
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    Dormitorios
                  </label>
                  <Input
                    type="number"
                    value={unit.bedrooms}
                    onChange={(e) => updateUnit(index, 'bedrooms', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    Baños
                  </label>
                  <Input
                    type="number"
                    value={unit.bathrooms}
                    onChange={(e) => updateUnit(index, 'bathrooms', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    Precio <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    value={unit.price}
                    onChange={(e) => updateUnit(index, 'price', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Total Area */}
                <div>
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    Área Total (m²)
                  </label>
                  <Input
                    type="number"
                    value={unit.total_area || ""}
                    onChange={(e) => updateUnit(index, 'total_area', e.target.value ? parseFloat(e.target.value) : undefined)}
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Built Area */}
                <div>
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    Área Construida (m²)
                  </label>
                  <Input
                    type="number"
                    value={unit.built_area || ""}
                    onChange={(e) => updateUnit(index, 'built_area', e.target.value ? parseFloat(e.target.value) : undefined)}
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Currency */}
                <div>
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    Moneda
                  </label>
                  <Select
                    value={unit.currency}
                    onValueChange={(value) => updateUnit(index, 'currency', value)}
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
                </div>

                {/* Orientation */}
                <div className="md:col-span-2">
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    Orientación
                  </label>
                  <Input
                    value={unit.orientation || ""}
                    onChange={(e) => updateUnit(index, 'orientation', e.target.value)}
                    placeholder="Ej: Norte, Sur, Este-Oeste"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-3">
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    Descripción
                  </label>
                  <Textarea
                    value={unit.description || ""}
                    onChange={(e) => updateUnit(index, 'description', e.target.value)}
                    placeholder="Descripción de la unidad..."
                    rows={2}
                  />
                </div>

                {/* Images Upload */}
                <div className="md:col-span-3">
                  <UnitImageUpload
                    value={unit.images}
                    onChange={(newImages) => updateUnit(index, 'images', newImages)}
                    unitId={`bulk-unit-${index}`}
                    disabled={isPending}
                    deferUpload={true}
                  />
                </div>

                {/* Floor Plan URL */}
                <div className="md:col-span-3">
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    URL del Plano de Planta
                  </label>
                  <Input
                    value={unit.floor_plan_url || ""}
                    onChange={(e) => updateUnit(index, 'floor_plan_url', e.target.value)}
                    type="url"
                    placeholder="https://ejemplo.com/plano.pdf"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {/* Add Unit Button */}
      <div className="mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={addUnit}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Agregar Otra Unidad
        </Button>
      </div>

      {/* Validation Summary */}
      {getValidationSummary() && (
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Formulario incompleto:</strong> {getValidationSummary()}
          </AlertDescription>
        </Alert>
      )}

      {/* Form Actions */}
      <div className="flex flex-col justify-end gap-4 pt-8 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isPending || !isFormValid()}
          className="min-w-[160px]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando {units.length} unidades...
            </>
          ) : (
            `Crear ${units.length} Unidades en Lote`
          )}
        </Button>
      </div>

      {/* Info Alert */}
      <Alert className="mt-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Las unidades se crearán con estado "Pendiente" y requerirán
          aprobación manual desde el listado de unidades antes de estar disponibles para operaciones.
        </AlertDescription>
      </Alert>
    </div>
  );
}