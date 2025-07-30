import { Request, Response } from 'express';
import { AuthenticatedRequest, createSuccessResponse, createErrorResponse } from '../types';
import { db, inpatientAdmissions, bedAllocations, vitalSigns, medicationRecords } from '../db';
import { eq, and, desc, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Inpatient Admissions Management
export const createInpatientAdmission = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      patientId,
      roomNumber,
      bedNumber,
      admissionReason,
      admittingDoctorId,
      expectedDurationDays,
      severity,
      notes,
    } = req.body;

    const admission = await db.insert(inpatientAdmissions).values({
      patientId,
      roomNumber,
      bedNumber,
      admissionReason,
      admittingDoctorId: admittingDoctorId || req.user!.id,
      admissionDate: new Date(),
      expectedDurationDays,
      severity: severity || 'moderate',
      status: 'active',
      notes,
    }).returning();

    // Also create bed allocation record
    await db.insert(bedAllocations).values({
      patientId,
      roomNumber,
      bedNumber,
      allocationDate: new Date(),
      status: 'occupied',
      notes: `Allocated for admission: ${admission[0].id}`,
    });

    res.status(201).json(createSuccessResponse('Inpatient admission created successfully', admission[0]));
  } catch (error) {
    console.error('Create inpatient admission error:', error);
    res.status(500).json(createErrorResponse('Failed to create inpatient admission'));
  }
};

export const getInpatientAdmissions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, status, roomNumber, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select().from(inpatientAdmissions);

    if (patientId) {
      query = query.where(eq(inpatientAdmissions.patientId, patientId as string));
    }

    if (status) {
      query = query.where(eq(inpatientAdmissions.status, status as any));
    }

    if (roomNumber) {
      query = query.where(eq(inpatientAdmissions.roomNumber, roomNumber as string));
    }

    const admissions = await query
      .orderBy(desc(inpatientAdmissions.admissionDate))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse('Inpatient admissions retrieved successfully', admissions));
  } catch (error) {
    console.error('Get inpatient admissions error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve inpatient admissions'));
  }
};

export const getInpatientAdmissionById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const admission = await db
      .select()
      .from(inpatientAdmissions)
      .where(eq(inpatientAdmissions.id, id))
      .limit(1);

    if (!admission[0]) {
      return res.status(404).json(createErrorResponse('Inpatient admission not found'));
    }

    res.json(createSuccessResponse('Inpatient admission retrieved successfully', admission[0]));
  } catch (error) {
    console.error('Get inpatient admission error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve inpatient admission'));
  }
};

export const updateInpatientAdmission = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await db
      .update(inpatientAdmissions)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(inpatientAdmissions.id, id))
      .returning();

    if (!updated[0]) {
      return res.status(404).json(createErrorResponse('Inpatient admission not found'));
    }

    res.json(createSuccessResponse('Inpatient admission updated successfully', updated[0]));
  } catch (error) {
    console.error('Update inpatient admission error:', error);
    res.status(500).json(createErrorResponse('Failed to update inpatient admission'));
  }
};

export const dischargeInpatient = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { dischargeNotes, dischargeInstructions } = req.body;

    // Update admission status
    const updated = await db
      .update(inpatientAdmissions)
      .set({
        status: 'discharged',
        dischargeDate: new Date(),
        dischargeNotes,
        dischargeInstructions,
        updatedAt: new Date(),
      })
      .where(eq(inpatientAdmissions.id, id))
      .returning();

    if (!updated[0]) {
      return res.status(404).json(createErrorResponse('Inpatient admission not found'));
    }

    // Free up the bed
    await db
      .update(bedAllocations)
      .set({
        status: 'available',
        deallocatedDate: new Date(),
        notes: `Discharged from admission: ${id}`,
      })
      .where(
        and(
          eq(bedAllocations.patientId, updated[0].patientId),
          eq(bedAllocations.roomNumber, updated[0].roomNumber),
          eq(bedAllocations.bedNumber, updated[0].bedNumber),
          eq(bedAllocations.status, 'occupied')
        )
      );

    res.json(createSuccessResponse('Patient discharged successfully', updated[0]));
  } catch (error) {
    console.error('Discharge inpatient error:', error);
    res.status(500).json(createErrorResponse('Failed to discharge patient'));
  }
};

