/**
 * KURONEX GAMES — Role-Based Access Control (RBAC) Engine
 *
 * Implements server-side role resolution, hierarchical authorization,
 * granular permission enforcement, and self-promotion / privilege-escalation guards.
 */

export const ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "MODERATOR",
  "GAME_MANAGER",
  "CONTENT_MANAGER",
  "ANALYST",
  "DEVELOPER",
  "PLAYER",
] as const;

export type AppRole = (typeof ROLES)[number];

export type Permission =
  | "*"
  | "system:settings:write"
  | "system:audit:read"
  | "users:read"
  | "users:roles:write"
  | "users:delete"
  | "users:suspend"
  | "games:read"
  | "games:write"
  | "games:slots:write"
  | "developers:read"
  | "developers:write"
  | "announcements:read"
  | "announcements:write"
  | "promotions:write"
  | "analytics:read"
  | "downloads:read"
  | "reviews:read"
  | "reviews:moderate"
  | "library:manage";

/**
 * Role hierarchy levels.
 * An actor cannot grant, modify, or delete a role with hierarchy >= their own.
 */
export const ROLE_HIERARCHY: Record<AppRole, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  MODERATOR: 60,
  GAME_MANAGER: 50,
  CONTENT_MANAGER: 40,
  ANALYST: 30,
  DEVELOPER: 20,
  PLAYER: 10,
};

/**
 * Granular permissions assigned to each role.
 */
export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  SUPER_ADMIN: ["*"],
  ADMIN: [
    "system:settings:write",
    "system:audit:read",
    "users:read",
    "users:roles:write",
    "users:delete",
    "users:suspend",
    "games:read",
    "games:write",
    "games:slots:write",
    "developers:read",
    "developers:write",
    "announcements:read",
    "announcements:write",
    "promotions:write",
    "analytics:read",
    "downloads:read",
    "reviews:read",
    "reviews:moderate",
    "library:manage",
  ],
  MODERATOR: [
    "users:read",
    "users:suspend",
    "announcements:read",
    "reviews:read",
    "reviews:moderate",
    "library:manage",
  ],
  GAME_MANAGER: [
    "games:read",
    "games:write",
    "games:slots:write",
    "developers:read",
    "library:manage",
  ],
  CONTENT_MANAGER: [
    "announcements:read",
    "announcements:write",
    "developers:read",
    "developers:write",
    "promotions:write",
    "games:read",
    "library:manage",
  ],
  ANALYST: [
    "analytics:read",
    "downloads:read",
    "system:audit:read",
    "users:read",
    "games:read",
    "library:manage",
  ],
  DEVELOPER: [
    "games:read",
    "developers:read",
    "library:manage",
  ],
  PLAYER: [
    "library:manage",
    "reviews:read",
  ],
};

/**
 * Normalizes input role string to canonical AppRole enum.
 */
export function normalizeRole(roleInput?: string | null): AppRole {
  if (!roleInput) return "PLAYER";
  const upper = roleInput.trim().toUpperCase();

  switch (upper) {
    case "SUPER_ADMIN":
    case "ROOT":
    case "ROOT_ADMIN":
      return "SUPER_ADMIN";
    case "ADMIN":
    case "ADMINISTRATOR":
      return "ADMIN";
    case "MODERATOR":
    case "MOD":
      return "MODERATOR";
    case "GAME_MANAGER":
      return "GAME_MANAGER";
    case "CONTENT_MANAGER":
      return "CONTENT_MANAGER";
    case "ANALYST":
      return "ANALYST";
    case "DEVELOPER":
    case "DEV":
      return "DEVELOPER";
    case "PLAYER":
    case "USER":
    default:
      return "PLAYER";
  }
}

/**
 * Returns true if the role has administrative access (SUPER_ADMIN or ADMIN).
 */
export function isAdminRole(roleInput?: string | null): boolean {
  const role = normalizeRole(roleInput);
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

/**
 * Verifies whether a given role holds a specific permission.
 */
export function hasPermission(roleInput: string | undefined | null, permission: Permission): boolean {
  const role = normalizeRole(roleInput);
  const permissions = ROLE_PERMISSIONS[role] || [];

  if (permissions.includes("*")) {
    return true;
  }

  return permissions.includes(permission);
}

/**
 * Enforces role hierarchy constraints:
 * An actor can only assign a target role strictly LOWER than their own hierarchy.
 */
export function canAssignRole(actorRoleInput: string, targetRoleInput: string): boolean {
  const actorRole = normalizeRole(actorRoleInput);
  const targetRole = normalizeRole(targetRoleInput);

  const actorLevel = ROLE_HIERARCHY[actorRole] ?? 0;
  const targetLevel = ROLE_HIERARCHY[targetRole] ?? 0;

  // SUPER_ADMIN can assign any role up to SUPER_ADMIN
  if (actorRole === "SUPER_ADMIN") {
    return true;
  }

  // Actor cannot grant a role equal to or greater than their own level
  return actorLevel > targetLevel;
}

/**
 * Enforces whether an actor can modify or delete a target user based on role hierarchy.
 */
export function canMutateUser(actorRoleInput: string, targetUserRoleInput: string, actorUserId: string, targetUserId: string): boolean {
  // Self-privilege modification / deletion forbidden
  if (actorUserId === targetUserId) {
    return false;
  }

  const actorRole = normalizeRole(actorRoleInput);
  const targetRole = normalizeRole(targetUserRoleInput);

  // Protected root admin cannot be mutated
  if (targetRole === "SUPER_ADMIN" && actorRole !== "SUPER_ADMIN") {
    return false;
  }

  const actorLevel = ROLE_HIERARCHY[actorRole] ?? 0;
  const targetLevel = ROLE_HIERARCHY[targetRole] ?? 0;

  return actorLevel > targetLevel;
}
