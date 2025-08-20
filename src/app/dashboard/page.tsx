'use client';

import { ChartLineMultiple } from '@/components/dashboard/ChartLineMultiple';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { ArrowRightIcon, BuildingIcon, AlertTriangle } from 'lucide-react';
import { useAuth, useIsAdmin } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { isLoading, isAuthenticated } = useAuth();
  const isAdmin = useIsAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      if (!isAdmin) {
        // Show access denied message and redirect to home after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryColor mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show access denied message for non-admin users
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">
            No tienes permisos para acceder a esta sección. Solo los administradores pueden ver el dashboard.
          </p>
          <p className="text-sm text-gray-500">
            Serás redirigido al inicio en unos segundos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="flex w-full items-start justify-between gap-5">
        <InfoCard title="Unidades Vendidas" number={234} />

        <InfoCard title="Unidades Disponibles" number={192} />

        <InfoCard title="Unidades Reservadas" number={43} />

        <InfoCard title="Clientes" number={126} />
      </div>

      <ChartLineMultiple />

      <div className="flex justify-between gap-5">
        <Card className="flex min-h-[30vh] w-fit flex-col items-center justify-between p-8">
          <CardTitle className="text-2xl text-[#0040FF]">
            Ventas del mes
          </CardTitle>
          <CardContent className="p-0">
            <p className="text-4xl font-bold text-black">$1.267.984</p>
          </CardContent>
          <CardFooter className="pb-0">
            <button className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0040FF] px-6 py-2 whitespace-nowrap text-white">
              Ver ventas
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </CardFooter>
        </Card>

        <Card className="flex min-h-[30vh] w-full flex-col p-6">
          <CardTitle className="mb-4 text-2xl text-[#0040FF]">
            Compradores Frecuentes
          </CardTitle>
          <CardContent className="flex-1 p-0">
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full overflow-hidden rounded-xl">
                <thead className="bg-[#E8EEFF]">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium first:rounded-tl-xl">
                      Comprador
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Unidades
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Proyectos
                    </th>
                    <th className="px-4 py-3 text-left font-medium last:rounded-tr-xl">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 font-medium text-white">
                          JR
                        </div>
                        <span className="font-medium">Juan Rodríguez</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">8</td>
                    <td className="px-4 py-3">3</td>
                    <td className="px-4 py-3 font-bold text-green-600">
                      $2.340.500
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500 font-medium text-white">
                          MG
                        </div>
                        <span className="font-medium">María González</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">5</td>
                    <td className="px-4 py-3">2</td>
                    <td className="px-4 py-3 font-bold text-green-600">
                      $1.890.750
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 font-medium text-white">
                          CR
                        </div>
                        <span className="font-medium">Carlos Ramírez</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">6</td>
                    <td className="px-4 py-3">4</td>
                    <td className="px-4 py-3 font-bold text-green-600">
                      $2.156.300
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoCard({ title, number }: { title: string; number: number }) {
  return (
    <div className="flex h-fit w-full items-center justify-start gap-5 rounded-2xl border border-[#DCDCDC] bg-white px-6 py-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5]">
        <BuildingIcon className="h-7 w-7 text-[#F5F5F5]" fill="#0040FF" />
      </div>

      <div className="flex flex-col items-start justify-center gap-1">
        <h3 className="text-sm text-[#7B7B7B]">{title}</h3>
        <p className="text-2xl font-bold">{number}</p>
      </div>
    </div>
  );
}
