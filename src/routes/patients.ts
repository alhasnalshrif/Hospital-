import { Router } from 'express';
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  addMedicalRecord,
  getMedicalRecords,
} from '../controllers/patients';
import { authenticateToken } from '../middleware/auth';
import { requirePermission, PERMISSIONS } from '../middleware/permissions';
import { validateRequest } from '../middleware/validation';
import { auditLogger } from '../middleware/audit';
import { patientValidation } from '../utils/validation';

const router = Router();

// All patient routes require authentication
router.use(authenticateToken);

// Patient management routes
router.post(
  '/',
  requirePermission(PERMISSIONS.PATIENTS.CREATE.resource, PERMISSIONS.PATIENTS.CREATE.action),
  validateRequest(patientValidation.create),
  auditLogger('create', 'patient'),
  createPatient
);

router.get(
  '/',
  requirePermission(PERMISSIONS.PATIENTS.READ.resource, PERMISSIONS.PATIENTS.READ.action),
  getPatients
);

router.get(
  '/:id',
  requirePermission(PERMISSIONS.PATIENTS.READ.resource, PERMISSIONS.PATIENTS.READ.action),
  getPatientById
);

router.put(
  '/:id',
  requirePermission(PERMISSIONS.PATIENTS.UPDATE.resource, PERMISSIONS.PATIENTS.UPDATE.action),
  validateRequest(patientValidation.update),
  auditLogger('update', 'patient'),
  updatePatient
);

router.delete(
  '/:id',
  requirePermission(PERMISSIONS.PATIENTS.DELETE.resource, PERMISSIONS.PATIENTS.DELETE.action),
  auditLogger('delete', 'patient'),
  deletePatient
);

// Medical records routes
router.post(
  '/:id/medical-records',
  requirePermission(PERMISSIONS.MEDICAL_RECORDS.CREATE.resource, PERMISSIONS.MEDICAL_RECORDS.CREATE.action),
  auditLogger('create', 'medical_record'),
  addMedicalRecord
);

router.get(
  '/:id/medical-records',
  requirePermission(PERMISSIONS.MEDICAL_RECORDS.READ.resource, PERMISSIONS.MEDICAL_RECORDS.READ.action),
  getMedicalRecords
);

export default router;