'use client';

import {
  ChevronDown,
  ArrowLeft,
  SquareArrowOutUpRightIcon,
  BedIcon,
  ShowerHeadIcon,
  RulerIcon,
  CompassIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';

  // Datos de ejemplo del proyecto
 export  const projectData = {
    '1': {
      title: 'Winks America',
      price: '$228.000',
      location: 'Carrasco',
      date: 'Ene 2027',
      images: ['/pro-hero.png'],
      progressImages: ['/progress-1.png', '/progress-2.png', '/progress-3.png'],
      description: `Se construye un nuevo desarrollo de Kopel Sánchez en Barra de Carrasco.
Winks Américas. Ubicado en el sector de mayor crecimiento
de la zona este de Montevideo.

Este proyecto se desarrolla en una edificación de 8 niveles con apartamentos monoambientes y de 1, 2 y 3 dormitorios con amplias terrazas y vistas panorámicas. Y un amplio local comercial en planta baja.`,
      characteristics: [
        { icon: '🏢', text: '34 unidades\ndisponibles' },
        { icon: '🚗', text: '23 garages\ndisponibles' },
        { icon: '🔥', text: '4 barbacoas\ny gimnasio' },
        { icon: '🏊', text: 'Piscina\nclimatizada' },
      ],
      amenities: `Aménities:

- 2 amplias barbacoas con parrillero.
- Amplios espacios con caracteres diferentes.
- SUM con parrillero y terraza.
-Gimnasio Equipado.
-Salon de uso múltiples.
- Sauna y duchas.
-Oficinas.`,
      additionalFeatures: `Características adicionales:

- Servicio de portería y control de acceso.
- Acceso digital a las unidades con portero inteligente, control de acceso con smarthphone.
- Totem para comunicación interna del edificio.
- Excelente nivel de seguridad.
- Excelente nivel en terminaciones.
- Garajes y cocheras opcionales.`,
      investment: `Inversión:

Proyecto se construye bajo la Ley de Vivienda Promovida N°18.795, que implica las siguientes exoneraciones por 10 años:

- Exoneración del ITP.
- Exoneración del I.R.P.F./ I.R.N.R. / I.R.A.E.
- Exoneración de impuestos de ITP a la primera compra.

- Boleto de reserva: 10%
- Compromiso de compra/venta: 20%
- Pagos durante la obra: 60%
- Salgo de contra entrega: 10%`,
      planFiles: [
        '1a Plano Planta Nivel 1 al 3.pdf',
        '1b Plano Planta Nivel 4.pdf',
        '1c Plano Planta Nivel 5.pdf',
        '1d Plano Planta Nivel 6 al 8.pdf',
      ],
      availableUnits: [
        {
          id: '604',
          title: 'Unidad 604 - Piso 6',
          description: '2 dormitorios, 2 baños',
          bedrooms: 2,
          bathrooms: 2,
          area: '86m2',
          orientation: 'Norte',
          price: '$190.000',
          type: 'Frente',
          image: '/unit-image-1-66596a.png',
          available: true,
          statusIcon: false,
        },
        {
          id: '608',
          title: 'Unidad 608 - Piso 6',
          description: '2 dormitorios, 2 baños',
          bedrooms: 2,
          bathrooms: 2,
          area: '86m2',
          orientation: 'Norte',
          price: '$190.000',
          type: 'Contra - Frente',
          image: '/unit-image-2-5e5a37.png',
          available: true,
          statusIcon: false,
        },
        {
          id: '702',
          title: 'Unidad 702 - Piso 7',
          description: '2 dormitorios, 2 baños',
          bedrooms: 2,
          bathrooms: 2,
          area: '86m2',
          orientation: 'Norte',
          price: '$190.000',
          type: 'Frente',
          image: '/unit-image-3-2eff01.png',
          available: true,
          statusIcon: false,
        },
        {
          id: '708',
          title: 'Unidad 708 - Piso 7',
          description: '2 dormitorios, 2 baños',
          bedrooms: 2,
          bathrooms: 2,
          area: '86m2',
          orientation: 'Norte',
          price: '$190.000',
          type: 'Frente',
          image: '/unit-image-4.png',
          available: false,
          statusIcon: '✓',
        },
        {
          id: '812',
          title: 'Unidad 812 - Piso 8',
          description: '2 dormitorios, 2 baños',
          bedrooms: 2,
          bathrooms: 2,
          area: '86m2',
          orientation: 'Norte',
          price: '$190.000',
          type: 'Frente',
          image: '/unit-image-5-124e52.png',
          available: false,
          statusIcon: true,
        },
        {
          id: '808',
          title: 'Unidad 808 - Piso 8',
          description: '2 dormitorios, 2 baños',
          bedrooms: 2,
          bathrooms: 2,
          area: '86m2',
          orientation: 'Norte',
          price: '$190.000',
          type: 'Contra - Frente',
          image: '/unit-image-6-48ba9f.png',
          available: false,
          statusIcon: true,
        },
        {
          id: 'comercial',
          title: 'Local comercial - Planta baja',
          description: '2 dormitorios, 2 baños',
          bedrooms: 0,
          bathrooms: 2,
          area: '286m2',
          orientation: 'Norte',
          price: '$190.000',
          type: 'Frente',
          image: '/unit-image-7.png',
          available: true,
          statusIcon: false,
        },
        {
          id: 'cochera-02',
          title: 'Cochera 02 - Subsuelo',
          description: ' ',
          bedrooms: 0,
          bathrooms: 0,
          area: '2.5x4m',
          orientation: 'Simple',
          price: '$20.000',
          type: 'Cochera',
          image: '/unit-image-8.png',
          available: false,
          statusIcon: true,
        },
        {
          id: 'unidad-08',
          title: 'Unidad 08 - Planta baja',
          description: ' ',
          bedrooms: 0,
          bathrooms: 0,
          area: '3x4.5m',
          orientation: 'Simple',
          price: '$20.000',
          type: 'Bodega',
          image: '/unit-image-9-91f5c8.png',
          available: false,
          statusIcon: true,
        },
      ],
    },
    // Datos para otros proyectos...
  };

const ProjectDetailPage = () => {
  const params = useParams();
  const projectId = params.id;

  const [filters, setFilters] = useState({
    piso: 'Mostrar todo',
    tipologia: 'Mostrar todo',
    orientacion: 'Mostrar todo',
  });



  const project =
    projectData[projectId as keyof typeof projectData] || projectData['1'];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* Hero Section with Gallery */}
        <section className="relative h-[95vh] overflow-hidden">
          <div>
            <div className="relative h-full overflow-hidden">
              <img
                src="/pro-hero.png"
                alt={project.title}
                className="h-[95vh] w-full rounded-b-3xl object-cover"
              />
              <div className="absolute inset-0 z-10 rounded-b-3xl bg-gradient-to-b from-black/30 to-black/80"></div>

              {/* Project Info Overlay */}
              <div className="absolute bottom-0 left-0 z-20 h-full w-full">
                <div className="container mx-auto flex h-full w-full flex-col items-start justify-between pt-32 pb-10">
                  <div className="mb-4 flex gap-4">
                    <span className="rounded-2xl bg-white px-4 py-2 text-lg font-medium text-black">
                      {project.location}
                    </span>
                    <span className="rounded-2xl bg-white px-4 py-2 text-lg font-medium text-black">
                      {project.date}
                    </span>
                  </div>

                  <div className="flex w-full items-center justify-between">
                    <div className="flex w-fit flex-col gap-2 rounded-2xl bg-white px-6 py-2 text-black">
                      <h1 className="text-6xl font-semibold">
                        {project.title}
                      </h1>
                      <p className="text-4xl font-medium">
                        Desde: {project.price}
                      </p>
                    </div>

                    <img
                      src="/unit-spects.png"
                      alt={project.title}
                      className="h-1/2 w-fit object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div>
          {/* Back Button */}
          <div className="container mt-5 mx-auto mb-20 flex items-center justify-between">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a lista de proyectos
            </Link>

            <button className="font-medium text-blue-600 hover:text-blue-800">
              Descargar PDF
            </button>
          </div>

          <div className="container mx-auto flex gap-10">
            {/* Left Column - Description */}
            <div className="flex flex-col gap-5">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <h2 className="mb-6 text-3xl font-bold text-black">
                    Descripción
                  </h2>
                  <p className="mb-8 max-w-[600px] whitespace-pre-line text-black">
                    {project.description}
                  </p>
                </div>

                <div>
                  <div className="flex flex-col">
                    <p className="mb-2 font-semibold text-black">Desarrolla:</p>
                    <p className="mb-8 max-w-[600px] whitespace-pre-line text-black">
                      Av. de las Américas & Melchora Cuenca
                    </p>
                  </div>

                  <div className="flex gap-10">
                    <div>
                      <p className="mb-2 font-semibold text-black">
                        Desarrolla:
                      </p>
                      <div className="flex gap-4">
                        <Image
                          src="/developer-logo-7b3d8c.png"
                          alt="Developer"
                          width={154}
                          height={30}
                          className="h-8 w-auto"
                        />
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 font-semibold text-black">
                        Construye:
                      </p>
                      <div className="flex gap-4">
                        <Image
                          src="/constructor-logo-7b3d8c.png"
                          alt="Constructor"
                          width={154}
                          height={30}
                          className="h-8 w-auto"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid gap-8 md:grid-cols-3">
                {/* Amenities */}
                <div>
                  <h3 className="mb-4 text-lg font-bold text-black">
                    Aménities
                  </h3>
                  <div className="text-sm text-black">
                    <p>- 2 amplias barbacoas con parrillero.</p>
                    <p>- Amplios espacios con caracteres diferentes.</p>
                    <p>- SUM con parrillero y terraza.</p>
                    <p>- Gimnasio Equipado.</p>
                    <p>- Salon de uso múltiples.</p>
                    <p>- Sauna y duchas.</p>
                    <p>- Oficinas.</p>
                  </div>
                </div>

                {/* Additional Features */}
                <div>
                  <h3 className="mb-4 text-lg font-bold text-black">
                    Características adicionales
                  </h3>
                  <div className="text-sm text-black">
                    <p>- Servicio de portería y control de acceso.</p>
                    <p>
                      - Acceso digital a las unidades con portero inteligente,
                      control de acceso con smarthphone.
                    </p>
                    <p>- Totem para comunicación interna del edificio.</p>
                    <p>- Excelente nivel de seguridad.</p>
                    <p>- Excelente nivel en terminaciones.</p>
                    <p>- Garajes y cocheras opcionales.</p>
                  </div>
                </div>

                {/* Investment */}
                <div>
                  <h3 className="mb-4 text-lg font-bold text-black">
                    Inversión
                  </h3>
                  <div className="text-sm text-black">
                    <p className="mb-3">
                      Proyecto se construye bajo la Ley de Vivienda Promovida
                      N°18.795, que implica las siguientes exoneraciones por 10
                      años:
                    </p>
                    <p>- Exoneración del ITP.</p>
                    <p>- Exoneración del I.R.P.F./ I.R.N.R. / I.R.A.E.</p>
                    <p>
                      - Exoneración de impuestos de ITP a la primera compra.
                    </p>
                    <div className="mt-3">
                      <p>- Boleto de reserva: 10%</p>
                      <p>- Compromiso de compra/venta: 20%</p>
                      <p>- Pagos durante la obra: 60%</p>
                      <p>- Salgo de contra entrega: 10%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TODO: Esto tiene que ser un carousel */}
              <img
                src="/pro-big.png"
                alt="Proyecto"
                className="h-auto w-full py-10"
              />

              <div className="flex w-full items-start gap-10">
                <div className="w-full">
                  <h3 className="mb-6 text-3xl font-semibold text-black">
                    Ubicación
                  </h3>
                  <div className="mb-8 overflow-hidden rounded-2xl border border-gray-300">
                    <Image
                      src="/map-location-68c752.png"
                      alt="Ubicación del proyecto"
                      width={640}
                      height={400}
                      className="h-[500px] w-full object-cover"
                    />
                  </div>
                </div>

                <div className="w-full">
                  <h3 className="mb-6 text-3xl font-semibold text-black">
                    Master plan
                  </h3>

                  <div className="space-y-0">
                    {project.planFiles.map((file, index) => (
                      <div
                        key={index}
                        className={`${index === 0 ? 'border-t' : ''} flex cursor-pointer items-center justify-between border-b border-gray-300 p-4 text-black transition duration-300 hover:text-blue-600`}
                      >
                        <span className="font-medium">{file}</span>
                        <button className="cursor-pointer text-xl">
                          <SquareArrowOutUpRightIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-3xl font-semibold text-black">
                  Avances de obra
                </h3>
                <p className="mb-6">Agosto 2025</p>
                <div className="grid grid-cols-3 gap-2">
                  {project.progressImages.map((img, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={img}
                        alt={`Avance ${index + 1}`}
                        fill
                        className="max-h-[300px] rounded-2xl object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Unidades disponibles */}
          <div className="bg-neutral-100 py-10">
            <div className="container mx-auto py-10">
              <h2 className="mb-2 text-3xl font-bold text-black">
                Unidades disponibles
              </h2>
              <p className="mb-8 text-gray-600">9 Unidades disponibles</p>

              {/* Filters */}
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Piso
                  </label>
                  <div className="relative">
                    <select
                      value={filters.piso}
                      onChange={(e) =>
                        setFilters({ ...filters, piso: e.target.value })
                      }
                      className="w-full appearance-none rounded border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Mostrar todo">Mostrar todo</option>
                      <option value="Planta baja">Planta baja</option>
                      <option value="Piso 1-3">Piso 1-3</option>
                      <option value="Piso 4-6">Piso 4-6</option>
                      <option value="Piso 7-8">Piso 7-8</option>
                    </select>
                    <ChevronDown className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Tipología
                  </label>
                  <div className="relative">
                    <select
                      value={filters.tipologia}
                      onChange={(e) =>
                        setFilters({ ...filters, tipologia: e.target.value })
                      }
                      className="w-full appearance-none rounded border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Mostrar todo">Mostrar todo</option>
                      <option value="Monoambiente">Monoambiente</option>
                      <option value="1 dormitorio">1 dormitorio</option>
                      <option value="2 dormitorios">2 dormitorios</option>
                      <option value="3 dormitorios">3 dormitorios</option>
                      <option value="Local comercial">Local comercial</option>
                      <option value="Cochera">Cochera</option>
                    </select>
                    <ChevronDown className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Orientación
                  </label>
                  <div className="relative">
                    <select
                      value={filters.orientacion}
                      onChange={(e) =>
                        setFilters({ ...filters, orientacion: e.target.value })
                      }
                      className="w-full appearance-none rounded border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Mostrar todo">Mostrar todo</option>
                      <option value="Norte">Norte</option>
                      <option value="Sur">Sur</option>
                      <option value="Este">Este</option>
                      <option value="Oeste">Oeste</option>
                    </select>
                    <ChevronDown className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Units Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {project.availableUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:border-blue-600"
                  >
                    {/* Image Section */}
                    <div className="relative">
                      <Image
                        src={unit.image}
                        alt={unit.title}
                        width={414}
                        height={267}
                        className="h-64 w-full rounded-t-2xl object-cover"
                      />
                      {/* Top Tags */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="flex items-center justify-center rounded-2xl bg-gray-200 px-4 py-2 text-sm font-medium text-black">
                          {unit.type}
                        </span>
                        <span className="rounded-2xl bg-gray-200 px-4 py-2 text-sm font-medium text-black">
                          {unit.statusIcon ? (
                            <svg
                              width="26"
                              height="25"
                              viewBox="0 0 26 25"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M14.3125 0.84375L17.3594 7.07812L24.0625 8.0625C24.625 8.15625 25.0938 8.53125 25.2812 9.09375C25.4688 9.60938 25.3281 10.2188 24.9062 10.5938L20.0312 15.4219L21.2031 22.2656C21.2969 22.8281 21.0625 23.3906 20.5938 23.7188C20.125 24.0938 19.5156 24.0938 19 23.8594L13 20.625L6.95312 23.8594C6.48438 24.0938 5.875 24.0938 5.40625 23.7188C4.9375 23.3906 4.70312 22.8281 4.79688 22.2656L5.92188 15.4219L1.04688 10.5938C0.671875 10.2188 0.53125 9.60938 0.671875 9.09375C0.859375 8.53125 1.32812 8.15625 1.89062 8.0625L8.64062 7.07812L11.6406 0.84375C11.875 0.328125 12.3906 0 13 0C13.5625 0 14.0781 0.328125 14.3125 0.84375Z"
                                fill="#0040FF"
                              />
                            </svg>
                          ) : (
                            <svg
                              width="26"
                              height="25"
                              viewBox="0 0 26 25"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12.9531 0C13.4219 0 13.7969 0.28125 13.9844 0.65625L17.2188 7.26562L24.3906 8.34375C24.8125 8.39062 25.1406 8.71875 25.2812 9.09375C25.4219 9.51562 25.3281 9.9375 25 10.2656L19.7969 15.4219L21.0156 22.6875C21.1094 23.1094 20.9219 23.5781 20.5938 23.8125C20.2188 24.0469 19.75 24.0938 19.375 23.9062L12.9531 20.4375L6.53125 23.9062C6.15625 24.0938 5.73438 24.0469 5.35938 23.8125C5.03125 23.5781 4.84375 23.1094 4.89062 22.6875L6.15625 15.4219L0.953125 10.2656C0.625 9.9375 0.53125 9.51562 0.671875 9.09375C0.8125 8.71875 1.14062 8.39062 1.5625 8.34375L8.73438 7.26562L11.9688 0.65625C12.1562 0.28125 12.5312 0 12.9531 0ZM12.9531 3.70312L10.5156 8.8125C10.3281 9.14062 10.0469 9.375 9.67188 9.42188L4.09375 10.2188L8.125 14.2031C8.40625 14.4844 8.5 14.8594 8.45312 15.2344L7.51562 20.8125L12.4375 18.1875C12.7656 18 13.1875 18 13.5156 18.1875L18.4375 20.8125L17.5 15.2344C17.4062 14.8594 17.5469 14.4844 17.8281 14.2031L21.8125 10.2188L16.2812 9.42188C15.9062 9.375 15.5781 9.14062 15.4375 8.8125L12.9531 3.70312Z"
                                fill="black"
                              />
                            </svg>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4">
                      {/* Title and Description */}
                      <div className="mb-4">
                        <h4 className="mb-1 text-2xl font-semibold text-black transition duration-300 group-hover:text-blue-600">
                          {unit.title}
                        </h4>
                        <p className="text-black">{unit.description}</p>
                      </div>

                      {/* Unit Details Icons */}
                      <div className="mb-6 flex w-full justify-between pr-10">
                        {unit.bedrooms > 0 && (
                          <div className="flex items-center gap-2">
                            <BedIcon className="h-5 w-5" />
                            <div className="text-black">{unit.bedrooms}</div>
                          </div>
                        )}
                        {unit.bathrooms > 0 && (
                          <div className="flex items-center gap-2">
                            <ShowerHeadIcon className="h-5 w-5" />
                            <div className="text-black">{unit.bathrooms}</div>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <RulerIcon className="h-5 w-5" />
                          <div className="text-black">{unit.area}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CompassIcon className="h-5 w-5" />
                          <div className="text-black">{unit.orientation}</div>
                        </div>
                      </div>

                      {/* Price and Purchase Button */}
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="mb-1 font-semibold text-black">
                            Precio
                          </p>
                          <p className="text-3xl font-bold text-black transition duration-300 group-hover:text-blue-600">
                            {unit.price}
                          </p>
                        </div>

                        <Link
                          href={`/projects/${projectId}/units/${unit.id}`}
                          className="flex items-center gap-2 rounded-full border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
                        >
                          Comprar
                          <ArrowLeft className="h-4 w-4 rotate-180" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Component similar to header as shown in Figma */}
      <Footer />
    </div>
  );
};

export default ProjectDetailPage;
