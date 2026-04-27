import Link from "next/link";
import { SHOP_NAV_CATEGORIES, type ShopNavCategory } from "@/lib/shop-nav-categories";
import styles from "./shop-category-bento.module.css";

/** Eighth bento tile — mobile-only (hidden from grid at 701px+); not in global shop nav. */
const BENTO_MOBILE_ONLY_PIZZA: ShopNavCategory = {
  label: "Pizza Ovens",
  kicker: "Wood-Fired",
  href: "/category/sub_ctgy_pizza_oven",
  categoryCode: "sub_ctgy_pizza_oven",
  stripImage: "/images/catalog-hero-bg.png",
};

const BENTO_TILES: ShopNavCategory[] = [...SHOP_NAV_CATEGORIES, BENTO_MOBILE_ONLY_PIZZA];

/** Bento tiles that use `stripImage` from `SHOP_NAV_CATEGORIES`; others keep shared art. */
const BENTO_CUSTOM_BG_CODES = new Set([
  "ctgy_residential_equipment",
  "ctgy_commercial_products",
  "ctgy_equipment_accessories",
  "ctgy_sauces_and_spices",
  "ctgy_cookbooks",
  "ctgy_replacement_parts",
  "ctgy_wood_and_pellets",
]);

const CATEGORY_BENTO_BG_DEFAULT = "/images/category-bento-placeholder.jpg";

/** `background-position: center` for product photography that reads best centered */
const BENTO_CARD_BG_CENTER_CODES = new Set([
  "ctgy_sauces_and_spices",
  "ctgy_cookbooks",
  "ctgy_replacement_parts",
  "ctgy_wood_and_pellets",
]);

const ICONS = [
  // Residential — home
  <svg key="i0" viewBox="0 0 24 24" aria-hidden>
    <path d="M3 9.5L12 3l9 6.5V21H3V9.5z" />
    <path d="M9 21V14h6v7" />
  </svg>,
  // Commercial
  <svg key="i1" viewBox="0 0 24 24" aria-hidden>
    <rect x="2" y="3" width="20" height="18" rx="2" />
    <path d="M2 9h20" />
    <path d="M10 3v6" />
  </svg>,
  // Equipment accessories
  <svg key="i2" viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v4m0 14v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M1 12h4m14 0h4M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83" />
  </svg>,
  // Sauces
  <svg key="i3" viewBox="0 0 24 24" aria-hidden>
    <path d="M8 2h8l1 5H7L8 2z" />
    <path d="M7 7h10v2a5 5 0 01-5 5 5 5 0 01-5-5V7z" />
    <path d="M12 14v5" />
    <path d="M8 22h8" />
  </svg>,
  // Cookbooks
  <svg key="i4" viewBox="0 0 24 24" aria-hidden>
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>,
  // Parts
  <svg key="i5" viewBox="0 0 24 24" aria-hidden>
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94L6.73 20.2a2 2 0 01-2.83 0 2 2 0 010-2.83l6.73-6.73A6 6 0 016.93 2.53l3.77 3.77z" />
  </svg>,
  // Wood
  <svg key="i6" viewBox="0 0 24 24" aria-hidden>
    <path d="M17 14c.3-1 .5-2 .5-3C17.5 6.5 14 3 12 3S6.5 6.5 6.5 11c0 1 .2 2 .5 3" />
    <path d="M8.5 17h7" />
    <path d="M9.5 20h5" />
    <path d="M12 14v-3" />
  </svg>,
  // Pizza — mobile-only 8th tile (stroke-only; `.icon svg` sets fill: none)
  <svg key="i-pizza" viewBox="0 0 24 24" aria-hidden>
    <path d="M12 3c-1.5 3-6 9-6 13a6 6 0 1012 0c0-4-4.5-10-6-13z" />
    <circle cx="12" cy="14" r="1" />
    <circle cx="10" cy="10" r="0.75" />
    <circle cx="14" cy="11" r="0.75" />
  </svg>,
];

/** Desktop: original 7-cell bento. Mobile: +1 Pizza tile (CSS-hidden on wide viewports). */
export default function ShopCategoryStrip() {
  return (
    <section
      className="w-full border-t border-b border-[#2E2E2E] bg-[#0e0e0e] py-10 sm:py-12"
      aria-labelledby="shop-our-categories-heading"
    >
      {/* Full width of main content column — same as hero copy / featured / testimonials */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center sm:mb-12">
          <h2
            id="shop-our-categories-heading"
            className="font-heading text-3xl font-extrabold uppercase tracking-wider text-white sm:text-4xl md:text-5xl"
          >
            Shop Our Categories
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 bg-[#D52324]" aria-hidden />
          <p className="mx-auto mt-5 max-w-2xl font-body text-base leading-relaxed text-[#9A9A9A] sm:text-lg">
            Everything you need to smoke, grill, and serve — from backyard to commercial kitchen.
          </p>
        </header>
        <ul className={`${styles.bento} m-0 list-none p-0`}>
          {BENTO_TILES.map((cat, i) => {
            const mainLine = cat.cardTitle ?? cat.label;
            const bgUrl = BENTO_CUSTOM_BG_CODES.has(cat.categoryCode)
              ? cat.stripImage
              : CATEGORY_BENTO_BG_DEFAULT;
            const mobileOnly = cat.categoryCode === BENTO_MOBILE_ONLY_PIZZA.categoryCode;
            return (
              <li
                key={cat.href}
                className={`min-w-0 p-0${mobileOnly ? ` ${styles.bentoMobileOnly}` : ""}`}
              >
                <Link
                  href={cat.href}
                  className={styles.card}
                >
                  <div
                    className={`${styles.cardBg}${
                      BENTO_CARD_BG_CENTER_CODES.has(cat.categoryCode) ? ` ${styles.cardBgCenter}` : ""
                    }`}
                    style={{ backgroundImage: `url(${bgUrl})` }}
                    aria-hidden
                  />
                  <div className={styles.cardScrim} aria-hidden />
                  <div className={styles.icon} aria-hidden>
                    {ICONS[i]}
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.labelCol}>
                      <span className={`${styles.count} font-heading`}>{cat.kicker}</span>
                      <span className={`${styles.title} font-heading`}>{mainLine}</span>
                    </div>
                    <span className={styles.arrow} aria-hidden>→</span>
                  </div>
                  <div className={styles.cardGlowLine} aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
