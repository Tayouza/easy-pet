"use client";

import dynamic from "next/dynamic";

function MapLoading() {
  return <div className="skeleton h-full w-full rounded-none" />;
}

/** Mapas Leaflet só no cliente (window). */
export const StoresMap = dynamic(() => import("./StoresMap"), { ssr: false, loading: MapLoading });
export const LocationPicker = dynamic(() => import("./LocationPicker"), { ssr: false, loading: MapLoading });
