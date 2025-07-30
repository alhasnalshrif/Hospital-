import { Router } from 'express';
import {
  verifyInsuranceEligibility,
  submitInsuranceClaim,
  getClaimStatus,
  updateClaimStatus,
  createPreauthorization,
  updatePreauthorizationStatus,
  addPatientInsurance,
  getPatientInsurance,
  createInsuranceCompany,
  getInsuranceCompanies,
} from '../controllers/insurance';
import { requireAuth } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const router = Router();

// All insurance routes require authentication
router.use(requireAuth);

// Insurance Eligibility
router.post('/eligibility/verify', requirePermission('insurance', 'read'), verifyInsuranceEligibility);

// Claims Management
router.post('/claims', requirePermission('insurance', 'create'), submitInsuranceClaim);
router.get('/claims/:claimId/status', requirePermission('insurance', 'read'), getClaimStatus);
router.put('/claims/:claimId/status', requirePermission('insurance', 'update'), updateClaimStatus);

// Pre-authorization
router.post('/preauthorizations', requirePermission('insurance', 'create'), createPreauthorization);
router.put('/preauthorizations/:authId/status', requirePermission('insurance', 'update'), updatePreauthorizationStatus);

// Patient Insurance
router.post('/patients/:patientId/insurance', requirePermission('insurance', 'create'), addPatientInsurance);
router.get('/patients/:patientId/insurance', requirePermission('insurance', 'read'), getPatientInsurance);

// Insurance Companies
router.post('/companies', requirePermission('insurance', 'create'), createInsuranceCompany);
router.get('/companies', requirePermission('insurance', 'read'), getInsuranceCompanies);

export default router;