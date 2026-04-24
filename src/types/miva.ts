export interface MivaApiResponse<T = unknown> {
  success: boolean | 1 | 0;
  data?: T;
  error_code?: string;
  error_message?: string;
  total_count?: number;
  start_offset?: number;
}

export interface MivaListResponse<T> {
  success: boolean | 1 | 0;
  data: T[];
  total_count: number;
  start_offset: number;
}

export interface MivaProductAttributeOption {
  id: number;
  product_id: number;
  attr_id: number;
  disp_order: number;
  code: string;
  prompt: string;
  price: number;
  cost: number;
  weight: number;
  image: string;
}

export interface MivaProductAttribute {
  id: number;
  product_id: number;
  default_id: number;
  disp_order: number;
  attemp_id: number;
  code: string;
  type: string;
  prompt: string;
  price: number;
  cost: number;
  weight: number;
  required: boolean;
  inventory: boolean;
  image: string;
  options: MivaProductAttributeOption[];
}

export interface MivaProductCategoryRef {
  id: number;
  parent_id: number;
  agrpcount: number;
  depth: number;
  disp_order: number;
  page_id: number;
  code: string;
  name: string;
  page_title: string;
  active: boolean;
  dt_created: number;
  dt_Updated: number;
}

export interface MivaProductShippingRules {
  product_id?: number;
  ownpackage: boolean;
  width: number;
  length: number;
  height: number;
  limitmeths: boolean;
  methods: unknown[];
}

export interface MivaProduct {
  id: number;
  code: string;
  sku: string;
  name: string;
  thumbnail: string;
  image: string;
  price: number;
  formatted_price: string;
  cost: number;
  weight: number;
  inv1: number;
  taxable: boolean;
  active: boolean;
  descrip: string;
  catcount: number;
  uris: MivaProductUri[];
  page_title?: string;
  cancat_code?: string;
  page_code?: string;
  product_inventory?: number;
  product_inventory_active?: boolean;
  url?: string;
  /**
   * Some Miva/aggregate APIs expose a dedicated features payload (string, array, or structured list).
   * @see `extractApiFeatureLines` in miva-product-features.ts
   */
  features?: unknown;
  /** Miva may return an object map or an array of field rows — see `getProductCustomFieldRows`. */
  CustomField_Values?: Record<string, unknown> | unknown[] | null;
  productimagedata?: MivaProductImage[];
  /** Ondemand: variant / runtime attributes (configurable product options). */
  attributes?: MivaProductAttribute[];
  /** Ondemand: category assignments. */
  categories?: MivaProductCategoryRef[];
  productshippingrules?: MivaProductShippingRules;
  /** Ondemand: inventory / stock messaging from Miva. */
  productinventorysettings?: {
    in_short?: string;
    in_long?: string;
  };
  /** Ondemand: true related assignments from the admin (see `getRelatedProducts`). */
  relatedproduct?: MivaProduct[];
  relatedproducts?: MivaProduct[];
}

export interface MivaProductUri {
  id: number;
  uri: string;
  status: number;
  canonical: boolean;
}

export interface MivaProductImage {
  product_id: number;
  image_id: number;
  default_image: boolean;
  image: string;
  /** Gallery sort order from Miva when present. */
  disp_order?: number;
}

export interface MivaCategory {
  id: number;
  parent_id: number;
  availability_group_count: number;
  depth: number;
  disp_order: number;
  code: string;
  name: string;
  page_title: string;
  active: boolean;
  dt_updated: number;
  descrip: string;
  uris: MivaCategoryUri[];
}

export interface MivaCategoryUri {
  id: number;
  uri: string;
  status: number;
  canonical: boolean;
}

export interface MivaBasket {
  id: number;
  customer_id: number;
  ship_id: number;
  bill_id: number;
  tax_exempt: boolean;
  coupon_id: number;
  ship_fname: string;
  ship_lname: string;
  ship_comp: string;
  ship_addr1: string;
  ship_addr2: string;
  ship_city: string;
  ship_state: string;
  ship_zip: string;
  ship_cntry: string;
  ship_phone: string;
  ship_email: string;
  bill_fname: string;
  bill_lname: string;
  bill_comp: string;
  bill_addr1: string;
  bill_addr2: string;
  bill_city: string;
  bill_state: string;
  bill_zip: string;
  bill_cntry: string;
  bill_phone: string;
  bill_email: string;
  ship_method: string;
  cust_login: string;
  cust_pw_email: string;
  business_title: string;
  ship_res: boolean;
  total: number;
  formatted_total: string;
}

export interface MivaBasketItem {
  status: number;
  quantity: number;
  subterm_id: number;
  product_id: number;
  product_code: string;
  product_name: string;
  product_sku: string;
  product_price: number;
  product_formatted_price: string;
  product_weight: number;
  product_taxable: boolean;
  product_image: string;
  product_thumbnail: string;
  attributes: MivaBasketItemAttribute[];
  total: number;
  formatted_total: string;
}

export interface MivaBasketItemAttribute {
  code: string;
  template_code: string;
  value: string;
}

export interface CartItem {
  product_code: string;
  product_name: string;
  product_sku: string;
  product_price: number;
  product_formatted_price: string;
  product_image: string;
  product_thumbnail: string;
  quantity: number;
  total: number;
}

export interface SearchFilter {
  name: string;
  operator: string;
  value: string | number | boolean;
}

export interface ProductListQueryParams {
  count?: number;
  offset?: number;
  sort?: string;
  filter?: SearchFilter[];
  search?: string;
  category_code?: string;
}
