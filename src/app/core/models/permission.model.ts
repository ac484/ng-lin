/**
 * Permission representation and evaluation helpers.
 */
export type CorePermission = string;

export interface PermissionRequirement {
  anyOf?: CorePermission[];
  allOf?: CorePermission[];
  noneOf?: CorePermission[];
}

/**
 * Evaluate a permission requirement against a permission set.
 */
export function satisfiesPermissionRequirement(
  owned: Iterable<CorePermission>,
  requirement: PermissionRequirement
): boolean {
  const ownedSet = new Set(owned);

  if (requirement.allOf?.length) {
    const allSatisfied = requirement.allOf.every(permission => ownedSet.has(permission));
    if (!allSatisfied) return false;
  }

  if (requirement.anyOf?.length) {
    const anySatisfied = requirement.anyOf.some(permission => ownedSet.has(permission));
    if (!anySatisfied) return false;
  }

  if (requirement.noneOf?.length) {
    const noneViolated = requirement.noneOf.some(permission => ownedSet.has(permission));
    if (noneViolated) return false;
  }

  return true;
}
