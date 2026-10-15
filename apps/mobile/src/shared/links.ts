import { onlyDigits } from './format';

export function whatsappUrl(numero: string | null | undefined, lojaNome?: string): string {
  const texto = `Olá${lojaNome ? `, ${lojaNome}` : ''}! Vi sua loja no EasyPet 🐾`;
  return `https://wa.me/55${onlyDigits(numero)}?text=${encodeURIComponent(texto)}`;
}

export function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function telUrl(numero: string | null | undefined): string {
  return `tel:+55${onlyDigits(numero)}`;
}
