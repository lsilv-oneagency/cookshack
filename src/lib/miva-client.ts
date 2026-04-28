import { unstable_cache } from "next/cache";
import type {
  MivaListResponse,
  MivaApiResponse,
  MivaProduct,
  MivaCategory,
  MivaBasket,
  ProductListQueryParams,
  SearchFilter,
} from "@/types/miva";
import {
  filterStorefrontProducts,
  isNonPurchasableStorefrontProduct,
  isPdpRelatedPair,
} from "@/lib/miva-storefront-visibility";
import { mivaBasicAuthHeader, normalizeMivaHttpPassword } from "@/lib/miva-http-credentials";
import { mivaJsonApiAuthorizationHeader } from "@/lib/miva-json-api-auth";

/**
 * Minimal `ondemandcolumns` for category grids, search, and product list — matches the original
 * starter app (`~/Downloads/miva`). Heavy columns here can cause Miva to error or slow down
 * `CategoryProductList_Load_Query` / megamenu `/api/products` on some stores/tokens.
 */
const MIVA_CATEGORY_AND_SEARCH_ON_DEMAND: readonly string[] = ["uris", "productimagedata"];

/** Original starter `ProductList_Load_Query` columns (global product grid). */
const MIVA_PRODUCT_GRID_ON_DEMAND: readonly string[] = [
  "catcount",
  "uris",
  "CustomField_Values",
  "productimagedata",
];

/**
 * Ondemand columns for cached catalog + PDP — description, custom fields, categories, related, etc.
 * See Miva `ProductList_Load_Query` ondemand column docs.
 */
export const MIVA_PRODUCT_ON_DEMAND_COLUMNS = [
  "descrip",
  "catcount",
  "uris",
  // `:*` is not accepted on all Miva / token configs — base column still returns all assigned fields.
  "CustomField_Values",
  "productimagedata",
  "attributes",
  "categories",
  "productshippingrules",
  "relatedproduct",
  "productinventorysettings",
  "cancat_code",
  "url",
  "page_code",
  "product_inventory",
] as const;

/**
 * Per-request env read (not module-load snapshot). Needed so `MIVA_HTTP_*` and tokens from
 * Vercel / `.env.local` are always current — otherwise nginx Basic can be missing on `/api/products`
 * (e.g. megamenu) while a standalone script that loads dotenv still works.
 */
function readMivaConnectionEnv(): {
  storeUrl: string;
  apiToken: string;
  signingKey: string;
  storeCode: string;
  digest: string;
  httpUser: string;
  httpPassRaw: string;
  httpPassNorm: string;
} {
  return {
    storeUrl: (process.env.MIVA_STORE_URL || "").trim(),
    apiToken: (process.env.MIVA_API_TOKEN || "").trim(),
    signingKey: (process.env.MIVA_SIGNING_KEY || "").trim(),
    storeCode: (process.env.MIVA_STORE_CODE || "").trim(),
    digest: (process.env.MIVA_SIGNING_DIGEST || "sha256").trim() || "sha256",
    httpUser: (process.env.MIVA_HTTP_USER || "").trim(),
    httpPassRaw: process.env.MIVA_HTTP_PASS || "",
    httpPassNorm: normalizeMivaHttpPassword(process.env.MIVA_HTTP_PASS || ""),
  };
}

/** Cap each Miva round-trip so `next build` / static generation stays under platform limits. */
const MIVA_FETCH_TIMEOUT_MS = Math.min(
  12_000,
  Number(process.env.MIVA_FETCH_TIMEOUT_MS) || 12_000
);

