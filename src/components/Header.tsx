"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import type { MivaCategory, MivaProduct } from "@/types/miva";
import { IconPhone } from "@/components/icons";
import ProductImage from "@/components/ProductImage";
import { CookshackLogoLockup } from "@/components/CookshackLogo";
import HeaderSmokeVideo from "@/components/HeaderSmokeVideo";

type NavItem = {
  label: string;
  href: string;
  /** Miva category code for mega menu (`/api/products?category=`); null = link only (e.g. Recipes). */
  categoryCode: string | null;
};

// ── Static nav — codes match Miva store categories ───────────────────────────
const NAV_ITEMS: NavItem[] = [
  { label: "Residential Equipment", href: "/category/ctgy_residential_equipment", categoryCode: "ctgy_residential_equipment" },
  { label: "Commercial Equipment", href: "/category/ctgy_commercial_products", categoryCode: "ctgy_commercial_products" },
  { label: "Equipment Accessories", href: "/category/ctgy_equipment_accessories", categoryCode: "ctgy_equipment_accessories" },
  { label: "Sauces and Spices", href: "/category/ctgy_sauces_and_spices", categoryCode: "ctgy_sauces_and_spices" },
  { label: "Cookbooks", href: "/category/ctgy_cookbooks", categoryCode: "ctgy_cookbooks" },
  { label: "Replacement Parts", href: "/category/ctgy_replacement_parts", categoryCode: "ctgy_replacement_parts" },
  { label: "Wood and Pellets", href: "/category/ctgy_wood_and_pellets", categoryCode: "ctgy_wood_and_pellets" },
  { label: "Recipes", href: "/recipes", categoryCode: null },
];

const MEGA_PRODUCT_COUNT = 8;
const MEGA_FETCH_MS = 20_000;

interface HeaderProps {
  categories?: MivaCategory[];
}

