import { Router } from 'express';
import {
  uploadMedicalImage,
  getMedicalImage,
  getPatientImages,
  updateImageReport,
  createImagingStudy,
  getImagingStudies,
  updateStudyStatus,
  getAllPendingReports,
} from '../controllers/imaging';
import { requireAuth } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const router = Router();

// All imaging routes require authentication
router.use(requireAuth);

// Medical Image Management
router.post('/images/upload', requirePermission('imaging', 'create'), uploadMedicalImage);
router.get('/images/:dicomId', requirePermission('imaging', 'read'), getMedicalImage);
router.get('/patients/:patientId/images', requirePermission('imaging', 'read'), getPatientImages);
router.put('/images/:dicomId/report', requirePermission('imaging', 'update'), updateImageReport);

// Imaging Studies
router.post('/studies', requirePermission('imaging', 'create'), createImagingStudy);
router.get('/patients/:patientId/studies', requirePermission('imaging', 'read'), getImagingStudies);
router.put('/studies/:studyId/status', requirePermission('imaging', 'update'), updateStudyStatus);

// Radiology Workflow
router.get('/reports/pending', requirePermission('imaging', 'read'), getAllPendingReports);

export default router;