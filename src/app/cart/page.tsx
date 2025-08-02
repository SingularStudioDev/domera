'use client';

import { ChevronDown, ArrowLeft, BedIcon, BathIcon, DownloadIcon, ArrowRight } from 'lucide-react';
import { SquareIcon } from 'lucide-react';
import { TagIcon } from 'lucide-react';
import { RulerIcon } from 'lucide-react';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';

const CartPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Datos del carrito (en una app real vendrian de un estado global)
  const cartItems = [
    {
      id: '1',
      projectName: 'Winks America',
      unitTitle: 'Unidad 604 - Piso 6',
      image: '/cart-unit-1-29f3e6.png',
      bathrooms: 2,
      bedrooms: 2,
      builtArea: '120m2',
      completion: 'Enero 2027',
      price: 190000,
    },
    {
      id: '2',
      projectName: 'Winks America',
      unitTitle: 'Cochera 02 - Subsuelo',
      image: '/cart-unit-2.png',
      type: 'Simple',
      dimensions: '2.5x4m',
      completion: 'Enero 2027',
      price: 20000,
    },
  ];

  const platformFee = 3000;
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  const accordionItems = [
    'Vigencia de la reserva',
    'Cancelación',
    'Costos',
    'Términos y condiciones',
    'Cláusulas',
    'Cancelación',
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-24">
        <div>
          <div className="flex gap-2">
            {/* Left Column - Cart Content */}
            <div className="w-full">
              <div className="container mx-auto mb-6 flex flex-col items-start gap-6 pt-2">
                {/* Back Button */}
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Link>

                {/* Title */}
                <h1 className="text-3xl font-bold text-black">
                  Carrito de compra
                </h1>
              </div>

              {/* Cart Items */}
              <div className="container mx-auto mb-20 space-y-0">
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
                      {/* Unit Image */}
                      <div className="w-52 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.unitTitle}
                          width={204}
                          height={180}
                          className="h-45 w-full rounded-2xl object-cover"
                        />
                      </div>

                      {/* Unit Details */}
                      <div className="flex-1">
                        <h3 className="mb-2 text-xl font-bold text-black">
                          {item.projectName}
                        </h3>
                        <h4 className="mb-4 text-3xl font-bold text-black">
                          {item.unitTitle}
                        </h4>

                        {/* Unit Specifications */}
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

                      {/* Price */}
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

                {/* Platform Fee Notice */}
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

                  {/* Total */}

                  <div className="flex justify-start pr-7">
                    <div>
                      <p className="text-lg font-bold text-blue-600">Total</p>
                      <p className="text-3xl font-bold text-blue-600">
                        ${total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditions Section */}
              <div className="mb-20 rounded-3xl bg-gray-100 p-12">
                <div className="container mx-auto">
                  <h2 className="mb-8 text-3xl font-bold text-black">
                    Condiciones
                  </h2>
                  <div className="space-y-0">
                    {accordionItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border-b border-gray-300 py-4"
                      >
                        <span className="text-lg font-bold text-black">
                          {item}
                        </span>
                        <ChevronDown className="h-5 w-5 text-black" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Download Section */}
              <div className="container mx-auto mb-20 flex gap-20">
                <div className="max-w-[900px] flex-1">
                  <h2 className="mb-8 text-3xl font-bold text-black">
                    Descargar boleto de reserva
                  </h2>
                  <p className="mb-8 text-gray-700">
                    Firmá el boleto de reserva con tu firma digital (Abitab o
                    Agesic) y generá un documento con validez legal. Al hacerlo,
                    aceptás las condiciones y responsabilidades establecidas.
                  </p>

                  <Link
                    href="#"
                    className="mb-8 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <DownloadIcon className="h-4 w-4 " />
                    Descargar boleto de reserva
                  </Link>

                  <p className="mb-8 text-gray-700">
                    Una vez firmado, subilo a la plataforma y en minutos vas a
                    recibir al mail registrado una copia del mismo. Podes
                    revisarlo con tu escribano y subirlo cuando quieras.
                  </p>
                  <p className="mb-8 text-gray-700">
                    Una vez subido al sistema tendrás 2 días hábiles para hacer
                    el depósito de la seña para mantener la reserva.
                  </p>

                  {/* Bank Information */}
                  <div className="mb-8 grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-700">
                        Banco: Santander
                        <br />
                        Titular: Dahiana mendez
                        <br />
                        Cuenta: 123456
                        <br />
                        Moneda: USD
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-700">
                        Banco: BROU
                        <br />
                        Titular: Dahiana mendez
                        <br />
                        Cuenta: 0000123456 00002
                        <br />
                        Moneda: USD
                      </p>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="mb-8 max-w-[400px]">
                    <div className="mb-2 flex gap-1">
                      <span className="text-sm text-gray-600">Archivo</span>
                      <span className="text-sm text-red-600">*</span>
                    </div>
                    <div className="rounded border border-dashed border-gray-300 p-8 text-center">
                      <p className="mb-4 text-sm text-black">
                        Arrastra el archivo o selecciona desde tu dispositivo
                      </p>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.doc,.docx"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer rounded-full border border-blue-600 bg-white px-6 py-2 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
                      >
                        Cargar archivo
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    className={`w-fit flex items-center justify-center rounded-full px-8 py-3 text-white transition-colors ${
                      selectedFile
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'cursor-not-allowed bg-gray-300'
                    }`}
                    disabled={!selectedFile}
                  >
                    Proceder a la reserva
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
