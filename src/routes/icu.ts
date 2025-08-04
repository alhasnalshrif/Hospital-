import { Router } from 'express';
import {
  createIcuAdmission,
  getIcuAdmissions,
  getIcuAdmissionById,
  updateIcuAdmission,
  dischargeFromIcu,
  recordIcuMonitoring,
  getIcuMonitoring,
  recordIcuProcedure,
  getIcuProcedures,
  createIcuDailyReport,
  getIcuDailyReports,
  updateIcuDailyReport,
  getIcuStatistics,
} from '../controllers/icu';
import { authenticateToken } from '../middleware/auth';
import { requirePermission, PERMISSIONS } from '../middleware/permissions';
import { validateRequest } from '../middleware/validation';
import { auditLogger } from '../middleware/audit';

const router = Router();

// All ICU routes require authentication
router.use(authenticateToken);

// ICU Admissions Routes
router.post(
  '/admissions',
  requirePermission(PERMISSIONS.ICU.CREATE.resource, PERMISSIONS.ICU.CREATE.action),
  auditLogger('create', 'icu_admission'),
  createIcuAdmission
);

router.get(
  '/admissions',
  requirePermission(PERMISSIONS.ICU.READ.resource, PERMISSIONS.ICU.READ.action),
  getIcuAdmissions
);

router.get(
  '/admissions/:id',
  requirePermission(PERMISSIONS.ICU.READ.resource, PERMISSIONS.ICU.READ.action),
  getIcuAdmissionById
);

router.put(
  '/admissions/:id',
  requirePermission(PERMISSIONS.ICU.UPDATE.resource, PERMISSIONS.ICU.UPDATE.action),
  auditLogger('update', 'icu_admission'),
  updateIcuAdmission
);

router.put(
  '/admissions/:id/discharge',
  requirePermission(PERMISSIONS.ICU.UPDATE.resource, PERMISSIONS.ICU.UPDATE.action),
  auditLogger('discharge', 'icu_admission'),
  dischargeFromIcu
);

// ICU Monitoring Routes
router.post(
  '/monitoring',
  requirePermission(PERMISSIONS.ICU.MONITORING.resource, PERMISSIONS.ICU.MONITORING.action),
  auditLogger('create', 'icu_monitoring'),
  recordIcuMonitoring
);

router.get(
  '/monitoring',
  requirePermission(PERMISSIONS.ICU.MONITORING.resource, PERMISSIONS.ICU.MONITORING.action),
  getIcuMonitoring
);

// ICU Procedures Routes
router.post(
  '/procedures',
  requirePermission(PERMISSIONS.ICU.PROCEDURES.resource, PERMISSIONS.ICU.PROCEDURES.action),
  auditLogger('create', 'icu_procedure'),
  recordIcuProcedure
);

router.get(
  '/procedures',
  requirePermission(PERMISSIONS.ICU.PROCEDURES.resource, PERMISSIONS.ICU.PROCEDURES.action),
  getIcuProcedures
);

// ICU Daily Reports Routes
router.post(
  '/daily-reports',
  requirePermission(PERMISSIONS.ICU.UPDATE.resource, PERMISSIONS.ICU.UPDATE.action),
  auditLogger('create', 'icu_daily_report'),
  createIcuDailyReport
);

router.get(
  '/daily-reports',
  requirePermission(PERMISSIONS.ICU.READ.resource, PERMISSIONS.ICU.READ.action),
  getIcuDailyReports
);

router.put(
  '/daily-reports/:id',
  requirePermission(PERMISSIONS.ICU.UPDATE.resource, PERMISSIONS.ICU.UPDATE.action),
  auditLogger('update', 'icu_daily_report'),
  updateIcuDailyReport
);

// ICU Statistics Routes
router.get(
  '/statistics',
  requirePermission(PERMISSIONS.ICU.READ.resource, PERMISSIONS.ICU.READ.action),
  getIcuStatistics
);

export default router;