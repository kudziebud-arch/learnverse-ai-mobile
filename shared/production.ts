export const organizationRoles = ["student", "educator", "creator", "institution_admin"] as const;
export type OrganizationRole = (typeof organizationRoles)[number];

export const organizationManagerRoles: OrganizationRole[] = ["educator", "creator", "institution_admin"];

export function canManageOrganization(role: OrganizationRole) {
  return organizationManagerRoles.includes(role);
}

export function canResolveModeration(role: OrganizationRole) {
  return role === "institution_admin";
}

export function isSafeStorageKey(value: string) {
  return value.length >= 3 && value.length <= 512 && /^[A-Za-z0-9._/-]+$/.test(value) && !value.startsWith("/") && !value.includes("..") && !value.split("/").some((segment) => segment.length === 0);
}
