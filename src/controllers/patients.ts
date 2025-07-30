import { Request, Response } from 'express';
import { db, patients, medicalRecords } from '../db';
import { eq, ilike, and, or, desc } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, AuthenticatedRequest, PatientSearchParams } from '../types';
import { generatePatientNumber, calculateAge } from '../utils/helpers';

export const createPatient = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const patientData = req.body;
    const patientNumber = generatePatientNumber();

    const newPatient = await db
      .insert(patients)
      .values({
        ...patientData,
        patientNumber,
      })
      .returning();

    res.status(201).json(createSuccessResponse(newPatient[0], 'Patient created successfully'));
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json(createErrorResponse('Failed to create patient'));
  }
};

export const getPatients = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      name,
      patientNumber,
      phone,
      nationalId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    }: PatientSearchParams = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    let whereConditions = [];
    
    if (name) {
      whereConditions.push(
        or(
          ilike(patients.firstName, `%${name}%`),
          ilike(patients.lastName, `%${name}%`),
          ilike(patients.arabicName, `%${name}%`)
        )
      );
    }
    
    if (patientNumber) {
      whereConditions.push(ilike(patients.patientNumber, `%${patientNumber}%`));
    }
    
    if (phone) {
      whereConditions.push(ilike(patients.phone, `%${phone}%`));
    }
    
    if (nationalId) {
      whereConditions.push(ilike(patients.nationalId, `%${nationalId}%`));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const patientList = await db
      .select({
        id: patients.id,
        patientNumber: patients.patientNumber,
        firstName: patients.firstName,
        lastName: patients.lastName,
        arabicName: patients.arabicName,
        dateOfBirth: patients.dateOfBirth,
        gender: patients.gender,
        phone: patients.phone,
        email: patients.email,
        bloodType: patients.bloodType,
        createdAt: patients.createdAt,
      })
      .from(patients)
      .where(whereClause)
      .orderBy(sortOrder === 'desc' ? desc(patients.createdAt) : patients.createdAt)
      .limit(Number(limit))
      .offset(offset);

    // Add age calculation
    const patientsWithAge = patientList.map(patient => ({
      ...patient,
      age: calculateAge(patient.dateOfBirth),
    }));

    res.json(createSuccessResponse({
      patients: patientsWithAge,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: patientList.length,
      },
    }));
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json(createErrorResponse('Failed to get patients'));
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const patient = await db
      .select()
      .from(patients)
      .where(eq(patients.id, id))
      .limit(1);

    if (!patient[0]) {
      return res.status(404).json(createErrorResponse('Patient not found'));
    }

    // Get recent medical records
    const recentRecords = await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.patientId, id))
      .orderBy(desc(medicalRecords.visitDate))
      .limit(10);

    const patientWithAge = {
      ...patient[0],
      age: calculateAge(patient[0].dateOfBirth),
      recentMedicalRecords: recentRecords,
    };

    res.json(createSuccessResponse(patientWithAge));
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json(createErrorResponse('Failed to get patient'));
  }
};

export const updatePatient = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPatient = await db
      .update(patients)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(patients.id, id))
      .returning();

    if (!updatedPatient[0]) {
      return res.status(404).json(createErrorResponse('Patient not found'));
    }

    res.json(createSuccessResponse(updatedPatient[0], 'Patient updated successfully'));
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json(createErrorResponse('Failed to update patient'));
  }
};

export const deletePatient = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Soft delete by setting isActive to false
    const deletedPatient = await db
      .update(patients)
      .set({
        isActive: 'false',
        updatedAt: new Date(),
      })
      .where(eq(patients.id, id))
      .returning();

    if (!deletedPatient[0]) {
      return res.status(404).json(createErrorResponse('Patient not found'));
    }

    res.json(createSuccessResponse(null, 'Patient deleted successfully'));
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json(createErrorResponse('Failed to delete patient'));
  }
};

export const addMedicalRecord = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const recordData = req.body;

    const newRecord = await db
      .insert(medicalRecords)
      .values({
        ...recordData,
        patientId: id,
        doctorId: req.user!.id,
      })
      .returning();

    res.status(201).json(createSuccessResponse(newRecord[0], 'Medical record added successfully'));
  } catch (error) {
    console.error('Add medical record error:', error);
    res.status(500).json(createErrorResponse('Failed to add medical record'));
  }
};

export const getMedicalRecords = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const records = await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.patientId, id))
      .orderBy(desc(medicalRecords.visitDate))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse({
      records,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: records.length,
      },
    }));
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json(createErrorResponse('Failed to get medical records'));
  }
};