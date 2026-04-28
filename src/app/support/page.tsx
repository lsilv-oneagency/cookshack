import type { Metadata } from "next";
import MarketingPlaceholder from "@/components/MarketingPlaceholder";

export const metadata: Metadata = {
  title: "Support",
  description: "Cookshack product support and help resources.",
};

export default function SupportPage() {
  return <MarketingPlaceholder title="Support" />;
}
