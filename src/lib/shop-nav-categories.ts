/**
 * Primary shop nav categories (home category strip, mobile menu, and category page hero lookup) — Miva `category` codes.
 * Desktop header megamenu uses `MEGA_MENU_CATEGORIES` (excludes some categories; see below).
 */
export type ShopNavCategory = {
  label: string;
  /**
   * Main line on the home bento card; defaults to `label` when omitted.
   */
  cardTitle?: string;
  href: string;
  categoryCode: string;
  /**
   * Home bento kicker (small line above the title). Header ignores this.
   */
  kicker: string;
  /**
   * Home `ShopCategoryStrip` / bento card image. Header ignores this.
   * Swap to category-specific art in `/public/images` as you add it.
   */
  stripImage: string;
};

export const SHOP_NAV_CATEGORIES: ShopNavCategory[] = [
  {
    label: "Residential Equipment",
    kicker: "Smokers & Grills",
    href: "/category/ctgy_residential_equipment",
    categoryCode: "ctgy_residential_equipment",
    stripImage: "/images/shop-residential.png",
  },
  {
    label: "Commercial Equipment",
    kicker: "Pro Series",
    href: "/category/ctgy_commercial_products",
    categoryCode: "ctgy_commercial_products",
    stripImage: "/images/shop-commercial.png",
  },
  {
    label: "Equipment Accessories",
    kicker: "Add-Ons",
    href: "/category/ctgy_equipment_accessories",
    categoryCode: "ctgy_equipment_accessories",
    stripImage: "/images/commercial.png",
  },
  {
    label: "Sauces and Spices",
    cardTitle: "Sauces & Spices",
    kicker: "Rubs & Marinades",
    href: "/category/ctgy_sauces_and_spices",
    categoryCode: "ctgy_sauces_and_spices",
    stripImage: "/images/home.png",
  },
  {
    label: "Cookbooks",
    kicker: "Recipes & Guides",
    href: "/category/ctgy_cookbooks",
    categoryCode: "ctgy_cookbooks",
    stripImage: "/images/catalog-hero-bg.png",
  },
  {
    label: "Replacement Parts",
    kicker: "OEM Components",
    href: "/category/ctgy_replacement_parts",
    categoryCode: "ctgy_replacement_parts",
    stripImage: "/images/hero.png",
  },
  {
    label: "Wood and Pellets",
    cardTitle: "Wood & Pellets",
    kicker: "Smoking Fuel",
    href: "/category/ctgy_wood_and_pellets",
    categoryCode: "ctgy_wood_and_pellets",
    stripImage: "/images/why-cookshack-bg.png",
  },
];

const EXCLUDED_MEGA_MENU_CODES = new Set<string>(["ctgy_sauces_and_spices", "ctgy_cookbooks"]);

/** Subset of `SHOP_NAV_CATEGORIES` shown in the desktop header megamenu (hover + product grid). */
export const MEGA_MENU_CATEGORIES: ShopNavCategory[] = SHOP_NAV_CATEGORIES.filter(
  (c) => !EXCLUDED_MEGA_MENU_CODES.has(c.categoryCode)
);
