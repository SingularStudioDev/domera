'use client';

import { useState } from 'react';
import Header from '@/components/header/Header';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/custom-ui/ProjectCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
        <div className="container mx-auto px-4 md:px-0">
          {/* Filters Section */}
          <div className="mb-6 flex items-center justify-between">
            {/* Projects Title */}
            <h2 className="dashboard-title">Proyectos</h2>

            <div className="flex w-2/3 flex-col gap-4 lg:flex-row lg:gap-6">
              {/* Habitaciones Filter */}
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Habitaciones
                </label>
                <Select
                  value={filters.habitaciones}
                  onValueChange={(value) =>
                    setFilters({ ...filters, habitaciones: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mostrar todo">Mostrar todo</SelectItem>
                    <SelectItem value="1 habitación">1 habitación</SelectItem>
                    <SelectItem value="2 habitaciones">
                      2 habitaciones
                    </SelectItem>
                    <SelectItem value="3 habitaciones">
                      3 habitaciones
                    </SelectItem>
                    <SelectItem value="4+ habitaciones">
                      4+ habitaciones
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Estreno Filter */}
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Estreno
                </label>
                <Select
                  value={filters.estreno}
                  onValueChange={(value) =>
                    setFilters({ ...filters, estreno: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mostrar todo">Mostrar todo</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                    <SelectItem value="2028">2028</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Barrios Filter */}
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Barrios
                </label>
                <Select
                  value={filters.barrios}
                  onValueChange={(value) =>
                    setFilters({ ...filters, barrios: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mostrar todo">Mostrar todo</SelectItem>
                    <SelectItem value="Pocitos">Pocitos</SelectItem>
                    <SelectItem value="Recoleta">Recoleta</SelectItem>
                    <SelectItem value="Palermo">Palermo</SelectItem>
                    <SelectItem value="Puerto Madero">Puerto Madero</SelectItem>
                    <SelectItem value="Villa Crespo">Villa Crespo</SelectItem>
                    <SelectItem value="Caballito">Caballito</SelectItem>
                    <SelectItem value="La Blanqueada">La Blanqueada</SelectItem>
                    <SelectItem value="Cordón">Cordón</SelectItem>
                    <SelectItem value="Parque Batlle">Parque Batlle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

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