async function mivaRequest<T>(payload: Record<string, unknown>): Promise<T> {
  const { mergeMivaEnvFromRepoOnce } = await import("@/lib/merge-miva-env-from-dotenv");
  mergeMivaEnvFromRepoOnce();
  const e = readMivaConnectionEnv();
  if (!e.storeUrl || !e.apiToken || !e.storeCode) {
    throw new Error("Miva API not configured (MIVA_STORE_URL, MIVA_API_TOKEN, MIVA_STORE_CODE)");
  }

  const body = JSON.stringify({
    Store_Code: e.storeCode,
    Miva_Request_Timestamp: Math.floor(Date.now() / 1000),
    ...payload,
  });

  const authHeader = mivaJsonApiAuthorizationHeader(body, e.apiToken, e.signingKey, e.digest);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Miva-API-Authorization": authHeader,
  };

  if (e.httpUser && e.httpPassNorm) {
    headers["Authorization"] = mivaBasicAuthHeader(e.httpUser, e.httpPassRaw.trim());
  }

  const baseUrl = e.storeUrl.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/mm5/json.mvc`, {
    method: "POST",
    headers,
    body,
    redirect: "manual",
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(MIVA_FETCH_TIMEOUT_MS),
  });

  if (response.status >= 300 && response.status < 400) {
    const loc = response.headers.get("location") || "";
    throw new Error(
      `Miva API redirect HTTP ${response.status}${loc ? ` → ${loc.slice(0, 120)}` : ""} (check store URL / Basic auth)`
    );
  }

  if (!response.ok) {
    const snippet = (await response.text()).slice(0, 200).replace(/\s+/g, " ");
    let extra = "";
    if (
      response.status === 401 &&
      /nginx|Authorization Required/i.test(snippet) &&
      (!e.httpUser || !e.httpPassNorm)
    ) {
      extra =
        " Nginx expects HTTP Basic: set MIVA_HTTP_USER and MIVA_HTTP_PASS on this host (e.g. Vercel project env), not only in local .env.local.";
    }
    throw new Error(`Miva API HTTP ${response.status}${snippet ? `: ${snippet}` : ""}${extra}`);
  }

  let json: Record<string, unknown>;
  try {
    json = (await response.json()) as Record<string, unknown>;
  } catch {
    throw new Error(`Miva API: response was not JSON (HTTP ${response.status})`);
  }

  if (!json.success && json.success !== true && json.success !== 1) {
    throw new Error(
      (json.error_message as string) || `Miva API error: ${String(json.error_code ?? "")}`
    );
  }

  return json as T;
}

// Miva list responses nest the array: { success, data: { total_count, start_offset, data: [] } }
// This helper unwraps that into the flat MivaListResponse shape the rest of the app expects.
async function mivaListRequest<T>(
  payload: Record<string, unknown>
): Promise<MivaListResponse<T>> {
  const raw = await mivaRequest<{
    success: boolean | 1 | 0;
    data: { total_count: number; start_offset: number; data: T[] };
  }>(payload);

  return {
    success: raw.success,
    data: raw.data?.data ?? [],
    total_count: raw.data?.total_count ?? 0,
    start_offset: raw.data?.start_offset ?? 0,
  };
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProducts(
  params: ProductListQueryParams = {}
): Promise<MivaListResponse<MivaProduct>> {
  const { count = 24, offset = 0, sort = "name", filter = [] } = params;

  return mivaListRequest<MivaProduct>({
    Function: "ProductList_Load_Query",
    Count: count,
    Offset: offset,
    Sort: sort,
    Filter: [
      { name: "active", operator: "EQ", value: true },
      ...filter,
    ],
    ondemandcolumns: [...MIVA_PRODUCT_GRID_ON_DEMAND],
  });
}

// Miva's ProductList_Load_Query does not support reliable code-based filtering
// on this store (Product_Load_Code is also an invalid function here).
// We fetch the full product catalog once and cache it for 5 minutes, then
// look up by code in memory — 600 products is ~246KB and takes ~500ms.
const getProductCatalog = unstable_cache(
  async (): Promise<MivaProduct[]> => {
    try {
      const res = await mivaListRequest<MivaProduct>({
        Function: "ProductList_Load_Query",
        Count: 999,
        Filter: [{ name: "active", operator: "EQ", value: true }],
        ondemandcolumns: [...MIVA_PRODUCT_ON_DEMAND_COLUMNS],
      });
      return res.data || [];
    } catch (e) {
      console.warn("[miva-client] product catalog unavailable", e);
      return [];
    }
  },
  ["miva-product-catalog", "v5-cfval"],
  { revalidate: 300 } // 5-minute cache
);

export async function getProductByCode(
  code: string
): Promise<MivaApiResponse<MivaProduct>> {
  const catalog = await getProductCatalog();
  const product = catalog.find(
    (p) => p.code.toLowerCase() === code.toLowerCase()
  ) ?? null;
  return {
    success: product ? (1 as unknown as boolean) : (0 as unknown as boolean),
    data: product as MivaProduct,
  };
}

/**
 * All active products from the cached catalog (same 999 cap as in-memory PDP lookups), filtered
 * for the storefront. Used by `/shop` for client-side sort / filters; mirrors category pages.
 */
export async function getAllStorefrontProducts(): Promise<MivaProduct[]> {
  const raw = await getProductCatalog();
  return filterStorefrontProducts(raw);
}

export async function searchProducts(
  query: string,
  params: Omit<ProductListQueryParams, "search"> = {}
): Promise<MivaListResponse<MivaProduct>> {
  const { count = 24, offset = 0 } = params;

  const filter: SearchFilter[] = [
    { name: "active", operator: "EQ", value: true },
    { name: "search", operator: "SUBLIKE", value: query },
  ];

  return mivaListRequest<MivaProduct>({
    Function: "ProductList_Load_Query",
    Count: count,
    Offset: offset,
    Filter: filter,
    ondemandcolumns: [...MIVA_CATEGORY_AND_SEARCH_ON_DEMAND],
  });
}

export async function getCategoryProducts(
  categoryCode: string,
  params: ProductListQueryParams = {}
): Promise<MivaListResponse<MivaProduct>> {
  const { count = 24, offset = 0, sort = "name" } = params;

  return mivaListRequest<MivaProduct>({
    Function: "CategoryProductList_Load_Query",
    Category_Code: categoryCode,
    Count: count,
    Offset: offset,
    Sort: sort,
    Filter: [{ name: "active", operator: "EQ", value: true }],
    ondemandcolumns: [...MIVA_CATEGORY_AND_SEARCH_ON_DEMAND],
  });
}

/** Miva category code for recipe/content SKUs (non-storefront PDP). Override if your store uses a different code. */
export function getRecipesCategoryCode(): string {
  return (process.env.MIVA_RECIPES_CATEGORY_CODE || "ctgy_recipes").trim();
}

export function isProductInRecipesCategory(p: MivaProduct): boolean {
  const want = getRecipesCategoryCode().toLowerCase();
  if (!want) return false;
  return (p.categories ?? []).some((c) => c.code?.toLowerCase() === want);
}

/** Recipe editorial page: recipes category in Miva, or legacy non-purchasable content SKUs. */
export function canViewAsRecipeContentPage(p: MivaProduct): boolean {
  if (isProductInRecipesCategory(p)) return true;
  return isNonPurchasableStorefrontProduct(p);
}

const CATEGORY_PRODUCT_PAGE_SIZE = 100;
const MAX_CATEGORY_PRODUCTS = 20_000;

/**
 * Fetches every active product in a category (paged) for client-side filter/sort.
 */
export async function getAllCategoryProducts(
  categoryCode: string,
  sort: string = "name"
): Promise<MivaProduct[]> {
  const all: MivaProduct[] = [];
  let offset = 0;
  while (all.length < MAX_CATEGORY_PRODUCTS) {
    const res = await getCategoryProducts(categoryCode, {
      count: CATEGORY_PRODUCT_PAGE_SIZE,
      offset,
      sort,
    });
    const batch = res.data || [];
    if (batch.length === 0) break;
    for (const p of batch) {
      all.push(p);
    }
    if (batch.length < CATEGORY_PRODUCT_PAGE_SIZE) break;
    offset += batch.length;
  }
  return all;
}

/**
 * Merges Miva “related product” admin assignments (when present) with other products
 * from the **same Miva category(ies)** as the current PDP. Previously the fallback was
 * the first N products **store-wide** by `disp_order`, which mixed unrelated departments
 * (e.g. smokers with sauces or content SKUs in the same global slice).
 *
 * Admin-assigned related items are only kept if they share a category with the current
 * product (after resolving stubs against the cached catalog so category fields exist).
 */
export async function getRelatedProducts(
  excludeCode: string,
  limit: number = 8,
  current?: MivaProduct
): Promise<MivaProduct[]> {
  try {
    const seen = new Set<string>([excludeCode.toLowerCase()]);
    const out: MivaProduct[] = [];

    const catalog = await getProductCatalog();
    const resolveFull = (p: MivaProduct): MivaProduct =>
      catalog.find((x) => x.code.toLowerCase() === p.code.toLowerCase()) ?? p;

    const currentFull = current ? resolveFull(current) : undefined;
    const hasCategoryContext = (currentFull?.categories?.length ?? 0) > 0;

    const fromApi =
      (current?.relatedproducts?.length ? current.relatedproducts : null) ||
      (current?.relatedproduct?.length ? current.relatedproduct : null);
    if (Array.isArray(fromApi) && currentFull) {
      for (const p of fromApi) {
        if (!p?.code || seen.has(p.code.toLowerCase())) continue;
        const candidate = resolveFull(p);
        if (isNonPurchasableStorefrontProduct(candidate)) continue;
        if (!isPdpRelatedPair(currentFull, candidate)) continue;
        seen.add(p.code.toLowerCase());
        out.push(candidate);
        if (out.length >= limit) return out;
      }
    }

    if (out.length < limit && hasCategoryContext && currentFull?.categories?.length) {
      for (const cat of currentFull.categories) {
        if (!cat.code || out.length >= limit) break;
        try {
          const res = await getCategoryProducts(cat.code, {
            count: 80,
            offset: 0,
            sort: "disp_order",
          });
          for (const p of res.data || []) {
            if (!p?.code || seen.has(p.code.toLowerCase())) continue;
            const candidate = resolveFull(p);
            if (isNonPurchasableStorefrontProduct(candidate)) continue;
            if (!isPdpRelatedPair(currentFull, candidate)) continue;
            seen.add(p.code.toLowerCase());
            out.push(candidate);
            if (out.length >= limit) return out;
          }
        } catch {
          // try next category
        }
      }
    }

    // Default category code (Miva) — when `categories` is empty, this still finds shelf-mates.
    if (out.length < limit && currentFull?.cancat_code) {
      try {
        const res = await getCategoryProducts(currentFull.cancat_code, {
          count: 80,
          offset: 0,
          sort: "disp_order",
        });
        for (const p of res.data || []) {
          if (!p?.code || seen.has(p.code.toLowerCase())) continue;
          const candidate = resolveFull(p);
          if (isNonPurchasableStorefrontProduct(candidate)) continue;
          if (!isPdpRelatedPair(currentFull, candidate)) continue;
          seen.add(p.code.toLowerCase());
          out.push(candidate);
          if (out.length >= limit) return out;
        }
      } catch {
        // ignore
      }
    }

    // In-memory pass: same JSON catalog as PDP — fills gaps when per-category API lists are empty.
    if (out.length < limit && currentFull) {
      const rest = catalog
        .filter((p) => p?.code && !seen.has(p.code.toLowerCase()) && !isNonPurchasableStorefrontProduct(p))
        .sort((a, b) => a.name.localeCompare(b.name));
      for (const p of rest) {
        if (out.length >= limit) break;
        if (p.code.toLowerCase() === excludeCode.toLowerCase()) continue;
        if (!isPdpRelatedPair(currentFull, p)) continue;
        seen.add(p.code.toLowerCase());
        out.push(p);
      }
    }

    return out;
  } catch {
    return [];
  }
}

/**
 * When `CategoryProductList` / `getRelatedProducts` return no peers, scan the same
 * `ProductList` cache the PDP uses. Category assignments are often present on the full
 * catalog row even if list-by-category API returned nothing, so isPdpRelatedPair
 * can still find shelf-mates. As a last resort, returns any purchasable SKUs (stable order).
 */
export async function getShelfMateCompanionsFromCatalog(
  product: MivaProduct,
  limit: number = 2
): Promise<MivaProduct[]> {
  const catalog = await getProductCatalog();
  const self = product.code.toLowerCase();
  const currentFull = catalog.find((p) => p.code.toLowerCase() === self) ?? product;
  const pool = filterStorefrontProducts(catalog).filter((p) => p.code.toLowerCase() !== self);
  const paired = pool
    .filter((p) => isPdpRelatedPair(currentFull, p))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (paired.length > 0) {
    return paired.slice(0, limit);
  }
  return pool.sort((a, b) => a.name.localeCompare(b.name)).slice(0, limit);
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getCategories(): Promise<MivaListResponse<MivaCategory>> {
  return mivaListRequest<MivaCategory>({
    Function: "CategoryList_Load_Query",
    Count: 100,
    Filter: [{ name: "active", operator: "EQ", value: true }],
    ondemandcolumns: ["uris"],
  });
}

const CATEGORY_LIST_MAX = 999;

/**
 * All active categories (used for parent-chain walks / filters). One large slice + optional paging
 * if the store has more than `CATEGORY_LIST_MAX` categories.
 */
export async function getAllActiveCategories(): Promise<MivaCategory[]> {
  const byId = new Map<number, MivaCategory>();
  const merge = (batch: MivaCategory[]) => {
    for (const c of batch) {
      if (c.id != null) {
        byId.set(c.id, c);
      }
    }
  };

  const first = await mivaListRequest<MivaCategory>({
    Function: "CategoryList_Load_Query",
    Count: CATEGORY_LIST_MAX,
    Offset: 0,
    Filter: [{ name: "active", operator: "EQ", value: true }],
    ondemandcolumns: ["uris"],
  });
  const firstData = first.data || [];
  merge(firstData);
  const total = first.total_count || 0;
  if (firstData.length < CATEGORY_LIST_MAX) {
    return [...byId.values()];
  }
  if (total > 0 && byId.size >= total) {
    return [...byId.values()];
  }

  let offset = firstData.length;
  for (let i = 0; i < 20; i++) {
    const res = await mivaListRequest<MivaCategory>({
      Function: "CategoryList_Load_Query",
      Count: CATEGORY_LIST_MAX,
      Offset: offset,
      Filter: [{ name: "active", operator: "EQ", value: true }],
      ondemandcolumns: ["uris"],
    });
    const batch = res.data || [];
    const before = byId.size;
    merge(batch);
    if (batch.length === 0) break;
    if (byId.size === before) break; // offset likely ignored
    if (batch.length < CATEGORY_LIST_MAX) break;
    if (total > 0 && byId.size >= total) break;
    offset += batch.length;
  }
  return [...byId.values()];
}

/**
 * Resolves a category by Miva `code`. Some Miva API configs return a non-matching
 * first row when the `code` filter is ignored, which made every /category/… page
 * show the same name (e.g. Residential). We always verify `row.code` matches, then
 * fall back to scanning active categories.
 */
export async function getCategoryByCode(
  code: string
): Promise<MivaApiResponse<MivaCategory>> {
  const want = code.trim();
  if (!want) {
    return { success: 0 as unknown as boolean };
  }

  const res = await mivaListRequest<MivaCategory>({
    Function: "CategoryList_Load_Query",
    Count: 1,
    Filter: [{ name: "code", operator: "EQ", value: want }],
    ondemandcolumns: ["uris"],
  });
  const first = res.data?.[0] ?? null;
  const matchByCode = (c: MivaCategory | null) =>
    c &&
    typeof c.code === "string" &&
    c.code.toLowerCase() === want.toLowerCase();
  let cat: MivaCategory | null = matchByCode(first) ? first! : null;

  if (!cat) {
    const wide = await mivaListRequest<MivaCategory>({
      Function: "CategoryList_Load_Query",
      Count: 500,
      Filter: [{ name: "active", operator: "EQ", value: true }],
      ondemandcolumns: ["uris"],
    });
    cat =
      wide.data?.find(
        (c) => c.code.toLowerCase() === want.toLowerCase()
      ) ?? null;
  }

  if (!cat) {
    return { success: 0 as unknown as boolean };
  }
  return {
    success: 1 as unknown as boolean,
    data: cat,
  };
}

// ─── Basket / Cart ───────────────────────────────────────────────────────────

export async function createBasket(): Promise<MivaApiResponse<MivaBasket>> {
  return mivaRequest<MivaApiResponse<MivaBasket>>({
    Function: "Basket_Create",
  });
}

export async function addBasketItem(
  sessionId: string,
  productCode: string,
  quantity: number = 1,
  attributes: Record<string, string>[] = []
): Promise<MivaApiResponse> {
  return mivaRequest<MivaApiResponse>({
    Function: "BasketItem_Add",
    Session_Id: sessionId,
    Product_Code: productCode,
    Quantity: quantity,
    Attributes: attributes,
  });
}

export async function getBasket(
  sessionId: string
): Promise<MivaApiResponse<MivaBasket>> {
  return mivaRequest<MivaApiResponse<MivaBasket>>({
    Function: "Basket_Load",
    Session_Id: sessionId,
  });
}

export async function getBasketItems(
  sessionId: string
): Promise<MivaListResponse<MivaBasket>> {
  return mivaListRequest<MivaBasket>({
    Function: "BasketItemList_Load_Query",
    Session_Id: sessionId,
  });
}
