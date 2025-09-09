"use client";

import { useEffect } from "react";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

// Fix for default marker icon in Next.js
import "leaflet/dist/leaflet.css";

// Custom hook to set the view when coordinates change
function ChangeView({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  return null;
}

// Fix for default marker icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface ProjectMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  popup?: string;
}

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  zoom: number;
  markerPopup: string;
  projects?: ProjectMarker[];
  onMarkerClick?: (marker: ProjectMarker) => void;
}

export default function LeafletMap({
  latitude,
  longitude,
  zoom,
  markerPopup,
  projects,
  onMarkerClick,
}: LeafletMapProps) {
  const position: [number, number] = [latitude, longitude];

  const handleMarkerClick = (marker: ProjectMarker) => {
    if (onMarkerClick) {
      onMarkerClick(marker);
    }
  };

  return (
    <MapContainer
      center={position}
      zoom={zoom}
      className="h-[50dvh] w-full"
      zoomControl={true}
      scrollWheelZoom={true}
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Render multiple project markers if projects array is provided */}
      {projects && projects.length > 0 ? (
        projects.map((project) => (
          <Marker
            key={project.id}
            position={[project.latitude, project.longitude]}
            eventHandlers={{
              click: () => handleMarkerClick(project),
            }}
          >
            <Popup>
              <span className="font-medium text-gray-900">
                {project.popup || project.title}
              </span>
            </Popup>
          </Marker>
        ))
      ) : (
        // Fallback to single marker if no projects provided
        <Marker position={position}>
          <Popup>
            <span className="font-medium text-gray-900">{markerPopup}</span>
          </Popup>
        </Marker>
      )}
      
      <ChangeView center={position} zoom={zoom} />
    </MapContainer>
  );
}
