'use client';

import { ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';
import ProjectCard from './ProjectCard';

const Projects = () => {
  const projects = [
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
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto">
        {/* Section Header */}

        <h2 className="mb-6 text-3xl leading-tight text-black lg:text-7xl">
          Proyectos
        </h2>

        {/* Projects Grid */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={index === projects.length - 1 ? 'col-span-full' : ''}
            >
              <ProjectCard {...project} />
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="mx-auto flex w-full items-center justify-center text-center">
          <Link
            href="/projects"
            className="flex cursor-pointer items-center gap-5 rounded-full border border-[#0040FF] px-8 py-3 font-medium text-[#0040FF] transition-colors duration-200 hover:bg-[#0040FF] hover:text-white"
          >
            Proyectos
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Projects;
