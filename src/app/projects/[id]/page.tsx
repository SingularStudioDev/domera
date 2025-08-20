'use client';

import { useParams } from 'next/navigation';
import Header from '@/components/header/Header';
import Footer from '@/components/Footer';
import ProjectHero from './units/_components/ProjectHero';
import ProjectInfo from './units/_components/ProjectInfo';
import ProjectDescription from './units/_components/ProjectDescription';
import ProjectDetails from './units/_components/ProjectDetails';
import ProjectLocation from './units/_components/ProjectLocation';
import ProjectProgress from './units/_components/ProjectProgress';
import AvailableUnits from './units/_components/AvailableUnits';

// Datos de ejemplo del proyecto
export const projectData = {
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
  const projectId = params.id as string;

  const project =
    projectData[projectId as keyof typeof projectData] || projectData['1'];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        <ProjectHero
          title={project.title}
          price={project.price}
          location={project.location}
          date={project.date}
          image="/pro-hero.png"
        />

        <div>
          <ProjectInfo />

          <div className="container mx-auto flex flex-col gap-10 px-4 md:flex-row md:px-0">
            <div className="flex flex-col gap-5">
              <ProjectDescription description={project.description} />
              
              <ProjectDetails
                amenities={project.amenities}
                additionalFeatures={project.additionalFeatures}
                investment={project.investment}
              />

              <img
                src="/pro-big.png"
                alt="Proyecto"
                className="h-auto w-full py-5 md:py-10"
              />

              <ProjectLocation planFiles={project.planFiles} />

              <ProjectProgress progressImages={project.progressImages} />
            </div>
          </div>

          <AvailableUnits units={project.availableUnits} projectId={projectId} />
        </div>
      </main>

      {/* Footer Component similar to header as shown in Figma */}
      <Footer />
    </div>
  );
};

export default ProjectDetailPage;
