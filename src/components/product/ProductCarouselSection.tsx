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
      className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"
      aria-labelledby={sectionId ? `${sectionId}-heading` : undefined}
    >
      <div className="mb-4">
        <h2
          id={sectionId ? `${sectionId}-heading` : undefined}
          className="text-lg font-bold text-[#0F1111] sm:text-xl"
        >
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-[#565959]">{subtitle}</p>}
        <div className="mt-2 h-0.5 w-12 bg-[#D52324]" />
      </div>
      <div className="-mx-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-2 pb-1 sm:-mx-0 sm:px-0">
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
