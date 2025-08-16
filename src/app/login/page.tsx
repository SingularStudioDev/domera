'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Footer from '@/components/Footer';
import { Separator } from '@/components/ui/separator';
import Logo from '@/assets/Domera.svg';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.email === 'prueba@test.com' && formData.password === 'Password.123') {
      if (rememberMe) {
        router.push('/dashboard');
      } else {
        router.push('/userDashboard');
      }
    } else {
      alert('Credenciales incorrectas');
    }
  };

  const handleGoogleLogin = () => {
    // Handle Google login
    console.log('Google login');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="absolute top-10 left-10">
        <Link href="/">
          <Logo width={213} height={56} />
        </Link>
      </div>
      {/* Main Login Section */}
      <div className="grid items-center lg:grid-cols-2">
        {/* Left Side - Form */}
        <div className="mx-auto items-center mt-12 flex w-full max-w-xl flex-col justify-center">
          <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center">
            {/* Form Title */}
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-semibold text-gray-900">
                Iniciar sesión
              </h2>
              <p className="text-gray-600">Bienvenido de vuelta a Domera</p>
            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 transition-colors hover:bg-gray-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Iniciar sesión con Google
            </button>

            <Separator className="my-4" />

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-2 w-full">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-blue-600"
                  placeholder="tu@email.com"
                  required
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
                    className="w-full rounded-md border border-gray-300 px-4 py-3 pr-12 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-blue-600"
                    placeholder="Tu contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex mt-1 items-center">

                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block cursor-pointer select-none text-sm text-gray-700"
                  >
                    Recordarme
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="text-blue-600 hover:text-blue-700">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full cursor-pointer rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Iniciar sesión
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link
                  href="/register"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Crear cuenta
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden h-screen w-[50vw] items-center justify-center lg:flex">
          <div className="relative w-full">
            <img
              src="/register-img.png"
              alt="Login Domera"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
