/**
 * Role-Based Access Control
 *
 * Defines permissions for each role
 * Like having different keycard levels
 */
export type Role = 'superadmin' | 'admin' | 'viewer';

export interface Permission {
    action: string;
    resource: string;
}

// Define permissions for each role
export const rolePermissions: Record<Role, Permission[]> = {
    superadmin: [
        // Full access to everything
        { action: '*', resource: '*' },
    ],
    admin: [
        // Can control simulation
        { action: 'control', resource: 'simulation' },
        { action: 'view', resource: 'simulation' },
        // Can manage trains
        { action: 'create', resource: 'train' },
        { action: 'update', resource: 'train' },
        { action: 'view', resource: 'train' },
        { action: 'delete', resource: 'train' },
        // Can trigger manual events
        { action: 'trigger', resource: 'event' },
        // Can view system status
        { action: 'view', resource: 'system' },
        { action: 'view', resource: 'logs' },
        // Cannot manage admins
        // Cannot delete system data
    ],
    viewer: [
        // Read-only access
        { action: 'view', resource: 'train' },
        { action: 'view', resource: 'simulation' },
        { action: 'view', resource: 'system' },
        { action: 'view', resource: 'logs' },
        // No write operations
    ],
};

/**
 * Check if a role has permission for an action on a resource
 */
export function hasPermission(
    role: Role,
    action: string,
    resource: string
): boolean {
    const permissions = rolePermissions[role];

    // Superadmin has wildcard
    if (role === 'superadmin') return true;

    return permissions.some(
        p => (p.action === '*' || p.action === action) &&
            (p.resource === '*' || p.resource === resource)
    );
}

/**
 * Check if a role is at least the required level
 * superadmin > admin > viewer
 */
export function isAtLeast(role: Role, requiredRole: Role): boolean {
    const hierarchy: Role[] = ['viewer', 'admin', 'superadmin'];
    const roleIndex = hierarchy.indexOf(role);
    const requiredIndex = hierarchy.indexOf(requiredRole);

    return roleIndex >= requiredIndex;
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: Role): Permission[] {
    return rolePermissions[role];
}
