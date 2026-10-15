import { createElement } from "react";
import {
  Award,
  Bath,
  Camera,
  Cookie,
  FlaskConical,
  Fish,
  Flower2,
  Footprints,
  HeartHandshake,
  Hospital,
  Hotel,
  Pill,
  Stethoscope,
  Store,
  Wheat,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import { categoryMeta } from "@/shared";

const ICONS: Record<string, LucideIcon> = {
  Store,
  Wheat,
  Stethoscope,
  Hospital,
  Bath,
  Hotel,
  Award,
  Footprints,
  Pill,
  FlaskConical,
  Fish,
  Cookie,
  Camera,
  HeartHandshake,
  Flower2,
};

export function categoryIcon(categoriaId: string | null | undefined): LucideIcon {
  return ICONS[categoryMeta(categoriaId).lucide] ?? Store;
}

export function CategoryIcon({ id, ...props }: { id: string | null | undefined } & LucideProps) {
  return createElement(categoryIcon(id), props);
}
