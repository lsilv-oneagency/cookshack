import Link from "next/link";
import { IconMagnifyingGlass } from "@/components/icons";

export default function NotFound() {
  return (
    <>
      <div className="bg-[#1A1A1A] border-b border-[#2B2B2B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="font-heading font-extrabold text-white text-5xl tracking-wider uppercase">
            404
          </h1>
        </div>
      </div>
      <div className="bg-[#F5F0EB] min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
        <IconMagnifyingGlass className="w-16 h-16 mx-auto mb-6 text-[#E85D04]" aria-hidden />
        <h2 className="font-heading font-extrabold text-[#1A1A1A] text-3xl tracking-wider uppercase mb-3">
          Page Not Found
        </h2>
        <p className="text-[#6B6B6B] mb-8 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="px-8 py-3.5 bg-[#E85D04] text-white font-heading font-bold tracking-widest uppercase text-sm hover:bg-[#C44A00] transition rounded"
          >
            Go Home
          </Link>
          <Link
            href="/shop"
            className="px-8 py-3.5 bg-white text-[#1A1A1A] font-heading font-bold tracking-widest uppercase text-sm border border-[#D4C8BE] hover:border-[#E85D04] hover:text-[#E85D04] transition rounded"
          >
            Browse Products
          </Link>
        </div>
        <p className="mt-8 text-sm text-[#9A9A9A]">
          Need help?{" "}
          <a href="tel:18004230698" className="text-[#E85D04] font-semibold hover:text-[#C44A00] transition">
            Call 1-800-423-0698
          </a>
        </p>
      </div>
    </>
  );
}
