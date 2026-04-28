import type { Metadata } from "next";
import MarketingPlaceholder from "@/components/MarketingPlaceholder";

export const metadata: Metadata = {
  title: "Dealers",
  description: "Find a Cookshack dealer.",
};

export default function DealersPage() {
  return <MarketingPlaceholder title="Dealers" />;
}
