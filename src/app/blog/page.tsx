import type { Metadata } from "next";
import MarketingPlaceholder from "@/components/MarketingPlaceholder";

export const metadata: Metadata = {
  title: "Blog",
  description: "News and updates from Cookshack.",
};

export default function BlogPage() {
  return <MarketingPlaceholder title="Blog" />;
}
