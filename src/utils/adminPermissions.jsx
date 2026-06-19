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

const readStoredAdminPermissions = () => {
  const permissions = safeJsonParse(localStorage.getItem("adminPermissions"), []);
  return toPermissionList(permissions);
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

export const getCurrentAdminRole = () =>
  localStorage.getItem("adminRole") || localStorage.getItem("userRole") || "";

export const isCurrentUserSuperAdmin = () =>
  normalizeRole(getCurrentAdminRole()) === "superadmin";

export const getAdminPermissions = () => {
  const role = getCurrentAdminRole();
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "superadmin") {
    return ["View", "Create", "Edit", "Delete"];
  }

  if (
    normalizedRole !== "admin" &&
    normalizedRole !== "clinicadmin"
  ) {
    return ["View"];
  }

  const storedPermissions = readStoredAdminPermissions();

  if (storedPermissions.length) {
    return Array.from(new Set(["View", ...storedPermissions]));
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
