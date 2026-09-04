"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import Link from "next/link";

const markerIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const PERU_CENTER: [number, number] = [-9.19, -75.02];

export type MappedShelter = {
  id: number;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
};

export function ShelterMap({ shelters }: { shelters: MappedShelter[] }) {
  const first = shelters[0];
  const center: [number, number] = first ? [first.latitude, first.longitude] : PERU_CENTER;

  return (
    <MapContainer center={center} zoom={shelters.length ? 6 : 5} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {shelters.map((shelter) => (
        <Marker key={shelter.id} position={[shelter.latitude, shelter.longitude]} icon={markerIcon}>
          <Popup>
            <div className="grid gap-1 text-sm">
              <strong>{shelter.name}</strong>
              <Link href={`/refugios/${shelter.slug}`} className="font-semibold text-brand-600 hover:underline">
                Ver perfil
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
