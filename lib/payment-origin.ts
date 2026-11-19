function normalizeOrigin(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(value.includes("://") ? value : `https://${value}`).origin;
  } catch {
    return null;
  }
}

function allowedOrigins(request: Request) {
  const origins = new Set<string>();
  const requestOrigin = normalizeOrigin(new URL(request.url).origin);
  if (requestOrigin) origins.add(requestOrigin);

  for (const value of [
    "https://medrush-ambulance-management-system-3000.v0.build",
    "https://v0-medrush.vercel.app",
    process.env.V0_RUNTIME_URL,
    process.env.V0_DEV_APP_URL,
    process.env.V0_BUILD_URL,
    process.env.V0_SANDBOX_URL,
    process.env.VERCEL_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]) {
    const origin = normalizeOrigin(value);
    if (origin) origins.add(origin);
  }

  return origins;
}

export function getTrustedPaymentOrigin(request: Request) {
  const origin = normalizeOrigin(request.headers.get("origin"));
  return origin && allowedOrigins(request).has(origin) ? origin : null;
}
