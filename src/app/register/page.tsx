'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/assets/Domera.svg';

import Footer from '@/components/Footer';
import { Separator } from '@/components/ui/separator';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleGoogleRegister = () => {
    // Handle Google registration
    console.log('Google registration');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="absolute top-10 left-10">
        <Link href="/">
          <Logo width={213} height={56} />
        </Link>
      </div>

      {/* Main Register Section */}
      <div className="grid items-center lg:grid-cols-2">
        {/* Left Side - Form */}
        <div className="mx-auto mt-12 flex w-full max-w-xl flex-col items-center justify-center">
          <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center">
            {/* Form Title */}
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-semibold text-gray-900">
                Crear cuenta
              </h2>
              <p className="text-gray-600">
                Únete a Domera y comienza a invertir en bienes raíces
              </p>
            </div>

            {/* Google Register Button */}
            <button
              onClick={handleGoogleRegister}
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
              Registrarse con Google
            </button>

            <Separator className="my-4" />

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-primaryColor"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-primaryColor"
                    placeholder="Tu apellido"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-primaryColor"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-primaryColor"
                  placeholder="Crea una contraseña segura"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-primaryColor"
                  placeholder="Confirma tu contraseña"
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full cursor-pointer rounded-md bg-primaryColor px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Crear cuenta
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link
                  href="/login"
                  className="font-medium text-primaryColor hover:text-blue-700"
                >
                  Iniciar sesión
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
              alt="Registro Domera"
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
