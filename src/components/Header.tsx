"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { getPrimaryProductImagePath } from "@/lib/miva-product-images";
import { megamenuIconForCategory } from "@/lib/megamenu-category-icons";
import { MEGA_MENU_CATEGORIES, SHOP_NAV_CATEGORIES } from "@/lib/shop-nav-categories";
import type { MivaProduct } from "@/types/miva";
import { IconPhone } from "@/components/icons";
import ProductImage from "@/components/ProductImage";
import { CookshackLogoLockup } from "@/components/CookshackLogo";

type NavItem = {
  label: string;
  href: string;
  /** Miva category code for mega menu (`/api/products?category=`). */
  categoryCode: string | null;
};

// ── Static nav — codes match Miva store categories (shared with home category strip) ──
/** Mobile menu: full list. Desktop category bar + megamenu: `MEGA_MENU_CATEGORIES` only. */
const NAV_ITEMS: NavItem[] = SHOP_NAV_CATEGORIES;
const MEGA_MENU_ITEMS: NavItem[] = MEGA_MENU_CATEGORIES;

function MegaMenuTitleIcon({ categoryCode }: { categoryCode: string }) {
  const I = megamenuIconForCategory(categoryCode);
  if (!I) return null;
  return <I className="h-4 w-4 shrink-0 text-[#D52324] sm:h-[18px] sm:w-[18px]" aria-hidden />;
}

