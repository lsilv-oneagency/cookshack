"use client";

import { useState } from "react";
import Image from "next/image";
import ProductImage from "@/components/ProductImage";

type ProductDetailGalleryProps = {
  images: string[];
  productName: string;
  productCode: string;
  productSku?: string;
};

/**
 * Interactive gallery: vertical thumbnails (lg+) + main image, PDP-style.
 */
export default function ProductDetailGallery({
  images,
  productName,
  productCode,
  productSku,
}: ProductDetailGalleryProps) {
  const list = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const safeIndex = list.length > 0 ? Math.min(active, list.length - 1) : 0;
  const main = list[safeIndex];

  if (list.length === 0) {
    return (
      <div className="relative min-h-[min(60vw,420px)] w-full overflow-hidden rounded-md border border-neutral-200 bg-white p-1 shadow-sm lg:aspect-square lg:min-h-0">
        <ProductImage
          src={undefined}
          alt={productName}
          productCode={productCode}
          productSku={productSku}
          productName={productName}
          fill
          className="object-contain p-4 sm:p-6"
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-neutral-200 bg-white p-2 shadow-sm sm:p-3 lg:flex-row lg:items-start lg:gap-4">
      {list.length > 1 && (
        <div className="flex flex-row gap-2 overflow-x-auto pb-1 lg:max-h-[min(80vh,560px)] lg:w-24 lg:flex-col lg:overflow-y-auto lg:pb-0">
          {list.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded border-2 transition lg:h-[4.5rem] lg:w-full ${
                i === safeIndex
                  ? "border-[#D52324] ring-2 ring-[#D52324]/20"
                  : "border-neutral-200 hover:border-[#D52324]/50"
              }`}
              aria-label={`View image ${i + 1} of ${list.length}`}
              aria-current={i === safeIndex ? "true" : undefined}
            >
              <Image
                src={img}
                alt=""
                fill
                className="object-contain p-1.5"
                sizes="80px"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}

      <div className="relative min-h-[min(60vw,420px)] w-full flex-1 overflow-hidden rounded border border-neutral-200 bg-white lg:aspect-square lg:min-h-0">
        <ProductImage
          src={main}
          alt={productName}
          productCode={productCode}
          productSku={productSku}
          productName={productName}
          fill
          className="object-contain p-4 sm:p-6"
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
        />
      </div>
    </div>
  );
}
