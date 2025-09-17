"use client";

import { useState } from "react";

import { 
  BellIcon, 
  CheckIcon, 
  ChevronRightIcon, 
  FilterIcon, 
  MailIcon, 
  ShoppingCartIcon, 
  UserIcon,
  AlertTriangleIcon,
  FileTextIcon,
  DollarSignIcon
} from "lucide-react";

import { cn } from "@/utils/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data basado en el schema de Prisma
const mockNotifications = [
  {
    id: "1",
    type: "operation_update",
    title: "Nueva operación iniciada",
    message: "María González ha iniciado una operación para el apartamento 204 en Torres del Río",
    isRead: false,
    createdAt: "2025-01-15T10:30:00Z",
    operationId: "op-001",
    metadata: {
      clientName: "María González",
      projectName: "Torres del Río",
      unitNumber: "204"
    }
  },
  {
    id: "2", 
    type: "document_upload",
    title: "Documentos subidos",
    message: "Carlos Rodríguez subió los documentos requeridos para su operación",
    isRead: false,
    createdAt: "2025-01-15T09:45:00Z",
    operationId: "op-002",
    metadata: {
      clientName: "Carlos Rodríguez",
      documentCount: 3
    }
  },
  {
    id: "3",
    type: "validation_required", 
    title: "Validación requerida",
    message: "Documentos de Ana Martínez requieren validación",
    isRead: true,
    createdAt: "2025-01-14T16:20:00Z",
    operationId: "op-003",
    metadata: {
      clientName: "Ana Martínez",
      documentType: "Cédula de identidad"
    }
  },
  {
    id: "4",
    type: "payment_reminder",
    title: "Recordatorio de pago",
    message: "Roberto Silva tiene un pago pendiente que vence en 3 días",
    isRead: true,
    createdAt: "2025-01-14T14:00:00Z", 
    operationId: "op-004",
    metadata: {
      clientName: "Roberto Silva",
      amount: 5000,
      dueDate: "2025-01-17"
    }
  },
  {
    id: "5",
    type: "professional_assignment",
    title: "Profesional asignado",
    message: "Se asignó escribanía López & Asociados a la operación de Laura Fernández",
    isRead: true,
    createdAt: "2025-01-13T11:15:00Z",
    operationId: "op-005",
    metadata: {
      clientName: "Laura Fernández",
      professionalName: "López & Asociados"
    }
  },
  {
    id: "6",
    type: "system_announcement",
    title: "Actualización del sistema",
    message: "El sistema estará en mantenimiento el domingo de 2:00 a 6:00 AM",
    isRead: false,
    createdAt: "2025-01-13T08:00:00Z",
    metadata: {
      scheduledTime: "2025-01-19T02:00:00Z"
    }
  }
];

const notificationTypeConfig = {
  operation_update: {
    icon: ShoppingCartIcon,
    color: "bg-blue-100 text-blue-600",
    bgColor: "bg-blue-50"
  },
  document_upload: {
    icon: FileTextIcon,
    color: "bg-green-100 text-green-600", 
    bgColor: "bg-green-50"
  },
  validation_required: {
    icon: AlertTriangleIcon,
    color: "bg-orange-100 text-orange-600",
    bgColor: "bg-orange-50"
  },
  payment_reminder: {
    icon: DollarSignIcon,
    color: "bg-red-100 text-red-600",
    bgColor: "bg-red-50"
  },
  professional_assignment: {
    icon: UserIcon,
    color: "bg-purple-100 text-purple-600",
    bgColor: "bg-purple-50"
  },
  system_announcement: {
    icon: BellIcon,
    color: "bg-gray-100 text-gray-600",
    bgColor: "bg-gray-50"
  }
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const filteredNotifications = notifications.filter(notification => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.isRead;
    return notification.type === filter;
  });

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `hace ${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `hace ${Math.floor(diffHours)}h`;
    } else if (diffDays < 7) {
      return `hace ${Math.floor(diffDays)} días`;
    } else {
      return date.toLocaleDateString("es-UY", {
        day: "2-digit",
        month: "2-digit"
      });
    }
  };

  const getNotificationConfig = (type: string) => {
    return notificationTypeConfig[type as keyof typeof notificationTypeConfig] || notificationTypeConfig.system_announcement;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="bg-red-500">
              {unreadCount} sin leer
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <CheckIcon className="h-4 w-4" />
              Marcar todas como leídas
            </button>
          )}
          
          <div className="flex items-center gap-2">
            <FilterIcon className="h-4 w-4 text-gray-500" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Todas</option>
              <option value="unread">Sin leer</option>
              <option value="operation_update">Operaciones</option>
              <option value="document_upload">Documentos</option>
              <option value="validation_required">Validación</option>
              <option value="payment_reminder">Pagos</option>
              <option value="professional_assignment">Profesionales</option>
              <option value="system_announcement">Sistema</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <BellIcon className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay notificaciones
              </h3>
              <p className="text-gray-500 text-center max-w-sm">
                {filter === "unread" 
                  ? "No tienes notificaciones sin leer."
                  : "No hay notificaciones disponibles."
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => {
                const config = getNotificationConfig(notification.type);
                const IconComponent = config.icon;
                
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-4 p-6 transition-colors hover:bg-gray-50 cursor-pointer",
                      !notification.isRead && "bg-blue-50/50"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      config.color
                    )}>
                      <IconComponent className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={cn(
                            "font-medium text-gray-900",
                            !notification.isRead && "font-semibold"
                          )}>
                            {notification.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                            {notification.message}
                          </p>
                          
                          {/* Metadata */}
                          {notification.metadata && (
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              {notification.operationId && (
                                <span className="px-2 py-1 bg-gray-100 rounded">
                                  ID: {notification.operationId}
                                </span>
                              )}
                              {notification.metadata.clientName && (
                                <span className="px-2 py-1 bg-gray-100 rounded">
                                  Cliente: {notification.metadata.clientName}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Time & Status */}
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTime(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          )}
                          <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <BellIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-lg font-semibold">{notifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
                <MailIcon className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sin leer</p>
                <p className="text-lg font-semibold">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                <ShoppingCartIcon className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Operaciones</p>
                <p className="text-lg font-semibold">
                  {notifications.filter(n => n.type === "operation_update").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <AlertTriangleIcon className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Requieren acción</p>
                <p className="text-lg font-semibold">
                  {notifications.filter(n => 
                    n.type === "validation_required" || n.type === "payment_reminder"
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}