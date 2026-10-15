import L from "leaflet";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { categoryIcon } from "@/components/ui/CategoryIcon";
import { categoryMeta } from "@/shared";

const cache = new Map<string, L.DivIcon>();

/** Pin colorido por categoria; lojas destaque ganham pin maior com estrela. */
export function storePin(categoriaId: string, destaque = false, active = false): L.DivIcon {
  const key = `${categoriaId}|${destaque}|${active}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const cor = categoryMeta(categoriaId).cor;
  const w = destaque ? 46 : 34;
  const h = Math.round(w * 1.25);
  const icon = renderToStaticMarkup(createElement(categoryIcon(categoriaId), { size: 24, color: "#fff", strokeWidth: 2.3 }));
  const s = 20; // tamanho do ícone em unidades do viewBox do pin (48 de largura)
  const star = destaque
    ? `<g transform="translate(32 -3)"><circle cx="9" cy="9" r="9.5" fill="#FFC857" stroke="#fff" stroke-width="2.5"/><path d="M9 3.8l1.6 3.2 3.5.5-2.5 2.4.6 3.5L9 11.8l-3.2 1.6.6-3.5-2.5-2.4 3.5-.5z" fill="#1E1B18"/></g>`
    : "";
  const html = `<svg width="${w}" height="${h}" viewBox="0 0 48 60" overflow="visible"><path d="M24 2C12.4 2 3 11.2 3 22.6 3 37.6 24 57 24 57s21-19.4 21-34.4C45 11.2 35.6 2 24 2Z" fill="${cor}" stroke="#fff" stroke-width="3"/><g transform="translate(${24 - s / 2} ${22 - s / 2}) scale(${s / 24})">${icon}</g>${star}</svg>`;
  const div = L.divIcon({
    className: `ep-pin${active ? " is-active" : ""}`,
    html,
    iconSize: [w, h],
    iconAnchor: [w / 2, h - 2],
    popupAnchor: [0, -h + 8],
  });
  cache.set(key, div);
  return div;
}

export const meIcon = () =>
  L.divIcon({ className: "ep-me", html: "<span></span>", iconSize: [18, 18], iconAnchor: [9, 9] });
