"use client";

import { useState } from "react";

import { 
  BuildingIcon, 
  CameraIcon, 
  EditIcon, 
  GlobeIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  SaveIcon,
  XIcon,
  FileTextIcon,
  StarIcon,
  UsersIcon,
  CalendarIcon
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data basado en el schema de Organization
const mockOrganization = {
  id: "org-123",
  name: "Desarrollos del Río SA",
  slug: "desarrollos-del-rio",
  email: "contacto@desarrollosdelrio.com",
  phone: "+598 2901 5000",
  address: "Av. Brasil 2500, Montevideo, Uruguay",
  taxId: "214567890013",
  status: "active",
  logoUrl: null,
  websiteUrl: "https://desarrollosdelrio.com",
  description: "Somos una desarrolladora inmobiliaria con más de 15 años de experiencia en el mercado uruguayo, especializados en proyectos residenciales de alta calidad en las mejores zonas de Montevideo.",
  createdAt: "2024-08-15T10:00:00Z",
  // Stats calculadas
  totalProjects: 8,
  activeProjects: 3,
  totalUnits: 247,
  soldUnits: 186,
  totalRevenue: 45670000
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [organization, setOrganization] = useState(mockOrganization);
  const [editForm, setEditForm] = useState(mockOrganization);

  const handleSave = () => {
    // Aquí iría la lógica para guardar en el backend
    setOrganization(editForm);
    setIsEditing(false);
    // TODO: Implementar llamada a la API
  };

  const handleCancel = () => {
    setEditForm(organization);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-UY", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activa";
      case "inactive":
        return "Inactiva";
      case "pending_approval":
        return "Pendiente de aprobación";
      case "suspended":
        return "Suspendida";
      default:
        return "Desconocido";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Perfil de la Organización</h1>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <EditIcon className="h-4 w-4" />
            Editar Perfil
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              <XIcon className="h-4 w-4" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              <SaveIcon className="h-4 w-4" />
              Guardar
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Organization Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BuildingIcon className="h-5 w-5" />
                Información de la Organización
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo and Basic Info */}
              <div className="flex items-start gap-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    {organization.logoUrl ? (
                      <img 
                        src={organization.logoUrl} 
                        alt="Logo" 
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <BuildingIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700">
                      <CameraIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 bg-transparent focus:outline-none"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-gray-900">{organization.name}</h2>
                    )}
                    <Badge className={getStatusColor(organization.status)}>
                      {getStatusText(organization.status)}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-1">@{organization.slug}</p>
                  <p className="text-gray-600">RUT: {organization.taxId}</p>
                  <p className="text-sm text-gray-500">
                    Miembro desde {formatDate(organization.createdAt)}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                {isEditing ? (
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {organization.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MailIcon className="h-5 w-5" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <MailIcon className="h-4 w-4 text-gray-400" />
                      <span>{organization.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 text-gray-400" />
                      <span>{organization.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    <span>{organization.address}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sitio Web
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={editForm.websiteUrl || ""}
                    onChange={(e) => setEditForm(prev => ({ ...prev, websiteUrl: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <GlobeIcon className="h-4 w-4 text-gray-400" />
                    {organization.websiteUrl ? (
                      <a 
                        href={organization.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {organization.websiteUrl}
                      </a>
                    ) : (
                      <span className="text-gray-500">No especificado</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StarIcon className="h-5 w-5" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BuildingIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Proyectos totales</span>
                </div>
                <span className="font-semibold">{organization.totalProjects}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Proyectos activos</span>
                </div>
                <span className="font-semibold text-green-600">{organization.activeProjects}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Unidades totales</span>
                </div>
                <span className="font-semibold">{organization.totalUnits}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StarIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Unidades vendidas</span>
                </div>
                <span className="font-semibold text-blue-600">{organization.soldUnits}</span>
              </div>

              <hr className="my-4" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Ingresos totales</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(organization.totalRevenue)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Tasa de conversión</span>
                <span className="font-bold text-blue-600">
                  {Math.round((organization.soldUnits / organization.totalUnits) * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileTextIcon className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                  <div>
                    <p className="text-gray-900">Nueva operación iniciada</p>
                    <p className="text-gray-500 text-xs">hace 2 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <p className="text-gray-900">Documentos validados</p>
                    <p className="text-gray-500 text-xs">hace 5 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2"></div>
                  <div>
                    <p className="text-gray-900">Profesional asignado</p>
                    <p className="text-gray-500 text-xs">hace 1 día</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}