import L from "leaflet";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { categoryIcon } from "@/components/ui/CategoryIcon";
import { categoryMeta, initials } from "@/shared";

const cache = new Map<string, L.DivIcon>();

const STAR_SVG =
  '<svg viewBox="0 0 18 18" width="18" height="18"><circle cx="9" cy="9" r="8" fill="#FFC857" stroke="#fff" stroke-width="2"/><path d="M9 4.2l1.4 2.9 3.2.4-2.3 2.2.6 3.2L9 11.4l-2.9 1.5.6-3.2-2.3-2.2 3.2-.4z" fill="#1E1B18"/></svg>';

const escapeAttr = (v: string) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * Pin com o logo da loja: círculo (44px, destaque 52px) com borda de 3px na cor da categoria,
 * pontinha embaixo e estrela no canto para destaque. Se a imagem falhar, ficam as iniciais.
 */
function logoPin(logoUrl: string, nome: string, categoriaId: string, destaque: boolean, active: boolean): L.DivIcon {
  const cor = categoryMeta(categoriaId).cor;
  const d = destaque ? 52 : 44;
  const tail = 10;
  const h = d + tail;
  const html = `<div class="ep-logo-pin" style="--c:${cor};width:${d}px;height:${h}px">
    <div class="ep-logo-pin__ring" style="width:${d}px;height:${d}px">
      <span class="ep-logo-pin__ini">${escapeAttr(initials(nome) || nome.slice(0, 1))}</span>
      <img src="${escapeAttr(logoUrl)}" alt="" loading="lazy" onerror="this.remove()" />
    </div>
    <span class="ep-logo-pin__tail"></span>
    ${destaque ? `<span class="ep-logo-pin__star">${STAR_SVG}</span>` : ""}
  </div>`;
  return L.divIcon({
    className: `ep-pin${active ? " is-active" : ""}`,
    html,
    iconSize: [d, h],
    iconAnchor: [d / 2, h],
    popupAnchor: [0, -h + 4],
  });
}

/** Pin da loja: logo quando houver; senão gota colorida por categoria (destaque maior, com estrela). */
export function storePin(categoriaId: string, destaque = false, active = false, logo?: { url: string | null | undefined; nome: string }): L.DivIcon {
  const key = `${categoriaId}|${destaque}|${active}|${logo?.url ?? ""}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (logo?.url) {
    const icon = logoPin(logo.url, logo.nome, categoriaId, destaque, active);
    cache.set(key, icon);
    return icon;
  }
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
