import type { Metadata } from "next";
import MarketingPlaceholder from "@/components/MarketingPlaceholder";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Cookshack terms of service.",
};

export default function TermsOfServicePage() {
  return <MarketingPlaceholder title="Terms of Service" />;
}
