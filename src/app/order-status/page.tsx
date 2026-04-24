import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Status",
  description: "Check your Cookshack order status.",
};

export default function OrderStatusPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-extrabold uppercase tracking-wider text-[#1A1A1A] sm:text-4xl">
        Order Status
      </h1>
      <p className="mt-4 text-[#565959]">Order lookup will be available here.</p>
    </div>
  );
}
