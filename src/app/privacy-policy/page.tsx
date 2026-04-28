import type { Metadata } from "next";
import MarketingPlaceholder from "@/components/MarketingPlaceholder";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Cookshack privacy policy.",
};

export default function PrivacyPolicyPage() {
  return <MarketingPlaceholder title="Privacy Policy" />;
}
