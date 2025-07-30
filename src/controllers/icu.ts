import { Request, Response } from 'express';
import { AuthenticatedRequest, createSuccessResponse, createErrorResponse } from '../types';
import { db, icuAdmissions, icuMonitoring, icuProcedures, icuDailyReports } from '../db';
import { eq, and, desc, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// ICU Admissions Management
export const createIcuAdmission = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      patientId,
      icuUnitNumber,
      bedNumber,
      admissionReason,
      severity,
      ventilatorRequired,
      isolationRequired,
      expectedDurationDays,
      notes,
    } = req.body;

    const admission = await db.insert(icuAdmissions).values({
      patientId,
      icuUnitNumber,
      bedNumber,
      admissionReason,
      severity: severity || 'critical',
      ventilatorRequired: ventilatorRequired || false,
      isolationRequired: isolationRequired || false,
      expectedDurationDays,
      admissionDate: new Date(),
      status: 'active',
      notes,
    }).returning();

    res.status(201).json(createSuccessResponse('ICU admission created successfully', admission[0]));
  } catch (error) {
    console.error('Create ICU admission error:', error);
    res.status(500).json(createErrorResponse('Failed to create ICU admission'));
  }
};

export const getIcuAdmissions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, status, icuUnitNumber, severity, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select().from(icuAdmissions);

    if (patientId) {
      query = query.where(eq(icuAdmissions.patientId, patientId as string));
    }

    if (status) {
      query = query.where(eq(icuAdmissions.status, status as any));
    }

    if (icuUnitNumber) {
      query = query.where(eq(icuAdmissions.icuUnitNumber, icuUnitNumber as string));
    }

    if (severity) {
      query = query.where(eq(icuAdmissions.severity, severity as any));
    }

    const admissions = await query
      .orderBy(desc(icuAdmissions.admissionDate))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse('ICU admissions retrieved successfully', admissions));
  } catch (error) {
    console.error('Get ICU admissions error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve ICU admissions'));
  }
};

export const getIcuAdmissionById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const admission = await db
      .select()
      .from(icuAdmissions)
      .where(eq(icuAdmissions.id, id))
      .limit(1);

    if (!admission[0]) {
      return res.status(404).json(createErrorResponse('ICU admission not found'));
    }

    res.json(createSuccessResponse('ICU admission retrieved successfully', admission[0]));
  } catch (error) {
    console.error('Get ICU admission error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve ICU admission'));
  }
};

export const updateIcuAdmission = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await db
      .update(icuAdmissions)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(icuAdmissions.id, id))
      .returning();

    if (!updated[0]) {
      return res.status(404).json(createErrorResponse('ICU admission not found'));
    }

    res.json(createSuccessResponse('ICU admission updated successfully', updated[0]));
  } catch (error) {
    console.error('Update ICU admission error:', error);
    res.status(500).json(createErrorResponse('Failed to update ICU admission'));
  }
};

export const dischargeFromIcu = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { dischargeReason, dischargeDestination, dischargeNotes } = req.body;

    const updated = await db
      .update(icuAdmissions)
      .set({
        status: 'discharged',
        dischargeDate: new Date(),
        dischargeReason,
        dischargeDestination,
        dischargeNotes,
        updatedAt: new Date(),
      })
      .where(eq(icuAdmissions.id, id))
      .returning();

    if (!updated[0]) {
      return res.status(404).json(createErrorResponse('ICU admission not found'));
    }

    res.json(createSuccessResponse('Patient discharged from ICU successfully', updated[0]));
  } catch (error) {
    console.error('Discharge from ICU error:', error);
    res.status(500).json(createErrorResponse('Failed to discharge patient from ICU'));
  }
};

// ICU Monitoring Management
export const recordIcuMonitoring = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      patientId,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      heartRate,
      temperature,
      respiratoryRate,
      oxygenSaturation,
      centralVenousPressure,
      intracranialPressure,
      cardiacOutput,
      ventilatorSettings,
      glasgowComaScale,
      notes,
    } = req.body;

    const monitoring = await db.insert(icuMonitoring).values({
      patientId,
      recordedById: req.user!.id,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      heartRate,
      temperature,
      respiratoryRate,
      oxygenSaturation,
      centralVenousPressure,
      intracranialPressure,
      cardiacOutput,
      ventilatorSettings,
      glasgowComaScale,
      notes,
      recordedAt: new Date(),
    }).returning();

    res.status(201).json(createSuccessResponse('ICU monitoring recorded successfully', monitoring[0]));
  } catch (error) {
    console.error('Record ICU monitoring error:', error);
    res.status(500).json(createErrorResponse('Failed to record ICU monitoring'));
  }
};