// Bed Management
export const getBedAllocations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roomNumber, status, patientId } = req.query;

    let query = db.select().from(bedAllocations);

    if (roomNumber) {
      query = query.where(eq(bedAllocations.roomNumber, roomNumber as string));
    }

    if (status) {
      query = query.where(eq(bedAllocations.status, status as any));
    }

    if (patientId) {
      query = query.where(eq(bedAllocations.patientId, patientId as string));
    }

    const allocations = await query.orderBy(asc(bedAllocations.roomNumber), asc(bedAllocations.bedNumber));

    res.json(createSuccessResponse('Bed allocations retrieved successfully', allocations));
  } catch (error) {
    console.error('Get bed allocations error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve bed allocations'));
  }
};

export const getAvailableBeds = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const availableBeds = await db
      .select()
      .from(bedAllocations)
      .where(eq(bedAllocations.status, 'available'))
      .orderBy(asc(bedAllocations.roomNumber), asc(bedAllocations.bedNumber));

    res.json(createSuccessResponse('Available beds retrieved successfully', availableBeds));
  } catch (error) {
    console.error('Get available beds error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve available beds'));
  }
};

// Vital Signs Management
export const recordVitalSigns = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      patientId,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      heartRate,
      temperature,
      respiratoryRate,
      oxygenSaturation,
      notes,
    } = req.body;

    const vitalSign = await db.insert(vitalSigns).values({
      patientId,
      recordedById: req.user!.id,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      heartRate,
      temperature,
      respiratoryRate,
      oxygenSaturation,
      notes,
      recordedAt: new Date(),
    }).returning();

    res.status(201).json(createSuccessResponse('Vital signs recorded successfully', vitalSign[0]));
  } catch (error) {
    console.error('Record vital signs error:', error);
    res.status(500).json(createErrorResponse('Failed to record vital signs'));
  }
};

export const getVitalSigns = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, fromDate, toDate, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select().from(vitalSigns);

    if (patientId) {
      query = query.where(eq(vitalSigns.patientId, patientId as string));
    }

    const vitals = await query
      .orderBy(desc(vitalSigns.recordedAt))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse('Vital signs retrieved successfully', vitals));
  } catch (error) {
    console.error('Get vital signs error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve vital signs'));
  }
};

// Medication Management
export const recordMedication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      patientId,
      medicationName,
      dosage,
      frequency,
      route,
      startDate,
      endDate,
      prescribedBy,
      notes,
    } = req.body;

    const medication = await db.insert(medicationRecords).values({
      patientId,
      medicationName,
      dosage,
      frequency,
      route,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      prescribedBy: prescribedBy || req.user!.id,
      administeredBy: req.user!.id,
      status: 'active',
      notes,
    }).returning();

    res.status(201).json(createSuccessResponse('Medication recorded successfully', medication[0]));
  } catch (error) {
    console.error('Record medication error:', error);
    res.status(500).json(createErrorResponse('Failed to record medication'));
  }
};

export const getMedicationRecords = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, status, medicationName, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select().from(medicationRecords);

    if (patientId) {
      query = query.where(eq(medicationRecords.patientId, patientId as string));
    }

    if (status) {
      query = query.where(eq(medicationRecords.status, status as any));
    }

    const medications = await query
      .orderBy(desc(medicationRecords.createdAt))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse('Medication records retrieved successfully', medications));
  } catch (error) {
    console.error('Get medication records error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve medication records'));
  }
};

export const updateMedicationStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updated = await db
      .update(medicationRecords)
      .set({
        status,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(medicationRecords.id, id))
      .returning();

    if (!updated[0]) {
      return res.status(404).json(createErrorResponse('Medication record not found'));
    }

    res.json(createSuccessResponse('Medication status updated successfully', updated[0]));
  } catch (error) {
    console.error('Update medication status error:', error);
    res.status(500).json(createErrorResponse('Failed to update medication status'));
  }
};