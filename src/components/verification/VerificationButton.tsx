// =============================================================================
// VERIFICATION BUTTON COMPONENT
// Button component for starting verification process
// =============================================================================

"use client";

import { useState } from "react";

import { startVerificationAction } from "@/lib/actions/verification";

// =============================================================================
// TYPES
// =============================================================================

interface VerificationButtonProps {
  isVerified?: boolean;
  canStartVerification?: boolean;
  hasActiveSessions?: boolean;
  onVerificationStarted?: (verificationUrl: string) => void;
  className?: string;
  variant?: "primary" | "secondary";
}

// =============================================================================
// VERIFICATION BUTTON COMPONENT
// =============================================================================

export function VerificationButton({
  isVerified = false,
  canStartVerification = true,
  hasActiveSessions = false,
  onVerificationStarted,
  className = "",
  variant = "primary",
}: VerificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Don't show button if already verified
  if (isVerified) {
    return null;
  }

  // Button styles based on variant
  const baseClasses = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  // Handle verification start
  const handleStartVerification = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await startVerificationAction();

      if (result.success && result.data) {
        const data = result.data as any;

        // If we got a verification URL, either redirect or call callback
        if (data.verificationUrl) {
          if (onVerificationStarted) {
            onVerificationStarted(data.verificationUrl);
          } else {
            // Default behavior: open in new window
            window.open(data.verificationUrl, "_blank", "width=800,height=600");
          }
        } else {
          setError("No se recibió URL de verificación");
        }
      } else {
        setError(result.error || "Error iniciando verificación");
      }
    } catch (error) {
      console.error("Error starting verification:", error);
      setError("Error inesperado al iniciar verificación");
    } finally {
      setIsLoading(false);
    }
  };

  // Button text based on state
  const getButtonText = () => {
    if (isLoading) return "Iniciando...";
    if (hasActiveSessions) return "Continuar verificación";
    return "Verificar identidad";
  };

  // Button disabled state
  const isDisabled = isLoading || (!canStartVerification && !hasActiveSessions);

  return (
    <div className="space-y-2">
      <button
        onClick={handleStartVerification}
        disabled={isDisabled}
        className={buttonClasses}
      >
        {isLoading && (
          <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {getButtonText()}
      </button>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
          {error}
        </div>
      )}

      {!canStartVerification && !hasActiveSessions && !isVerified && (
        <p className="text-xs text-gray-500">
          No se puede iniciar verificación en este momento
        </p>
      )}
    </div>
  );
}

// =============================================================================
// VERIFICATION FLOW COMPONENT
// =============================================================================

interface VerificationFlowProps {
  isVerified?: boolean;
  status?: string;
  verificationCompletedAt?: Date;
  canStartVerification?: boolean;
  hasActiveSessions?: boolean;
  className?: string;
}

export function VerificationFlow({
  isVerified = false,
  status = "NOT_STARTED",
  verificationCompletedAt,
  canStartVerification = true,
  hasActiveSessions = false,
  className = "",
}: VerificationFlowProps) {
  const handleVerificationStarted = (verificationUrl: string) => {
    // Open verification in same window for better user experience
    window.location.href = verificationUrl;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Verification explanation */}
      <div className="text-sm text-gray-600">
        <p>
          Para realizar operaciones en Domera, necesitas verificar tu identidad.
          Este proceso es seguro y cumple con todas las regulaciones de KYC.
        </p>
      </div>

      {/* Verification features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-green-600">🔒</span>
          <span>Proceso seguro</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-blue-600">⚡</span>
          <span>Verificación rápida</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-purple-600">🌍</span>
          <span>220+ países</span>
        </div>
      </div>

      {/* Action button */}
      <VerificationButton
        isVerified={isVerified}
        canStartVerification={canStartVerification}
        hasActiveSessions={hasActiveSessions}
        onVerificationStarted={handleVerificationStarted}
        variant="primary"
        className="w-full"
      />

      {/* Additional info for verified users */}
      {isVerified && verificationCompletedAt && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">✅</span>
            <span className="text-sm text-green-800 font-medium">
              Identidad verificada
            </span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            Verificada el {new Date(verificationCompletedAt).toLocaleDateString("es-UY")}
          </p>
        </div>
      )}
    </div>
  );
}