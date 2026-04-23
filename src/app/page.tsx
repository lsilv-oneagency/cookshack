import Link from "next/link";
import Image from "next/image";
import { getProducts, getCategoryProducts } from "@/lib/miva-client";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import HeroBackground from "@/components/HeroBackground";
import type { MivaProduct } from "@/types/miva";
import {
  IconArrowUturnLeft,
  IconCog,
  IconFlame,
  IconLockClosed,
  IconPhone,
  IconPizza,
  IconTruck,
  IconTrophy,
  IconUserGroup,
} from "@/components/icons";

const IMG = (p: string) => `/api/img?p=${encodeURIComponent(`mm5/graphics/00000001/1/${p}`)}`;


export const revalidate = 300;

// Pull hero behind fixed glass header: offsets ≈ contact bar + logo + search (+ category nav md+).
const HERO_UNDER_HEADER =
  "-mt-[188px] pt-[188px] sm:-mt-[188px] sm:pt-[188px] md:-mt-[236px] md:pt-[236px]";

// ── Hero ───────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      className={`relative ${HERO_UNDER_HEADER} flex min-h-[88svh] items-center overflow-hidden bg-[#111111]`}
      aria-label="Cookshack hero"
    >
      <HeroBackground />
      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/80 via-black/55 to-black/75" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-6 text-center sm:px-6 sm:pb-20 md:px-8 md:pb-28 md:pt-8">
        <div className="flex flex-col items-center">
          <span className="inline-flex items-center justify-center gap-2 text-[#F48C06] text-xs font-heading font-bold tracking-[0.2em] uppercase mb-6">
            <IconUserGroup className="w-4 h-4 shrink-0 text-[#F48C06]" aria-hidden />
            Since 1962 — Family Owned
          </span>
          <h1 className="font-heading font-extrabold text-white leading-none text-shadow-lg mb-6">
            <span className="block text-5xl sm:text-6xl lg:text-7xl tracking-wider">
              NOTHING{" "}
              <span className="text-[#E85D05]">BEATS A</span>
            </span>
            <span
              className="block text-5xl font-extrabold leading-none tracking-wider text-white sm:text-6xl lg:text-7xl"
              style={{
                fontFamily: "var(--font-mesquite)",
                fontOpticalSizing: "auto",
                letterSpacing: "0.05em",
              }}
            >
              COOKSHACK!
            </span>
          </h1>
          <p className="text-[#9A9A9A] text-base sm:text-lg leading-relaxed mb-8 max-w-2xl mx-auto font-body">
            Consistent, high-volume performance with legendary smoke flavor — 
            precision-built for backyard cooks and commercial kitchens who demand professional results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
            <Link
              href="/category/ctgy_residential_equipment"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#E85D05] text-white font-heading font-bold tracking-widest uppercase text-sm hover:bg-[#C44A00] active:scale-[0.98] transition-all rounded"
            >
              Shop Residential
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/category/ctgy_commercial_products"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[#3D3D3D] text-white font-heading font-bold tracking-widest uppercase text-sm hover:border-[#E85D05] hover:text-[#E85D05] transition-all rounded"
            >
              Shop Commercial
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Full-width shop split: commercial | residential ────────────────────────
const SHOP_SPLIT_COLUMNS = [
  {
    title: "Pro-Grade Grills & Smokers",
    href: "/category/ctgy_commercial_products",
    image: "/images/shop-commercial.png",
    alt: "Chef using a Cookshack commercial smoker in a professional kitchen",
  },
  {
    title: "Home Grills & Smokers",
    href: "/category/ctgy_residential_equipment",
    image: "/images/shop-residential.png",
    alt: "Cooking with a Cookshack smoker in a backyard patio setting",
  },
] as const;

