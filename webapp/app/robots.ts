import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/cart",
        "/checkout",
        "/checkout/success",
        "/login",
        "/orders",
        "/partner/dashboard",
        "/partner/submitted",
        "/subscriptions/manage",
        "/subscribe",
        "/subscriptions/custom",
        "/offers",
        "/partner/business-order",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
