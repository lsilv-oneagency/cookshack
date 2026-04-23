"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import type { MivaCategory } from "@/types/miva";
import { IconPhone } from "@/components/icons";

type NavSubItem = { label: string; href: string };

// ── Static nav structure — codes match Miva store categories ─────────────────
const NAV_ITEMS: { label: string; href: string; sub: NavSubItem[] }[] = [
  {
    label: "Residential Equipment",
    href: "/category/ctgy_residential_equipment",
    sub: [],
  },
  {
    label: "Commercial Equipment",
    href: "/category/ctgy_commercial_products",
    sub: [],
  },
  {
    label: "Equipment Accessories",
    href: "/category/ctgy_equipment_accessories",
    sub: [],
  },
  {
    label: "Sauces and Spices",
    href: "/category/ctgy_sauces_and_spices",
    sub: [],
  },
  {
    label: "Cookbooks",
    href: "/category/ctgy_cookbooks",
    sub: [],
  },
  {
    label: "Replacement Parts",
    href: "/category/ctgy_replacement_parts",
    sub: [],
  },
  {
    label: "Wood and Pellets",
    href: "/category/ctgy_wood_and_pellets",
    sub: [],
  },
  {
    label: "Recipes",
    href: "/recipes",
    sub: [],
  },
];

// ── Cookshack Logo — Mesquite Std when present in /public/fonts; else Outfit ──
function CookshackLogo() {
  return (
    <span className="flex flex-col leading-none gap-0.5">
      <span
        style={{
          fontFamily: "var(--font-mesquite)",
          fontOpticalSizing: "auto",
          fontSize: "1.75rem",
          letterSpacing: "0.05em",
          lineHeight: 1,
        }}
        className="text-white group-hover:text-[#E85D04] transition-colors duration-200"
      >
        COOKSHACK
      </span>
      <span
        className="font-heading font-bold uppercase leading-none"
        style={{ fontSize: "0.48rem", letterSpacing: "0.22em", color: "#E85D04" }}
      >
        Nothing Beats A Cookshack!
      </span>
    </span>
  );
}

interface HeaderProps {
  categories?: MivaCategory[];
}

export default function Header({ categories: _categories = [] }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount, toggleCart } = useCart();

  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const dropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setOpenDropdown(null); }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  const openMenu = (label: string) => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setOpenDropdown(label);
  };

  const closeMenu = () => {
    dropdownTimerRef.current = setTimeout(() => setOpenDropdown(null), 120);
  };

  return (
    <>
      {/* ── Top utility bar ────────────────────────────────── */}
      <div className="bg-[#1A1A1A] text-[#9A9A9A] text-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-[#E85D04]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <a href="tel:18004230698" className="hover:text-white transition font-medium">
              1-800-423-0698
            </a>
          </span>
          <div className="flex items-center gap-5">
            <Link href="/support" className="hover:text-white transition">Support</Link>
            <Link href="/order-history" className="hover:text-white transition">Order History</Link>
            <Link href="/sign-in" className="hover:text-white transition">Sign In</Link>
          </div>
        </div>
      </div>

      {/* ── Main header ────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 bg-[#111111] transition-shadow duration-300 ${
          scrolled ? "shadow-[0_2px_20px_rgba(0,0,0,0.5)]" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 group" aria-label="Cookshack — Home">
              <CookshackLogo />
            </Link>

            {/* Search bar — desktop */}
            <form onSubmit={handleSearch} className="flex-1 max-w-sm hidden lg:flex">
              <div className="relative w-full">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-4 pr-10 py-2 text-sm bg-[#2B2B2B] border border-[#3D3D3D] text-white placeholder-[#6B6B6B] rounded-full focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent transition"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#E85D04] transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link href="/search" className="lg:hidden p-2 text-[#9A9A9A] hover:text-white transition rounded-full hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>

              <Link href="/sign-in" className="hidden sm:flex p-2 text-[#9A9A9A] hover:text-white transition rounded-full hover:bg-white/10" aria-label="Account">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>

              <button
                onClick={toggleCart}
                className="relative p-2 text-[#9A9A9A] hover:text-white transition rounded-full hover:bg-white/10"
                aria-label="Cart"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#E85D04] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-[#9A9A9A] hover:text-white transition rounded-full hover:bg-white/10"
                aria-label="Menu"
              >
                {mobileOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Desktop nav ──────────────────────────────────── */}
        <nav className="hidden md:block border-t border-[#2B2B2B]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex flex-wrap items-center justify-center gap-0">
              {NAV_ITEMS.map((item) => (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.sub.length > 0 && openMenu(item.label)}
                  onMouseLeave={closeMenu}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 px-4 py-3.5 text-sm font-heading font-semibold tracking-wider uppercase transition border-b-2 ${
                      pathname.startsWith(item.href)
                        ? "text-[#E85D04] border-[#E85D04]"
                        : "text-[#CCCCCC] hover:text-white border-transparent hover:border-[#E85D04]"
                    }`}
                  >
                    {item.label}
                    {item.sub.length > 0 && (
                      <svg className="w-3 h-3 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </Link>

                  {/* Dropdown */}
                  {item.sub.length > 0 && openDropdown === item.label && (
                    <div
                      className="absolute top-full left-0 min-w-[220px] bg-[#1A1A1A] border border-[#2B2B2B] shadow-2xl py-2 z-50"
                      onMouseEnter={() => openMenu(item.label)}
                      onMouseLeave={closeMenu}
                    >
                      {item.sub.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="block px-5 py-2.5 text-sm text-[#CCCCCC] hover:text-white hover:bg-[#E85D04] transition font-body tracking-wide"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* ── Mobile menu ──────────────────────────────────── */}
        {mobileOpen && (
          <div className="md:hidden bg-[#1A1A1A] border-t border-[#2B2B2B]">
            <form onSubmit={handleSearch} className="px-4 py-3 border-b border-[#2B2B2B]">
              <div className="relative">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-4 pr-10 py-2.5 text-sm bg-[#2B2B2B] border border-[#3D3D3D] text-white placeholder-[#6B6B6B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E85D04]"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
            <nav className="py-2">
              {NAV_ITEMS.map((item) => (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-center text-center px-5 py-3 text-sm font-heading font-semibold tracking-wider uppercase text-[#CCCCCC] hover:text-white hover:bg-[#2B2B2B] transition"
                  >
                    {item.label}
                  </Link>
                  {item.sub.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className="block pl-9 pr-5 py-2.5 text-sm text-[#9A9A9A] hover:text-white hover:bg-[#2B2B2B] transition"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              ))}
              <div className="border-t border-[#2B2B2B] mt-2 pt-2 px-5 pb-3 flex gap-4 text-xs text-[#9A9A9A]">
                <a href="tel:18004230698" className="inline-flex items-center gap-1.5 hover:text-white">
                  <IconPhone className="w-3.5 h-3.5 shrink-0 text-[#E85D04]" aria-hidden />
                  1-800-423-0698
                </a>
                <Link href="/sign-in" className="hover:text-white">Sign In</Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
