"use client";

import { useCallback, useEffect, useState } from "react";

import { Building, Save } from "lucide-react";

import {
  getOrganizationByIdAction,
  updateOrganizationAction,
  uploadOrganizationLogoAction,
} from "@/lib/actions/organizations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/image-upload/ImageUpload";

interface Organization {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  websiteUrl?: string;
  description?: string;
  status: "active" | "inactive" | "pending_approval";
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface EditOrganizationFormProps {
  organizationId: string;
}

export default function EditOrganizationForm({
  organizationId,
}: EditOrganizationFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    email: "",
    phone: "",
    address: "",
    taxId: "",
    websiteUrl: "",
    description: "",
    status: "pending_approval" as Organization["status"],
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Load organization data
  useEffect(() => {
    const loadOrganization = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await getOrganizationByIdAction(organizationId);

        if (result.success && result.data) {
          const org = result.data as Organization;
          setOrganization(org);
          setFormData({
            name: org.name || "",
            slug: org.slug || "",
            email: org.email || "",
            phone: org.phone || "",
            address: org.address || "",
            taxId: org.taxId || "",
            websiteUrl: org.websiteUrl || "",
            description: org.description || "",
            status: org.status,
          });
        } else {
          setError(result.error || "Error cargando organización");
        }
      } catch (err) {
        setError("Error inesperado cargando organización");
        console.error("Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (organizationId) {
      loadOrganization();
    }
  }, [organizationId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = useCallback((file: File | null) => {
    setLogoFile(file);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let logoUrl = organization?.logoUrl;

      // Upload logo if a new one was selected
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append("logo", logoFile);

        const logoUploadResult = await uploadOrganizationLogoAction(
          organizationId,
          logoFormData,
        );

        if (logoUploadResult.success && logoUploadResult.data) {
          logoUrl = (logoUploadResult.data as { logoUrl: string }).logoUrl;
        } else {
          setError(logoUploadResult.error || "Error subiendo logo");
          return;
        }
      }

      // Update organization data
      const updateData = {
        ...formData,
        logoUrl,
      };

      const result = await updateOrganizationAction(organizationId, updateData);

      if (result.success) {
        setSuccess("Organización actualizada exitosamente");
        setLogoFile(null);
        
        // Update local organization state
        if (result.data) {
          const updatedOrg = result.data as Organization;
          setOrganization(updatedOrg);
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || "Error actualizando organización");
      }
    } catch (err) {
      setError("Error inesperado actualizando organización");
      console.error("Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Building className="mr-2 h-6 w-6 animate-pulse text-gray-400" />
            <p>Cargando datos de la organización...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!organization) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-600">
            <p>No se pudo cargar la organización</p>
            {error && <p className="mt-2 text-sm">{error}</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Editar Organización: {organization.name}
        </CardTitle>
        <CardDescription>
          Actualiza los datos de la organización
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Nombre de la Organización *
              </label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej: Constructora ABC"
                required
                maxLength={255}
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Slug (identificador único) *
              </label>
              <Input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="constructora-abc"
                required
                maxLength={100}
                pattern="^[a-z0-9-]+$"
                title="Solo letras minúsculas, números y guiones"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email *
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="contacto@constructora-abc.com"
                required
                maxLength={255}
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Teléfono
              </label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+598 99 123 456"
                maxLength={50}
              />
            </div>
          </div>

          {/* Address and Tax ID */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Dirección
              </label>
              <Input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Av. 18 de Julio 1234, Montevideo"
                maxLength={500}
              />
            </div>

            <div>
              <label
                htmlFor="taxId"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                RUT
              </label>
              <Input
                type="text"
                id="taxId"
                name="taxId"
                value={formData.taxId}
                onChange={handleInputChange}
                placeholder="210123456789"
                maxLength={50}
              />
            </div>
          </div>

          {/* Website and Status */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="websiteUrl"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Sitio Web
              </label>
              <Input
                type="url"
                id="websiteUrl"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleInputChange}
                placeholder="https://www.constructora-abc.com"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Estado
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="border-input bg-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="pending_approval">Pendiente de Aprobación</option>
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
              </select>
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Logo de la Organización
            </label>
            <ImageUpload
              value={logoFile}
              onChange={handleLogoChange}
              preview={organization.logoUrl}
              placeholder="Subir logo de la organización"
              aspectRatio="aspect-square"
              maxSize={5 * 1024 * 1024}
              accept="image/jpeg,image/png,image/webp"
              className="max-w-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              placeholder="Breve descripción de la organización..."
              maxLength={1000}
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-md border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving} className="px-6">
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}