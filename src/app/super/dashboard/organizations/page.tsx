'use client';

import { useState, useRef } from 'react';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createOrganizationAction } from '@/lib/actions/organizations';
import { Upload, X, Image } from 'lucide-react';

export default function OrganizationsPage() {
  const { user, isLoading: isSessionLoading, isAuthenticated } = useSuperAdmin();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    websiteUrl: '',
    description: '',
    logo: null as File | null,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'name' && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData((prev) => ({
        ...prev,
        slug: slug,
      }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('El archivo del logo debe ser menor a 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('El archivo debe ser una imagen');
        return;
      }

      setFormData((prev) => ({ ...prev, logo: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logo: null }));
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement file upload to Supabase storage and get URL
      // For now, we'll skip the logo and implement file upload later
      const organizationData = {
        name: formData.name,
        slug: formData.slug,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        taxId: formData.taxId || undefined,
        websiteUrl: formData.websiteUrl || undefined,
        description: formData.description || undefined,
        status: 'pending_approval' as const,
        // logo: formData.logo, // TODO: Implement file upload
      };

      const result = await createOrganizationAction(organizationData);

      if (result.success) {
        setSuccess('Organizacion creada exitosamente');
        setFormData({
          name: '',
          slug: '',
          email: '',
          phone: '',
          address: '',
          taxId: '',
          websiteUrl: '',
          description: '',
          logo: null,
        });
        setLogoPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(result.error || 'Error al crear la organizaci�n');
      }
    } catch (err) {
      setError('Error inesperado al crear la organizaci�n');
      console.error('Error:', err);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  if (isSessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Redirigiendo al login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="dashboard-title">Gestion de Organizaciones</h1>
        </div>

        {/* Create Organization Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Nueva Organizacion</CardTitle>
            <CardDescription>
              Completa los datos para crear una nueva organizacion
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
                    Nombre de la Organizacion *
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
                    Slug (identificador unico) *
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
                    title="Solo letras min�sculas, n�meros y guiones"
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
                    Telofono
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
                    Direccion
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

              {/* Website and Logo */}
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

                {/* Logo Upload */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Logo de la Organizacion
                  </label>
                  <div className="space-y-3">
                    {logoPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-20 w-20 rounded-lg border object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                        <Image className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">PNG, JPG hasta 5MB</p>
                      </div>
                    )}
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                      id="logo-upload"
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {logoPreview ? 'Cambiar Logo' : 'Subir Logo'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Descripcion
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  placeholder="Breve descripcion de la organizacion..."
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
                <Button type="submit" disabled={isSubmitLoading} className="px-6">
                  {isSubmitLoading ? 'Creando...' : 'Crear Organizacion'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Organizations List (placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle>Organizaciones Existentes</CardTitle>
            <CardDescription>
              Lista de todas las organizaciones registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center text-gray-500">
              <p>Funcionalidad de listado proximamente...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
