import Link from "next/link";
import { getRecipeProductsForHome, getRecipesCategoryCode } from "@/lib/miva-client";
import { getPrimaryProductImagePath } from "@/lib/miva-product-images";
import ProductImage from "@/components/ProductImage";

function stripHtmlTeaser(html: string | undefined, max: number): string {
  if (!html) return "";
  const t = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

export default async function FromTheKitchenSection() {
  const { products, totalInCategory } = await getRecipeProductsForHome(3);
  const categoryCode = getRecipesCategoryCode();
  const categoryHref = `/category/${encodeURIComponent(categoryCode)}`;
  const hasPicks = products.length > 0;

  return (
    <section
      className="border-t border-[#E8E0D8] bg-white py-16 sm:py-20"
      aria-labelledby="from-the-kitchen-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-heading font-bold uppercase tracking-[0.28em] text-[#D52324] sm:text-xs">
            From the Cookshack kitchen
          </p>
          <h2
            id="from-the-kitchen-heading"
            className="mt-3 font-heading text-3xl font-extrabold leading-[1.15] tracking-tight text-[#1A1A1A] sm:text-4xl md:text-[2.65rem]"
          >
            {hasPicks && totalInCategory > 0 ? (
              <>
                {totalInCategory} recipe{totalInCategory === 1 ? "" : "s"}. Six decades of know-how.
              </>
            ) : (
              <>Recipes from the vault. Six decades of know-how.</>
            )}
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-[#6B6B6B] sm:text-lg sm:leading-relaxed">
            Pulled from our recipe catalog in Miva — the same listings that power your storefront categories.
          </p>
        </header>

        {hasPicks ? (
          <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
            {products.map((p) => {
              const href = `/recipes/view/${encodeURIComponent(p.code)}`;
              const rawImg = getPrimaryProductImagePath(p);
              const teaser = stripHtmlTeaser(p.descrip, 150);
              const title = (p.page_title && p.page_title.trim()) || p.name;
              return (
                <Link
                  key={p.code}
                  href={href}
                  className="group flex min-h-0 flex-col overflow-hidden rounded-lg border border-[#E8E0D8] bg-[#FDFDFC] shadow-sm transition hover:border-[#D6D6D6] hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] w-full bg-white">
                    <ProductImage
                      src={rawImg || undefined}
                      alt={p.name}
                      productCode={p.code}
                      productSku={p.sku}
                      productName={p.name}
                      fill
                      className="object-cover object-center transition duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <p className="text-[10px] font-heading font-bold uppercase tracking-[0.22em] text-[#9A9A9A] sm:text-[11px]">
                      Recipe
                    </p>
                    <h3 className="mt-3 font-heading text-lg font-extrabold leading-snug tracking-tight text-[#1A1A1A] transition group-hover:text-[#D52324] sm:text-xl">
                      {title}
                    </h3>
                    {teaser ? (
                      <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-[#565959] sm:text-base sm:leading-relaxed">
                        {teaser}
                      </p>
                    ) : (
                      <p className="mt-3 flex-1 font-body text-sm italic text-[#9A9A9A] sm:text-base">
                        Open for full instructions and tips.
                      </p>
                    )}
                    <span className="mt-5 inline-flex items-center gap-2 font-heading text-sm font-bold text-[#D52324] transition group-hover:underline">
                      Read the recipe
                      <span aria-hidden className="text-base leading-none">
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mx-auto mt-12 max-w-xl rounded-lg border border-dashed border-[#D6D6D6] bg-[#FAFAFA] px-6 py-10 text-center sm:px-8">
            <p className="font-body text-sm leading-relaxed text-[#565959] sm:text-base">
              Nothing matched the recipe category feed yet, so this row is waiting on Miva. The block stays put so
              the page doesn&apos;t jump — use the links below to browse recipes in the meantime.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
              <Link
                href="/recipes"
                className="inline-flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-widest text-[#D52324] transition hover:underline"
              >
                Recipe collections
                <span aria-hidden>→</span>
              </Link>
              <Link
                href={categoryHref}
                className="inline-flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-widest text-[#1A1A1A] transition hover:underline"
              >
                Recipe category on shop
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        )}

        <p className="mt-10 text-center">
          <Link
            href={categoryHref}
            className="inline-flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-widest text-[#D52324] transition hover:underline"
          >
            Browse all recipe products
            <span aria-hidden>→</span>
          </Link>
        </p>
      </div>
    </section>
  );
}
