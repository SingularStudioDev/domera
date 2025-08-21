'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/assets/Domera.svg';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Check if user is super admin and redirect accordingly
      getSession().then((session) => {
        if (session?.user?.roles?.some(role => role.role === 'admin' && !role.organizationId)) {
          router.push('/superDashboard');
        } else {
          router.push('/');
        }
      });
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // First validate super admin credentials
      const superAdminValidation = await fetch('/api/auth/super-admin/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const validationResult = await superAdminValidation.json();

      if (!validationResult.success) {
        setError(validationResult.error || 'Credenciales incorrectas');
        return;
      }

      // If validation passes, sign in with NextAuth
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Error de autenticación. Intenta nuevamente.');
      } else if (result?.ok) {
        // Redirect to super dashboard
        router.push('/superDashboard');
      }
    } catch (error) {
      console.error('Super admin login error:', error);
      setError('Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Logo width={213} height={56} className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white">
      <div className="absolute top-10 left-10">
        <Link href="/">
          <Logo width={213} height={56} />
        </Link>
      </div>
      {/* Main Login Section */}
      <div className="flex h-full w-full items-center justify-center">
        {/* Left Side - Form */}
        <div className="mx-auto mt-12 flex w-full max-w-xl flex-col items-center justify-center">
          <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center">
            {/* Form Title */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-semibold text-gray-900">
                Acceso Super Administrador
              </h2>
              <p className="text-gray-600">Acceso exclusivo para super administradores de Domera</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="w-full space-y-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="focus:ring-primaryColor w-full rounded-md border border-gray-300 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2"
                  placeholder="tu@email.com"
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
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="focus:ring-primaryColor w-full rounded-md border border-gray-300 px-4 py-3 pr-12 transition-all outline-none focus:border-transparent focus:ring-2"
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
                className="bg-primaryColor mt-2 w-full cursor-pointer rounded-md px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