function CategoryCards() {
  return (
    <section className="w-full bg-[#111111]">
      <div className="grid w-full grid-cols-1 md:grid-cols-2 md:grid-rows-1 gap-0">
        {SHOP_SPLIT_COLUMNS.map((col, index) => (
          <Link
            key={col.href}
            href={col.href}
            className={`group relative flex min-h-[min(70vw,420px)] md:min-h-[min(50vw,560px)] w-full items-center justify-center overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D05] focus-visible:ring-inset ${
              index === 1 ? "md:border-l border-white/10" : ""
            }`}
          >
            <Image
              src={col.image}
              alt={col.alt}
              fill
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/30 group-hover:via-black/50 transition-colors duration-300" />
            <div className="relative z-10 flex flex-col items-center justify-center px-6 py-16 text-center">
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-wider uppercase leading-tight max-w-lg text-shadow-lg">
                {col.title}
              </h2>
              <span className="mt-6 inline-flex items-center gap-2 text-[#E85D05] font-heading font-bold text-sm tracking-widest uppercase group-hover:gap-3 transition-all">
                Shop now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** When Miva returns no featured / pizza product (e.g. local dev). */
function FeaturedProductFallback() {
  return (
    <section className="bg-[#1A1A1A] overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(232,93,4,0.12)_0%,transparent_60%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-[#F48C06] text-[10px] font-heading font-bold tracking-[0.25em] uppercase mb-4">
              <IconPizza className="w-4 h-4 shrink-0 text-[#F48C06]" aria-hidden />
              Wood fire — pizza ovens
            </span>
            <h2 className="font-heading font-extrabold text-white text-4xl sm:text-5xl tracking-wider uppercase leading-none mb-4">
              Wood Fire<br />
              <span className="text-[#E85D05]">Pizza Oven</span>
            </h2>
            <p className="text-[#9A9A9A] text-base leading-relaxed mb-6 max-w-md">
              Bring artisan-quality, wood-fired pizza to your commercial kitchen or backyard.
              Authentic char. Incredible crust. Only from Cookshack.
            </p>
            <Link
              href="/category/sub_ctgy_pizza_oven"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#E85D05] text-white font-heading font-bold tracking-widest uppercase text-sm hover:bg-[#C44A00] transition rounded"
            >
              Explore pizza ovens
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          <div className="hidden md:block relative h-72 w-full rounded-xl overflow-hidden border border-[#2B2B2B]">
            <Image
              src={IMG("Pizza_Oven_Promo_3.jpg")}
              alt="Cookshack wood fire pizza oven"
              fill
              className="object-cover rounded-xl"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#1A1A1A]/40 rounded-xl pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Featured spotlight — mirrors cookshack.com hero merchandising:
 * first active product in `cat_featured_products`, else first in `sub_ctgy_pizza_oven`.
 */
async function FeaturedProduct() {
  let product: MivaProduct | null = null;
  try {
    const featured = await getCategoryProducts("cat_featured_products", {
      count: 1,
      sort: "disp_order",
    });
    product = featured.data?.[0] ?? null;
    if (!product) {
      const pizza = await getCategoryProducts("sub_ctgy_pizza_oven", {
        count: 1,
        sort: "disp_order",
      });
      product = pizza.data?.[0] ?? null;
    }
  } catch {
    product = null;
  }

  if (!product) {
    return <FeaturedProductFallback />;
  }

  const plain = stripHtml(product.descrip || "");
  const excerpt =
    plain.length > 220 ? `${plain.slice(0, 217).trimEnd()}…` : plain;
  const isPizzaSpotlight = /pizza|wood\s*fire/i.test(product.name);
  const imgPath =
    product.image ||
    product.productimagedata?.find((i) => i.default_image)?.image ||
    product.productimagedata?.[0]?.image ||
    "";

  return (
    <section className="bg-[#1A1A1A] overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(232,93,4,0.12)_0%,transparent_60%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-[#F48C06] text-[10px] font-heading font-bold tracking-[0.25em] uppercase mb-4">
              {isPizzaSpotlight ? (
                <IconPizza className="w-4 h-4 shrink-0 text-[#F48C06]" aria-hidden />
              ) : (
                <IconFlame className="w-4 h-4 shrink-0 text-[#F48C06]" aria-hidden />
              )}
              {isPizzaSpotlight ? "Wood fire — featured" : "Featured product"}
            </span>
            <h2 className="font-heading font-extrabold text-white text-3xl sm:text-4xl lg:text-5xl tracking-wider uppercase leading-tight mb-3">
              {product.name}
            </h2>
            {product.formatted_price && (
              <p className="font-heading font-extrabold text-2xl text-[#E85D05] mb-4">
                {product.formatted_price}
              </p>
            )}
            <p className="text-[#9A9A9A] text-base leading-relaxed mb-6 max-w-md">
              {excerpt ||
                "Industry-leading Cookshack equipment — engineered for performance, reliability, and legendary smoke flavor."}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <Link
                href={`/shop/${encodeURIComponent(product.code)}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#E85D05] text-white font-heading font-bold tracking-widest uppercase text-sm hover:bg-[#C44A00] transition rounded"
              >
                Shop now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              {isPizzaSpotlight && (
                <Link
                  href="/category/sub_ctgy_pizza_oven"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[#3D3D3D] text-white font-heading font-bold tracking-widest uppercase text-sm hover:border-[#E85D05] hover:text-[#E85D05] transition rounded"
                >
                  All pizza ovens
                </Link>
              )}
            </div>
          </div>
          <div className="relative h-72 md:h-96 w-full rounded-xl overflow-hidden bg-[#111111] border border-[#2B2B2B]">
            <ProductImage
              src={imgPath}
              alt={product.name}
              productCode={product.code}
              productName={product.name}
              fill
              className="object-contain bg-white p-6 md:p-8"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#1A1A1A]/35 pointer-events-none rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "My smoker runs all day, every day, six days a week. I never worry about over or underdone. My smoke is consistent and hard to beat. We are setting the standard for BBQ in our area.",
    name: "Route 8 BBQ",
    role: "Commercial Customer",
  },
  {
    quote: "I've been using Cookshack for 15 years. The quality is unmatched and the customer support is always there when I need them. These machines are workhorses.",
    name: "James T.",
    role: "Residential Customer",
  },
  {
    quote: "Switched to Cookshack for our restaurant three years ago. Our customers always comment on the amazing smoke flavor. Best investment we've made in our kitchen.",
    name: "Smokehouse Kitchen",
    role: "Commercial Customer",
  },
];

function Testimonials() {
  return (
    <section className="bg-[#F7F7F7] py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading font-extrabold text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider uppercase">
            What Our Customers Are Saying
          </h2>
          <div className="w-16 h-1 bg-[#E85D05] mx-auto mt-3" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="bg-white border border-[#E8E0D8] rounded p-7 flex flex-col gap-5 shadow-sm hover:shadow-md hover:border-[#E85D05]/30 transition"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <svg key={s} className="w-4 h-4 fill-[#E85D05]" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-[#3D3D3D] text-sm leading-relaxed font-body flex-1 italic">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div>
                <p className="font-heading font-bold text-[#1A1A1A] tracking-wide uppercase text-sm">
                  {t.name}
                </p>
                <p className="text-xs text-[#9A9A9A] mt-0.5">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Why Cookshack ─────────────────────────────────────────────────────────
function WhyCookshack() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/why-cookshack-bg.png')" }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/90 via-[#1A1A1A]/82 to-[#0a0a0a]/92"
        aria-hidden
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-heading font-extrabold text-4xl sm:text-5xl text-white tracking-wider uppercase">
            Why Cookshack?
          </h2>
          <div className="w-16 h-1 bg-[#E85D05] mx-auto mt-3" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(
            [
              {
                Icon: IconFlame,
                title: "Legendary Smoke Flavor",
                desc: "Engineered to deliver the same authentic, slow-smoked taste every single time — whether it's your first cook or your thousandth.",
              },
              {
                Icon: IconCog,
                title: "Built to Last",
                desc: "Commercial-grade stainless steel construction designed to run shift after shift, year after year without missing a beat.",
              },
              {
                Icon: IconTrophy,
                title: "Competition Proven",
                desc: "From backyard BBQ championships to Michelin-starred restaurants, Cookshack is the choice of champions.",
              },
              {
                Icon: IconUserGroup,
                title: "Expert Support",
                desc: "Our BBQ experts are available by phone, Mon–Fri. Real people who know these machines inside and out.",
              },
            ] as const
          ).map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="glass-why-card rounded-lg p-6 transition duration-300 hover:border-[#E85D05] group"
            >
              <Icon className="w-10 h-10 text-[#E85D05] mb-4" aria-hidden />
              <h3 className="font-heading font-bold text-white text-lg tracking-wide uppercase mb-2 group-hover:text-[#E85D05] transition">
                {title}
              </h3>
              <p className="text-[#9A9A9A] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Top Products ──────────────────────────────────────────────────────────
async function TopProducts() {
  let products: Awaited<ReturnType<typeof getProducts>>["data"] = [];
  try {
    // Use the Featured Products category — real hero products with images.
    // Fall back to residential equipment if featured is empty.
    const res = await getCategoryProducts("cat_featured_products", { count: 8, sort: "disp_order" });
    products = res.data || [];
    if (products.length === 0) {
      const fallback = await getCategoryProducts("ctgy_residential_equipment", { count: 8, sort: "disp_order" });
      products = fallback.data || [];
    }
  } catch {
    try {
      const res = await getProducts({ count: 8, sort: "disp_order" });
      products = res.data || [];
    } catch {
      // silently fail — section simply won't show
    }
  }

  if (products.length === 0) return null;

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <h2 className="font-heading font-extrabold text-4xl sm:text-5xl text-[#1A1A1A] tracking-wider uppercase leading-none">
              Top Products
            </h2>
            <div className="w-16 h-1 bg-[#E85D05] mt-3" />
            <p className="text-[#6B6B6B] text-sm mt-3 font-body">
              Discover Cookshack&apos;s industry-leading smokers, wood-fired ovens, and premium fuels.
            </p>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-2 text-[#E85D05] font-heading font-bold text-sm tracking-widest uppercase hover:text-[#C44A00] transition"
          >
            View All Products
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {products.map((p) => (
            <ProductCard key={p.id || p.code} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Trust bar ─────────────────────────────────────────────────────────────
function TrustBar() {
  return (
    <div className="bg-[#111111] border-t border-b border-[#2B2B2B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#2B2B2B]">
          {(
            [
              { Icon: IconTruck, label: "Free Shipping", sub: "On qualifying orders" },
              { Icon: IconLockClosed, label: "Secure Checkout", sub: "SSL encrypted" },
              { Icon: IconArrowUturnLeft, label: "Easy Returns", sub: "Hassle-free process" },
              { Icon: IconPhone, label: "1-800-423-0698", sub: "Mon–Fri, 8am–5pm CT" },
            ] as const
          ).map(({ Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 py-3 sm:py-2 sm:px-6 first:pl-0">
              <Icon className="w-7 h-7 shrink-0 text-[#E85D05]" aria-hidden />
              <div>
                <p className="text-sm font-heading font-bold text-white tracking-wide uppercase">
                  {label}
                </p>
                <p className="text-xs text-[#6B6B6B] mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default async function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <CategoryCards />
      <FeaturedProduct />
      <TopProducts />
      <Testimonials />
      <WhyCookshack />
    </>
  );
}
