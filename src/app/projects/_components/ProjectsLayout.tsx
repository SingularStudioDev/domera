"use client";

import { useState } from "react";

import Footer from "@/components/Footer";
import Header from "@/components/header/Header";

import ProjectsFilter from "./projectFilter/ProjectsFilter";
import ProjectsListView from "./ProjectsListView";
import ProjectsMapView from "./ProjectsMapView";

interface ProjectsLayoutProps {
  searchParams: {
    neighborhood?: string;
    city?: string;
    status?: "pre_sale" | "construction" | "completed";
    rooms?: string;
    amenities?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  };
  filterOptions: {
    cities: string[];
    neighborhoods: string[];
    amenities?: string[];
  };
}

/**
 * Client-side layout component that manages view state and persistent filters
 */
export default function ProjectsLayoutClient({
  searchParams,
  filterOptions,
}: ProjectsLayoutProps) {
  const [currentView, setCurrentView] = useState<"list" | "map">("list");

  const handleViewChange = (view: "list" | "map") => {
    setCurrentView(view);
  };

  const renderContent = () => {
    if (currentView === "map") {
      return <ProjectsMapView searchParams={searchParams} />;
    }
    return <ProjectsListView searchParams={searchParams} />;
  };

  return (
    <>
      <Header />

      <main className="bg-white pt-24">
        <div className="container mx-auto px-4 md:px-0">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <h1 className="dashboard-title mb-4">Proyectos</h1>

            {/* Persistent Filters */}
            <ProjectsFilter
              cities={filterOptions.cities}
              neighborhoods={filterOptions.neighborhoods}
              amenities={filterOptions.amenities}
              onViewChange={handleViewChange}
              currentView={currentView}
            />
          </div>
          {/* Dynamic Content Area */}
          <div className="min-h-[400px]">{renderContent()}</div>
        </div>
      </main>

      <Footer />
    </>
  );
}
