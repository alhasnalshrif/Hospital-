import { Router } from 'express';
import {
  createPtAssessment,
  getPtAssessments,
  getPtAssessmentById,
  updatePtAssessment,
  createTherapySession,
  getTherapySessions,
  getTherapySessionById,
  updateTherapySession,
  getTherapyEquipment,
  updateEquipmentStatus,
  getEquipmentMaintenanceSchedule,
  createOutcomeEvaluation,
  getOutcomeEvaluations,
  getOutcomeEvaluationById,
  getPtStatistics,
} from '../controllers/physicalTherapy';
import { authenticateToken } from '../middleware/auth';
import { requirePermission, PERMISSIONS } from '../middleware/permissions';
import { validateRequest } from '../middleware/validation';
import { auditLogger } from '../middleware/audit';

const router = Router();

// All physical therapy routes require authentication
router.use(authenticateToken);

// PT Assessments Routes
router.post(
  '/assessments',
  requirePermission(PERMISSIONS.PHYSICAL_THERAPY.ASSESSMENTS.resource, PERMISSIONS.PHYSICAL_THERAPY.ASSESSMENTS.action),
  auditLogger('create', 'pt_assessment'),
  createPtAssessment
);

router.get(
  '/assessments',
  requirePermission(PERMISSIONS.PHYSICAL_THERAPY.ASSESSMENTS.resource, PERMISSIONS.PHYSICAL_THERAPY.ASSESSMENTS.action),
  getPtAssessments
);

router.get(
  '/assessments/:id',
  requirePermission(PERMISSIONS.PHYSICAL_THERAPY.ASSESSMENTS.resource, PERMISSIONS.PHYSICAL_THERAPY.ASSESSMENTS.action),
  getPtAssessmentById
);

router.put(
  '/assessments/:id',
  requirePermission(PERMISSIONS.PHYSICAL_THERAPY.ASSESSMENTS.resource, PERMISSIONS.PHYSICAL_THERAPY.ASSESSMENTS.action),
  auditLogger('update', 'pt_assessment'),
  updatePtAssessment
);

// Therapy Sessions Routes
router.post(
  '/sessions',
  requirePermission(PERMISSIONS.PHYSICAL_THERAPY.SESSIONS.resource, PERMISSIONS.PHYSICAL_THERAPY.SESSIONS.action),
  auditLogger('create', 'therapy_session'),
  createTherapySession
);

router.get(
  '/sessions',
  requirePermission(PERMISSIONS.PHYSICAL_THERAPY.SESSIONS.resource, PERMISSIONS.PHYSICAL_THERAPY.SESSIONS.action),
  getTherapySessions
);

router.get(
  '/sessions/:id',
  requirePermission(PERMISSIONS.PHYSICAL_THERAPY.SESSIONS.resource, PERMISSIONS.PHYSICAL_THERAPY.SESSIONS.action),
  getTherapySessionById
);

router.put(
  '/sessions/:id',
  requirePermission(PERMISSIONS.PHYSICAL_THERAPY.SESSIONS.resource, PERMISSIONS.PHYSICAL_THERAPY.SESSIONS.action),
  auditLogger('update', 'therapy_session'),
  updateTherapySession
);

// Equipment Management Routes
router.get(
  '/equipment',
  requirePermission(PERMISSIONS.PHYSICAL_THERAPY.READ.resource, PERMISSIONS.PHYSICAL_THERAPY.READ.action),
  getTherapyEquipment
);

router.put(
  '/equipment/:id/status',
  requirePermission(PERMISSIONS.PHYSICAL_THERAPY.UPDATE.resource, PERMISSIONS.PHYSICAL_THERAPY.UPDATE.action),
  auditLogger('update', 'therapy_equipment'),
  updateEquipmentStatus
);

router.get(
  '/equipment/maintenance-schedule',
  requirePermission(PERMISSIONS.PHYSICAL_THERAPY.READ.resource, PERMISSIONS.PHYSICAL_THERAPY.READ.action),
  getEquipmentMaintenanceSchedule
);

// Outcome Evaluations Routes
router.post(
  '/evaluations',
  requirePermission(PERMISSIONS.PHYSICAL_THERAPY.UPDATE.resource, PERMISSIONS.PHYSICAL_THERAPY.UPDATE.action),
  auditLogger('create', 'outcome_evaluation'),
  createOutcomeEvaluation
);

router.get(
  '/evaluations',
  requirePermission(PERMISSIONS.PHYSICAL_THERAPY.READ.resource, PERMISSIONS.PHYSICAL_THERAPY.READ.action),
  getOutcomeEvaluations
);

router.get(
  '/evaluations/:id',
  requirePermission(PERMISSIONS.PHYSICAL_THERAPY.READ.resource, PERMISSIONS.PHYSICAL_THERAPY.READ.action),
  getOutcomeEvaluationById
);

// Statistics Routes
router.get(
  '/statistics',
  requirePermission(PERMISSIONS.PHYSICAL_THERAPY.READ.resource, PERMISSIONS.PHYSICAL_THERAPY.READ.action),
  getPtStatistics
);

export default router;