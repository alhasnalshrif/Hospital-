import { Request, Response } from 'express';
import { AuthenticatedRequest, createSuccessResponse, createErrorResponse } from '../types';
import { db, dentalRecords, dentalAppointments, dentalXrays, dentalInventory } from '../db';
import { eq, and, desc, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Dental Records Management
export const createDentalRecord = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      patientId,
      treatmentType,
      diagnosis,
      treatmentPlan,
      procedures,
      notes,
      toothNumbers,
      materials,
      complications,
    } = req.body;

    const dentalRecord = await db.insert(dentalRecords).values({
      patientId,
      doctorId: req.user!.id,
      treatmentType,
      diagnosis,
      treatmentPlan,
      procedures,
      notes,
      toothNumbers,
      materials,
      complications,
      treatmentDate: new Date(),
    }).returning();

    res.status(201).json(createSuccessResponse('Dental record created successfully', dentalRecord[0]));
  } catch (error) {
    console.error('Create dental record error:', error);
    res.status(500).json(createErrorResponse('Failed to create dental record'));
  }
};

export const getDentalRecords = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, page = 1, limit = 10, treatmentType } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select().from(dentalRecords);

    if (patientId) {
      query = query.where(eq(dentalRecords.patientId, patientId as string));
    }

    if (treatmentType) {
      query = query.where(eq(dentalRecords.treatmentType, treatmentType as any));
    }

    const records = await query
      .orderBy(desc(dentalRecords.treatmentDate))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse('Dental records retrieved successfully', records));
  } catch (error) {
    console.error('Get dental records error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve dental records'));
  }
};

export const getDentalRecordById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const record = await db
      .select()
      .from(dentalRecords)
      .where(eq(dentalRecords.id, id))
      .limit(1);

    if (!record[0]) {
      return res.status(404).json(createErrorResponse('Dental record not found'));
    }

    res.json(createSuccessResponse('Dental record retrieved successfully', record[0]));
  } catch (error) {
    console.error('Get dental record error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve dental record'));
  }
};

export const updateDentalRecord = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await db
      .update(dentalRecords)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(dentalRecords.id, id))
      .returning();

    if (!updated[0]) {
      return res.status(404).json(createErrorResponse('Dental record not found'));
    }

    res.json(createSuccessResponse('Dental record updated successfully', updated[0]));
  } catch (error) {
    console.error('Update dental record error:', error);
    res.status(500).json(createErrorResponse('Failed to update dental record'));
  }
};

// Dental Appointments Management
export const createDentalAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      patientId,
      appointmentDate,
      appointmentTime,
      appointmentType,
      duration,
      notes,
      urgency,
    } = req.body;

    const appointment = await db.insert(dentalAppointments).values({
      patientId,
      doctorId: req.user!.id,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      appointmentType,
      duration,
      notes,
      urgency: urgency || 'normal',
      status: 'scheduled',
    }).returning();

    res.status(201).json(createSuccessResponse('Dental appointment created successfully', appointment[0]));
  } catch (error) {
    console.error('Create dental appointment error:', error);
    res.status(500).json(createErrorResponse('Failed to create dental appointment'));
  }
};

export const getDentalAppointments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, doctorId, date, status, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select().from(dentalAppointments);

    if (patientId) {
      query = query.where(eq(dentalAppointments.patientId, patientId as string));
    }

    if (doctorId) {
      query = query.where(eq(dentalAppointments.doctorId, doctorId as string));
    }

    if (status) {
      query = query.where(eq(dentalAppointments.status, status as any));
    }

    const appointments = await query
      .orderBy(asc(dentalAppointments.appointmentDate))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse('Dental appointments retrieved successfully', appointments));
  } catch (error) {
    console.error('Get dental appointments error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve dental appointments'));
  }
};

export const updateAppointmentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updated = await db
      .update(dentalAppointments)
      .set({
        status,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(dentalAppointments.id, id))
      .returning();

    if (!updated[0]) {
      return res.status(404).json(createErrorResponse('Dental appointment not found'));
    }

    res.json(createSuccessResponse('Appointment status updated successfully', updated[0]));
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json(createErrorResponse('Failed to update appointment status'));
  }
};

// Dental X-rays Management
export const createDentalXray = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      patientId,
      xrayType,
      description,
      imageUrl,
      findings,
      toothNumbers,
    } = req.body;

    const xray = await db.insert(dentalXrays).values({
      patientId,
      doctorId: req.user!.id,
      xrayType,
      description,
      imageUrl,
      findings,
      toothNumbers,
      xrayDate: new Date(),
    }).returning();

    res.status(201).json(createSuccessResponse('Dental X-ray created successfully', xray[0]));
  } catch (error) {
    console.error('Create dental X-ray error:', error);
    res.status(500).json(createErrorResponse('Failed to create dental X-ray'));
  }
};

export const getDentalXrays = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, xrayType, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select().from(dentalXrays);

    if (patientId) {
      query = query.where(eq(dentalXrays.patientId, patientId as string));
    }

    if (xrayType) {
      query = query.where(eq(dentalXrays.xrayType, xrayType as any));
    }

    const xrays = await query
      .orderBy(desc(dentalXrays.xrayDate))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse('Dental X-rays retrieved successfully', xrays));
  } catch (error) {
    console.error('Get dental X-rays error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve dental X-rays'));
  }
};

// Dental Inventory Management
export const getDentalInventory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, lowStock } = req.query;

    let query = db.select().from(dentalInventory);

    if (category) {
      query = query.where(eq(dentalInventory.category, category as any));
    }

    const inventory = await query.orderBy(asc(dentalInventory.itemName));

    let filteredInventory = inventory;
    if (lowStock === 'true') {
      filteredInventory = inventory.filter(item => item.currentStock <= item.minimumStock);
    }

    res.json(createSuccessResponse('Dental inventory retrieved successfully', filteredInventory));
  } catch (error) {
    console.error('Get dental inventory error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve dental inventory'));
  }
};

export const updateInventoryItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { currentStock, notes } = req.body;

    const updated = await db
      .update(dentalInventory)
      .set({
        currentStock,
        notes,
        lastUpdated: new Date(),
      })
      .where(eq(dentalInventory.id, id))
      .returning();

    if (!updated[0]) {
      return res.status(404).json(createErrorResponse('Inventory item not found'));
    }

    res.json(createSuccessResponse('Inventory item updated successfully', updated[0]));
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json(createErrorResponse('Failed to update inventory item'));
  }
};