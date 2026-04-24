import Link from "next/link";

type Props = {
  productName: string;
};

/**
 * Amazon-style light strip under the main nav — keeps PDP commerce context without the dark video hero.
 */
export default function PdpBreadcrumb({ productName }: Props) {
  return (
    <nav
      className="border-b border-[#D5D9D9] bg-[#F0F2F2] text-xs text-[#565959]"
      aria-label="Breadcrumb"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-1.5 gap-y-1 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link href="/" className="text-[#D52324] hover:underline">
          Home
        </Link>
        <span className="text-[#C9C9C9] select-none" aria-hidden>
          ›
        </span>
        <Link href="/shop" className="text-[#D52324] hover:underline">
          Shop
        </Link>
        <span className="text-[#C9C9C9] select-none" aria-hidden>
          ›
        </span>
        <span className="max-w-[min(100%,42rem)] truncate text-[#0F1111]">{productName}</span>
      </div>
    </nav>
  );
}
