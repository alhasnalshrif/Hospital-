import { Router } from 'express';
import {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  recordAttendance,
  getEmployeeAttendance,
  submitLeaveRequest,
  getLeaveRequests,
  updateLeaveRequestStatus,
  createDepartment,
  getDepartments,
  createPosition,
  getPositions,
  getEmployeePayroll,
} from '../controllers/hr';
import { requireAuth } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const router = Router();

// All HR routes require authentication
router.use(requireAuth);

// Employee Management
router.post('/employees', requirePermission('hr', 'create'), createEmployee);
router.get('/employees', requirePermission('hr', 'read'), getEmployees);
router.get('/employees/:employeeId', requirePermission('hr', 'read'), getEmployee);
router.put('/employees/:employeeId', requirePermission('hr', 'update'), updateEmployee);

// Attendance Management
router.post('/attendance', requirePermission('hr', 'create'), recordAttendance);
router.get('/employees/:employeeId/attendance', requirePermission('hr', 'read'), getEmployeeAttendance);

// Leave Management
router.post('/leave-requests', requirePermission('hr', 'create'), submitLeaveRequest);
router.get('/leave-requests', requirePermission('hr', 'read'), getLeaveRequests);
router.put('/leave-requests/:requestId/status', requirePermission('hr', 'update'), updateLeaveRequestStatus);

// Department Management
router.post('/departments', requirePermission('hr', 'create'), createDepartment);
router.get('/departments', requirePermission('hr', 'read'), getDepartments);

// Position Management
router.post('/positions', requirePermission('hr', 'create'), createPosition);
router.get('/positions', requirePermission('hr', 'read'), getPositions);

// Payroll
router.get('/employees/:employeeId/payroll', requirePermission('hr', 'read'), getEmployeePayroll);

export default router;