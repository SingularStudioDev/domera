'use client';

import { Heart, Grid3X3, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/header/Header';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/custom-ui/ProjectCard';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Project type matching the existing patterns
interface FavoriteProject {
  id: string;
  title: string;
  price: string;
  image: string;
  status: string;
  date: string;
  isFavorite: boolean;
  rooms?: number;
  isNew?: boolean;
  neighborhood?: string;
}

// Mock favorite projects data following existing patterns
const mockFavoriteProjects: FavoriteProject[] = [
  {
    id: '1',
    title: 'Alo 26',
    price: '$167.000',
    image: '/project-alo-26-7e5196.png',
    status: 'Pocitos',
    date: 'Jul 2028',
    isFavorite: true,
    rooms: 2,
    isNew: true,
    neighborhood: 'Pocitos',
  },
  {
    id: '3',
    title: 'Le Mont',
    price: '$325.000',
    image: '/project-le-mont.png',
    status: 'Pocitos',
    date: 'Dic 2027',
    isFavorite: true,
    rooms: 3,
    isNew: false,
    neighborhood: 'Pocitos',
  },
  {
    id: '5',
    title: 'Alzira',
    price: '$312.000',
    image: '/project-alzira.png',
    status: 'Pocitos',
    date: 'Jul 2028',
    isFavorite: true,
    rooms: 1,
    isNew: true,
    neighborhood: 'Carrasco',
  },
];

const FavoritesPage = () => {
  const [favoriteProjects, setFavoriteProjects] = useState<FavoriteProject[]>(
    []
  );
  const [filteredProjects, setFilteredProjects] = useState<FavoriteProject[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [selectedRooms, setSelectedRooms] = useState<string>('all');
  const [selectedNew, setSelectedNew] = useState<string>('all');
  const [selectedNeighborhood, setSelectedNeighborhood] =
    useState<string>('all');

  // Simulate loading favorite projects (future: replace with API call)
  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      setFavoriteProjects(mockFavoriteProjects);
      setIsLoading(false);
    };

    loadFavorites();
  }, []);

  // Filter projects based on selected filters
  useEffect(() => {
    let filtered = favoriteProjects;

    // Filter by rooms
    if (selectedRooms !== 'all') {
      if (selectedRooms === '4+') {
        filtered = filtered.filter(
          (project) => project.rooms && project.rooms >= 4
        );
      } else {
        filtered = filtered.filter(
          (project) => project.rooms === parseInt(selectedRooms)
        );
      }
    }

    // Filter by new construction
    if (selectedNew !== 'all') {
      filtered = filtered.filter((project) =>
        selectedNew === 'true' ? project.isNew : !project.isNew
      );
    }

    // Filter by neighborhood
    if (selectedNeighborhood !== 'all') {
      filtered = filtered.filter(
        (project) => project.neighborhood === selectedNeighborhood
      );
    }

    setFilteredProjects(filtered);
  }, [favoriteProjects, selectedRooms, selectedNew, selectedNeighborhood]);

  // Loading state component
  const LoadingState = () => (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-[547px] rounded-3xl bg-gray-200"></div>
        </div>
      ))}
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
        <Heart className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="mb-4 text-2xl font-semibold text-gray-800">
        No tienes proyectos favoritos
      </h3>
      <p className="mb-8 max-w-md text-lg text-gray-600">
        Explora nuestros proyectos y marca como favoritos los que m�s te
        interesen.
      </p>
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 rounded-full bg-primaryColor px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700"
      >
        <Grid3X3 className="h-5 w-5" />
        Ver Proyectos
      </Link>
    </div>
  );

  return (
    <>
      <Header />
      <main className="bg-white pt-36">
        <div className="container mx-auto">
          {/* Hero Section */}
          <div className="mb-8 flex w-full items-center justify-between gap-8">
            <h1 className="dashboard-title">Favoritos</h1>

            {/* Filters Section */}
            <div className="flex w-4/6 flex-col gap-4 sm:flex-row sm:items-center">
              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Rooms Filter */}
                <div className="w-full space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Habitaciones
                  </label>
                  <Select
                    value={selectedRooms}
                    onValueChange={setSelectedRooms}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder="Seleccionar"
                        className="w-full"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="1">1 habitación</SelectItem>
                      <SelectItem value="2">2 habitaciones</SelectItem>
                      <SelectItem value="3">3 habitaciones</SelectItem>
                      <SelectItem value="4+">4+ habitaciones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* New Construction Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Estreno
                  </label>
                  <Select value={selectedNew} onValueChange={setSelectedNew}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="true">A estrenar</SelectItem>
                      <SelectItem value="false">Usado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Neighborhood Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Barrio
                  </label>
                  <Select
                    value={selectedNeighborhood}
                    onValueChange={setSelectedNeighborhood}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Pocitos">Pocitos</SelectItem>
                      <SelectItem value="Carrasco">Carrasco</SelectItem>
                      <SelectItem value="La Blanqueada">
                        La Blanqueada
                      </SelectItem>
                      <SelectItem value="Punta Carretas">
                        Punta Carretas
                      </SelectItem>
                      <SelectItem value="Centro">Centro</SelectItem>
                      <SelectItem value="Cordón">Cordón</SelectItem>
                      <SelectItem value="Parque Rodó">Parque Rodó</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="mb-16">
            {isLoading ? (
              <LoadingState />
            ) : favoriteProjects.length === 0 ? (
              <EmptyState />
            ) : filteredProjects.length === 0 ? (
              <div>
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-50">
                    <Filter className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="mb-4 text-2xl font-semibold text-gray-800">
                    No se encontraron proyectos
                  </h3>
                  <p className="mb-8 max-w-md text-lg text-gray-600">
                    Intenta ajustar los filtros para encontrar proyectos que
                    coincidan con tus criterios.
                  </p>
                </div>
                <Separator className="my-12" />
                {/* Continue browsing section */}
                <div>
                  <div className="text-center">
                    <h3 className="mb-2 text-2xl font-semibold text-gray-800">
                      Buscas mas opciones?
                    </h3>
                    <p className="mb-8 text-lg text-gray-600">
                      Explora todos nuestros proyectos disponibles
                    </p>
                    <Link
                      href="/projects"
                      className="inline-flex items-center gap-2 rounded-full border border-primaryColor px-8 py-3 font-medium text-primaryColor transition-colors hover:bg-primaryColor hover:text-white"
                    >
                      <Grid3X3 className="h-5 w-5" />
                      Ver Todos los Proyectos
                    </Link>
                  </div>
                </div>{' '}
              </div>
            ) : (
              <>
                {/* Projects Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      title={project.title}
                      price={project.price}
                      image={project.image}
                      status={project.status}
                      date={project.date}
                      isFavorite={project.isFavorite}
                    />
                  ))}
                </div>

                <Separator className="my-14" />

                {/* Continue browsing section */}
                <div>
                  <div className="text-center">
                    <h3 className="mb-2 text-2xl font-semibold text-gray-800">
                      Buscas mas opciones?
                    </h3>
                    <p className="mb-8 text-lg text-gray-600">
                      Explora todos nuestros proyectos disponibles
                    </p>
                    <Link
                      href="/projects"
                      className="inline-flex items-center gap-2 rounded-full border border-primaryColor px-8 py-3 font-medium text-primaryColor transition-colors hover:bg-primaryColor hover:text-white"
                    >
                      <Grid3X3 className="h-5 w-5" />
                      Ver Todos los Proyectos
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default FavoritesPage;
