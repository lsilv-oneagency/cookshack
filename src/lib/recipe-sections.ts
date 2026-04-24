/**
 * Canonical recipe section paths for the Next app.
 * All hub and subpage links are internal (`/recipes/...`) so the build does not
 * depend on the legacy storefront remaining online.
 */
export type RecipeSection = {
  slug: string;
  label: string;
  description: string;
  hubAccent?: string;
  /** Large cards on /recipes (beef, chicken, fish & seafood) */
  featuredOnHub?: boolean;
  hubOrder?: number;
};

const sections: RecipeSection[] = [
  {
    slug: "beef",
    label: "Beef",
    hubOrder: 1,
    featuredOnHub: true,
    hubAccent: "from-[#3D2914] to-[#2A1C0D]",
    description:
      "From brisket to burgers, these beef recipes deliver rich hardwood-smoked flavor and proven techniques to help you cook tender, unforgettable results every time.",
  },
  {
    slug: "chicken",
    label: "Chicken",
    hubOrder: 2,
    featuredOnHub: true,
    hubAccent: "from-[#4A3B2A] to-[#2E261C]",
    description:
      "From whole birds to wings and thighs, these chicken recipes deliver juicy, perfectly smoked results with simple techniques and bold hardwood flavor every time.",
  },
  {
    slug: "fish-seafood",
    label: "Fish & seafood",
    hubOrder: 3,
    featuredOnHub: true,
    hubAccent: "from-[#1A3A4A] to-[#0D2229]",
    description:
      "From delicate fish fillets to shellfish favorites, these seafood recipes highlight clean hardwood smoke and precise techniques for fresh, flavorful results without overpowering the catch.",
  },
  {
    slug: "commercial",
    label: "Commercial",
    description:
      "Recipes scaled for high-volume and foodservice: predictable timing, batch-friendly prep, and smokehouse flavor on a commercial line.",
  },
  {
    slug: "desserts",
    label: "Desserts",
    description:
      "Sweet finishes from the pit or kitchen—desserts that pair smoke, heat, and classic Cookshack technique.",
  },
  {
    slug: "game-sausage",
    label: "Game & sausage",
    description:
      "Wild game, charcuterie, and sausage recipes with smoke profiles that complement lean cuts and ground blends.",
  },
  {
    slug: "other",
    label: "Other recipes",
    description:
      "A catch-all for techniques and ideas that do not sit in a single protein bucket—worth bookmarking for experiments.",
  },
  {
    slug: "pork",
    label: "Pork",
    description:
      "Ribs, shoulder, loin, and more—pork built for long smokes, bark, and juicy slices.",
  },
  {
    slug: "turkey",
    label: "Turkey",
    description:
      "Whole birds, breasts, and holiday centerpieces with even heat and clear smoke for golden skin and moist meat.",
  },
  {
    slug: "veggies-sides",
    label: "Veggies & sides",
    description:
      "Smoked vegetables, slaws, beans, and sides that stand up to main-course smoke without getting lost on the plate.",
  },
  {
    slug: "cookshack-101s",
    label: "Cookshack 101s",
    description:
      "Foundational guides—fire management, wood choice, and technique primers to level up every cook.",
  },
];

export const RECIPE_SECTIONS: readonly RecipeSection[] = sections;

export const RECIPE_SLUGS = sections.map((s) => s.slug);

export function getRecipeSectionBySlug(slug: string): RecipeSection | undefined {
  return sections.find((s) => s.slug === slug);
}

export function getHubFeaturedSections(): RecipeSection[] {
  return [...sections]
    .filter((s) => s.featuredOnHub)
    .sort((a, b) => (a.hubOrder ?? 0) - (b.hubOrder ?? 0));
}
