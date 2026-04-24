import type { ComponentType } from "react";
import type { IconProps } from "@/components/icons";
import {
  IconFlame,
  IconHome,
  IconBuildingStorefront,
  IconSquares2x2,
  IconWrenchScrewdriver,
} from "@/components/icons";

/** Miva `categoryCode` → icon for desktop header megamenu (nav + panel title). */
export const MEGAMENU_ICONS: Partial<Record<string, ComponentType<IconProps>>> = {
  ctgy_residential_equipment: IconHome,
  ctgy_commercial_products: IconBuildingStorefront,
  ctgy_equipment_accessories: IconSquares2x2,
  ctgy_replacement_parts: IconWrenchScrewdriver,
  ctgy_wood_and_pellets: IconFlame,
};

export function megamenuIconForCategory(categoryCode: string | null | undefined) {
  if (!categoryCode) return null;
  return MEGAMENU_ICONS[categoryCode] ?? null;
}
