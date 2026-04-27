import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { canViewAsRecipeContentPage, getProductByCode } from "@/lib/miva-client";
import { getPrimaryProductImagePath } from "@/lib/miva-product-images";
import ProductImage from "@/components/ProductImage";

type PageProps = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  try {
    const res = await getProductByCode(decodeURIComponent(code));
    const p = res.data;
    if (!p || !canViewAsRecipeContentPage(p)) {
      return { title: "Recipe" };
    }
    const title = (p.page_title && p.page_title.trim()) || p.name;
    const plain = p.descrip?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 155);
    return {
      title,
      description: plain || `Cookshack recipe: ${p.name}`,
    };
  } catch {
    return { title: "Recipe" };
  }
}

export default async function RecipeContentProductPage({ params }: PageProps) {
  const { code } = await params;
  const productCode = decodeURIComponent(code);

  const res = await getProductByCode(productCode);
  const p = res.data;
  if (!p || !canViewAsRecipeContentPage(p)) {
    notFound();
  }

  const title = (p.page_title && p.page_title.trim()) || p.name;
  const rawImg = getPrimaryProductImagePath(p);
  const html = p.descrip?.trim() || "";

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[#6B6B6B]">
        <Link href="/" className="transition hover:text-[#D52324]">
          Home
        </Link>
        <span aria-hidden className="text-[#4A4A4A]">
          /
        </span>
        <Link href="/recipes" className="transition hover:text-[#D52324]">
          Recipes
        </Link>
        <span aria-hidden className="text-[#4A4A4A]">
          /
        </span>
        <span className="text-[#9A9A9A]">{title}</span>
      </nav>

      <p className="text-[10px] font-heading font-bold uppercase tracking-[0.28em] text-[#D52324] sm:text-xs">Recipe</p>
      <h1 className="mt-2 font-heading text-3xl font-extrabold leading-tight tracking-tight text-[#1A1A1A] sm:text-4xl">
        {title}
      </h1>

      {rawImg ? (
        <div className="relative mt-8 aspect-[16/10] w-full overflow-hidden rounded-lg border border-[#E8E0D8] bg-white">
          <ProductImage
            src={rawImg}
            alt={p.name}
            productCode={p.code}
            productSku={p.sku}
            productName={p.name}
            fill
            className="object-contain object-center p-4 sm:p-6"
            sizes="(max-width: 768px) 100vw, 48rem"
            priority
          />
        </div>
      ) : null}

      {html ? (
        <div
          className="recipe-prose mt-8 font-body text-base leading-relaxed text-[#3D3D3D] [&_a]:text-[#D52324] [&_a]:underline [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-[#1A1A1A] [&_li]:my-1 [&_p]:my-3 [&_strong]:text-[#1A1A1A] [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className="mt-8 text-[#565959]">Full recipe copy is not available for this item yet.</p>
      )}

      <div className="mt-10 border-t border-[#E8E0D8] pt-8">
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-widest text-[#D52324] transition hover:underline"
        >
          ← All recipes
        </Link>
      </div>
    </article>
  );
}
