import Link from "next/link";
import CatalogHeroBand from "@/components/CatalogHeroBand";
import { IconMagnifyingGlass } from "@/components/icons";

export default function NotFound() {
  return (
    <>
      <CatalogHeroBand paddingClassName="py-10">
        <h1 className="font-heading font-extrabold text-white text-5xl tracking-wider uppercase">
          404
        </h1>
      </CatalogHeroBand>
      <div className="bg-white min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
        <IconMagnifyingGlass className="w-16 h-16 mx-auto mb-6 text-[#AE1B07]" aria-hidden />
        <h2 className="font-heading font-extrabold text-[#1A1A1A] text-3xl tracking-wider uppercase mb-3">
          Page Not Found
        </h2>
        <p className="text-[#6B6B6B] mb-8 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="px-8 py-3.5 bg-[#AE1B07] text-white font-heading font-bold tracking-widest uppercase text-sm hover:bg-[#8E1405] transition rounded"
          >
            Go Home
          </Link>
          <Link
            href="/shop"
            className="px-8 py-3.5 bg-white text-[#1A1A1A] font-heading font-bold tracking-widest uppercase text-sm border border-[#D4C8BE] hover:border-[#AE1B07] hover:text-[#AE1B07] transition rounded"
          >
            Browse Products
          </Link>
        </div>
        <p className="mt-8 text-sm text-[#9A9A9A]">
          Need help?{" "}
          <a href="tel:18004230698" className="text-[#AE1B07] font-semibold hover:text-[#8E1405] transition">
            Call 1-800-423-0698
          </a>
        </p>
      </div>
    </>
  );
}
