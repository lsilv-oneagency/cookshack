import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Warranty",
  description: "Cookshack product warranty information.",
};

export default function WarrantyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-extrabold uppercase tracking-wider text-[#1A1A1A] sm:text-4xl">
        Warranty
      </h1>
      <p className="mt-4 text-[#565959]">Warranty details will be added here.</p>
    </div>
  );
}
