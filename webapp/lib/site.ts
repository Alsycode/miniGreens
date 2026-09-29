// Falls back to the production domain until NEXT_PUBLIC_SITE_URL is set for this environment.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://minigreens.com";

export const SITE_NAME = "Mini Greens Company";
