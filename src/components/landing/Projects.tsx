'use client';

import ProjectCard from '../custom-ui/ProjectCard';
import MainButton from '../custom-ui/MainButton';

const Projects = () => {
  const projects = [
    {
      id: '1',
      title: 'Alo 26',
      price: '$167.000',
      image: '/project-alo-26-7e5196.png',
      status: 'Pocitos',
      date: 'Jul 2028',
    },
    {
      id: '2',
      title: 'Winks America',
      price: '$228.000',
      image: '/project-winks-america.png',
      status: 'Carrasco',
      date: 'Ene 2027',
    },
    {
      id: '3',
      title: 'Le Mont',
      price: '$325.000',
      image: '/project-le-mont.png',
      status: 'Pocitos',
      date: 'Dic 2027',
    },
    {
      id: '4',
      title: 'Alto 26',
      price: '$167.000',
      image: '/project-alto-26.png',
      status: 'Pocitos',
      date: 'Jul 2028',
    },
    {
      id: '5',
      title: 'Alzira',
      price: '$312.000',
      image: '/project-alzira.png',
      status: 'Pocitos',
      date: 'Jul 2028',
    },
    {
      id: '6',
      title: 'Amarras',
      price: '$167.000',
      image: '/project-amarras.png',
      status: 'Carrasco',
      date: 'Jul 2028',
    },
    {
      id: '7',
      title: 'Smart Point 2',
      price: '$145.000',
      image: '/project-smart-point-2-7dfd3e.png',
      status: 'La Blanqueada',
      date: 'Mar 2027',
    },
  ];

  return (
    <section className="px-4 pb-10 md:px-0 md:pb-16">
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
          <MainButton href="/projects" showArrow>
            Proyectos
          </MainButton>
        </div>
      </div>
    </section>
  );
};

export default Projects;