const MEGA_PRODUCT_COUNT = 8;
const MEGA_FETCH_MS = 20_000;

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount, toggleCart } = useCart();

  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  /** Which nav label has the mega menu open (desktop). */
  const [megaLabel, setMegaLabel] = useState<string | null>(null);
  const [megaLoading, setMegaLoading] = useState(false);
  const [megaProducts, setMegaProducts] = useState<MivaProduct[]>([]);
  const [megaError, setMegaError] = useState<string | null>(null);
  const megaCacheRef = useRef<Record<string, MivaProduct[]>>({});
  const megaFetchGenRef = useRef(0);
  const [scrolled, setScrolled] = useState(false);
  /** `true` after user scrolls down the page: compact mark; at top (or back near top) = full “native” size. */
  const [logoCompact, setLogoCompact] = useState(false);
  /** Contact bar + search row: hide on scroll down, show on scroll up or near top. */
  const [headerExtrasVisible, setHeaderExtrasVisible] = useState(true);
  const lastScrollY = useRef(0);
  const megaCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 4);
      setLogoCompact(y > 56);

      const prev = lastScrollY.current;
      const delta = y - prev;
      lastScrollY.current = y;

      if (y < 40) {
        setHeaderExtrasVisible(true);
      } else if (delta > 12) {
        setHeaderExtrasVisible(false);
      } else if (delta < -12) {
        setHeaderExtrasVisible(true);
      }
    };
    lastScrollY.current = typeof window !== "undefined" ? window.scrollY : 0;
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaLabel(null);
    setMegaProducts([]);
    setMegaLoading(false);
    setMegaError(null);
    setHeaderExtrasVisible(true);
    lastScrollY.current = typeof window !== "undefined" ? window.scrollY : 0;
  }, [pathname]);

  const activeMegaItem = megaLabel ? MEGA_MENU_ITEMS.find((i) => i.label === megaLabel) : undefined;
  const activeMegaCode = activeMegaItem?.categoryCode ?? null;

  useEffect(() => {
    if (!activeMegaCode) {
      setMegaProducts([]);
      setMegaLoading(false);
      setMegaError(null);
      return;
    }
    const cached = megaCacheRef.current[activeMegaCode];
    if (cached) {
      setMegaProducts(cached);
      setMegaLoading(false);
      setMegaError(null);
      return;
    }

    const gen = ++megaFetchGenRef.current;
    setMegaLoading(true);
    setMegaError(null);
    setMegaProducts([]);

    (async () => {
      try {
        const r = await fetch(
          `/api/products?category=${encodeURIComponent(activeMegaCode)}&count=${MEGA_PRODUCT_COUNT}&sort=disp_order`,
          { signal: AbortSignal.timeout(MEGA_FETCH_MS) }
        );
        const j = (await r.json()) as { data?: MivaProduct[]; error?: string };

        if (gen !== megaFetchGenRef.current) return;

        if (!r.ok) {
          const msg = j.error || `Could not load products (${r.status})`;
          setMegaError(msg);
          setMegaProducts([]);
          return;
        }

        const list: MivaProduct[] = Array.isArray(j.data) ? j.data : [];
        megaCacheRef.current[activeMegaCode] = list;
        setMegaProducts(list);
        setMegaError(null);
      } catch (e) {
        if (gen !== megaFetchGenRef.current) return;
        const msg =
          e instanceof Error
            ? e.name === "TimeoutError"
              ? "Request timed out — try again or open the category page."
              : e.message
            : "Could not load products.";
        setMegaError(msg);
        setMegaProducts([]);
      } finally {
        if (gen === megaFetchGenRef.current) {
          setMegaLoading(false);
        }
      }
    })();
  }, [activeMegaCode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  const openMega = (label: string) => {
    if (megaCloseTimerRef.current) {
      clearTimeout(megaCloseTimerRef.current);
      megaCloseTimerRef.current = null;
    }
    setMegaLabel(label);
  };

  const scheduleCloseMega = () => {
    megaCloseTimerRef.current = setTimeout(() => setMegaLabel(null), 200);
  };

  const cancelCloseMega = () => {
    if (megaCloseTimerRef.current) {
      clearTimeout(megaCloseTimerRef.current);
      megaCloseTimerRef.current = null;
    }
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-white/[0.18] transition-shadow duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.25)] ${
          scrolled ? "shadow-[0_12px_40px_rgba(0,0,0,0.45)]" : ""
        }`}
      >
        <div className="relative">
        {/* ── Contact bar: same scroll show/hide as search — heritage + commercial + services + account + cart ── */}
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
            headerExtrasVisible ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className="glass-header-layer border-b border-white/[0.18] text-[#9A9A9A] text-xs"
              inert={headerExtrasVisible ? undefined : true}
            >
              <div className="mx-auto flex min-h-9 max-w-7xl items-center justify-between gap-2 px-4 py-1 sm:min-h-10 sm:px-6 sm:py-0 lg:px-8">
                {/* Left — heritage line (HTML text, not an image) */}
                <p className="min-w-0 max-w-[min(100%,22rem)] flex-1 text-[7px] font-heading font-bold uppercase leading-tight tracking-[0.12em] text-[#8A8A8A] sm:max-w-none sm:text-[10px] sm:leading-snug sm:tracking-[0.14em] md:text-[11px]">
                  <span className="text-[#9A9A9A]">Made in Ponca City, Oklahoma</span>
                  <span className="whitespace-nowrap text-[#5C5C5C] sm:px-1.5" aria-hidden>
                    {" "}
                    |{" "}
                  </span>
                  <span>Since 1962</span>
                </p>

                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
                  <Link
                    href="/commercial"
                    title="Commercial buyer? Start here"
                    tabIndex={headerExtrasVisible ? 0 : -1}
                    className="max-w-[9.5rem] shrink-0 text-right font-heading font-extrabold leading-tight text-[#D52324] border-b-2 border-[#D52324] pb-0.5 text-[9px] transition hover:text-white sm:max-w-none sm:pb-1 sm:text-xs md:max-w-none md:text-sm"
                  >
                    <span className="md:hidden">Commercial →</span>
                    <span className="hidden md:inline">Commercial buyer? Start here →</span>
                  </Link>

                  <div className="hidden items-center gap-2 md:flex md:gap-3 lg:gap-4">
                    <Link
                      href="/financing"
                      tabIndex={headerExtrasVisible ? 0 : -1}
                      className="whitespace-nowrap text-[#9A9A9A] transition hover:text-white"
                    >
                      Financing Available
                    </Link>
                    <Link
                      href="/warranty"
                      tabIndex={headerExtrasVisible ? 0 : -1}
                      className="whitespace-nowrap text-[#9A9A9A] transition hover:text-white"
                    >
                      Warranty
                    </Link>
                    <Link
                      href="/order-status"
                      tabIndex={headerExtrasVisible ? 0 : -1}
                      className="whitespace-nowrap text-[#9A9A9A] transition hover:text-white"
                    >
                      Order Status
                    </Link>
                    <a
                      href="tel:18004230698"
                      tabIndex={headerExtrasVisible ? 0 : -1}
                      className="whitespace-nowrap font-medium text-[#9A9A9A] transition hover:text-white"
                    >
                      1-800-423-0698
                    </a>
                  </div>

                  <a
                    href="tel:18004230698"
                    tabIndex={headerExtrasVisible ? 0 : -1}
                    className="flex p-1 text-[#D52324] transition hover:text-white md:hidden"
                    aria-label="Call 1-800-423-0698"
                  >
                    <IconPhone className="h-4 w-4 shrink-0" />
                  </a>

                  <Link
                    href="/sign-in"
                    tabIndex={headerExtrasVisible ? 0 : -1}
                    className="flex p-1 text-[#9A9A9A] transition hover:text-white sm:p-1.5"
                    aria-label="Account"
                  >
                    <svg className="h-4 w-4 sm:h-[18px] sm:w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Link>
                  <button
                    type="button"
                    onClick={toggleCart}
                    tabIndex={headerExtrasVisible ? 0 : -1}
                    className="relative flex p-1 text-[#9A9A9A] transition hover:text-white sm:p-1.5"
                    aria-label="Cart"
                  >
                    <svg className="h-4 w-4 sm:h-[18px] sm:w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {itemCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#D52324] px-0.5 text-[9px] font-bold text-white sm:h-[18px] sm:min-w-[18px] sm:text-[10px]">
                        {itemCount > 99 ? "99+" : itemCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Logo row + search row + category nav (dark band, glass) ── */}
        <div className="glass-header-layer">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Logo row */}
          <div
            className={`relative flex items-center justify-center transition-[min-height,padding] duration-300 ease-out ${
              logoCompact
                ? "min-h-[4.5rem] py-2 sm:min-h-20 sm:py-2.5"
                : "min-h-[5.75rem] py-2.5 sm:min-h-24 sm:py-3"
            }`}
          >
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="absolute left-0 p-2 text-[#9A9A9A] transition hover:text-white rounded-full hover:bg-white/10 md:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <Link href="/" className="group px-2" aria-label="Cookshack — Home">
              <CookshackLogoLockup
                interactive
                showTagline={false}
                wordmarkClassName={
                  (logoCompact
                    ? "h-11 max-w-[min(100%,19rem)] sm:h-14"
                    : "h-16 max-w-[min(100%,24rem)] sm:h-20") + " transition-all duration-300 ease-out"
                }
              />
            </Link>
          </div>

          {/* Search row — tied to same `headerExtrasVisible` as contact bar */}
          <div
            className={`grid border-t transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
              headerExtrasVisible
                ? "grid-rows-[1fr] border-white/10"
                : "grid-rows-[0fr] border-transparent"
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="pb-3 pt-2.5" inert={headerExtrasVisible ? undefined : true}>
                <form onSubmit={handleSearch} className="mx-auto w-full max-w-3xl">
                  <div className="relative w-full">
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search products..."
                      tabIndex={headerExtrasVisible ? 0 : -1}
                      className="w-full rounded-full border border-white/20 bg-white/[0.14] py-2.5 pl-4 pr-11 text-sm text-white shadow-inner shadow-black/30 placeholder:text-white/50 backdrop-blur-xl backdrop-saturate-200 transition focus:border-white/35 focus:bg-white/[0.2] focus:outline-none focus:ring-2 focus:ring-[#D52324] disabled:opacity-50"
                      disabled={!headerExtrasVisible}
                    />
                    <button
                      type="submit"
                      title="Search"
                      aria-label="Search"
                      tabIndex={headerExtrasVisible ? 0 : -1}
                      disabled={!headerExtrasVisible}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] transition hover:text-[#D52324] disabled:pointer-events-none"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          </div>

        {/* ── Desktop nav + mega menu (products per category) ─────────────── */}
        <div
          className="relative z-20 hidden w-full md:block"
          onMouseLeave={scheduleCloseMega}
        >
          <nav className="w-full border-t border-white/10" aria-label="Shop categories">
            <ul className="mx-auto flex max-w-7xl flex-nowrap items-stretch justify-center gap-x-0 px-3 sm:gap-x-1 sm:px-6 lg:gap-x-1.5 lg:px-8">
              {MEGA_MENU_ITEMS.map((item) => {
                const hasMega = item.categoryCode !== null;
                const megaOpen = hasMega && megaLabel === item.label;
                const pathBase = pathname.split("?")[0]?.replace(/\/$/, "") ?? "";
                const hrefBase = item.href.replace(/\/$/, "");
                const navItemActive = pathBase === hrefBase;
                const CategoryIcon = megamenuIconForCategory(item.categoryCode);
                return (
                  <li
                    key={item.label}
                    className="relative flex shrink-0"
                    onMouseEnter={() => {
                      cancelCloseMega();
                      if (hasMega) openMega(item.label);
                      else setMegaLabel(null);
                    }}
                  >
                    <Link
                      href={item.href}
                      title={item.label}
                      className={`inline-flex min-h-[40px] min-w-0 items-center justify-center gap-1 px-1.5 py-2 text-center text-[10px] font-heading font-semibold uppercase leading-none tracking-wide transition border-b-2 sm:min-h-[44px] sm:gap-1.5 sm:px-2.5 sm:text-[11px] lg:px-3 lg:text-xs ${
                        megaOpen || navItemActive
                          ? "text-[#D52324] border-[#D52324]"
                          : "text-[#CCCCCC] hover:text-white border-transparent hover:border-[#D52324]"
                      }`}
                    >
                      {CategoryIcon && (
                        <CategoryIcon
                          className="h-3.5 w-3.5 shrink-0 text-[#D52324] lg:h-4 lg:w-4"
                          aria-hidden
                        />
                      )}
                      <span className="whitespace-nowrap">{item.label}</span>
                      {hasMega && (
                        <svg
                          className={`h-3 w-3 shrink-0 opacity-60 transition-transform ${megaOpen ? "rotate-180" : ""}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {megaLabel && activeMegaItem?.categoryCode && (
            <div
              className="mega-menu-panel absolute left-0 right-0 top-full z-[200] border-t border-neutral-200 border-b border-neutral-200"
              onMouseEnter={cancelCloseMega}
            >
              <div className="mx-auto max-w-7xl px-3 pt-3 pb-5 sm:px-4 sm:pt-3 sm:pb-6 lg:px-6">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="flex min-w-0 items-center gap-2 text-[10px] font-heading font-bold uppercase tracking-widest text-[#9A9A9A] sm:gap-2.5 sm:text-xs">
                    <MegaMenuTitleIcon categoryCode={activeMegaItem.categoryCode} />
                    <span className="min-w-0">{activeMegaItem.label}</span>
                  </p>
                  <Link
                    href={activeMegaItem.href}
                    className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#D52324] hover:underline transition sm:text-xs"
                  >
                    View entire category →
                  </Link>
                </div>

                {megaLoading ? (
                  <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
                    {Array.from({ length: MEGA_PRODUCT_COUNT }).map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse rounded-lg border border-neutral-200 bg-neutral-50 p-1 shadow-sm"
                      >
                        <div className="h-[4.5rem] rounded-md bg-neutral-200/80 sm:h-[5.5rem] md:h-28" />
                        <div className="mx-auto mt-1 h-2 max-w-[85%] rounded bg-neutral-200" />
                        <div className="mx-auto mt-1 h-2 max-w-[55%] rounded bg-neutral-200" />
                      </div>
                    ))}
                  </div>
                ) : megaError ? (
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-4 text-center">
                    <p className="text-xs text-neutral-800 sm:text-sm">{megaError}</p>
                    <p className="mt-2 text-[10px] text-neutral-600 sm:text-xs">
                      On the live site this is usually a Vercel env issue — copy every{" "}
                      <code className="rounded bg-neutral-200 px-1 text-neutral-900">MIVA_*</code> value from{" "}
                      <code className="rounded bg-neutral-200 px-1 text-neutral-900">.env.local</code> into Vercel (Production
                      and Preview).
                    </p>
                    <Link
                      href={activeMegaItem.href}
                      className="mt-3 inline-block text-[10px] font-heading font-bold uppercase tracking-widest text-[#D52324] hover:underline sm:text-xs"
                    >
                      View category anyway →
                    </Link>
                  </div>
                ) : megaProducts.length === 0 ? (
                  <p className="py-4 text-center text-xs text-[#9A9A9A] sm:text-sm">
                    No products in this category right now.{" "}
                    <Link href={activeMegaItem.href} className="text-[#D52324] hover:underline">
                      Browse the category
                    </Link>
                  </p>
                ) : (
                  <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
                    {megaProducts.map((p) => (
                      <Link
                        key={p.code}
                        href={`/shop/${encodeURIComponent(p.code)}`}
                        className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition hover:border-[#D52324] hover:shadow-md"
                      >
                        <div className="relative h-[4.5rem] w-full bg-white sm:h-[5.5rem] md:h-28">
                          <ProductImage
                            src={getPrimaryProductImagePath(p) || undefined}
                            alt={p.name}
                            productCode={p.code}
                            productName={p.name}
                            fill
                            sizes="(max-width: 768px) 25vw, 12vw"
                            className="object-contain p-0.5 transition group-hover:scale-105 sm:p-1"
                          />
                        </div>
                        <div className="flex min-h-0 flex-1 flex-col gap-0.5 px-1 pb-2 pt-1">
                          <span className="line-clamp-2 text-[8px] font-heading font-semibold uppercase leading-tight tracking-wide text-neutral-900 transition group-hover:text-[#D52324] sm:text-[9px] md:line-clamp-2 md:text-[10px]">
                            {p.name}
                          </span>
                          {p.formatted_price && (
                            <span className="text-[9px] font-heading font-extrabold text-[#D52324] sm:text-[10px] md:text-xs">
                              {p.formatted_price}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        </div>

        {/* ── Mobile menu ──────────────────────────────────── */}
        {mobileOpen && (
          <div className="glass-header-layer border-t border-white/[0.14] border-b border-white/[0.16] md:hidden">
            <nav className="py-2" aria-label="Mobile menu">
              <div className="border-b border-[#2B2B2B] px-5 pb-3">
                <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">
                  Service
                </p>
                <ul className="space-y-2 text-sm text-[#CCCCCC]">
                  <li>
                    <Link href="/financing" className="block py-1 font-heading font-semibold transition hover:text-white" onClick={() => setMobileOpen(false)}>
                      Financing Available
                    </Link>
                  </li>
                  <li>
                    <Link href="/warranty" className="block py-1 font-heading font-semibold transition hover:text-white" onClick={() => setMobileOpen(false)}>
                      Warranty
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/order-status"
                      className="block py-1 font-heading font-semibold transition hover:text-white"
                      onClick={() => setMobileOpen(false)}
                    >
                      Order Status
                    </Link>
                  </li>
                </ul>
              </div>
              {NAV_ITEMS.map((item) => (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-center text-center px-5 py-3 text-sm font-heading font-semibold tracking-wider uppercase text-[#CCCCCC] hover:text-white hover:bg-[#2B2B2B] transition"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                </div>
              ))}
              <div className="mt-2 border-t border-[#2B2B2B] px-5 pb-3 pt-2 flex flex-wrap items-center gap-4 text-xs text-[#9A9A9A]">
                <a href="tel:18004230698" className="inline-flex items-center gap-1.5 font-medium transition hover:text-white">
                  <IconPhone className="h-3.5 w-3.5 shrink-0 text-[#D52324]" aria-hidden />
                  1-800-423-0698
                </a>
                <Link href="/sign-in" className="font-heading font-bold uppercase tracking-wide transition hover:text-white" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
              </div>
            </nav>
          </div>
        )}
        </div>
      </header>
    </>
  );
}
