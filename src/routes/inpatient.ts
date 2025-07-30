import { Router } from 'express';
import {
  createInpatientAdmission,
  getInpatientAdmissions,
  getInpatientAdmissionById,
  updateInpatientAdmission,
  dischargeInpatient,
  getBedAllocations,
  getAvailableBeds,
  recordVitalSigns,
  getVitalSigns,
  recordMedication,
  getMedicationRecords,
  updateMedicationStatus,
} from '../controllers/inpatient';
import { authenticateToken } from '../middleware/auth';
import { requirePermission, PERMISSIONS } from '../middleware/permissions';
import { validateRequest } from '../middleware/validation';
import { auditLogger } from '../middleware/audit';

const router = Router();

// All inpatient routes require authentication
router.use(authenticateToken);

// Inpatient Admissions Routes
router.post(
  '/admissions',
  requirePermission(PERMISSIONS.INPATIENT.CREATE.resource, PERMISSIONS.INPATIENT.CREATE.action),
  auditLogger('create', 'inpatient_admission'),
  createInpatientAdmission
);

router.get(
  '/admissions',
  requirePermission(PERMISSIONS.INPATIENT.READ.resource, PERMISSIONS.INPATIENT.READ.action),
  getInpatientAdmissions
);

router.get(
  '/admissions/:id',
  requirePermission(PERMISSIONS.INPATIENT.READ.resource, PERMISSIONS.INPATIENT.READ.action),
  getInpatientAdmissionById
);

router.put(
  '/admissions/:id',
  requirePermission(PERMISSIONS.INPATIENT.UPDATE.resource, PERMISSIONS.INPATIENT.UPDATE.action),
  auditLogger('update', 'inpatient_admission'),
  updateInpatientAdmission
);

router.put(
  '/admissions/:id/discharge',
  requirePermission(PERMISSIONS.INPATIENT.DISCHARGE.resource, PERMISSIONS.INPATIENT.DISCHARGE.action),
  auditLogger('discharge', 'inpatient_admission'),
  dischargeInpatient
);

// Bed Management Routes
router.get(
  '/beds',
  requirePermission(PERMISSIONS.INPATIENT.BEDS.resource, PERMISSIONS.INPATIENT.BEDS.action),
  getBedAllocations
);

router.get(
  '/beds/available',
  requirePermission(PERMISSIONS.INPATIENT.BEDS.resource, PERMISSIONS.INPATIENT.BEDS.action),
  getAvailableBeds
);

// Vital Signs Routes
router.post(
  '/vital-signs',
  requirePermission(PERMISSIONS.INPATIENT.UPDATE.resource, PERMISSIONS.INPATIENT.UPDATE.action),
  auditLogger('create', 'vital_signs'),
  recordVitalSigns
);

router.get(
  '/vital-signs',
  requirePermission(PERMISSIONS.INPATIENT.READ.resource, PERMISSIONS.INPATIENT.READ.action),
  getVitalSigns
);

// Medication Management Routes
router.post(
  '/medications',
  requirePermission(PERMISSIONS.INPATIENT.UPDATE.resource, PERMISSIONS.INPATIENT.UPDATE.action),
  auditLogger('create', 'medication_record'),
  recordMedication
);

router.get(
  '/medications',
  requirePermission(PERMISSIONS.INPATIENT.READ.resource, PERMISSIONS.INPATIENT.READ.action),
  getMedicationRecords
);

router.put(
  '/medications/:id/status',
  requirePermission(PERMISSIONS.INPATIENT.UPDATE.resource, PERMISSIONS.INPATIENT.UPDATE.action),
  auditLogger('update', 'medication_record'),
  updateMedicationStatus
);

export default router;