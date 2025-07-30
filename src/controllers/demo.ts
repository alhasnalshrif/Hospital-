import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse } from '../types';

export const demoLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Demo response without database
    if (email === 'admin@hospital.com' && password === 'admin123') {
      const demoUser = {
        id: 'demo-admin-id',
        employeeId: 'EMP001',
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@hospital.com',
        role: 'admin',
        department: 'administration',
      };

      const demoToken = 'demo-jwt-token-' + Date.now();

      res.json(createSuccessResponse({ 
        user: demoUser, 
        token: demoToken,
        note: 'This is a demo response. Database integration required for full functionality.'
      }, 'Demo login successful'));
    } else {
      return res.status(401).json(createErrorResponse('Invalid credentials (try admin@hospital.com / admin123 for demo)'));
    }
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json(createErrorResponse('Demo login failed'));
  }
};

export const demoRegister = async (req: Request, res: Response) => {
  try {
    const {
      employeeId,
      firstName,
      lastName,
      email,
      role,
      department,
    } = req.body;

    // Demo response without database
    const demoUser = {
      id: 'demo-user-' + Date.now(),
      employeeId,
      firstName,
      lastName,
      email,
      role,
      department,
    };

    res.status(201).json(createSuccessResponse(demoUser, 'Demo user registered successfully (database integration required for persistence)'));
  } catch (error) {
    console.error('Demo registration error:', error);
    res.status(500).json(createErrorResponse('Demo registration failed'));
  }
};

export const demoPatients = async (req: Request, res: Response) => {
  try {
    // Demo patients data
    const demoPatients = [
      {
        id: 'patient-1',
        patientNumber: 'P250001',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-15',
        gender: 'male',
        phone: '123-456-7890',
        age: 35,
      },
      {
        id: 'patient-2',
        patientNumber: 'P250002',
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '1985-05-20',
        gender: 'female',
        phone: '987-654-3210',
        age: 40,
      },
    ];

    res.json(createSuccessResponse({
      patients: demoPatients,
      pagination: { page: 1, limit: 20, total: 2 },
      note: 'This is demo data. Database integration required for real patient management.'
    }));
  } catch (error) {
    console.error('Demo patients error:', error);
    res.status(500).json(createErrorResponse('Demo patients fetch failed'));
  }
};

export const demoServiceCharges = async (req: Request, res: Response) => {
  try {
    // Demo service charges
    const demoServices = [
      { serviceCode: 'DEN001', serviceName: 'Dental Consultation', department: 'dental', basePrice: '100.00' },
      { serviceCode: 'INP001', serviceName: 'Room Charge (General)', department: 'inpatient', basePrice: '300.00' },
      { serviceCode: 'ICU001', serviceName: 'ICU Room Charge', department: 'icu', basePrice: '1000.00' },
      { serviceCode: 'PED001', serviceName: 'Pediatric Consultation', department: 'pediatrics', basePrice: '120.00' },
      { serviceCode: 'PT001', serviceName: 'Physical Therapy Session', department: 'physical_therapy', basePrice: '150.00' },
    ];

    res.json(createSuccessResponse(demoServices));
  } catch (error) {
    console.error('Demo service charges error:', error);
    res.status(500).json(createErrorResponse('Demo service charges fetch failed'));
  }
};