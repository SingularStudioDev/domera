"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Logo from "@/assets/Domera.svg";

type AuthStep = "credentials" | "verification" | "success";

interface UserData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  tokenExpiry?: string;
}

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [authStep, setAuthStep] = useState<AuthStep>("credentials");
  const [userData, setUserData] = useState<UserData | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for token expiry
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Check for existing session
  useEffect(() => {
    // Check if user has active super admin session
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/super-admin/session-check");
        if (response.ok) {
          router.push("/super/dashboard");
        }
      } catch (error) {
        // No active session, stay on login page
      }
    };
    checkSession();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/super-admin/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Credenciales incorrectas");
        return;
      }

      // Store user data and move to verification step
      setUserData(result.data);
      setAuthStep("verification");

      // Set countdown timer (10 minutes = 600 seconds)
      setCountdown(600);
    } catch (error) {
      console.error("Super admin credentials validation error:", error);
      setError("Error al validar credenciales. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!userData) {
      setError("Error de sesión. Recarga la página.");
      return;
    }

    try {
      const response = await fetch("/api/auth/super-admin/verify-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.userId,
          token: verificationCode,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Código de verificación incorrecto");
        return;
      }

      // Success! Redirect to dashboard
      setAuthStep("success");
      setTimeout(() => {
        router.push("/super/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Super admin 2FA verification error:", error);
      setError("Error al verificar código. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!userData) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/super-admin/resend-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.userId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCountdown(600); // Reset countdown
        setVerificationCode(""); // Clear current code
        setError("");
        // Show success message briefly
        setError("Nuevo código enviado a tu email");
        setTimeout(() => setError(""), 3000);
      } else {
        setError(result.error || "Error enviando nuevo código");
      }
    } catch (error) {
      setError("Error enviando nuevo código. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Render different steps
  const renderCredentialsStep = () => (
    <form onSubmit={handleCredentialsSubmit} className="w-full space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full rounded-md border border-gray-300 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
          placeholder="tu@domera.uy"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 px-4 py-3 pr-12 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
            placeholder="Tu contraseña"
            required
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            {showPassword ? (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full cursor-pointer rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isSubmitting ? "Validando..." : "Continuar"}
      </button>
    </form>
  );

  const renderVerificationStep = () => (
    <div className="w-full space-y-4">
      <div className="mb-6 text-center">
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Verificación de dos factores
        </h3>
        <p className="text-sm text-gray-600">
          Hemos enviado un código de 6 dígitos a{" "}
          <strong>{userData?.email}</strong>
        </p>
        {countdown > 0 && (
          <p className="mt-2 text-xs text-gray-500">
            El código expira en {formatTime(countdown)}
          </p>
        )}
      </div>

      <form onSubmit={handleVerificationSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Código de verificación
          </label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => {
              setVerificationCode(
                e.target.value.replace(/\D/g, "").slice(0, 6),
              );
              if (error) setError("");
            }}
            className="w-full rounded-md border border-gray-300 px-4 py-3 text-center text-2xl tracking-widest transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
            placeholder="000000"
            maxLength={6}
            required
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || verificationCode.length !== 6}
          className="w-full cursor-pointer rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isSubmitting ? "Verificando..." : "Verificar código"}
        </button>
      </form>

      <div className="space-y-2 text-center">
        <button
          onClick={handleResendCode}
          disabled={isSubmitting || countdown > 540} // Allow resend after 1 minute
          className="text-sm text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          {countdown > 540
            ? "Espera 1 minuto para reenviar"
            : "Reenviar código"}
        </button>

        <button
          onClick={() => {
            setAuthStep("credentials");
            setUserData(null);
            setVerificationCode("");
            setCountdown(0);
            setError("");
          }}
          className="block w-full text-sm text-gray-600 hover:text-gray-700"
        >
          ← Volver al inicio de sesión
        </button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="w-full space-y-4 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900">
        ¡Autenticación exitosa!
      </h3>
      <p className="text-sm text-gray-600">
        Redirigiendo al panel de super administración...
      </p>
    </div>
  );

  return (
    <div className="h-screen bg-white">
      <div className="absolute top-10 left-10">
        <Link href="/">
          <Logo width={213} height={56} />
        </Link>
      </div>

      <div className="flex h-full w-full items-center justify-center">
        <div className="mx-auto mt-12 flex w-full max-w-xl flex-col items-center justify-center">
          <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center">
            {/* Progress indicator */}
            <div className="mb-8 w-full">
              <div className="mb-4 flex items-center justify-center space-x-4">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                    authStep === "credentials"
                      ? "bg-blue-600 text-white"
                      : authStep === "verification" || authStep === "success"
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  1
                </div>
                <div
                  className={`h-1 w-16 rounded ${
                    authStep === "verification" || authStep === "success"
                      ? "bg-green-600"
                      : "bg-gray-200"
                  }`}
                ></div>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                    authStep === "verification"
                      ? "bg-blue-600 text-white"
                      : authStep === "success"
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  2
                </div>
                <div
                  className={`h-1 w-16 rounded ${
                    authStep === "success" ? "bg-green-600" : "bg-gray-200"
                  }`}
                ></div>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                    authStep === "success"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  ✓
                </div>
              </div>
            </div>

            {/* Form Title */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-semibold text-gray-900">
                Acceso Super Administrador
              </h2>
              <p className="text-gray-600">
                {authStep === "credentials" &&
                  "Acceso exclusivo para super administradores de Domera"}
                {authStep === "verification" &&
                  "Verifica tu identidad con el código enviado"}
                {authStep === "success" &&
                  "Autenticación completada exitosamente"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className={`mb-4 rounded-md border p-3 ${
                  error.includes("enviado")
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <p
                  className={`text-sm ${
                    error.includes("enviado")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {error}
                </p>
              </div>
            )}

            {/* Render current step */}
            {authStep === "credentials" && renderCredentialsStep()}
            {authStep === "verification" && renderVerificationStep()}
            {authStep === "success" && renderSuccessStep()}
          </div>
        </div>
      </div>
    </div>
  );
}
