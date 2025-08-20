'use client';

import { BedIcon, BathIcon, RulerIcon } from 'lucide-react';

import { formatCurrencyUYU } from '@/utils/utils';
import MainButton from '@/components/MainButton';

export const accordionItems = [
  'Vigencia de la reserva',
  'Cancelación',
  'Costos',
  'Términos y condiciones',
  'Cláusulas',
  'Cancelación',
];

export default function CheckoutPage() {
  // Datos del carrito (en una app real vendrian de un estado global)
  const cartItems = {
    id: '1',
    projectName: 'Winks America',
    unitTitle: 'Unidad 604 - Piso 6',
    image: '/cart-unit-1-29f3e6.png',
    bathrooms: 2,
    bedrooms: 2,
    builtArea: '120m2',
    completion: 'Enero 2027',
    price: 190000,
  };

  return (
    <div className="w-full">
      <div className="flex w-full gap-16">
        <div className="w-1/3" />
        <div className="container mx-auto flex w-full flex-col justify-end gap-10">
          <div className="flex gap-10">
            {/* Left Column - Main Image */}
            <div>
              <img
                src={cartItems.image}
                alt={cartItems.projectName}
                className="h-[344px] w-fit rounded-3xl border border-gray-300 object-cover"
              />
            </div>

            <div className="flex max-h-[344px] flex-col items-start justify-between">
              <div className="flex flex-col gap-4">
                <h1 className="text-4xl font-bold text-black">
                  {cartItems.unitTitle}
                </h1>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-4">
                    <div className="flex flex-1 items-center gap-4">
                      <BathIcon className="h-5 w-5 text-black" />
                      <span className="text-xl text-black">Baños:</span>
                      <span className="text-xl text-black">
                        {cartItems.bathrooms}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-1 items-center gap-4">
                      <BedIcon className="h-5 w-5 text-black" />
                      <span className="text-xl text-black">Dormitorios:</span>
                      <span className="text-xl text-black">
                        {cartItems.bedrooms}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-1 items-center gap-4">
                      <RulerIcon className="h-5 w-5 text-black" />
                      <span className="text-xl text-black">Edificados:</span>
                      <span className="text-xl text-black">
                        {cartItems.builtArea}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price and Buy Button */}
              <div className="flex flex-col items-start justify-end gap-2">
                <div className="flex gap-4">
                  <div className="flex flex-1 items-center gap-2">
                    <span className="text-xl text-black">Estreno:</span>
                    <span className="text-xl text-black">
                      {cartItems.completion}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primaryColor text-lg font-bold">
                      Precio
                    </p>
                    <p className="text-primaryColor text-3xl font-bold">
                      {formatCurrencyUYU(cartItems.price)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-7 pb-20">
            <MainButton href="/checkout/additional">
              Agregar otro item
            </MainButton>

            <MainButton href="/checkout/confirmation">
              Ir al boleto de reserva{' '}
            </MainButton>
          </div>
        </div>
      </div>
    </div>
  );
}

{
  /* <div className="container mx-auto mb-20 space-y-0">
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`border-r border-l border-gray-300 bg-white ${
                      index === 0
                        ? 'rounded-t-2xl border-t'
                        : index === cartItems.length - 1
                          ? 'border-t'
                          : 'border-b-0'
                    }`}
                  >
                    <div className="flex h-[220px] gap-6 p-6">

                      <div className="w-52 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.unitTitle}
                          width={204}
                          height={180}
                          className="h-45 w-full rounded-2xl object-cover"
                        />
                      </div>


                      <div className="flex-1">
                        <h3 className="mb-2 text-xl font-bold text-black">
                          {item.projectName}
                        </h3>
                        <h4 className="mb-4 text-3xl font-bold text-black">
                          {item.unitTitle}
                        </h4>


                        <div className="mb-4 flex gap-8">
                          {item.bathrooms && (
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-4">
                                <BathIcon className="h-5 w-5 text-black" />
                                <span className="text-lg">Baños:</span>
                              </div>
                              <span className="text-lg">{item.bathrooms}</span>
                            </div>
                          )}
                          {item.bedrooms && (
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-4">
                                <BedIcon className="h-5 w-5 text-black" />
                                <span className="text-lg">Dormitorios:</span>
                              </div>
                              <span className="text-lg">{item.bedrooms}</span>
                            </div>
                          )}
                          {item.builtArea && (
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-4">
                                <SquareIcon className="h-5 w-5 text-black" />
                                <span className="text-lg">Edificados:</span>
                              </div>
                              <span className="text-lg">{item.builtArea}</span>
                            </div>
                          )}
                          {item.type && (
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-4">
                                <TagIcon className="h-5 w-5 text-black" />
                                <span className="text-lg">Tipo:</span>
                              </div>
                              <span className="text-lg">{item.type}</span>
                            </div>
                          )}
                          {item.dimensions && (
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-4">
                                <RulerIcon className="h-5 w-5 text-black" />
                                <span className="text-lg">Dimensiones:</span>
                              </div>
                              <span className="text-lg">{item.dimensions}</span>
                            </div>
                          )}
                        </div>
                      </div>


                      <div className="flex h-full flex-col justify-between">
                        <p className="text-lg text-black">
                          Estreno: {item.completion}
                        </p>

                        <div>
                          <p className="text-lg font-bold text-blue-600">
                            Precio
                          </p>
                          <p className="text-3xl font-bold text-blue-600">
                            ${item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}


                <div className="flex items-start justify-between rounded-b-2xl border border-gray-300 bg-white p-6">
                  <div className="bg-white">
                    <p className="max-w-[571px] text-gray-700">
                      En el momento de firmar la <strong>compra-venta</strong>{' '}
                      de la unidad, se deberá abonar la suma de USD3000 dólares
                      por el concepto del uso de la plataforma.
                    </p>
                    <p className="mt-2 font-bold text-black">
                      No se deberá pagar comisión inmobiliaria.
                    </p>
                  </div>



                  <div className="flex justify-start pr-7">
                    <div>
                      <p className="text-lg font-bold text-blue-600">Total</p>
                      <p className="text-3xl font-bold text-blue-600">
                        ${total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div> */
}
