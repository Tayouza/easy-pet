import { cn } from "@/lib/cn";

/** Símbolo oficial (packages/brand/symbol.svg): pin laranja com pata branca. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="30 10 196 236" className={className} aria-hidden="true">
      <path fill="#FF6B35" d="M128 16C73 16 36 55 36 105c0 63 92 135 92 135s92-72 92-135c0-50-37-89-92-89Z" />
      <g fill="#FFFFFF">
        <ellipse cx="85" cy="99" rx="13" ry="18" transform="rotate(-24 85 99)" />
        <ellipse cx="112" cy="77" rx="13" ry="18" transform="rotate(-8 112 77)" />
        <ellipse cx="143" cy="77" rx="13" ry="18" transform="rotate(8 143 77)" />
        <ellipse cx="171" cy="99" rx="13" ry="18" transform="rotate(24 171 99)" />
        <path d="M128 108c-13 0-18 12-26 21-7 8-14 12-14 22 0 12 11 18 22 15 12-4 24-4 36 0 11 3 22-3 22-15 0-10-7-14-14-22-8-9-13-21-26-21Z" />
      </g>
    </svg>
  );
}

/** Logo oficial (public/logo.svg · logo-white.svg, gerados de packages/brand). */
export function Logo({ className, light, size = "md" }: { className?: string; light?: boolean; size?: "sm" | "md" | "lg" }) {
  const h = { sm: "h-9", md: "h-11", lg: "h-16" }[size];
  return <img src={light ? "/logo-white.svg" : "/logo.svg"} alt="EasyPet" className={cn(h, "w-auto select-none", className)} draggable={false} />;
}
