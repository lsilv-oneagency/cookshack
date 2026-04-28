import { redirect } from "next/navigation";

/** Send account login to the Miva storefront host (not this Next app). */
export default function SignInRedirectPage() {
  const base = process.env.NEXT_PUBLIC_STORE_URL?.trim().replace(/\/$/, "");
  if (base) {
    const path = process.env.NEXT_PUBLIC_STORE_SIGN_IN_PATH?.trim() || "/sign-in";
    const normalized = path.startsWith("/") ? path : `/${path}`;
    redirect(`${base}${normalized}`);
  }
  redirect("/order-status");
}
