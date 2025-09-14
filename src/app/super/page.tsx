"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Logo from "@/assets/Domera.svg";

import CredentialsForm from "./edit-project/_components/CredentialsForm";
import ErrorMessage from "./edit-project/_components/ErrorMessage";
import ProgressIndicator from "./edit-project/_components/ProgressIndicator";
import SuccessMessage from "./edit-project/_components/SuccessMessage";
import { AuthStep, FormData, UserData } from "./edit-project/_components/types";
import VerificationForm from "./edit-project/_components/VerificationForm";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [authStep, setAuthStep] = useState<AuthStep>("credentials");
  const [userData, setUserData] = useState<UserData | null>(null);

  const [formData, setFormData] = useState<FormData>({
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
      } catch {
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
    } catch {
      setError("Error enviando nuevo código. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <ProgressIndicator authStep={authStep} />

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

            <ErrorMessage error={error} />

            {/* Render current step */}
            {authStep === "credentials" && (
              <CredentialsForm
                formData={formData}
                showPassword={showPassword}
                isSubmitting={isSubmitting}
                onInputChange={handleInputChange}
                onTogglePassword={() => setShowPassword(!showPassword)}
                onSubmit={handleCredentialsSubmit}
              />
            )}
            {authStep === "verification" && (
              <VerificationForm
                userData={userData}
                verificationCode={verificationCode}
                isSubmitting={isSubmitting}
                countdown={countdown}
                onCodeChange={(code) => {
                  setVerificationCode(code);
                  if (error) setError("");
                }}
                onSubmit={handleVerificationSubmit}
                onResendCode={handleResendCode}
                onBackToLogin={() => {
                  setAuthStep("credentials");
                  setUserData(null);
                  setVerificationCode("");
                  setCountdown(0);
                  setError("");
                }}
              />
            )}
            {authStep === "success" && <SuccessMessage />}
          </div>
        </div>
      </div>
    </div>
  );
}
