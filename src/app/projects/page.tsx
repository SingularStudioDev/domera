'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Header from '@/components/header/Header';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/custom-ui/ProjectCard';

const ProjectsPage = () => {
  const [filters, setFilters] = useState({
    habitaciones: 'Mostrar todo',
    estreno: 'Mostrar todo',
    barrios: 'Mostrar todo',
  });

  const allProjects = [
    {
      id: '1',
      title: 'Alo 26',
      price: '$167.000',
      image: '/pro/pro-1.png',
      status: 'Pocitos',
      date: 'Jul 2028',
    },
    {
      id: '2',
      title: 'Winks America',
      price: '$228.000',
      image: '/pro/pro-2.png',
      status: 'Recoleta',
      date: 'Ene 2027',
    },
    {
      id: '3',
      title: 'Le Mont',
      price: '$325.000',
      image: '/pro/pro-3.png',
      status: 'Palermo',
      date: 'Dic 2027',
    },
    {
      id: '4',
      title: 'Alto 26',
      price: '$167.000',
      image: '/pro/pro-4.png',
      status: 'Puerto Madero',
      date: 'Jul 2028',
    },
    {
      id: '5',
      title: 'Alzira',
      price: '$312.000',
      image: '/pro/pro-5.png',
      status: 'Villa Crespo',
      date: 'Jul 2028',
    },
    {
      id: '6',
      title: 'Amaras',
      price: '$167.000',
      image: '/pro/pro-6.png',
      status: 'Caballito',
      date: 'Jul 2028',
    },
    {
      id: '7',
      title: 'Smart Point 2',
      price: '$145.000',
      image: '/pro/pro-7.png',
      status: 'La Blanqueada',
      date: 'Mar 2027',
    },
    {
      id: '8',
      title: '01 Vista',
      price: '$123.000',
      image: '/pro/pro-1.png',
      status: 'La Blanqueada',
      date: 'Mar 2027',
    },
    {
      id: '9',
      title: 'Domini House',
      price: '$103.000',
      image: '/pro/pro-2.png',
      status: 'Cordón',
      date: 'Jul 2026',
    },
    {
      id: '10',
      title: 'Pont Bleu',
      price: '$187.000',
      image: '/pro/pro-3.png',
      status: 'Parque Batlle',
      date: 'Nov 2026',
    },
  ];

  return (
    <>
      <Header />
      <main className="bg-white pt-32">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="mb-8">
            <h1 className="mb-4 text-6xl font-light text-black lg:text-7xl">
              Comprá en pozo
            </h1>
            <p className="text-2xl font-light text-black lg:text-3xl">
              Sin comisiones inmobiliarias
            </p>
          </div>

          {/* Filters Section */}
          <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:gap-6">
            {/* Habitaciones Filter */}
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Habitaciones
              </label>
              <div className="relative">
                <select
                  value={filters.habitaciones}
                  onChange={(e) =>
                    setFilters({ ...filters, habitaciones: e.target.value })
                  }
                  className="w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Mostrar todo">Mostrar todo</option>
                  <option value="1 habitación">1 habitación</option>
                  <option value="2 habitaciones">2 habitaciones</option>
                  <option value="3 habitaciones">3 habitaciones</option>
                  <option value="4+ habitaciones">4+ habitaciones</option>
                </select>
                <ChevronDown className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Estreno Filter */}
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Estreno
              </label>
              <div className="relative">
                <select
                  value={filters.estreno}
                  onChange={(e) =>
                    setFilters({ ...filters, estreno: e.target.value })
                  }
                  className="w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Mostrar todo">Mostrar todo</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
                <ChevronDown className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Barrios Filter */}
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Barrios
              </label>
              <div className="relative">
                <select
                  value={filters.barrios}
                  onChange={(e) =>
                    setFilters({ ...filters, barrios: e.target.value })
                  }
                  className="w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Mostrar todo">Mostrar todo</option>
                  <option value="Pocitos">Pocitos</option>
                  <option value="Recoleta">Recoleta</option>
                  <option value="Palermo">Palermo</option>
                  <option value="Puerto Madero">Puerto Madero</option>
                  <option value="Villa Crespo">Villa Crespo</option>
                  <option value="Caballito">Caballito</option>
                  <option value="La Blanqueada">La Blanqueada</option>
                  <option value="Cordón">Cordón</option>
                  <option value="Parque Batlle">Parque Batlle</option>
                </select>
                <ChevronDown className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Projects Title */}
          <h2 className="mb-8 text-3xl font-bold text-black lg:text-4xl">
            Proyectos
          </h2>

          {/* Projects Grid */}
          <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {allProjects.map((project, index) => (
              <div
                key={project.id}
                className={index === 6 ? 'col-span-full' : ''}
              >
                <ProjectCard {...project} />
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProjectsPage;
