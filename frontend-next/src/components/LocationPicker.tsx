"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

// El bundler no resuelve los íconos por defecto de Leaflet; se apuntan al CDN.
const markerIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const PERU_CENTER: [number, number] = [-9.19, -75.02];

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ position }: { position: [number, number] }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.setView(position, map.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position[0], position[1]]);
  return null;
}

export function LocationPicker({
  latitude,
  longitude,
  onChange,
}: {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const position: [number, number] = latitude !== null && longitude !== null ? [latitude, longitude] : PERU_CENTER;
  const hasPosition = latitude !== null && longitude !== null;

  return (
    <div className="h-96 w-full overflow-hidden rounded-xl border border-slate-custom-50">
      <MapContainer center={position} zoom={hasPosition ? 17 : 5} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onChange} />
        {hasPosition && <Marker position={position} icon={markerIcon} />}
        {hasPosition && <Recenter position={position} />}
      </MapContainer>
    </div>
  );
}
