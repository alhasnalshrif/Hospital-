import { Router } from 'express';
import {
  createBill,
  getBills,
  getBillById,
  createPayment,
  getPayments,
  getServiceCharges,
} from '../controllers/billing';
import { authenticateToken } from '../middleware/auth';
import { requirePermission, PERMISSIONS } from '../middleware/permissions';
import { validateRequest } from '../middleware/validation';
import { auditLogger } from '../middleware/audit';
import { billingValidation, paymentValidation } from '../utils/validation';

const router = Router();

// All billing routes require authentication
router.use(authenticateToken);

// Bill management routes
router.post(
  '/bills',
  requirePermission(PERMISSIONS.BILLING.CREATE.resource, PERMISSIONS.BILLING.CREATE.action),
  validateRequest(billingValidation.create),
  auditLogger('create', 'bill'),
  createBill
);

router.get(
  '/bills',
  requirePermission(PERMISSIONS.BILLING.READ.resource, PERMISSIONS.BILLING.READ.action),
  getBills
);

router.get(
  '/bills/:id',
  requirePermission(PERMISSIONS.BILLING.READ.resource, PERMISSIONS.BILLING.READ.action),
  getBillById
);

// Payment management routes
router.post(
  '/payments',
  requirePermission(PERMISSIONS.PAYMENTS.CREATE.resource, PERMISSIONS.PAYMENTS.CREATE.action),
  validateRequest(paymentValidation.create),
  auditLogger('create', 'payment'),
  createPayment
);

router.get(
  '/payments',
  requirePermission(PERMISSIONS.PAYMENTS.READ.resource, PERMISSIONS.PAYMENTS.READ.action),
  getPayments
);

// Service charges routes
router.get(
  '/service-charges',
  requirePermission(PERMISSIONS.BILLING.READ.resource, PERMISSIONS.BILLING.READ.action),
  getServiceCharges
);

export default router;