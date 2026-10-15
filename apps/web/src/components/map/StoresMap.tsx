"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { StoreCardData } from "@/lib/types";
import { categoryMeta, formatDistance, formatRating } from "@/shared";
import { StoreLogo } from "@/components/store/StoreVisuals";
import { meIcon, storePin } from "./pins";

export interface StoresMapProps {
  stores: StoreCardData[];
  center: { lat: number; lng: number };
  me?: { lat: number; lng: number } | null;
  radiusM?: number;
  activeId?: string | null;
  onSelect?: (id: string | null) => void;
  zoom?: number;
  fitRadius?: boolean;
  interactive?: boolean;
  /** Em telas touch, não arrasta com um dedo (evita prender a rolagem da página). */
  lockOnTouch?: boolean;
  className?: string;
}

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

/** Recalcula o tamanho quando o container muda (ex.: alternar lista/mapa no mobile). */
function AutoResize() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [map]);
  return null;
}

function FitRadius({ center, radiusM }: { center: { lat: number; lng: number }; radiusM: number }) {
  const map = useMap();
  useEffect(() => {
    const latDelta = radiusM / 111_320;
    const lngDelta = radiusM / (111_320 * Math.cos((center.lat * Math.PI) / 180));
    const bounds: [[number, number], [number, number]] = [
      [center.lat - latDelta, center.lng - lngDelta],
      [center.lat + latDelta, center.lng + lngDelta],
    ];
    // Com o container oculto (mobile, modo lista) o tamanho é 0 e o Leaflet calcula NaN:
    // só enquadra quando houver área visível; senão espera o próximo "resize".
    // Ao aparecer pela primeira vez, enquadra sem animação; depois anima as mudanças de raio.
    let wasHidden = !map.getSize().x;
    const fit = () => {
      const size = map.getSize();
      if (!size.x || !size.y) return false;
      if (wasHidden) {
        wasHidden = false;
        map.fitBounds(bounds, { padding: [10, 10], animate: false });
      } else map.flyToBounds(bounds, { duration: 0.6, padding: [10, 10] });
      return true;
    };
    if (fit()) return;
    const onResize = () => {
      if (fit()) map.off("resize", onResize);
    };
    map.on("resize", onResize);
    return () => {
      map.off("resize", onResize);
    };
  }, [map, center.lat, center.lng, radiusM]);
  return null;
}

export default function StoresMap({ stores, center, me, radiusM, activeId, onSelect, zoom = 14, fitRadius, interactive = true, lockOnTouch, className }: StoresMapProps) {
  const touchLocked = !!lockOnTouch && L.Browser.mobile;
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      scrollWheelZoom={interactive}
      dragging={interactive && !touchLocked}
      zoomControl={interactive}
      className={className ?? "h-full w-full"}
    >
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
      <AutoResize />
      {fitRadius && radiusM && <FitRadius center={center} radiusM={radiusM} />}
      {radiusM && (
        <Circle center={[center.lat, center.lng]} radius={radiusM} pathOptions={{ color: "#127475", weight: 1.5, fillColor: "#127475", fillOpacity: 0.05, dashArray: "6 6" }} />
      )}
      {me && <Marker position={[me.lat, me.lng]} icon={meIcon()} zIndexOffset={-100} />}
      {stores.map((s) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          icon={storePin(s.categoria_id, s.destaque, s.id === activeId, { url: s.logo_url, nome: s.nome })}
          zIndexOffset={s.id === activeId ? 2000 : s.destaque ? 1000 : 0}
          eventHandlers={{ click: () => onSelect?.(s.id) }}
        >
          {interactive && (
            <Popup>
              <div className="min-w-48 font-sans">
                <div className="flex items-center gap-2.5">
                  <StoreLogo url={s.logo_url} nome={s.nome} categoriaId={s.categoria_id} className="size-10 border-2 text-xs" />
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: categoryMeta(s.categoria_id).cor }}>
                      {categoryMeta(s.categoria_id).nome}
                    </div>
                    <div className="mt-0.5 text-[15px] font-extrabold leading-tight text-ink">{s.nome}</div>
                  </div>
                </div>
                <div className="mt-1 text-xs text-muted">
                  ★ {Number(s.nota_media) > 0 ? formatRating(s.nota_media) : "Novo"} · {s.bairro}
                  {s.distancia_m != null && ` · ${formatDistance(s.distancia_m)}`}
                </div>
                <Link href={`/loja/${s.id}`} className="mt-2 inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold !text-white">
                  Ver loja →
                </Link>
              </div>
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}
