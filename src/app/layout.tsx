import type { Metadata } from "next";
import { Barlow_Condensed, Inter, Rye } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCategories } from "@/lib/miva-client";
import type { MivaCategory } from "@/types/miva";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-heading",
});
// Rye — western slab serif, closest freely-available match for Mesquite Std.
// Drop MesquiteStd.otf into public/fonts/ and the @font-face in globals.css
// will automatically take precedence via the --font-mesquite CSS variable.
const rye = Rye({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mesquite",
});

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
      <main>{children}</main>
      <Footer />
    </CartProvider>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${barlowCondensed.variable} ${rye.variable} antialiased`}>
        <RootLayoutInner>{children}</RootLayoutInner>
      </body>
    </html>
  );
}
