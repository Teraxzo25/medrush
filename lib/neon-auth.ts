import { createNeonAuth } from "@neon/auth/next/server";

const baseUrl = process.env.NEON_AUTH_BASE_URL;
const cookieSecret = process.env.BETTER_AUTH_SECRET;

if (!baseUrl) throw new Error("Neon Auth is not configured.");
if (!cookieSecret || cookieSecret.length < 32) throw new Error("A secure auth cookie secret is required.");

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
    sameSite: process.env.NODE_ENV === "development" ? "none" : "lax",
  },
});
