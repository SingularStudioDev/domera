'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon in Next.js
import 'leaflet/dist/leaflet.css';

// Custom hook to set the view when coordinates change
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
}

// Fix for default marker icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  zoom: number;
  markerPopup: string;
}

export default function LeafletMap({
  latitude,
  longitude,
  zoom,
  markerPopup,
}: LeafletMapProps) {
  const position: [number, number] = [latitude, longitude];

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
      <Marker position={position}>
        <Popup>
          <span className="font-medium text-gray-900">{markerPopup}</span>
        </Popup>
      </Marker>
      <ChangeView center={position} zoom={zoom} />
    </MapContainer>
  );
}