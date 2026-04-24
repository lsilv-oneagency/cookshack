import Link from "next/link";
import Image from "next/image";
import { getProducts, getCategoryProducts } from "@/lib/miva-client";
import { getPrimaryProductImagePath } from "@/lib/miva-product-images";
import { filterStorefrontProducts } from "@/lib/miva-storefront-visibility";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import NothingBeatsCallout from "@/components/NothingBeatsCallout";
import HeroBackground from "@/components/HeroBackground";
import type { MivaProduct } from "@/types/miva";
import {
  IconCog,
  IconFlame,
  IconPizza,
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
      className={`relative ${HERO_UNDER_HEADER} flex min-h-[max(120svh,56rem)] flex-col overflow-hidden bg-[#111111]`}
      aria-label="Cookshack hero"
    >
      <HeroBackground />
      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/80 via-black/55 to-black/75" />

      <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 py-6 pb-8 text-center sm:px-6 sm:py-8 sm:pb-10 md:px-8 md:pb-12">
          <div className="flex flex-col items-center">
            <h1 className="mb-6 font-heading font-extrabold leading-[1.05] text-shadow-lg text-white">
              <span className="block text-5xl tracking-wider sm:text-6xl lg:text-7xl">Legendary Smoke</span>
              <span className="block text-5xl tracking-wider sm:text-6xl lg:text-7xl">Professional Grade</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl font-body text-base leading-relaxed text-[#9A9A9A] sm:text-lg">
              Handcrafted smokers and grills built for high-volume restaurants and ultimate backyard
              pitmasters.
            </p>
            <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/category/ctgy_residential_equipment"
                className="inline-flex items-center justify-center gap-2 rounded bg-[#D52324] px-8 py-4 font-heading text-sm font-bold uppercase tracking-widest text-white transition-all hover:brightness-[0.94] active:scale-[0.98]"
              >
                Shop Residential
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/category/ctgy_commercial_products"
                className="inline-flex items-center justify-center gap-2 rounded border-2 border-white/45 bg-black/35 px-8 py-4 font-heading text-sm font-bold uppercase tracking-widest text-white text-shadow-sm backdrop-blur-sm transition-all hover:border-[#D52324] hover:bg-[#D52324]/10 hover:text-[#D52324]"
              >
                Shop Commercial
              </Link>
            </div>
          </div>
        </div>
        <TrustBar variant="inHero" />
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
            className={`group relative flex min-h-[min(70vw,420px)] md:min-h-[min(50vw,560px)] w-full items-center justify-center overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D52324] focus-visible:ring-inset ${
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
              <span className="mt-6 inline-flex items-center gap-2 text-[#D52324] font-heading font-bold text-sm tracking-widest uppercase group-hover:gap-3 transition-all">
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
    <section className="relative overflow-hidden bg-white">
      <div className="relative z-0 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-[#D52324] text-[10px] font-heading font-bold tracking-[0.25em] uppercase mb-4">
              <IconPizza className="w-4 h-4 shrink-0 text-[#D52324]" aria-hidden />
              Wood fire — pizza ovens
            </span>
            <h2 className="font-heading font-extrabold text-[#1A1A1A] text-4xl sm:text-5xl tracking-wider uppercase leading-none mb-4">
              Wood Fire<br />
              <span className="text-[#D52324]">Pizza Oven</span>
            </h2>
            <p className="text-[#565959] text-base leading-relaxed mb-6 max-w-md">
              Bring artisan-quality, wood-fired pizza to your commercial kitchen or backyard.
              Authentic char. Incredible crust. Only from Cookshack.
            </p>
            <Link
              href="/category/sub_ctgy_pizza_oven"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#D52324] text-white font-heading font-bold tracking-widest uppercase text-sm hover:brightness-[0.94] transition rounded"
            >
              Explore pizza ovens
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          <div className="relative hidden h-72 w-full overflow-hidden rounded-xl border border-[#E8E0D8] bg-white md:block">
            <Image
              src={IMG("Pizza_Oven_Promo_3.jpg")}
              alt="Cookshack wood fire pizza oven"
              fill
              className="object-cover rounded-xl"
              unoptimized
            />
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
      count: 20,
      sort: "disp_order",
    });
    const sellable = filterStorefrontProducts(featured.data || []);
    product = sellable[0] ?? null;
    if (!product) {
      const pizza = await getCategoryProducts("sub_ctgy_pizza_oven", {
        count: 20,
        sort: "disp_order",
      });
      const sellablePizza = filterStorefrontProducts(pizza.data || []);
      product = sellablePizza[0] ?? null;
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
  const imgPath = getPrimaryProductImagePath(product);

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative z-0 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-[#D52324] text-[10px] font-heading font-bold tracking-[0.25em] uppercase mb-4">
              {isPizzaSpotlight ? (
                <IconPizza className="w-4 h-4 shrink-0 text-[#D52324]" aria-hidden />
              ) : (
                <IconFlame className="w-4 h-4 shrink-0 text-[#D52324]" aria-hidden />
              )}
              {isPizzaSpotlight ? "Wood fire — featured" : "Featured product"}
            </span>
            <h2 className="font-heading font-extrabold text-[#1A1A1A] text-3xl sm:text-4xl lg:text-5xl tracking-wider uppercase leading-tight mb-3">
              {product.name}
            </h2>
            {product.formatted_price && (
              <p className="font-heading font-extrabold text-2xl text-[#D52324] mb-4">
                {product.formatted_price}
              </p>
            )}
            <p className="text-[#565959] text-base leading-relaxed mb-6 max-w-md">
              {excerpt ||
                "Industry-leading Cookshack equipment — engineered for performance, reliability, and legendary smoke flavor."}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <Link
                href={`/shop/${encodeURIComponent(product.code)}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#D52324] text-white font-heading font-bold tracking-widest uppercase text-sm hover:brightness-[0.94] transition rounded"
              >
                Shop now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              {isPizzaSpotlight && (
                <Link
                  href="/category/sub_ctgy_pizza_oven"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[#3D3D3D] text-[#1A1A1A] font-heading font-bold tracking-widest uppercase text-sm hover:border-[#D52324] hover:text-[#D52324] transition rounded"
                >
                  All pizza ovens
                </Link>
              )}
            </div>
          </div>
          <div className="relative h-72 w-full overflow-hidden rounded-xl border border-[#E8E0D8] bg-white md:h-96">
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
          <div className="w-16 h-1 bg-[#D52324] mx-auto mt-3" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="bg-white border border-[#E8E0D8] rounded p-7 flex flex-col gap-5 shadow-sm hover:shadow-md hover:border-[#D52324]/30 transition"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <svg key={s} className="w-4 h-4 fill-[#D52324]" viewBox="0 0 20 20">
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
          <div className="w-16 h-1 bg-[#D52324] mx-auto mt-3" />
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
              className="glass-why-card rounded-lg p-6 transition duration-300 hover:border-[#D52324] group"
            >
              <Icon className="w-10 h-10 text-[#D52324] mb-4" aria-hidden />
              <h3 className="font-heading font-bold text-white text-lg tracking-wide uppercase mb-2 group-hover:text-[#D52324] transition">
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
    const res = await getCategoryProducts("cat_featured_products", { count: 16, sort: "disp_order" });
    products = filterStorefrontProducts(res.data || []).slice(0, 8);
    if (products.length === 0) {
      const fallback = await getCategoryProducts("ctgy_residential_equipment", { count: 16, sort: "disp_order" });
      products = filterStorefrontProducts(fallback.data || []).slice(0, 8);
    }
  } catch {
    try {
      const res = await getProducts({ count: 24, sort: "disp_order" });
      products = filterStorefrontProducts(res.data || []).slice(0, 8);
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
            <div className="w-16 h-1 bg-[#D52324] mt-3" />
            <p className="text-[#6B6B6B] text-sm mt-3 font-body">
              Discover Cookshack&apos;s industry-leading smokers, wood-fired ovens, and premium fuels.
            </p>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-2 text-[#D52324] font-heading font-bold text-sm tracking-widest uppercase hover:underline transition"
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
const TRUST_BAR_ITEMS: {
  iconSrc: string;
  label: string;
  sub?: string;
  /** Bigger than default 128px when set */
  iconSize?: "default" | "large";
}[] = [
  { iconSrc: "/images/USA.svg", label: "Made in USA" },
  { iconSrc: "/images/warranty.svg", label: "Commercial warranty" },
  { iconSrc: "/images/Shipping.svg", label: "Fast shipping", iconSize: "large" },
  { iconSrc: "/images/rating.svg", label: "Average rating" },
];

function TrustBar({ variant = "standalone" }: { variant?: "standalone" | "inHero" }) {
  return (
    <div
      className={
        variant === "inHero"
          ? "mt-auto w-full border-t border-[#2B2B2B] bg-[#111111]"
          : "border-t border-b border-[#2B2B2B] bg-[#111111]"
      }
    >
      <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-5 sm:py-3 lg:px-7 lg:py-3">
        <div className="grid grid-cols-2 gap-2 divide-y divide-[#2B2B2B] sm:gap-0 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
          {TRUST_BAR_ITEMS.map(({ iconSrc, label, sub, iconSize = "default" }) => {
            const isLarge = iconSize === "large";
            return (
            <div
              key={label}
              className="flex min-w-0 flex-col items-center justify-center gap-1.5 py-2.5 text-center sm:gap-1.5 sm:px-2 sm:py-2 md:px-3"
            >
              <img
                src={iconSrc}
                alt=""
                width={isLarge ? 80 : 64}
                height={isLarge ? 80 : 64}
                className={`shrink-0 ${isLarge ? "h-20 w-20" : "h-16 w-16"}`}
                decoding="async"
              />
              <div className="min-w-0 w-full max-w-none px-0.5 text-center">
                <p className="whitespace-nowrap text-[10px] font-heading font-bold uppercase leading-none tracking-wide text-white sm:text-xs">
                  {label}
                </p>
                {sub && <p className="mt-0.5 text-xs text-[#6B6B6B]">{sub}</p>}
              </div>
            </div>
            );
          })}
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
      <CategoryCards />
      <FeaturedProduct />
      <NothingBeatsCallout />
      <TopProducts />
      <Testimonials />
      <WhyCookshack />
    </>
  );
}
