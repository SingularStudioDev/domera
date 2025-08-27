import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Dispatch, SetStateAction } from 'react';
import {
  FileText,
  Eye,
  BedDoubleIcon,
  CarFrontIcon,
  DownloadIcon,
  FileDownIcon,
} from 'lucide-react';
import { FaFileDownload } from 'react-icons/fa';

interface ShoppingSheetProps {
  isSheetOpen: boolean;
  setIsSheetOpen: Dispatch<SetStateAction<boolean>>;
  projectName?: string;
  projectSubtitle?: string;
  projectAmount?: string;
  progressPercentage?: number;
  payments?: Array<{
    name: string;
    amount: string;
    dueDate: string;
    status: string;
  }>;
  blueprints?: Array<{
    name: string;
    url: string;
  }>;
}

export function ShoppingSheet({
  isSheetOpen,
  setIsSheetOpen,
  projectName = 'Winks Americas',
  projectSubtitle = 'Torre Residencial Premium',
  projectAmount = 'US$ 285.000',
  progressPercentage = 75,
  payments = [
    {
      name: 'Reserva',
      amount: 'US$ 5.000',
      dueDate: '15/01/2025',
      status: 'Pendiente',
    },
    {
      name: 'Primera cuota',
      amount: 'US$ 25.000',
      dueDate: '15/02/2025',
      status: 'Pendiente',
    },
    {
      name: 'Segunda cuota',
      amount: 'US$ 25.000',
      dueDate: '15/03/2025',
      status: 'Pendiente',
    },
    {
      name: 'Entrega',
      amount: 'US$ 230.000',
      dueDate: '15/12/2025',
      status: 'Pendiente',
    },
  ],
  blueprints = [
    { name: 'Planta del apartamento', url: '#' },
    { name: 'Planta del edificio', url: '#' },
  ],
}: ShoppingSheetProps) {
  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent
        side="right"
        className="w-[80vw] overflow-y-auto rounded-l-xl p-3 sm:max-w-[80vw]"
      >
        <div className="h-full bg-white">
          <div className="space-y-8 p-8">
            {/* Sección superior */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {projectName}
                </h1>
                <p className="mt-1 text-gray-800">{projectSubtitle}</p>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <div className="w-64">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-black">
                      {progressPercentage}% construído
                    </span>
                    <a
                      href="#"
                      className="text-primaryColor text-sm hover:underline"
                    >
                      Ver proyecto
                    </a>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="bg-primaryColor h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de pagos */}
            <div className="overflow-hidden rounded-lg bg-white">
              <div className="flex w-full items-center justify-between">
                <div className="mb-3 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900">
                    Unidad 604, Garage 02
                  </h3>
                  <div className="flex items-center gap-7 text-sm">
                    <p>Total:$187.000</p>
                    <div className="flex items-center gap-0.5">
                      <BedDoubleIcon className="h-4 w-4" />2
                    </div>
                    <div className="flex items-center gap-0.5">
                      <CarFrontIcon className="h-4 w-4" />1
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <a href="#" className="text-sm text-blue-600 hover:underline">
                    Contrato
                  </a>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border">
                <table className="w-full rounded-xl">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-black uppercase">
                        Pago
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-black uppercase">
                        Monto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-black uppercase">
                        Fecha de vencimiento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-black uppercase">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {payments.map((payment, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-2 text-sm font-medium whitespace-nowrap text-gray-900">
                          {payment.name}
                        </td>
                        <td className="px-6 py-2 text-sm whitespace-nowrap text-gray-900">
                          {payment.amount}
                        </td>
                        <td className="px-6 py-2 text-sm whitespace-nowrap text-gray-900">
                          {payment.dueDate}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap">
                          <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sección de planos */}
            <div>
              <h3 className="mb-4 text-lg font-bold text-gray-900">Planos</h3>
              <div className="space-y-3">
                {blueprints.map((blueprint, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Eye className="text-primaryColor h-5 w-5" />
                    <FileDownIcon className="text-primaryColor h-4 w-4" />
                    <a
                      href={blueprint.url}
                      className="text-primaryColor text-sm hover:underline"
                    >
                      {blueprint.name}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
