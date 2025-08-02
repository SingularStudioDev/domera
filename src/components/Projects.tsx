'use client';

import { ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';
import ProjectCard from './ProjectCard';

const Projects = () => {
  const projects = [
    {
      id: '1',
      title: 'Alo 26',
      price: 'Desde: $167.000',
      image: '/project-alo-26-7e5196.png',
      status: 'Pocitos',
      date: 'Jul 2028',
    },
    {
      id: '2',
      title: 'Winks America',
      price: 'Desde: $228.000',
      image: '/project-winks-america.png',
      status: 'Carrasco',
      date: 'Ene 2027',
    },
    {
      id: '3',
      title: 'Le Mont',
      price: 'Desde: $325.000',
      image: '/project-le-mont.png',
      status: 'Pocitos',
      date: 'Dic 2027',
    },
    {
      id: '4',
      title: 'Alto 26',
      price: 'Desde: $167.000',
      image: '/project-alto-26.png',
      status: 'Pocitos',
      date: 'Jul 2028',
    },
    {
      id: '5',
      title: 'Alzira',
      price: 'Desde: $312.000',
      image: '/project-alzira.png',
      status: 'Pocitos',
      date: 'Jul 2028',
    },
    {
      id: '6',
      title: 'Amarras',
      price: 'Desde: $167.000',
      image: '/project-amarras.png',
      status: 'Carrasco',
      date: 'Jul 2028',
    },
    {
      id: '7',
      title: 'Smart Point 2',
      price: 'Desde: $145.000',
      image: '/project-smart-point-2-7dfd3e.png',
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
              className={index === 6 ? 'col-span-full' : ''}
            >
              <ProjectCard
                id={project.id}
                title={project.title}
                price={project.price}
                image={project.image}
                status={project.status}
                date={project.date}
              />
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
