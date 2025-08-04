import { Router } from 'express';
import authRoutes from './auth';
import patientRoutes from './patients';
import billingRoutes from './billing';
import demoRoutes from './demo';
import usersRoutes from './users';
import imagingRoutes from './imaging';
import inventoryRoutes from './inventory';
import insuranceRoutes from './insurance';
import hrRoutes from './hr';
// Temporarily comment out new routes until schema alignment is fixed
// import dentalRoutes from './dental';
// import inpatientRoutes from './inpatient';
// import icuRoutes from './icu';
// import pediatricsRoutes from './pediatrics';
// import physicalTherapyRoutes from './physicalTherapy';

const router = Router();

// API version prefix
const API_VERSION = '/api/v1';

// Route mounting
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/patients`, patientRoutes);
router.use(`${API_VERSION}/billing`, billingRoutes);
router.use(`${API_VERSION}/demo`, demoRoutes);
router.use(`${API_VERSION}/users`, usersRoutes);
router.use(`${API_VERSION}/imaging`, imagingRoutes);
router.use(`${API_VERSION}/inventory`, inventoryRoutes);
router.use(`${API_VERSION}/insurance`, insuranceRoutes);
router.use(`${API_VERSION}/hr`, hrRoutes);
// Temporarily disabled until schema alignment is fixed
// router.use(`${API_VERSION}/dental`, dentalRoutes);
// router.use(`${API_VERSION}/inpatient`, inpatientRoutes);
// router.use(`${API_VERSION}/icu`, icuRoutes);
// router.use(`${API_VERSION}/pediatrics`, pediatricsRoutes);
// router.use(`${API_VERSION}/physical-therapy`, physicalTherapyRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Hospital Management System API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API documentation endpoint
router.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'Hospital Management System API Documentation',
    note: 'This backend includes demo endpoints that work without database setup',
    endpoints: {
      auth: {
        'POST /api/v1/auth/login': 'User login (requires database)',
        'POST /api/v1/auth/register': 'User registration (requires database)',
        'POST /api/v1/auth/logout': 'User logout (requires database)',
        'POST /api/v1/auth/change-password': 'Change password (requires database)',
        'GET /api/v1/auth/profile': 'Get user profile (requires database)',
      },
      patients: {
        'POST /api/v1/patients': 'Create patient (requires database)',
        'GET /api/v1/patients': 'Get patients list (requires database)',
        'GET /api/v1/patients/:id': 'Get patient by ID (requires database)',
        'PUT /api/v1/patients/:id': 'Update patient (requires database)',
        'DELETE /api/v1/patients/:id': 'Delete patient (requires database)',
        'POST /api/v1/patients/:id/medical-records': 'Add medical record (requires database)',
        'GET /api/v1/patients/:id/medical-records': 'Get medical records (requires database)',
      },
      billing: {
        'POST /api/v1/billing/bills': 'Create bill (requires database)',
        'GET /api/v1/billing/bills': 'Get bills list (requires database)',
        'GET /api/v1/billing/bills/:id': 'Get bill by ID (requires database)',
        'POST /api/v1/billing/payments': 'Process payment (requires database)',
        'GET /api/v1/billing/payments': 'Get payments list (requires database)',
        'GET /api/v1/billing/service-charges': 'Get service charges (requires database)',
      },
      dental: {
        'POST /api/v1/dental/records': 'Create dental record (requires database)',
        'GET /api/v1/dental/records': 'Get dental records (requires database)',
        'POST /api/v1/dental/appointments': 'Create dental appointment (requires database)',
        'GET /api/v1/dental/appointments': 'Get dental appointments (requires database)',
        'POST /api/v1/dental/xrays': 'Create dental X-ray (requires database)',
        'GET /api/v1/dental/xrays': 'Get dental X-rays (requires database)',
        'GET /api/v1/dental/inventory': 'Get dental inventory (requires database)',
      },
      inpatient: {
        'POST /api/v1/inpatient/admissions': 'Create inpatient admission (requires database)',
        'GET /api/v1/inpatient/admissions': 'Get inpatient admissions (requires database)',
        'PUT /api/v1/inpatient/admissions/:id/discharge': 'Discharge patient (requires database)',
        'GET /api/v1/inpatient/beds': 'Get bed allocations (requires database)',
        'POST /api/v1/inpatient/vital-signs': 'Record vital signs (requires database)',
        'POST /api/v1/inpatient/medications': 'Record medication (requires database)',
      },
      icu: {
        'POST /api/v1/icu/admissions': 'Create ICU admission (requires database)',
        'GET /api/v1/icu/admissions': 'Get ICU admissions (requires database)',
        'POST /api/v1/icu/monitoring': 'Record ICU monitoring (requires database)',
        'POST /api/v1/icu/procedures': 'Record ICU procedure (requires database)',
        'POST /api/v1/icu/daily-reports': 'Create ICU daily report (requires database)',
        'GET /api/v1/icu/statistics': 'Get ICU statistics (requires database)',
      },
      pediatrics: {
        'POST /api/v1/pediatrics/records': 'Create pediatric record (requires database)',
        'GET /api/v1/pediatrics/records': 'Get pediatric records (requires database)',
        'POST /api/v1/pediatrics/vaccinations': 'Record vaccination (requires database)',
        'GET /api/v1/pediatrics/vaccinations': 'Get vaccinations (requires database)',
        'POST /api/v1/pediatrics/growth-charts': 'Record growth measurement (requires database)',
        'POST /api/v1/pediatrics/milestones': 'Record developmental milestone (requires database)',
        'GET /api/v1/pediatrics/statistics': 'Get pediatric statistics (requires database)',
      },
      physicalTherapy: {
        'POST /api/v1/physical-therapy/assessments': 'Create PT assessment (requires database)',
        'GET /api/v1/physical-therapy/assessments': 'Get PT assessments (requires database)',
        'POST /api/v1/physical-therapy/sessions': 'Create therapy session (requires database)',
        'GET /api/v1/physical-therapy/sessions': 'Get therapy sessions (requires database)',
        'GET /api/v1/physical-therapy/equipment': 'Get therapy equipment (requires database)',
        'POST /api/v1/physical-therapy/evaluations': 'Create outcome evaluation (requires database)',
        'GET /api/v1/physical-therapy/statistics': 'Get PT statistics (requires database)',
      },
      users: {
        'GET /api/v1/users': 'Get users list (requires database)',
        'POST /api/v1/users': 'Create user (requires database)',
        'GET /api/v1/users/:id': 'Get user by ID (requires database)',
        'PUT /api/v1/users/:id': 'Update user (requires database)',
        'PUT /api/v1/users/:id/deactivate': 'Deactivate user (requires database)',
        'GET /api/v1/users/permissions/all': 'Get all permissions (requires database)',
        'GET /api/v1/users/roles/:role/permissions': 'Get role permissions (requires database)',
        'PUT /api/v1/users/roles/:role/permissions': 'Update role permissions (requires database)',
        'GET /api/v1/users/statistics': 'Get user statistics (requires database)',
      },
      demo: {
        'POST /api/v1/demo/login': 'Demo login (works without database) - try admin@hospital.com / admin123',
        'POST /api/v1/demo/register': 'Demo registration (works without database)',
        'GET /api/v1/demo/patients': 'Demo patients list (works without database)',
        'GET /api/v1/demo/service-charges': 'Demo service charges (works without database)',
      },
    },
    internalSystems: {
      imaging: {
        'POST /api/v1/imaging/images/upload': 'Upload medical image to internal PACS',
        'GET /api/v1/imaging/images/:dicomId': 'Get medical image by DICOM ID',
        'GET /api/v1/imaging/patients/:patientId/images': 'Get all images for patient',
        'PUT /api/v1/imaging/images/:dicomId/report': 'Update image report',
        'POST /api/v1/imaging/studies': 'Create imaging study',
        'GET /api/v1/imaging/patients/:patientId/studies': 'Get imaging studies for patient',
        'PUT /api/v1/imaging/studies/:studyId/status': 'Update study status',
        'GET /api/v1/imaging/reports/pending': 'Get pending reports',
      },
      inventory: {
        'POST /api/v1/inventory/items': 'Create inventory item',
        'GET /api/v1/inventory/items': 'Get inventory items',
        'PUT /api/v1/inventory/items/:itemId/stock': 'Update stock levels',
        'GET /api/v1/inventory/items/:itemId/movements': 'Get stock movements',
        'POST /api/v1/inventory/purchase-orders': 'Create purchase order',
        'GET /api/v1/inventory/purchase-orders': 'Get purchase orders',
        'PUT /api/v1/inventory/purchase-orders/:poId/status': 'Update PO status',
        'POST /api/v1/inventory/categories': 'Create inventory category',
        'GET /api/v1/inventory/categories': 'Get inventory categories',
        'GET /api/v1/inventory/alerts/low-stock': 'Get low stock alerts',
      },
      insurance: {
        'POST /api/v1/insurance/eligibility/verify': 'Verify insurance eligibility',
        'POST /api/v1/insurance/claims': 'Submit insurance claim',
        'GET /api/v1/insurance/claims/:claimId/status': 'Get claim status',
        'PUT /api/v1/insurance/claims/:claimId/status': 'Update claim status',
        'POST /api/v1/insurance/preauthorizations': 'Create pre-authorization',
        'PUT /api/v1/insurance/preauthorizations/:authId/status': 'Update pre-auth status',
        'POST /api/v1/insurance/patients/:patientId/insurance': 'Add patient insurance',
        'GET /api/v1/insurance/patients/:patientId/insurance': 'Get patient insurance',
        'POST /api/v1/insurance/companies': 'Create insurance company',
        'GET /api/v1/insurance/companies': 'Get insurance companies',
      },
      hr: {
        'POST /api/v1/hr/employees': 'Create employee record',
        'GET /api/v1/hr/employees': 'Get employees list',
        'GET /api/v1/hr/employees/:employeeId': 'Get employee details',
        'PUT /api/v1/hr/employees/:employeeId': 'Update employee',
        'POST /api/v1/hr/attendance': 'Record attendance',
        'GET /api/v1/hr/employees/:employeeId/attendance': 'Get employee attendance',
        'POST /api/v1/hr/leave-requests': 'Submit leave request',
        'GET /api/v1/hr/leave-requests': 'Get leave requests',
        'PUT /api/v1/hr/leave-requests/:requestId/status': 'Update leave request status',
        'POST /api/v1/hr/departments': 'Create department',
        'GET /api/v1/hr/departments': 'Get departments',
        'POST /api/v1/hr/positions': 'Create position',
        'GET /api/v1/hr/positions': 'Get positions',
        'GET /api/v1/hr/employees/:employeeId/payroll': 'Get employee payroll',
      },
    },
    externalIntegrations: {
      note: 'All external systems are now internal - no external APIs required',
      PACS: 'Picture Archiving and Communication System (internal implementation)',
      'HL7/FHIR': 'Health Level 7 / Fast Healthcare Interoperability Resources (internal implementation)',
      ERP: 'Enterprise Resource Planning - HR and Inventory (internal implementation)',
      Insurance: 'Insurance eligibility verification and claim processing (internal implementation)',
    },
    databaseSetup: {
      note: 'To enable full functionality, set up PostgreSQL and configure the .env file',
      steps: [
        '1. Install PostgreSQL',
        '2. Create database: hospital_management',
        '3. Update .env file with correct database credentials',
        '4. Run: npm run db:generate && npm run db:migrate',
        '5. Optionally run: npm run seed (to create default users)',
      ],
    },
  });
});

export default router;