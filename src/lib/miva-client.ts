import { createHmac } from "crypto";
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

const STORE_URL = process.env.MIVA_STORE_URL || "";
const API_TOKEN = process.env.MIVA_API_TOKEN || "";
const SIGNING_KEY = process.env.MIVA_SIGNING_KEY || "";
const STORE_CODE = process.env.MIVA_STORE_CODE || "";
const DIGEST = process.env.MIVA_SIGNING_DIGEST || "sha256";
const HTTP_USER = process.env.MIVA_HTTP_USER || "";
// Password stored directly to avoid dotenv $ interpolation issues
const HTTP_PASS = process.env.MIVA_HTTP_PASS || "NQbHbylsp1?1k$r0";

/** Keep under Next.js ~60s static generation budget when several calls run (layout + page). */
const MIVA_FETCH_TIMEOUT_MS = Math.min(
  12_000,
  Number(process.env.MIVA_FETCH_TIMEOUT_MS) || 12_000
);

function generateAuthHeader(body: string): string {
  if (!SIGNING_KEY) {
    return `MIVA ${API_TOKEN}`;
  }

  const keyBuffer = Buffer.from(SIGNING_KEY, "base64");
  const signature = createHmac(DIGEST, keyBuffer).update(body).digest("base64");
  const digestLabel = DIGEST === "sha1" ? "SHA1" : "SHA256";
  return `MIVA-HMAC-${digestLabel} ${API_TOKEN}:${signature}`;
}

async function mivaRequest<T>(payload: Record<string, unknown>): Promise<T> {
  if (!STORE_URL || !API_TOKEN || !STORE_CODE) {
    throw new Error("Miva API not configured (MIVA_STORE_URL, MIVA_API_TOKEN, MIVA_STORE_CODE)");
  }

  const body = JSON.stringify({
    Store_Code: STORE_CODE,
    Miva_Request_Timestamp: Math.floor(Date.now() / 1000),
    ...payload,
  });

  const authHeader = generateAuthHeader(body);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Miva-API-Authorization": authHeader,
  };

  if (HTTP_USER && HTTP_PASS) {
    headers["Authorization"] =
      "Basic " + Buffer.from(`${HTTP_USER}:${HTTP_PASS}`).toString("base64");
  }

  const url = `${STORE_URL.replace(/\/$/, "")}/mm5/json.mvc`;
  const response = await fetch(url, {
    method: "POST",
    headers,
    body,
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(MIVA_FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Miva API HTTP error: ${response.status}`);
  }

  const json = await response.json();

  if (!json.success && json.success !== true && json.success !== 1) {
    throw new Error(
      json.error_message || `Miva API error: ${json.error_code}`
    );
  }

  return json;
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
    ondemandcolumns: ["catcount", "uris", "CustomField_Values", "productimagedata"],
  });
}

// Miva's ProductList_Load_Query does not support reliable code-based filtering
// on this store (Product_Load_Code is also an invalid function here).
// We fetch the full product catalog once and cache it for 5 minutes, then
// look up by code in memory — 600 products is ~246KB and takes ~500ms.
const getProductCatalog = unstable_cache(
  async (): Promise<MivaProduct[]> => {
    const res = await mivaListRequest<MivaProduct>({
      Function: "ProductList_Load_Query",
      Count: 999,
      Filter: [{ name: "active", operator: "EQ", value: true }],
      ondemandcolumns: ["uris", "productimagedata"],
    });
    return res.data || [];
  },
  ["miva-product-catalog"],
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
    ondemandcolumns: ["uris", "productimagedata"],
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
    ondemandcolumns: ["uris", "productimagedata"],
  });
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

export async function getCategoryByCode(
  code: string
): Promise<MivaApiResponse<MivaCategory>> {
  // Category_Load_Code is not a valid Miva function — use list query filtered by code
  const res = await mivaListRequest<MivaCategory>({
    Function: "CategoryList_Load_Query",
    Count: 1,
    Filter: [{ name: "code", operator: "EQ", value: code }],
    ondemandcolumns: ["uris"],
  });
  const cat = res.data?.[0] ?? null;
  return {
    success: cat ? (1 as unknown as boolean) : (0 as unknown as boolean),
    data: cat as MivaCategory,
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
