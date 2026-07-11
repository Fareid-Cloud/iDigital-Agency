import {
  Globe,
  Share2,
  Target,
  Palette,
  Search,
  Clapperboard,
  type LucideIcon,
} from "lucide-react";
import type { SERVICE_KEYS } from "./constants";

export const SERVICE_ICONS: Record<(typeof SERVICE_KEYS)[number], LucideIcon> = {
  web: Globe,
  social: Share2,
  ads: Target,
  branding: Palette,
  seo: Search,
  content: Clapperboard,
};
