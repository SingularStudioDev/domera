// =============================================================================
// VERIFICATION CALLBACK PAGE
// Handles return from Didit verification process
// =============================================================================

import { Suspense } from "react";
import { redirect } from "next/navigation";

import { validateSession } from "@/lib/auth/validation";
import { getVerificationStatusAction } from "@/lib/actions/verification";

// =============================================================================
// CALLBACK CONTENT COMPONENT
// =============================================================================

async function CallbackContent({
  searchParams,
}: {
  searchParams: { sessionId?: string; status?: string };
}) {
  // Check authentication
  const authResult = await validateSession();
  if (!authResult.success || !authResult.user) {
    redirect("/login");
  }

  const { sessionId, status } = searchParams;

  // Get current verification status
  const verificationStatus = await getVerificationStatusAction();

  const isSuccess = status === "Approved";
  const isRejected = status === "Declined";
  const isPending = status === "In Progress" || status === "In Review";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Success State */}
        {isSuccess && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Verificación Exitosa!
            </h1>
            <p className="text-gray-600 mb-6">
              Tu identidad ha sido verificada correctamente. Ya puedes acceder a todas las funcionalidades de Domera.
            </p>
            <a
              href="/userDashboard"
              className="w-full inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Ir al Dashboard
            </a>
          </div>
        )}

        {/* Rejected State */}
        {isRejected && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Verificación Rechazada
            </h1>
            <p className="text-gray-600 mb-6">
              No pudimos verificar tu identidad. Por favor, intenta nuevamente o contacta con soporte.
            </p>
            <div className="space-y-3">
              <a
                href="/verification/test"
                className="w-full inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Intentar Nuevamente
              </a>
              <a
                href="mailto:soporte@domera.uy"
                className="w-full inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Contactar Soporte
              </a>
            </div>
          </div>
        )}

        {/* Pending State */}
        {isPending && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <svg
                className="h-6 w-6 text-yellow-600 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Verificación en Progreso
            </h1>
            <p className="text-gray-600 mb-6">
              Tu verificación está siendo procesada. Te notificaremos cuando esté completa.
            </p>
            <a
              href="/userDashboard"
              className="w-full inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Ir al Dashboard
            </a>
          </div>
        )}

        {/* Unknown/Default State */}
        {!isSuccess && !isRejected && !isPending && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
              <svg
                className="h-6 w-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Proceso de Verificación
            </h1>
            <p className="text-gray-600 mb-6">
              El proceso de verificación ha finalizado. Revisa tu estado en el dashboard.
            </p>
            <a
              href="/userDashboard"
              className="w-full inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ir al Dashboard
            </a>
          </div>
        )}

        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Debug Info (Development Only)
            </h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Session ID: {sessionId || "N/A"}</div>
              <div>Status: {status || "N/A"}</div>
              <div>User: {authResult.user.email}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function VerificationCallbackPage({
  searchParams,
}: {
  searchParams: { sessionId?: string; status?: string };
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Procesando verificación...</p>
        </div>
      </div>
    }>
      <CallbackContent searchParams={searchParams} />
    </Suspense>
  );
}