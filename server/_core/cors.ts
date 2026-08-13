export function isAllowedBrowserOrigin(origin: string | undefined, environment: string | undefined, configuredOrigins: string | undefined) {
  if (!origin) return true;
  if (environment !== "production") return true;
  const allowed = (configuredOrigins ?? "").split(",").map((value) => value.trim()).filter(Boolean);
  return allowed.includes(origin);
}
