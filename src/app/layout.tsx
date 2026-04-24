import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCategories } from "@/lib/miva-client";
import type { MivaCategory } from "@/types/miva";

// Outfit (variable, 100–900) — same family as fonts.googleapis.com/css2?family=Outfit
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

/** Avoid Vercel static prerender >60s when Miva is slow — render on demand instead. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Cookshack — Smokers, Grills & Pizza Ovens",
    template: "%s | Cookshack",
  },
  description:
    "Nothing Beats A Cookshack! Shop commercial and residential BBQ smokers, pellet grills, wood-fired pizza ovens, sauces, spices, and accessories.",
  keywords: ["BBQ smoker", "pellet grill", "commercial smoker", "wood fired pizza oven", "Cookshack"],
  openGraph: {
    type: "website",
    siteName: "Cookshack",
  },
};

async function RootLayoutInner({ children }: { children: React.ReactNode }) {
  let categories: MivaCategory[] = [];
  try {
    const res = await getCategories();
    categories = res.data || [];
  } catch {
    // proceed without categories — nav degrades gracefully
  }

  return (
    <CartProvider>
      <Header categories={categories} />
      <CartDrawer />
      {/* Offset for fixed header (contact + logo/search + category nav on md+) */}
      <main className="pt-[188px] sm:pt-[188px] md:pt-[236px]">{children}</main>
      <Footer />
    </CartProvider>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} antialiased`}
        suppressHydrationWarning
      >
        <RootLayoutInner>{children}</RootLayoutInner>
      </body>
    </html>
  );
}
