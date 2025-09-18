// =============================================================================
// VERIFICATION STATUS COMPONENT
// Displays user's current verification status and available actions
// =============================================================================

import { VerificationStatus as Status } from "@prisma/client";

// =============================================================================
// TYPES
// =============================================================================

interface VerificationStatusProps {
  isVerified: boolean;
  status?: Status;
  verificationCompletedAt?: Date;
  canStartVerification?: boolean;
  hasActiveSessions?: boolean;
}

// =============================================================================
// STATUS DISPLAY COMPONENT
// =============================================================================

export function VerificationStatus({
  isVerified,
  status = "NOT_STARTED",
  verificationCompletedAt,
  canStartVerification = false,
  hasActiveSessions = false,
}: VerificationStatusProps) {

  // Status configuration
  const statusConfig = {
    NOT_STARTED: {
      label: "No iniciada",
      color: "bg-gray-100 text-gray-800",
      icon: "⏳",
      description: "La verificación de identidad no ha sido iniciada",
    },
    IN_PROGRESS: {
      label: "En progreso",
      color: "bg-blue-100 text-blue-800",
      icon: "🔄",
      description: "Verificación en progreso, por favor completa el proceso",
    },
    IN_REVIEW: {
      label: "En revisión",
      color: "bg-yellow-100 text-yellow-800",
      icon: "👁️",
      description: "Los documentos están siendo revisados por nuestro equipo",
    },
    APPROVED: {
      label: "Verificada",
      color: "bg-green-100 text-green-800",
      icon: "✅",
      description: "Tu identidad ha sido verificada exitosamente",
    },
    DECLINED: {
      label: "Rechazada",
      color: "bg-red-100 text-red-800",
      icon: "❌",
      description: "La verificación fue rechazada, puedes intentar nuevamente",
    },
    EXPIRED: {
      label: "Expirada",
      color: "bg-gray-100 text-gray-800",
      icon: "⏰",
      description: "La sesión de verificación ha expirado",
    },
    ABANDONED: {
      label: "Abandonada",
      color: "bg-gray-100 text-gray-800",
      icon: "🚪",
      description: "La verificación fue abandonada",
    },
  };

  const currentStatus = isVerified ? "APPROVED" : status;
  const config = statusConfig[currentStatus];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
            {config.icon}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-medium text-gray-900">
              Verificación de Identidad
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {config.description}
          </p>

          {isVerified && verificationCompletedAt && (
            <p className="text-xs text-gray-500">
              Verificada el {new Date(verificationCompletedAt).toLocaleDateString("es-UY")}
            </p>
          )}

          {hasActiveSessions && (
            <div className="mt-3 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                Tienes una verificación en progreso. Por favor completa el proceso antes de iniciar una nueva.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// VERIFICATION BADGE COMPONENT
// =============================================================================

interface VerificationBadgeProps {
  isVerified: boolean;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function VerificationBadge({
  isVerified,
  size = "md",
  showText = true
}: VerificationBadgeProps) {
  const sizeClasses = {
    sm: "w-4 h-4 text-xs",
    md: "w-5 h-5 text-sm",
    lg: "w-6 h-6 text-base",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  if (isVerified) {
    return (
      <div className="flex items-center space-x-1">
        <div className={`${sizeClasses[size]} rounded-full bg-green-100 flex items-center justify-center`}>
          <span className="text-green-600">✓</span>
        </div>
        {showText && (
          <span className={`${textSizeClasses[size]} text-green-600 font-medium`}>
            Verificado
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      <div className={`${sizeClasses[size]} rounded-full bg-gray-100 flex items-center justify-center`}>
        <span className="text-gray-400">?</span>
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} text-gray-500`}>
          No verificado
        </span>
      )}
    </div>
  );
}