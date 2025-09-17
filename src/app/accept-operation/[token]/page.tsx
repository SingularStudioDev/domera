"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import {
  EyeIcon,
  EyeOffIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingIcon,
  DollarSignIcon,
  CalendarIcon,
  UserIcon,
  MailIcon
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { acceptOperationAction } from "@/lib/actions/clients";
import { verifyConfirmationToken } from "@/lib/dal/clients";

// =============================================================================
// TYPES AND SCHEMAS
// =============================================================================

const acceptOperationSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña es requerida"),
});

type AcceptOperationFormData = z.infer<typeof acceptOperationSchema>;

interface TokenData {
  operationId: string;
  email: string;
  temporaryPassword: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AcceptOperationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedSuccessfully, setAcceptedSuccessfully] = useState(false);

  const form = useForm<AcceptOperationFormData>({
    resolver: zodResolver(acceptOperationSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const verifyToken = () => {
    try {
      const data = verifyConfirmationToken(token);
      if (data) {
        setTokenData(data);
        setIsValidToken(true);
        form.setValue("email", data.email);
      } else {
        setIsValidToken(false);
      }
    } catch (error) {
      setIsValidToken(false);
    }
  };

  const handleAcceptOperation = async (data: AcceptOperationFormData) => {
    if (!tokenData) return;

    try {
      setIsLoading(true);

      await acceptOperationAction({
        token,
        password: data.password,
      });

      setAcceptedSuccessfully(true);
      toast.success("¡Operación aceptada exitosamente!");

      // Redirect to login or dashboard after success
      setTimeout(() => {
        router.push("/login?message=Operación aceptada exitosamente. Puedes iniciar sesión con tus credenciales.");
      }, 3000);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al aceptar operación");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseTemporaryPassword = () => {
    if (tokenData) {
      form.setValue("password", tokenData.temporaryPassword);
      setShowPassword(true);
    }
  };

  // =============================================================================
  // RENDER STATES
  // =============================================================================

  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Verificando enlace...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Enlace inválido</h1>
              <p className="text-gray-500 mb-6">
                Este enlace de confirmación ha expirado o no es válido.
              </p>
              <Button
                onClick={() => router.push("/login")}
                variant="outline"
              >
                Ir al inicio de sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (acceptedSuccessfully) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Operación Aceptada!</h1>
              <p className="text-gray-500 mb-6">
                Tu operación ha sido confirmada exitosamente. Serás redirigido al inicio de sesión.
              </p>
              <div className="animate-pulse text-sm text-gray-400">
                Redirigiendo...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Confirmar Operación
          </h1>
          <p className="text-gray-500">
            Revisa los detalles y confirma tu operación
          </p>
        </div>

        {/* Operation Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BuildingIcon className="h-5 w-5" />
              Detalles de la Operación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-medium">{tokenData?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MailIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">ID de Operación</p>
                  <p className="font-medium text-xs">{tokenData?.operationId}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> Al confirmar esta operación, aceptas los términos y condiciones.
                Las unidades serán reservadas bajo tu nombre.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión para Confirmar</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleAcceptOperation)} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  {...form.register("email")}
                  type="email"
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Contraseña</label>
                <div className="relative">
                  <Input
                    {...form.register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>¿Primera vez?</strong> Usa la contraseña temporal enviada en el email.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUseTemporaryPassword}
                  disabled={!tokenData}
                >
                  Usar contraseña temporal
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !tokenData}
              >
                {isLoading ? "Confirmando..." : "Confirmar Operación"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                ¿Problemas para acceder?{" "}
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm"
                  onClick={() => router.push("/login")}
                >
                  Ir al inicio de sesión
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}