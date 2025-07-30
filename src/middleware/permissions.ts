import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, createErrorResponse } from '../types';
import { db, permissions, rolePermissions } from '../db';
import { eq, and } from 'drizzle-orm';

// Permission cache to avoid database queries
const permissionCache = new Map<string, CacheEntry>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  hasPermission: boolean;
  timestamp: number;
}

export const requirePermission = (resource: string, action: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json(createErrorResponse('Authentication required'));
      }

      // Admin users have all permissions
      if (req.user.role === 'admin') {
        return next();
      }

      const cacheKey = `${req.user.role}:${resource}:${action}`;
      const cached = permissionCache.get(cacheKey);
      
      // Check cache first
      if (cached && (Date.now() - cached.timestamp) < CACHE_EXPIRY) {
        if (cached.hasPermission) {
          return next();
        } else {
          return res.status(403).json(createErrorResponse('Insufficient permissions'));
        }
      }

      // Query database for permission
      const hasPermission = await checkUserPermission(req.user.role, resource, action);
      
      // Update cache
      permissionCache.set(cacheKey, {
        hasPermission,
        timestamp: Date.now()
      });

      if (hasPermission) {
        return next();
      } else {
        return res.status(403).json(createErrorResponse('Insufficient permissions'));
      }
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json(createErrorResponse('Permission check failed'));
    }
  };
};

export const requireAnyPermission = (permissionChecks: Array<{ resource: string; action: string }>) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json(createErrorResponse('Authentication required'));
      }

      // Admin users have all permissions
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if user has any of the required permissions
      for (const { resource, action } of permissionChecks) {
        const hasPermission = await checkUserPermission(req.user.role, resource, action);
        if (hasPermission) {
          return next();
        }
      }

      return res.status(403).json(createErrorResponse('Insufficient permissions'));
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json(createErrorResponse('Permission check failed'));
    }
  };
};

export const requireAllPermissions = (permissionChecks: Array<{ resource: string; action: string }>) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json(createErrorResponse('Authentication required'));
      }

      // Admin users have all permissions
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if user has all required permissions
      for (const { resource, action } of permissionChecks) {
        const hasPermission = await checkUserPermission(req.user.role, resource, action);
        if (!hasPermission) {
          return res.status(403).json(createErrorResponse('Insufficient permissions'));
        }
      }

      return next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json(createErrorResponse('Permission check failed'));
    }
  };
};

const checkUserPermission = async (role: string, resource: string, action: string): Promise<boolean> => {
  try {
    const result = await db
      .select({
        permissionName: permissions.name,
      })
      .from(rolePermissions)
      .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(
        and(
          eq(rolePermissions.role, role as any),
          eq(permissions.resource, resource),
          eq(permissions.action, action)
        )
      )
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error('Database permission check error:', error);
    return false;
  }
};

// Helper function to clear permission cache (useful for admin operations)
export const clearPermissionCache = () => {
  permissionCache.clear();
};

// Helper function to check if user has specific permission (for programmatic use)
export const hasPermission = async (role: string, resource: string, action: string): Promise<boolean> => {
  if (role === 'admin') return true;
  return await checkUserPermission(role, resource, action);
};

// Comprehensive permission definitions for the hospital system
export const PERMISSIONS = {
  // Patient Management
  PATIENTS: {
    CREATE: { resource: 'patients', action: 'create' },
    READ: { resource: 'patients', action: 'read' },
    UPDATE: { resource: 'patients', action: 'update' },
    DELETE: { resource: 'patients', action: 'delete' },
    SEARCH: { resource: 'patients', action: 'search' },
  },
  
  // Medical Records
  MEDICAL_RECORDS: {
    CREATE: { resource: 'medical_records', action: 'create' },
    READ: { resource: 'medical_records', action: 'read' },
    UPDATE: { resource: 'medical_records', action: 'update' },
    DELETE: { resource: 'medical_records', action: 'delete' },
  },
  
  // Billing & Payments
  BILLING: {
    CREATE: { resource: 'bills', action: 'create' },
    READ: { resource: 'bills', action: 'read' },
    UPDATE: { resource: 'bills', action: 'update' },
    DELETE: { resource: 'bills', action: 'delete' },
    APPROVE: { resource: 'bills', action: 'approve' },
  },
  
  PAYMENTS: {
    CREATE: { resource: 'payments', action: 'create' },
    READ: { resource: 'payments', action: 'read' },
    REFUND: { resource: 'payments', action: 'refund' },
  },
  
  // Dental Department
  DENTAL: {
    CREATE: { resource: 'dental', action: 'create' },
    READ: { resource: 'dental', action: 'read' },
    UPDATE: { resource: 'dental', action: 'update' },
    DELETE: { resource: 'dental', action: 'delete' },
    APPOINTMENTS: { resource: 'dental', action: 'appointments' },
    XRAYS: { resource: 'dental', action: 'xrays' },
  },
  
  // Inpatient Care
  INPATIENT: {
    CREATE: { resource: 'inpatient', action: 'create' },
    READ: { resource: 'inpatient', action: 'read' },
    UPDATE: { resource: 'inpatient', action: 'update' },
    DELETE: { resource: 'inpatient', action: 'delete' },
    BEDS: { resource: 'inpatient', action: 'beds' },
    DISCHARGE: { resource: 'inpatient', action: 'discharge' },
  },
  
  // ICU Management
  ICU: {
    CREATE: { resource: 'icu', action: 'create' },
    READ: { resource: 'icu', action: 'read' },
    UPDATE: { resource: 'icu', action: 'update' },
    DELETE: { resource: 'icu', action: 'delete' },
    MONITORING: { resource: 'icu', action: 'monitoring' },
    PROCEDURES: { resource: 'icu', action: 'procedures' },
  },
  
  // Pediatrics
  PEDIATRICS: {
    CREATE: { resource: 'pediatrics', action: 'create' },
    READ: { resource: 'pediatrics', action: 'read' },
    UPDATE: { resource: 'pediatrics', action: 'update' },
    DELETE: { resource: 'pediatrics', action: 'delete' },
    VACCINATIONS: { resource: 'pediatrics', action: 'vaccinations' },
    GROWTH_CHARTS: { resource: 'pediatrics', action: 'growth_charts' },
  },
  
  // Physical Therapy
  PHYSICAL_THERAPY: {
    CREATE: { resource: 'physical_therapy', action: 'create' },
    READ: { resource: 'physical_therapy', action: 'read' },
    UPDATE: { resource: 'physical_therapy', action: 'update' },
    DELETE: { resource: 'physical_therapy', action: 'delete' },
    ASSESSMENTS: { resource: 'physical_therapy', action: 'assessments' },
    SESSIONS: { resource: 'physical_therapy', action: 'sessions' },
  },
  
  // User Management
  USERS: {
    CREATE: { resource: 'users', action: 'create' },
    READ: { resource: 'users', action: 'read' },
    UPDATE: { resource: 'users', action: 'update' },
    DELETE: { resource: 'users', action: 'delete' },
    ROLES: { resource: 'users', action: 'roles' },
  },
  
  // Reports & Analytics
  REPORTS: {
    READ: { resource: 'reports', action: 'read' },
    GENERATE: { resource: 'reports', action: 'generate' },
    EXPORT: { resource: 'reports', action: 'export' },
  },
  
  // System Administration
  SYSTEM: {
    CONFIG: { resource: 'system', action: 'config' },
    AUDIT: { resource: 'system', action: 'audit' },
    BACKUP: { resource: 'system', action: 'backup' },
  },
};