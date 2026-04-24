import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CatalogHeroBand from "@/components/CatalogHeroBand";
import { getRecipeSectionBySlug, RECIPE_SLUGS, type RecipeSection } from "@/lib/recipe-sections";

type PageProps = { params: Promise<{ slug: string }> };

function sectionTitle(section: RecipeSection) {
  if (section.slug === "cookshack-101s") {
    return "Cookshack 101s";
  }
  if (section.slug === "other") {
    return "More recipes";
  }
  return `${section.label} recipes`;
}

export function generateStaticParams() {
  return RECIPE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const section = getRecipeSectionBySlug(slug);
  if (!section) return { title: "Recipes" };
  const t = sectionTitle(section);
  return {
    title: `${t} | Cookshack`,
    description: section.description,
    openGraph: { title: `${t} | Cookshack` },
  };
}

export default async function RecipeSectionPage({ params }: PageProps) {
  const { slug } = await params;
  const section = getRecipeSectionBySlug(slug);
  if (!section) notFound();

  return (
    <>
      <CatalogHeroBand paddingClassName="py-10 sm:py-14">
        <nav className="mb-4 flex items-center justify-center gap-2 text-xs text-[#6B6B6B]">
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
          <span className="text-[#9A9A9A]">{section.label}</span>
        </nav>
        <p className="text-[10px] font-heading font-bold uppercase tracking-[0.35em] text-[#D52324] sm:text-xs">
          Cookshack recipes: built on smoke
        </p>
        <h1 className="mt-2 font-heading text-2xl font-extrabold uppercase tracking-wider text-white sm:text-4xl sm:tracking-widest">
          {sectionTitle(section)}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#C8C8C8] sm:text-base">
          {section.description}
        </p>
      </CatalogHeroBand>

      <div className="min-h-[40vh] bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <Link
            href="/recipes"
            className="inline-flex items-center font-heading text-sm font-bold uppercase tracking-widest text-[#D52324] transition hover:underline"
          >
            ← All recipes
          </Link>
        </div>
      </div>
    </>
  );
}
