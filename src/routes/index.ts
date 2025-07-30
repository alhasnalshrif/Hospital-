import { Router } from 'express';
import authRoutes from './auth';
import patientRoutes from './patients';
import billingRoutes from './billing';
import demoRoutes from './demo';

const router = Router();

// API version prefix
const API_VERSION = '/api/v1';

// Route mounting
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/patients`, patientRoutes);
router.use(`${API_VERSION}/billing`, billingRoutes);
router.use(`${API_VERSION}/demo`, demoRoutes);

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
      demo: {
        'POST /api/v1/demo/login': 'Demo login (works without database) - try admin@hospital.com / admin123',
        'POST /api/v1/demo/register': 'Demo registration (works without database)',
        'GET /api/v1/demo/patients': 'Demo patients list (works without database)',
        'GET /api/v1/demo/service-charges': 'Demo service charges (works without database)',
      },
    },
    externalIntegrations: {
      PACS: 'Picture Archiving and Communication System (implemented as service stubs)',
      'HL7/FHIR': 'Health Level 7 / Fast Healthcare Interoperability Resources (implemented as service stubs)',
      ERP: 'Enterprise Resource Planning (implemented as service stubs)',
      Insurance: 'Insurance claim processing (implemented as service stubs)',
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