export const getIcuMonitoring = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, fromDate, toDate, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select().from(icuMonitoring);

    if (patientId) {
      query = query.where(eq(icuMonitoring.patientId, patientId as string));
    }

    const monitoring = await query
      .orderBy(desc(icuMonitoring.recordedAt))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse('ICU monitoring retrieved successfully', monitoring));
  } catch (error) {
    console.error('Get ICU monitoring error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve ICU monitoring'));
  }
};

// ICU Procedures Management
export const recordIcuProcedure = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      patientId,
      procedureName,
      procedureType,
      description,
      performedByDoctorId,
      assistants,
      complications,
      outcome,
      notes,
    } = req.body;

    const procedure = await db.insert(icuProcedures).values({
      patientId,
      procedureName,
      procedureType,
      description,
      performedByDoctorId: performedByDoctorId || req.user!.id,
      assistants,
      complications,
      outcome,
      notes,
      procedureDate: new Date(),
    }).returning();

    res.status(201).json(createSuccessResponse('ICU procedure recorded successfully', procedure[0]));
  } catch (error) {
    console.error('Record ICU procedure error:', error);
    res.status(500).json(createErrorResponse('Failed to record ICU procedure'));
  }
};

export const getIcuProcedures = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, procedureType, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select().from(icuProcedures);

    if (patientId) {
      query = query.where(eq(icuProcedures.patientId, patientId as string));
    }

    if (procedureType) {
      query = query.where(eq(icuProcedures.procedureType, procedureType as any));
    }

    const procedures = await query
      .orderBy(desc(icuProcedures.procedureDate))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse('ICU procedures retrieved successfully', procedures));
  } catch (error) {
    console.error('Get ICU procedures error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve ICU procedures'));
  }
};

// ICU Daily Reports Management
export const createIcuDailyReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      patientId,
      shift,
      generalCondition,
      consciousnessLevel,
      respiratoryStatus,
      cardiovascularStatus,
      neurologyStatus,
      fluidBalance,
      medicationChanges,
      nursingNotes,
      doctorNotes,
      planOfCare,
    } = req.body;

    const report = await db.insert(icuDailyReports).values({
      patientId,
      reportDate: new Date(),
      shift,
      generalCondition,
      consciousnessLevel,
      respiratoryStatus,
      cardiovascularStatus,
      neurologyStatus,
      fluidBalance,
      medicationChanges,
      nursingNotes,
      doctorNotes,
      planOfCare,
      createdById: req.user!.id,
    }).returning();

    res.status(201).json(createSuccessResponse('ICU daily report created successfully', report[0]));
  } catch (error) {
    console.error('Create ICU daily report error:', error);
    res.status(500).json(createErrorResponse('Failed to create ICU daily report'));
  }
};

export const getIcuDailyReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, date, shift, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select().from(icuDailyReports);

    if (patientId) {
      query = query.where(eq(icuDailyReports.patientId, patientId as string));
    }

    if (shift) {
      query = query.where(eq(icuDailyReports.shift, shift as any));
    }

    const reports = await query
      .orderBy(desc(icuDailyReports.reportDate))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse('ICU daily reports retrieved successfully', reports));
  } catch (error) {
    console.error('Get ICU daily reports error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve ICU daily reports'));
  }
};

export const updateIcuDailyReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await db
      .update(icuDailyReports)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(icuDailyReports.id, id))
      .returning();

    if (!updated[0]) {
      return res.status(404).json(createErrorResponse('ICU daily report not found'));
    }

    res.json(createSuccessResponse('ICU daily report updated successfully', updated[0]));
  } catch (error) {
    console.error('Update ICU daily report error:', error);
    res.status(500).json(createErrorResponse('Failed to update ICU daily report'));
  }
};

// ICU Statistics and Dashboard
export const getIcuStatistics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get active admissions count
    const activeAdmissions = await db
      .select()
      .from(icuAdmissions)
      .where(eq(icuAdmissions.status, 'active'));

    // Get admissions by severity
    const severityStats = {
      critical: activeAdmissions.filter(a => a.severity === 'critical').length,
      serious: activeAdmissions.filter(a => a.severity === 'serious').length,
      stable: activeAdmissions.filter(a => a.severity === 'stable').length,
    };

    // Get ventilator usage
    const ventilatorsInUse = activeAdmissions.filter(a => a.ventilatorRequired).length;

    // Get isolation requirements
    const isolationRequired = activeAdmissions.filter(a => a.isolationRequired).length;

    const statistics = {
      totalActiveAdmissions: activeAdmissions.length,
      severityDistribution: severityStats,
      ventilatorsInUse,
      isolationRequired,
      lastUpdated: new Date(),
    };

    res.json(createSuccessResponse('ICU statistics retrieved successfully', statistics));
  } catch (error) {
    console.error('Get ICU statistics error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve ICU statistics'));
  }
};