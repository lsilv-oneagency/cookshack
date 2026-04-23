# Cookshack — Next.js Frontend (Miva JSON API)

A ground-up rebuild of cookshack.com using the **Miva JSON API** as the data layer, replacing the restrictive Miva UI-driven frontend with a fully custom Next.js 16 (App Router) storefront.

## Design System

| Token | Value |
|---|---|
| Brand accent | `#AE1B07` |
| Accent (hover / pressed) | `#8E1405` |
| Charcoal (bg) | `#111111` |
| Dark surface | `#1A1A1A` |
| Smoke | `#2B2B2B` |
| Page background | `#ffffff` |
| Primary font | [Outfit](https://fonts.google.com/specimen/Outfit) (100–900, `next/font/google`, optical sizing on) |
| Logo / display | Mesquite Std when bundled in `public/fonts/`; otherwise falls back to Outfit |

## Pages

| Route | Description |
|---|---|
| `/` | Full homepage: hero, category cards, pizza oven banner, top products, testimonials, why Cookshack |
| `/shop` | All products with sort + pagination |
| `/shop/[code]` | Product detail: image gallery, qty selector, description, related products |
| `/category/[code]` | Category product listings with sort + pagination |
| `/search` | Full-text product search |
| `/cart` | Shopping cart page |

## Navigation Structure

Mirrors cookshack.com's catalog:
- **Residential** → Electric Smokers, Pellet Grills, Charbroilers
- **Commercial** → Commercial Smokers, Pellet Fired Smokers, Pizza Ovens, Charbroilers
- **Accessories**
- **Sauces & Spices**
- **Wood & Pellets**
- **Parts** (Replacement Parts)
- **Gear**
- **Cookbooks**
- **Pizza Ovens** (highlighted CTA)

## API Architecture

All Miva API calls are server-side. Credentials never reach the browser.

```
Browser  →  Next.js API routes  →  Miva JSON API (cookshack.com/mm5/json.mvc)
```

**API Functions used:**
- `ProductList_Load_Query` — product listings, search
- `Product_Load_Code` — product detail
- `CategoryList_Load_Query` — navigation categories
- `Category_Load_Code` — category pages
- `CategoryProductList_Load_Query` — category product listings
- `Basket_Create` — create shopping session
- `BasketItem_Add` — add to cart

## Setup

### 1. Install

```bash
npm install
```

### 2. Configure Miva API credentials

```bash
# .env.local is pre-configured with the Cookshack store URL
# Fill in your API token and signing key:
```

```env
MIVA_STORE_URL=https://www.cookshack.com
MIVA_STORE_CODE=your_store_code
MIVA_API_TOKEN=your_api_token
MIVA_SIGNING_KEY=your_base64_signing_key
MIVA_SIGNING_DIGEST=sha256
NEXT_PUBLIC_STORE_URL=https://www.cookshack.com
```

**In Miva Admin:** Users → API Tokens → create token with the function permissions listed above.

### 3. Run

```bash
npm run dev          # http://localhost:3000
npm run build        # production build
npm start            # production server
```

## Category Code Mapping

The nav uses these category codes (matching cookshack.com's Miva setup). Update in `src/components/Header.tsx` if your Miva store uses different codes:

| Category | Code |
|---|---|
| Residential | `residential-smokers-grills` |
| Commercial | `commercial` |
| Accessories | `equipmentaccessories` |
| Sauces & Spices | `sauces-and-spices` |
| Wood & Pellets | `wood-pellets` |
| Replacement Parts | `replacementparts` |
| Gear | `gear` |
| Cookbooks | `cookbooks` |
| Pizza Ovens | `pizza-oven` |

## File Structure

```
src/
├── app/
│   ├── api/              # Server-side Miva proxies (products, categories, cart)
│   ├── shop/             # /shop + /shop/[code]
│   ├── category/[code]/  # Category pages
│   ├── search/           # Search page
│   ├── cart/             # Cart page
│   └── layout.tsx        # Root layout with Header + CartProvider + Footer
├── components/
│   ├── Header.tsx        # Cookshack nav with dropdowns + utility bar
│   ├── Footer.tsx        # Full footer with phone, categories, contact
│   ├── ProductCard.tsx   # Dark border, hover overlay, orange CTA
│   ├── ProductGrid.tsx   # Responsive grid with skeleton loading
│   ├── CartDrawer.tsx    # Dark slide-out cart drawer
│   └── Pagination.tsx    # Orange active state pagination
├── context/CartContext.tsx  # Cart state (localStorage-persisted)
├── lib/miva-client.ts       # Miva API client (HMAC-SHA256 auth)
└── types/miva.ts            # Full TypeScript types
```
