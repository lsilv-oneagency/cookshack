import type { Metadata } from "next";
import MarketingPlaceholder from "@/components/MarketingPlaceholder";

export const metadata: Metadata = {
  title: "About Cookshack",
  description: "American-made smokers and grills from Ponca City, Oklahoma since 1962.",
};

export default function AboutPage() {
  return <MarketingPlaceholder title="About Cookshack" />;
}
