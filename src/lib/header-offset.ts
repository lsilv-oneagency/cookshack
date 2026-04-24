/**
 * Spacer for fixed `Header` (contact + logo + search + `md+` category row).
 * Explicit `pt-52` / `md:pt-[17rem]` so clearance never depends on `var()` in arbitrary classes.
 * Keep in sync: `layout.tsx` `<main>`, home/catalog `pullUnderHeaderClass`, hero.
 */
export const mainHeaderOffsetClass = "pt-52 md:pt-[17rem]";

/** `-mt` + `pt` pair: pulls section up behind the header while keeping inner layout aligned. */
export const pullUnderHeaderClass = "-mt-52 md:-mt-[17rem] pt-52 md:pt-[17rem]";
