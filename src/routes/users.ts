import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  reactivateUser,
  resetUserPassword,
  getAllPermissions,
  getRolePermissions,
  updateRolePermissions,
  getUserStatistics,
} from '../controllers/users';
import { authenticateToken } from '../middleware/auth';
import { requirePermission, PERMISSIONS } from '../middleware/permissions';
import { validateRequest } from '../middleware/validation';
import { auditLogger } from '../middleware/audit';

const router = Router();

// All user management routes require authentication
router.use(authenticateToken);

// User Management Routes
router.get(
  '/',
  requirePermission(PERMISSIONS.USERS.READ.resource, PERMISSIONS.USERS.READ.action),
  getUsers
);

router.get(
  '/statistics',
  requirePermission(PERMISSIONS.USERS.READ.resource, PERMISSIONS.USERS.READ.action),
  getUserStatistics
);

router.get(
  '/:id',
  requirePermission(PERMISSIONS.USERS.READ.resource, PERMISSIONS.USERS.READ.action),
  getUserById
);

router.post(
  '/',
  requirePermission(PERMISSIONS.USERS.CREATE.resource, PERMISSIONS.USERS.CREATE.action),
  auditLogger('create', 'user'),
  createUser
);

router.put(
  '/:id',
  requirePermission(PERMISSIONS.USERS.UPDATE.resource, PERMISSIONS.USERS.UPDATE.action),
  auditLogger('update', 'user'),
  updateUser
);

router.put(
  '/:id/deactivate',
  requirePermission(PERMISSIONS.USERS.UPDATE.resource, PERMISSIONS.USERS.UPDATE.action),
  auditLogger('deactivate', 'user'),
  deactivateUser
);

router.put(
  '/:id/reactivate',
  requirePermission(PERMISSIONS.USERS.UPDATE.resource, PERMISSIONS.USERS.UPDATE.action),
  auditLogger('reactivate', 'user'),
  reactivateUser
);

router.put(
  '/:id/reset-password',
  requirePermission(PERMISSIONS.USERS.UPDATE.resource, PERMISSIONS.USERS.UPDATE.action),
  auditLogger('reset_password', 'user'),
  resetUserPassword
);

// Permission Management Routes
router.get(
  '/permissions/all',
  requirePermission(PERMISSIONS.USERS.ROLES.resource, PERMISSIONS.USERS.ROLES.action),
  getAllPermissions
);

router.get(
  '/roles/:role/permissions',
  requirePermission(PERMISSIONS.USERS.ROLES.resource, PERMISSIONS.USERS.ROLES.action),
  getRolePermissions
);

router.put(
  '/roles/:role/permissions',
  requirePermission(PERMISSIONS.USERS.ROLES.resource, PERMISSIONS.USERS.ROLES.action),
  auditLogger('update', 'role_permissions'),
  updateRolePermissions
);

export default router;