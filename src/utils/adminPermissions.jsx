const ROLE_OVERRIDES_KEY = "superadmin_role_overrides";

export const ADMIN_PERMISSION_DENIED_MESSAGE =
  "You do not have permission for this action. Please contact Super Admin.";

const normalizeRole = (role = "") =>
  String(role || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");

const normalizePermission = (permission = "") =>
  String(permission || "").trim().toLowerCase();

const safeJsonParse = (value, fallback) => {
  try {
    return JSON.parse(value || "");
  } catch {
    return fallback;
  }
};

const readRoleOverrides = () => {
  const value = safeJsonParse(localStorage.getItem(ROLE_OVERRIDES_KEY), {});
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
};

const toPermissionList = (permissions) => {
  if (!Array.isArray(permissions)) return [];

  return permissions
    .map((permission) =>
      typeof permission === "string"
        ? permission
        : permission?.name || permission?.permission || permission?.value
    )
    .filter(Boolean);
};

const getRoleOverride = (overrides = {}, role = "") => {
  const normalizedRole = normalizeRole(role);
  const adminLikeRoles = new Set(["admin", "clinicadmin"]);
  const targetRoles = adminLikeRoles.has(normalizedRole)
    ? adminLikeRoles
    : new Set([normalizedRole]);

  const matchingOverrides = Object.entries(overrides).filter(([key, override]) => {
    if (!override || typeof override !== "object") return false;
    if (override.permissionsSynced !== true) return false;

    const normalizedKey = normalizeRole(key);
    const overrideRole = normalizeRole(
      override.roleName || override.name || override.role || ""
    );

    return targetRoles.has(normalizedKey) || targetRoles.has(overrideRole);
  });

  if (!matchingOverrides.length) return null;
  if (matchingOverrides.length === 1) return matchingOverrides[0][1];

  const permissionLists = matchingOverrides.map(([, override]) =>
    toPermissionList(override.permissions)
  );
  const allowedPermissions = ["View", "Create", "Edit", "Delete"].filter((permission) =>
    permissionLists.every((permissions) =>
      permissions.some(
        (item) => normalizePermission(item) === normalizePermission(permission)
      )
    )
  );

  return {
    ...matchingOverrides[matchingOverrides.length - 1][1],
    permissions: allowedPermissions,
  };
};

export const getCurrentAdminRole = () =>
  localStorage.getItem("adminRole") || localStorage.getItem("userRole") || "";

export const isCurrentUserSuperAdmin = () =>
  normalizeRole(getCurrentAdminRole()) === "superadmin";

export const getAdminPermissions = () => {
  const role = getCurrentAdminRole();
  const normalizedRole = normalizeRole(role);

  if (
    normalizedRole !== "admin" &&
    normalizedRole !== "clinicadmin" &&
    normalizedRole !== "superadmin"
  ) {
    return ["View"];
  }

  const overrides = readRoleOverrides();
  const override = getRoleOverride(overrides, role);
  const overridePermissions = toPermissionList(override?.permissions);

  if (overridePermissions.length) {
    return Array.from(new Set(["View", ...overridePermissions]));
  }

  return ["View"];
};

export const hasAdminPermission = (permission) => {
  const normalizedPermission = normalizePermission(permission);

  if (normalizedPermission === "view") return true;

  return getAdminPermissions().some(
    (item) => normalizePermission(item) === normalizedPermission
  );
};

export const requireAdminPermission = (permission, onDenied) => {
  if (hasAdminPermission(permission)) return true;

  if (typeof onDenied === "function") {
    onDenied(ADMIN_PERMISSION_DENIED_MESSAGE);
  }

  return false;
};
