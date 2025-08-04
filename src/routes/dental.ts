import { Router } from 'express';
import {
  createDentalRecord,
  getDentalRecords,
  getDentalRecordById,
  updateDentalRecord,
  createDentalAppointment,
  getDentalAppointments,
  updateAppointmentStatus,
  createDentalXray,
  getDentalXrays,
  getDentalInventory,
  updateInventoryItem,
} from '../controllers/dental';
import { authenticateToken } from '../middleware/auth';
import { requirePermission, PERMISSIONS } from '../middleware/permissions';
import { validateRequest } from '../middleware/validation';
import { auditLogger } from '../middleware/audit';

const router = Router();

// All dental routes require authentication
router.use(authenticateToken);

// Dental Records Routes
router.post(
  '/records',
  requirePermission(PERMISSIONS.DENTAL.CREATE.resource, PERMISSIONS.DENTAL.CREATE.action),
  auditLogger('create', 'dental_record'),
  createDentalRecord
);

router.get(
  '/records',
  requirePermission(PERMISSIONS.DENTAL.READ.resource, PERMISSIONS.DENTAL.READ.action),
  getDentalRecords
);

router.get(
  '/records/:id',
  requirePermission(PERMISSIONS.DENTAL.READ.resource, PERMISSIONS.DENTAL.READ.action),
  getDentalRecordById
);

router.put(
  '/records/:id',
  requirePermission(PERMISSIONS.DENTAL.UPDATE.resource, PERMISSIONS.DENTAL.UPDATE.action),
  auditLogger('update', 'dental_record'),
  updateDentalRecord
);

// Dental Appointments Routes
router.post(
  '/appointments',
  requirePermission(PERMISSIONS.DENTAL.APPOINTMENTS.resource, PERMISSIONS.DENTAL.APPOINTMENTS.action),
  auditLogger('create', 'dental_appointment'),
  createDentalAppointment
);

router.get(
  '/appointments',
  requirePermission(PERMISSIONS.DENTAL.APPOINTMENTS.resource, PERMISSIONS.DENTAL.APPOINTMENTS.action),
  getDentalAppointments
);

router.put(
  '/appointments/:id/status',
  requirePermission(PERMISSIONS.DENTAL.APPOINTMENTS.resource, PERMISSIONS.DENTAL.APPOINTMENTS.action),
  auditLogger('update', 'dental_appointment'),
  updateAppointmentStatus
);

// Dental X-rays Routes
router.post(
  '/xrays',
  requirePermission(PERMISSIONS.DENTAL.XRAYS.resource, PERMISSIONS.DENTAL.XRAYS.action),
  auditLogger('create', 'dental_xray'),
  createDentalXray
);

router.get(
  '/xrays',
  requirePermission(PERMISSIONS.DENTAL.XRAYS.resource, PERMISSIONS.DENTAL.XRAYS.action),
  getDentalXrays
);

// Dental Inventory Routes
router.get(
  '/inventory',
  requirePermission(PERMISSIONS.DENTAL.READ.resource, PERMISSIONS.DENTAL.READ.action),
  getDentalInventory
);

router.put(
  '/inventory/:id',
  requirePermission(PERMISSIONS.DENTAL.UPDATE.resource, PERMISSIONS.DENTAL.UPDATE.action),
  auditLogger('update', 'dental_inventory'),
  updateInventoryItem
);

export default router;