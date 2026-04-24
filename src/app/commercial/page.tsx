import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Commercial",
  description: "Cookshack commercial smokers and grills for restaurants and foodservice.",
};

export default function CommercialPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-extrabold uppercase tracking-wider text-[#1A1A1A] sm:text-4xl">
        Commercial
      </h1>
      <p className="mt-4 text-[#565959]">
        Commercial buyers — product lines, spec sheets, and purchasing options will live here.{" "}
        <Link href="/" className="text-[#D52324] font-heading font-bold uppercase tracking-wide hover:underline">
          Return home
        </Link>
      </p>
    </div>
  );
}
