import type { MivaProduct, MivaProductImage } from "@/types/miva";

/**
 * Picks a stable sort for gallery images: default flag first, then Miva `disp_order` / `image_id`.
 */
function sortProductImageRows(items: MivaProductImage[]): MivaProductImage[] {
  return [...items].sort((a, b) => {
    if (a.default_image && !b.default_image) return -1;
    if (!a.default_image && b.default_image) return 1;
    const da = a.disp_order ?? a.image_id ?? 0;
    const db = b.disp_order ?? b.image_id ?? 0;
    return da - db;
  });
}

/**
 * Deduplicate paths (Miva often repeats the same asset on `image` and in `productimagedata`).
 */
function addUniquePath(out: string[], seen: Set<string>, path: string | undefined) {
  if (!path) return;
  const k = path.replace(/^\//, "");
  if (seen.has(k)) return;
  seen.add(k);
  out.push(path);
}

/**
 * All distinct **server-relative** image paths (not proxied) for the PDP, in the order shoppers should
 * see them: gallery default + `disp_order` first, then legacy `image` / `thumbnail` if not already
 * included.
 */
export function getAllProductImagePaths(product: MivaProduct): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  if (product.productimagedata && product.productimagedata.length > 0) {
    for (const im of sortProductImageRows(product.productimagedata)) {
      addUniquePath(out, seen, im?.image);
    }
  }
  addUniquePath(out, seen, product.image);
  addUniquePath(out, seen, product.thumbnail);

  return out;
}

/** Best path for cards, carousels, and cart line snapshots (thumbnails, mega menu, FBT, etc.). */
export function getPrimaryProductImagePath(product: MivaProduct): string {
  return getAllProductImagePaths(product)[0] || "";
}
