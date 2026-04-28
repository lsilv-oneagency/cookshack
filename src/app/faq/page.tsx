import type { Metadata } from "next";
import MarketingPlaceholder from "@/components/MarketingPlaceholder";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Cookshack smokers and grills.",
};

export default function FaqPage() {
  return <MarketingPlaceholder title="FAQs" />;
}
