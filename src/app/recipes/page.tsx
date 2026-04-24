import type { Metadata } from "next";
import Link from "next/link";
import CatalogHeroBand from "@/components/CatalogHeroBand";
import { getHubFeaturedSections, RECIPE_SECTIONS } from "@/lib/recipe-sections";

export const metadata: Metadata = {
  title: "Our Best Recipes for Grilling & Smoking | Cookshack",
  description:
    "Beef, chicken, fish, and more — proven Cookshack techniques and hardwood-smoked flavor for your grill and smoker.",
  openGraph: {
    title: "Our Best Recipes for Grilling & Smoking | Cookshack",
    description:
      "Explore beef, chicken, and seafood recipe collections from Cookshack’s recipe library.",
  },
};

export default function RecipesPage() {
  const hubCards = getHubFeaturedSections();

  return (
    <>
      <CatalogHeroBand paddingClassName="py-12 sm:py-16">
        <nav className="mb-5 flex items-center justify-center gap-2 text-xs text-[#6B6B6B]">
          <Link href="/" className="transition hover:text-[#D52324]">
            Home
          </Link>
          <span aria-hidden className="text-[#4A4A4A]">
            /
          </span>
          <span className="text-[#9A9A9A]">Recipes</span>
        </nav>
        <p className="text-[10px] font-heading font-bold uppercase tracking-[0.35em] text-[#D52324] sm:text-xs">
          Cookshack recipes: built on smoke
        </p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold uppercase tracking-wider text-white sm:text-5xl sm:tracking-widest">
          Recipes
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#C8C8C8] sm:text-base sm:leading-7">
          Techniques, times, and flavors built for hardwood smoke. Pick a collection to get straight into tested recipes
          for the grill, smoker, or charbroiler—whether you are cooking a weekend brisket or a weeknight fillet.
        </p>
      </CatalogHeroBand>

      <div className="min-h-screen bg-[#F7F4F0]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-sm font-extrabold uppercase tracking-[0.25em] text-[#8A8A8A] sm:text-base">
              Start with a collection
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-[#5A5A5A]">
              Three of our most-read protein lines—each with step-by-step guidance you can use today.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3 md:gap-8">
            {hubCards.map((c) => {
              const shortlabel =
                c.slug === "fish-seafood" ? "Seafood" : c.label;
              return (
                <article
                  key={c.slug}
                  id={c.slug}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_2px_24px_rgba(26,22,18,0.08)] transition hover:shadow-[0_8px_32px_rgba(26,22,18,0.12)]"
                >
                  <div
                    className={`relative flex aspect-[16/10] w-full items-end justify-start bg-gradient-to-br ${c.hubAccent ?? "from-[#1A1A1A] to-[#0a0a0a]"} p-4`}
                    aria-hidden
                  >
                    <span className="font-heading text-xs font-extrabold uppercase tracking-widest text-white/90">
                      {shortlabel}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="font-heading text-lg font-extrabold uppercase tracking-wide text-[#1A1A1A] sm:text-xl">
                      {c.label} recipes
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-[#4A4A4A]">{c.description}</p>
                    <Link
                      href={`/recipes/${c.slug}`}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#D52324] py-3.5 pl-4 pr-4 text-center font-heading text-sm font-bold uppercase tracking-widest text-white transition hover:brightness-[0.95] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-white"
                    >
                      Browse {c.label.toLowerCase()} recipes
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <section
            id="topics"
            className="mt-20 rounded-2xl border border-[#E8E0D8] bg-white p-6 sm:p-10"
            aria-label="All recipe topics"
          >
            <h2 className="font-heading text-center text-base font-extrabold uppercase tracking-wider text-[#1A1A1A] sm:text-lg">
              Every topic in the library
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-[#5A5A5A]">
              Game and sausage, holiday turkey, commercial-scale dishes, sides, desserts, and technique primers in
              Cookshack 101s—pick a category to go straight in.
            </p>
            <ul
              className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2.5"
              role="list"
            >
              {RECIPE_SECTIONS.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/recipes/${s.slug}`}
                    className="inline-block rounded-full border border-[#E0D8D0] bg-[#FAFAF8] px-3.5 py-1.5 font-heading text-xs font-bold uppercase tracking-wide text-[#3D3D3D] transition hover:border-[#D52324]/50 hover:text-[#D52324]"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
