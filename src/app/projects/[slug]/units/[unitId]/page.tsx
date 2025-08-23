'use client';

import {
  ArrowLeft,
  Home,
  Compass,
  Bath,
  Bed,
  Square,
  Calendar,
  ChefHat,
  CircleDollarSign,
  Wallet,
  ListCheck,
  MousePointer,
  ArrowRight,
  StarIcon,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import Header from '@/components/header/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';

const UnitDetailPage = () => {
  const params = useParams();
  const projectId = params.id;
  const unitId = params.unitId;

  // Datos de ejemplo de las unidades
  const unitData = {
    '604': {
      title: 'Unidad 604 - Piso 6',
      price: '$190.000',
      projectName: 'Winks America',
      location: 'Frente',
      orientation: 'Norte',
      bathrooms: 2,
      bedrooms: 2,
      builtArea: '120m2',
      balcony: '40m2',
      completion: 'Enero 2027',
      grill: 'No',
      mainImage: '/unit-main-image-29f3e6.png',
      description: `+ Hall de entrada (ideal recibidor).

+ Living comedor con doble ventanal.

+ Cocina integrada de concepto abierto con bajo mesada de gran calidad y barra desayunadora.

+ Dormitorio principal con baño en suite.

+ Segundo dormitorio con nicho para placar.

+ Tercer dormitorio con vista a la calle Melchora Cuenca.

+ Baño completo.

+ Terraza de uso exclusivo con acceso desde living comedor y dormitorios.`,
      gallery: [
        '/gallery-unit-1-61396b.png',
        '/gallery-unit-2.png',
        '/gallery-unit-3.png',
        '/gallery-unit-4.png',
        '/gallery-unit-5.png',
        '/gallery-unit-6.png',
      ],
      investment: `Proyecto se construye bajo la Ley de Vivienda Promovida N°18.795, que implica las siguientes exoneraciones por 10 años:

- Exoneración del ITP.
- Exoneración del I.R.P.F./ I.R.N.R. / I.R.A.E.
- Exoneración de impuestos de ITP a la primera compra.

- Boleto de reserva: 10%
- Compromiso de compra/venta: 20%
- Pagos durante la obra: 60%
- Salgo de contra entrega: 10%`,
      reservationInfo: `Al acceder al boleto de reserva, el comprador se compromete formalmente a adquirir la unidad.

Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.`,
      process: [
        { icon: '🏡', text: 'Seleccioná la propiedad' },
        { icon: '💰', text: 'Hacé click en comprar' },
        { icon: '📝', text: 'Completá el boleto de reserva' },
        { icon: '🏦', text: 'Hacé el deposito a tu escribana' },
        { icon: '📄', text: 'En 30 días recibirás el boleto de compra' },
      ],
    },
    '608': {
      title: 'Unidad 608 - Piso 6',
      price: '$190.000',
      projectName: 'Winks America',
      location: 'Contra-Frente',
      orientation: 'Sur',
      bathrooms: 2,
      bedrooms: 2,
      builtArea: '115m2',
      balcony: '35m2',
      completion: 'Enero 2027',
      grill: 'No',
      mainImage: '/unit-main-image-29f3e6.png',
      description: `+ Hall de entrada (ideal recibidor).
+ Living comedor con doble ventanal.
+ Cocina integrada de concepto abierto con bajo mesada de gran calidad y barra desayunadora.
+ Dormitorio principal con baño en suite.
+ Segundo dormitorio con nicho para placar.
+ Baño completo.
+ Terraza de uso exclusivo con acceso desde living comedor y dormitorios.`,
      gallery: [
        '/gallery-unit-1-61396b.png',
        '/gallery-unit-2.png',
        '/gallery-unit-3.png',
        '/gallery-unit-4.png',
        '/gallery-unit-5.png',
        '/gallery-unit-6.png',
      ],
      investment: `Proyecto se construye bajo la Ley de Vivienda Promovida N°18.795, que implica las siguientes exoneraciones por 10 años:

- Exoneración del ITP.
- Exoneración del I.R.P.F./ I.R.N.R. / I.R.A.E.
- Exoneración de impuestos de ITP a la primera compra.

- Boleto de reserva: 10%
- Compromiso de compra/venta: 20%
- Pagos durante la obra: 60%
- Salgo de contra entrega: 10%`,
      reservationInfo: `Al acceder al boleto de reserva, el comprador se compromete formalmente a adquirir la unidad.

Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.`,
      process: [
        { icon: '🏡', text: 'Seleccioná la propiedad' },
        { icon: '💰', text: 'Hacé click en comprar' },
        { icon: '📝', text: 'Completá el boleto de reserva' },
        { icon: '🏦', text: 'Hacé el deposito a tu escribana' },
        { icon: '📄', text: 'En 30 días recibirás el boleto de compra' },
      ],
    },
    '702': {
      title: 'Unidad 702 - Piso 7',
      price: '$190.000',
      projectName: 'Winks America',
      location: 'Frente',
      orientation: 'Norte',
      bathrooms: 2,
      bedrooms: 2,
      builtArea: '120m2',
      balcony: '40m2',
      completion: 'Enero 2027',
      grill: 'Sí',
      mainImage: '/unit-main-image-29f3e6.png',
      description: `+ Hall de entrada (ideal recibidor).

+ Living comedor con doble ventanal.

+ Cocina integrada de concepto abierto con bajo mesada de gran calidad y barra desayunadora.

+ Dormitorio principal con baño en suite.

+ Segundo dormitorio con nicho para placar.

+ Tercer dormitorio con vista a la calle Melchora Cuenca.

+ Baño completo.

+ Terraza de uso exclusivo con acceso desde living comedor y dormitorios.`,
      gallery: [
        '/gallery-unit-1-61396b.png',
        '/gallery-unit-2.png',
        '/gallery-unit-3.png',
        '/gallery-unit-4.png',
        '/gallery-unit-5.png',
        '/gallery-unit-6.png',
      ],
      investment: `Proyecto se construye bajo la Ley de Vivienda Promovida N°18.795, que implica las siguientes exoneraciones por 10 años:

- Exoneración del ITP.
- Exoneración del I.R.P.F./ I.R.N.R. / I.R.A.E.
- Exoneración de impuestos de ITP a la primera compra.

- Boleto de reserva: 10%
- Compromiso de compra/venta: 20%
- Pagos durante la obra: 60%
- Salgo de contra entrega: 10%`,
      reservationInfo: `Al acceder al boleto de reserva, el comprador se compromete formalmente a adquirir la unidad.

Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.`,
    },
  };

  const steps = [
    {
      icon: Home,
      title: 'Selecciona tu propiedad',
    },
    {
      icon: MousePointer,
      title: 'Hacé click en comprar',
    },
    {
      icon: ListCheck,
      title: 'Completa tu boleto de reserva',
    },
    {
      icon: CircleDollarSign,
      title: 'Hace el deposito y espera la escritura',
    },
    {
      icon: Wallet,
      title: 'En 30 días recibirás el boleto de compra ',
    },
  ];

  const unit = unitData[unitId as keyof typeof unitData] || unitData['604'];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-20">
        <div>
          {/* Back Button */}
          <div className="container mx-auto w-full py-6">
            <Link
              href={`/projects/${projectId}`}
              className="inline-flex items-center gap-2 text-primaryColor hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a lista de proyectos
            </Link>
          </div>

          {/* Main Content Grid */}
          <div className="container mx-auto mb-16 grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left Column - Main Image */}
            <div>
              <Image
                src={unit.mainImage}
                alt={unit.title}
                width={640}
                height={564}
                className="h-[564px] w-full rounded-3xl border border-gray-300 object-cover"
              />
            </div>

            {/* Right Column - Unit Info */}
            <div className="space-y-6">
              {/* Unit Title and Star */}
              <div className="flex items-center justify-start gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                  <StarIcon className="h-7 w-7 text-primaryColor" />
                </div>
                <h1 className="text-4xl font-bold text-black">{unit.title}</h1>
              </div>

              {/* Unit Details Grid */}
              <div className="space-y-4">
                {/* First Row */}
                <div className="flex gap-4">
                  <div className="flex flex-1 items-center gap-4">
                    <Home className="h-5 w-5 text-black" />
                    <span className="text-xl text-black">Ubicación:</span>
                    <span className="text-xl text-black">{unit.location}</span>
                  </div>
                </div>

                {/* Second Row */}
                <div className="flex gap-4">
                  <div className="flex flex-1 items-center gap-4">
                    <Compass className="h-5 w-5 text-black" />
                    <span className="text-xl text-black">Orientación:</span>
                    <span className="text-xl text-black">
                      {unit.orientation}
                    </span>
                  </div>
                </div>

                {/* Third Row */}
                <div className="flex gap-4">
                  <div className="flex flex-1 items-center gap-4">
                    <Bath className="h-5 w-5 text-black" />
                    <span className="text-xl text-black">Baños:</span>
                    <span className="text-xl text-black">{unit.bathrooms}</span>
                  </div>
                </div>

                {/* Fourth Row */}
                <div className="flex gap-4">
                  <div className="flex flex-1 items-center gap-4">
                    <Bed className="h-5 w-5 text-black" />
                    <span className="text-xl text-black">Dormitorios:</span>
                    <span className="text-xl text-black">{unit.bedrooms}</span>
                  </div>
                </div>

                {/* Fifth Row */}
                <div className="flex gap-4">
                  <div className="flex flex-1 items-center gap-4">
                    <Square className="h-5 w-5 text-black" />
                    <span className="text-xl text-black">Edificados:</span>
                    <span className="text-xl text-black">{unit.builtArea}</span>
                  </div>
                </div>

                {/* Sixth Row */}
                <div className="flex gap-4">
                  <div className="flex flex-1 items-center gap-4">
                    <Square className="h-5 w-5 text-black" />
                    <span className="text-xl text-black">Balcón:</span>
                    <span className="text-xl text-black">{unit.balcony}</span>
                  </div>
                </div>

                {/* Seventh Row */}
                <div className="flex gap-4">
                  <div className="flex flex-1 items-center gap-4">
                    <Calendar className="h-5 w-5 text-black" />
                    <span className="text-xl text-black">Estreno:</span>
                    <span className="text-xl text-black">
                      {unit.completion}
                    </span>
                  </div>
                </div>

                {/* Eighth Row */}
                <div className="flex gap-4">
                  <div className="flex flex-1 items-center gap-4">
                    <ChefHat className="h-5 w-5 text-black" />
                    <span className="text-xl text-black">Parrillero:</span>
                    <span className="text-xl text-black">{unit.grill}</span>
                  </div>
                </div>
              </div>

              {/* Price and Buy Button */}
              <div className="rounded-2xl border border-primaryColor p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-primaryColor">Precio</p>
                    <p className="text-3xl font-bold text-primaryColor">
                      {unit.price}
                    </p>
                  </div>
                  <Link
                    href="/checkout"
                    className="flex items-center justify-center rounded-full bg-primaryColor px-8 py-3 text-white transition-colors hover:bg-blue-700"
                  >
                    Comprar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles Section */}
          <div className="mb-16">
            <div className="rounded-3xl bg-gray-100 p-8">
              <div className="container mx-auto w-full">
                <h2 className="mb-8 text-3xl font-bold text-black">Detalles</h2>
                <div className="text-xl leading-relaxed whitespace-pre-line text-black">
                  {unit.description}
                </div>
              </div>
            </div>
          </div>

          {/* Galería Section */}
          <div className="container mx-auto mb-16 w-full">
            <h2 className="mb-8 text-3xl font-bold text-black">Galería</h2>
            <div className="space-y-8">
              {/* Primera fila de imágenes */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {unit.gallery.slice(0, 3).map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`Galería ${index + 1}`}
                    width={426}
                    height={243}
                    className="h-60 w-full rounded-3xl object-cover"
                  />
                ))}
              </div>
              {/* Segunda fila de imágenes */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {unit.gallery.slice(3, 6).map((image, index) => (
                  <Image
                    key={index + 3}
                    src={image}
                    alt={`Galería ${index + 4}`}
                    width={426}
                    height={243}
                    className="h-60 w-full rounded-3xl object-cover"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Inversión Section */}
          <div className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="rounded-l-3xl bg-gray-100 p-8 pl-48">
                <h3 className="mb-6 text-3xl font-bold text-black">
                  Inversión
                </h3>
                <div className="text-lg whitespace-pre-line text-gray-700">
                  {unit.investment}
                </div>
              </div>
              <div className="rounded-r-3xl bg-gray-200 p-8 pr-48">
                <h3 className="mb-6 text-3xl font-bold text-black">
                  Boleto de reserva
                </h3>
                <div className="text-lg whitespace-pre-line text-gray-700">
                  {unit.reservationInfo}
                </div>
              </div>
            </div>
          </div>

          {/* Proceso Section */}
          <section className="py-16">
            <div className="container mx-auto">
              {/* Section Header */}
              <div className="flex flex-col gap-10 text-start">
                <h2 className="text-3xl font-bold text-black">Proceso</h2>
              </div>

              {/* Process Steps */}
              <div className="grid w-full grid-cols-1 gap-8 pt-20 pb-10 md:grid-cols-3 lg:grid-cols-5">
                {steps.map((step) => {
                  const IconComponent = step.icon;
                  return (
                    <div key={step.title} className="text-center">
                      {/* Icon */}
                      <div className="bg-domera-blue mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                        <IconComponent className="h-12 w-12 text-[#0040FF]" />
                      </div>

                      {/* Content */}
                      <h3 className="mx-auto max-w-[150px] text-lg text-black">
                        {step.title}
                      </h3>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <div className="mb-16 flex w-full items-center justify-center text-center">
            <Link
              href="/checkout"
              className="flex w-fit items-center justify-center rounded-full bg-primaryColor px-12 py-4 text-xl font-medium text-white transition-colors hover:bg-blue-700"
            >
              Comprar unidad
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UnitDetailPage;
