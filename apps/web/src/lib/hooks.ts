"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_LOCATION } from "@/shared";

interface QueryState<T> {
  key: string;
  data?: T;
  error?: string;
}

/**
 * Busca assíncrona simples no cliente. Mantém o dado anterior enquanto recarrega.
 * `deps` define quando refazer a busca (serializado com JSON).
 */
export function useQuery<T>(fn: () => Promise<T>, deps: unknown[], enabled = true) {
  const [nonce, setNonce] = useState(0);
  const key = `${JSON.stringify(deps)}#${nonce}`;
  const [state, setState] = useState<QueryState<T>>({ key: "" });

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    fn()
      .then((data) => alive && setState({ key, data }))
      .catch((e: unknown) => {
        if (!alive) return;
        const message = (e as { message?: string })?.message ?? "Erro inesperado";
        setState((s) => ({ key, data: s.data, error: message }));
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const mutate = useCallback((updater: (prev: T | undefined) => T | undefined) => setState((s) => ({ ...s, data: updater(s.data) })), []);

  return {
    data: state.data,
    error: state.key === key ? state.error : undefined,
    loading: enabled && state.key !== key,
    /** true só na primeira carga (sem dado anterior) */
    initialLoading: enabled && state.key !== key && state.data === undefined,
    reload,
    mutate,
  };
}

/** Lança o erro do Supabase (para usar dentro de useQuery). */
export function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw res.error;
  return res.data as T;
}

export type GeoStatus = "pending" | "ok" | "fallback" | "far";

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Localização do navegador com fallback na Praça da Matriz (e se estiver fora de POA). */
export function useGeolocation() {
  const [state, setState] = useState<{ pos: { lat: number; lng: number }; status: GeoStatus }>({
    pos: { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng },
    status: "pending",
  });

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      queueMicrotask(() => setState((s) => ({ ...s, status: "fallback" })));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
        if (distanceKm(pos, DEFAULT_LOCATION) > 40) {
          setState({ pos: { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng }, status: "far" });
        } else {
          setState({ pos, status: "ok" });
        }
      },
      () => setState({ pos: { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng }, status: "fallback" }),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 },
    );
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  return { ...state, locate };
}

export function useDebounced<T>(value: T, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}
