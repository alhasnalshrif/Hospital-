import { Router } from 'express';
import {
  createPediatricRecord,
  getPediatricRecords,
  getPediatricRecordById,
  updatePediatricRecord,
  recordVaccination,
  getVaccinations,
  getVaccinationById,
  getUpcomingVaccinations,
  recordGrowthMeasurement,
  getGrowthCharts,
  getLatestGrowthMeasurement,
  recordDevelopmentalMilestone,
  getDevelopmentalMilestones,
  updateDevelopmentalMilestone,
  getPediatricStatistics,
} from '../controllers/pediatrics';
import { authenticateToken } from '../middleware/auth';
import { requirePermission, PERMISSIONS } from '../middleware/permissions';
import { validateRequest } from '../middleware/validation';
import { auditLogger } from '../middleware/audit';

const router = Router();

// All pediatric routes require authentication
router.use(authenticateToken);

// Pediatric Records Routes
router.post(
  '/records',
  requirePermission(PERMISSIONS.PEDIATRICS.CREATE.resource, PERMISSIONS.PEDIATRICS.CREATE.action),
  auditLogger('create', 'pediatric_record'),
  createPediatricRecord
);

router.get(
  '/records',
  requirePermission(PERMISSIONS.PEDIATRICS.READ.resource, PERMISSIONS.PEDIATRICS.READ.action),
  getPediatricRecords
);

router.get(
  '/records/:id',
  requirePermission(PERMISSIONS.PEDIATRICS.READ.resource, PERMISSIONS.PEDIATRICS.READ.action),
  getPediatricRecordById
);

router.put(
  '/records/:id',
  requirePermission(PERMISSIONS.PEDIATRICS.UPDATE.resource, PERMISSIONS.PEDIATRICS.UPDATE.action),
  auditLogger('update', 'pediatric_record'),
  updatePediatricRecord
);

// Vaccination Routes
router.post(
  '/vaccinations',
  requirePermission(PERMISSIONS.PEDIATRICS.VACCINATIONS.resource, PERMISSIONS.PEDIATRICS.VACCINATIONS.action),
  auditLogger('create', 'vaccination'),
  recordVaccination
);

router.get(
  '/vaccinations',
  requirePermission(PERMISSIONS.PEDIATRICS.VACCINATIONS.resource, PERMISSIONS.PEDIATRICS.VACCINATIONS.action),
  getVaccinations
);

router.get(
  '/vaccinations/:id',
  requirePermission(PERMISSIONS.PEDIATRICS.VACCINATIONS.resource, PERMISSIONS.PEDIATRICS.VACCINATIONS.action),
  getVaccinationById
);

router.get(
  '/vaccinations/upcoming',
  requirePermission(PERMISSIONS.PEDIATRICS.VACCINATIONS.resource, PERMISSIONS.PEDIATRICS.VACCINATIONS.action),
  getUpcomingVaccinations
);

// Growth Charts Routes
router.post(
  '/growth-charts',
  requirePermission(PERMISSIONS.PEDIATRICS.GROWTH_CHARTS.resource, PERMISSIONS.PEDIATRICS.GROWTH_CHARTS.action),
  auditLogger('create', 'growth_measurement'),
  recordGrowthMeasurement
);

router.get(
  '/growth-charts',
  requirePermission(PERMISSIONS.PEDIATRICS.GROWTH_CHARTS.resource, PERMISSIONS.PEDIATRICS.GROWTH_CHARTS.action),
  getGrowthCharts
);

router.get(
  '/growth-charts/latest/:patientId',
  requirePermission(PERMISSIONS.PEDIATRICS.GROWTH_CHARTS.resource, PERMISSIONS.PEDIATRICS.GROWTH_CHARTS.action),
  getLatestGrowthMeasurement
);

// Developmental Milestones Routes
router.post(
  '/milestones',
  requirePermission(PERMISSIONS.PEDIATRICS.UPDATE.resource, PERMISSIONS.PEDIATRICS.UPDATE.action),
  auditLogger('create', 'developmental_milestone'),
  recordDevelopmentalMilestone
);

router.get(
  '/milestones',
  requirePermission(PERMISSIONS.PEDIATRICS.READ.resource, PERMISSIONS.PEDIATRICS.READ.action),
  getDevelopmentalMilestones
);

router.put(
  '/milestones/:id',
  requirePermission(PERMISSIONS.PEDIATRICS.UPDATE.resource, PERMISSIONS.PEDIATRICS.UPDATE.action),
  auditLogger('update', 'developmental_milestone'),
  updateDevelopmentalMilestone
);

// Statistics Routes
router.get(
  '/statistics',
  requirePermission(PERMISSIONS.PEDIATRICS.READ.resource, PERMISSIONS.PEDIATRICS.READ.action),
  getPediatricStatistics
);

export default router;