"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { storePin } from "./pins";

function ClickHandler({ onChange }: { onChange: (p: { lat: number; lng: number }) => void }) {
  useMapEvents({ click: (e) => onChange({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (!map.getBounds().pad(-0.2).contains([lat, lng])) map.flyTo([lat, lng], Math.max(map.getZoom(), 16), { duration: 0.5 });
  }, [map, lat, lng]);
  return null;
}

export default function LocationPicker({
  value,
  categoriaId,
  logoUrl,
  nome = "",
  onChange,
}: {
  value: { lat: number; lng: number };
  categoriaId: string;
  logoUrl?: string | null;
  nome?: string;
  onChange: (p: { lat: number; lng: number }) => void;
}) {
  const icon = useMemo(() => storePin(categoriaId, false, true, { url: logoUrl, nome }), [categoriaId, logoUrl, nome]);
  return (
    <MapContainer center={[value.lat, value.lng]} zoom={16} className="h-full w-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
      <ClickHandler onChange={onChange} />
      <Recenter lat={value.lat} lng={value.lng} />
      <Marker
        position={[value.lat, value.lng]}
        icon={icon}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const p = (e.target as import("leaflet").Marker).getLatLng();
            onChange({ lat: p.lat, lng: p.lng });
          },
        }}
      />
    </MapContainer>
  );
}
