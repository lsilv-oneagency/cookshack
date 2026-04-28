import type { Metadata } from "next";
import MarketingPlaceholder from "@/components/MarketingPlaceholder";

export const metadata: Metadata = {
  title: "Our Story",
  description: "The Cookshack story — family-owned since 1962.",
};

export default function OurStoryPage() {
  return <MarketingPlaceholder title="Our Story" />;
}
