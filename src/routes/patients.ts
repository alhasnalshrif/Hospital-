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
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { auditLogger } from '../middleware/audit';
import { patientValidation } from '../utils/validation';

const router = Router();

// All patient routes require authentication
router.use(authenticateToken);

// Patient management routes
router.post(
  '/',
  requireRole(['admin', 'doctor', 'nurse', 'receptionist']),
  validateRequest(patientValidation.create),
  auditLogger('create', 'patient'),
  createPatient
);

router.get(
  '/',
  requireRole(['admin', 'doctor', 'nurse', 'receptionist', 'therapist', 'cashier']),
  getPatients
);

router.get(
  '/:id',
  requireRole(['admin', 'doctor', 'nurse', 'receptionist', 'therapist', 'cashier']),
  getPatientById
);

router.put(
  '/:id',
  requireRole(['admin', 'doctor', 'nurse', 'receptionist']),
  validateRequest(patientValidation.update),
  auditLogger('update', 'patient'),
  updatePatient
);

router.delete(
  '/:id',
  requireRole(['admin']),
  auditLogger('delete', 'patient'),
  deletePatient
);

// Medical records routes
router.post(
  '/:id/medical-records',
  requireRole(['doctor', 'nurse']),
  auditLogger('create', 'medical_record'),
  addMedicalRecord
);

router.get(
  '/:id/medical-records',
  requireRole(['admin', 'doctor', 'nurse', 'therapist']),
  getMedicalRecords
);

export default router;