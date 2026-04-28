import { redirect } from "next/navigation";

export default function OrderHistoryRedirectPage() {
  redirect("/order-status");
}
