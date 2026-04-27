import { getProductByCode } from "@/lib/miva-client";
import { getPrimaryProductImagePath } from "@/lib/miva-product-images";
import type { TopProductCardData } from "@/types/top-products-home";
import TopProductsHomeClient from "./TopProductsHomeClient";

const TOP_PRODUCT_ROWS = [
  {
    code: "SM025",
    title: "Smokette Elite, SS with Digital Controller and Meat Probe",
    quote: "The starter Cookshack. Set it and walk away.",
    monthly: "From $54/mo with Affirm",
    fallbackPrice: 1285.2,
    fallbackFormatted: "$1,285.20",
  },
  {
    code: "SM045",
    title: "Super Smoker Elite, SS with Digital Controller and Meat Probe",
    quote: "The sweet spot. Still park your car in the garage.",
    monthly: "From $64/mo with Affirm",
    fallbackPrice: 1520,
    fallbackFormatted: "$1,520.00",
  },
  {
    code: "PG500",
    title: "Fast Eddy's™ by Cookshack Pellet Grill",
    quote: "Competition DNA at home. Designed by a world champion.",
    monthly: "From $152/mo with Affirm",
    fallbackPrice: 3640,
    fallbackFormatted: "$3,640.00",
  },
  {
    code: "SM066",
    title: "Smoker Oven, AmeriQue, with Digital Cook and Hold Controller",
    quote: "Cook and hold. For the serious residential pitmaster.",
    monthly: "From $99/mo with Affirm",
    fallbackPrice: 2375,
    fallbackFormatted: "$2,375.00",
  },
] as const;

export default async function TopProductsHomeSection() {
  const items: TopProductCardData[] = await Promise.all(
    TOP_PRODUCT_ROWS.map(async (row) => {
      let product = null;
      try {
        const res = await getProductByCode(row.code);
        if (res.data?.code) product = res.data;
      } catch {
        // fall back to static merchandising copy + graphics URL resolution in ProductImage
      }
      const rawImg = product ? getPrimaryProductImagePath(product) : "";
      const inStock = product ? product.inv1 === undefined || product.inv1 > 0 : true;
      return {
        code: row.code,
        displayTitle: row.title,
        quote: row.quote,
        monthly: row.monthly,
        price: product?.price ?? row.fallbackPrice,
        formattedPrice: product?.formatted_price ?? row.fallbackFormatted,
        sku: product?.sku || row.code,
        productName: product?.name || row.title,
        rawImg,
        inStock,
      };
    })
  );

  return <TopProductsHomeClient items={items} />;
}