export default function Header({ categories: _categories = [] }: HeaderProps) {
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
  const megaCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaLabel(null);
    setMegaProducts([]);
    setMegaLoading(false);
    setMegaError(null);
  }, [pathname]);

  const activeMegaItem = megaLabel ? NAV_ITEMS.find((i) => i.label === megaLabel) : undefined;
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
        <HeaderSmokeVideo />
        <div className="relative z-[1]">
        {/* ── Contact bar (phone + links + account + cart) ── */}
        <div className="glass-header-layer border-b border-white/[0.18] text-[#9A9A9A] text-xs">
          <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 sm:h-9 sm:px-6 lg:px-8">
            <span className="flex min-w-0 items-center gap-1.5">
              <svg className="h-3.5 w-3.5 shrink-0 text-[#E85D05]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <a href="tel:18004230698" className="truncate font-medium transition hover:text-white">
                1-800-423-0698
              </a>
            </span>
            <div className="flex shrink-0 items-center gap-2 sm:gap-4 md:gap-5">
              <Link href="/support" className="hidden transition hover:text-white sm:inline">
                Support
              </Link>
              <Link href="/order-history" className="hidden transition hover:text-white md:inline">
                Order History
              </Link>
              <Link href="/sign-in" className="hidden transition hover:text-white lg:inline">
                Sign In
              </Link>
              <Link
                href="/sign-in"
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
                className="relative flex p-1 text-[#9A9A9A] transition hover:text-white sm:p-1.5"
                aria-label="Cart"
              >
                <svg className="h-4 w-4 sm:h-[18px] sm:w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#E85D05] px-0.5 text-[9px] font-bold text-white sm:h-[18px] sm:min-w-[18px] sm:text-[10px]">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Logo row + search row + category nav (dark band, glass) ── */}
        <div className="glass-header-layer">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Logo row */}
          <div className="relative flex min-h-[5rem] items-center justify-center py-2.5 sm:min-h-[5.25rem] sm:py-3">
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
                wordmarkClassName="h-12 max-w-[min(100%,20rem)] sm:h-14"
                taglineClassName="font-heading font-bold uppercase leading-none text-[0.52rem] tracking-[0.22em] text-[#E85D05]"
              />
            </Link>
          </div>

          {/* Search row — directly under logo */}
          <div className="border-t border-white/10 pb-3 pt-2.5">
            <form onSubmit={handleSearch} className="mx-auto w-full max-w-3xl">
              <div className="relative w-full">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-full border border-white/20 bg-white/[0.14] py-2.5 pl-4 pr-11 text-sm text-white shadow-inner shadow-black/30 placeholder:text-white/50 backdrop-blur-xl backdrop-saturate-200 transition focus:border-white/35 focus:bg-white/[0.2] focus:outline-none focus:ring-2 focus:ring-[#E85D05]"
                />
                <button
                  type="submit"
                  title="Search"
                  aria-label="Search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] transition hover:text-[#E85D05]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
          </div>

        {/* ── Desktop nav + mega menu (products per category) ─────────────── */}
        <div
          className="relative hidden w-full md:block"
          onMouseLeave={scheduleCloseMega}
        >
          <nav className="w-full border-t border-white/10" aria-label="Shop categories">
            <ul className="flex w-full flex-nowrap items-stretch">
              {NAV_ITEMS.map((item) => {
                const hasMega = item.categoryCode !== null;
                const megaOpen = hasMega && megaLabel === item.label;
                return (
                  <li
                    key={item.label}
                    className="relative flex min-w-0 flex-1 basis-0"
                    onMouseEnter={() => {
                      cancelCloseMega();
                      if (hasMega) openMega(item.label);
                      else setMegaLabel(null);
                    }}
                  >
                    <Link
                      href={item.href}
                      title={item.label}
                      className={`flex min-h-[40px] w-full min-w-0 items-center justify-center gap-0.5 px-1 py-2 text-center text-[10px] font-heading font-semibold uppercase leading-none tracking-wide transition border-b-2 sm:min-h-[44px] sm:px-1.5 sm:text-[11px] lg:px-2 lg:text-xs ${
                        megaOpen || pathname.startsWith(item.href)
                          ? "text-[#E85D05] border-[#E85D05]"
                          : "text-[#CCCCCC] hover:text-white border-transparent hover:border-[#E85D05]"
                      }`}
                    >
                      <span className="block min-w-0 max-w-full truncate">{item.label}</span>
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
              className="glass-header-layer absolute left-0 right-0 top-full z-50 -mt-px border-t border-white/[0.14] border-b border-white/[0.16] pt-px shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
              onMouseEnter={cancelCloseMega}
            >
              <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 lg:px-6">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#9A9A9A] sm:text-xs">
                    {activeMegaItem.label}
                  </p>
                  <Link
                    href={activeMegaItem.href}
                    className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#E85D05] hover:text-[#F48C06] transition sm:text-xs"
                  >
                    View entire category →
                  </Link>
                </div>

                {megaLoading ? (
                  <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
                    {Array.from({ length: MEGA_PRODUCT_COUNT }).map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse rounded-lg border border-white/10 bg-white/10 p-1 shadow-inner shadow-black/20 backdrop-blur-md"
                      >
                        <div className="h-16 rounded-md bg-white/10 sm:h-20 md:h-24" />
                        <div className="mx-auto mt-1 h-2 max-w-[85%] rounded bg-white/10" />
                        <div className="mx-auto mt-1 h-2 max-w-[55%] rounded bg-white/10" />
                      </div>
                    ))}
                  </div>
                ) : megaError ? (
                  <div className="rounded-lg border border-white/15 bg-black/30 px-4 py-4 text-center backdrop-blur-md">
                    <p className="text-xs text-[#E8E8E8] sm:text-sm">{megaError}</p>
                    <p className="mt-2 text-[10px] text-[#9A9A9A] sm:text-xs">
                      On the live site this is usually a Vercel env issue — copy every{" "}
                      <code className="rounded bg-white/10 px-1">MIVA_*</code> value from{" "}
                      <code className="rounded bg-white/10 px-1">.env.local</code> into Vercel (Production
                      and Preview).
                    </p>
                    <Link
                      href={activeMegaItem.href}
                      className="mt-3 inline-block text-[10px] font-heading font-bold uppercase tracking-widest text-[#E85D05] hover:text-[#F48C06] sm:text-xs"
                    >
                      View category anyway →
                    </Link>
                  </div>
                ) : megaProducts.length === 0 ? (
                  <p className="py-4 text-center text-xs text-[#9A9A9A] sm:text-sm">
                    No products in this category right now.{" "}
                    <Link href={activeMegaItem.href} className="text-[#E85D05] hover:underline">
                      Browse the category
                    </Link>
                  </p>
                ) : (
                  <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
                    {megaProducts.map((p) => (
                      <Link
                        key={p.code}
                        href={`/shop/${encodeURIComponent(p.code)}`}
                        className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-white/15 bg-white/95 shadow-sm backdrop-blur-md transition hover:border-[#E85D05] hover:bg-white hover:shadow-md"
                      >
                        <div className="relative h-16 w-full bg-white sm:h-20 md:h-24">
                          <ProductImage
                            src={p.image || p.thumbnail || undefined}
                            alt={p.name}
                            productCode={p.code}
                            productName={p.name}
                            fill
                            sizes="(max-width: 768px) 25vw, 12vw"
                            className="object-contain p-0.5 transition group-hover:scale-105 sm:p-1"
                          />
                        </div>
                        <div className="flex min-h-0 flex-1 flex-col gap-0.5 px-1 pb-1.5 pt-1">
                          <span className="line-clamp-2 text-[8px] font-heading font-semibold uppercase leading-tight tracking-wide text-neutral-900 transition group-hover:text-[#E85D05] sm:text-[9px] md:line-clamp-2 md:text-[10px]">
                            {p.name}
                          </span>
                          {p.formatted_price && (
                            <span className="text-[9px] font-heading font-extrabold text-[#E85D05] sm:text-[10px] md:text-xs">
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
            <nav className="py-2">
              {NAV_ITEMS.map((item) => (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-center text-center px-5 py-3 text-sm font-heading font-semibold tracking-wider uppercase text-[#CCCCCC] hover:text-white hover:bg-[#2B2B2B] transition"
                  >
                    {item.label}
                  </Link>
                </div>
              ))}
              <div className="border-t border-[#2B2B2B] mt-2 pt-2 px-5 pb-3 flex gap-4 text-xs text-[#9A9A9A]">
                <a href="tel:18004230698" className="inline-flex items-center gap-1.5 hover:text-white">
                  <IconPhone className="w-3.5 h-3.5 shrink-0 text-[#E85D05]" aria-hidden />
                  1-800-423-0698
                </a>
                <Link href="/sign-in" className="hover:text-white">Sign In</Link>
              </div>
            </nav>
          </div>
        )}
        </div>
      </header>
    </>
  );
}
