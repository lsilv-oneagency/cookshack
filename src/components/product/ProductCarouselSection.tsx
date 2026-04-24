import ProductCard from "@/components/ProductCard";
import type { MivaProduct } from "@/types/miva";

type Props = {
  title: string;
  subtitle?: string;
  products: MivaProduct[];
  sectionId?: string;
};

/** Horizontal scroll row of product cards — “Customers also viewed” style. */
export default function ProductCarouselSection({ title, subtitle, products, sectionId }: Props) {
  if (products.length === 0) return null;

  return (
    <section
      className="border-t border-[#E8E0D8] pt-10"
      aria-labelledby={sectionId ? `${sectionId}-heading` : undefined}
    >
      <div className="mb-6">
        <h2
          id={sectionId ? `${sectionId}-heading` : undefined}
          className="font-heading text-xl font-extrabold uppercase tracking-wider text-[#1A1A1A] sm:text-2xl"
        >
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-[#6B6B6B]">{subtitle}</p>}
        <div className="mt-2 h-1 w-12 bg-[#D52324]" />
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {products.map((p) => (
          <div
            key={p.code}
            className="w-[calc(50vw-2rem)] min-w-[200px] max-w-[260px] shrink-0 snap-start sm:w-56 md:w-60"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
