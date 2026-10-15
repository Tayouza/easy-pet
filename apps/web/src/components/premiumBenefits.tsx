import { Ban, Heart, IdCard, SlidersHorizontal, Star, Ticket, type LucideIcon } from "lucide-react";
import { PREMIUM_BENEFITS } from "@/shared";

const ICONS: Record<string, LucideIcon> = { ban: Ban, ticket: Ticket, heart: Heart, options: SlidersHorizontal, "id-card": IdCard, star: Star };

export const BENEFITS = PREMIUM_BENEFITS.map((b) => ({ ...b, Icon: ICONS[b.icon] ?? Star }));
