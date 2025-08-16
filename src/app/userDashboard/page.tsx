'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';
import Logo from '@/assets/Domera.svg';

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="absolute top-10 left-10">
        <Link href="/">
          <Logo width={213} height={56} />
        </Link>
      </div>

      <div className="container mx-auto px-6 pt-32">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Dashboard de Usuario
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Mis Propiedades
                </h3>
                <p className="text-blue-700">
                  Ver y gestionar mis inversiones inmobiliarias
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Documentos
                </h3>
                <p className="text-green-700">
                  Acceder a contratos y documentación legal
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">
                  Pagos
                </h3>
                <p className="text-purple-700">
                  Historial de pagos y próximos vencimientos
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-900 mb-2">
                  Perfil
                </h3>
                <p className="text-orange-700">
                  Actualizar información personal
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Soporte
                </h3>
                <p className="text-gray-700">
                  Contactar al equipo de atención al cliente
                </p>
              </div>

              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Configuración
                </h3>
                <p className="text-red-700">
                  Ajustar preferencias de la cuenta
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Link
                href="/"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}