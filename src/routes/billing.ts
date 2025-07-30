import { Router } from 'express';
import {
  createBill,
  getBills,
  getBillById,
  createPayment,
  getPayments,
  getServiceCharges,
} from '../controllers/billing';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { auditLogger } from '../middleware/audit';
import { billingValidation, paymentValidation } from '../utils/validation';

const router = Router();

// All billing routes require authentication
router.use(authenticateToken);

// Bill management routes
router.post(
  '/bills',
  requireRole(['admin', 'doctor', 'cashier']),
  validateRequest(billingValidation.create),
  auditLogger('create', 'bill'),
  createBill
);

router.get(
  '/bills',
  requireRole(['admin', 'doctor', 'cashier']),
  getBills
);

router.get(
  '/bills/:id',
  requireRole(['admin', 'doctor', 'cashier']),
  getBillById
);

// Payment management routes
router.post(
  '/payments',
  requireRole(['admin', 'cashier']),
  validateRequest(paymentValidation.create),
  auditLogger('create', 'payment'),
  createPayment
);

router.get(
  '/payments',
  requireRole(['admin', 'cashier']),
  getPayments
);

// Service charges routes
router.get(
  '/service-charges',
  requireRole(['admin', 'doctor', 'cashier']),
  getServiceCharges
);

export default router;