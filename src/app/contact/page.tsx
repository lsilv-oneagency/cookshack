import type { Metadata } from "next";
import MarketingPlaceholder from "@/components/MarketingPlaceholder";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Cookshack — Ponca City, Oklahoma.",
};

export default function ContactPage() {
  return (
    <MarketingPlaceholder
      title="Contact Us"
      intro="Call 1-800-423-0698 Mon–Fri, 8am–5pm CT, or email info@cookshack.com. Mailing address: 2304 N. Ash St., Ponca City, OK 74601."
    />
  );
}
