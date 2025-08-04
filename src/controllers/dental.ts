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
      toothNumber,
      procedure,
      diagnosis,
      treatmentPlan,
      notes,
      cost,
    } = req.body;

    const dentalRecord = await db.insert(dentalRecords).values({
      patientId,
      doctorId: req.user!.id,
      toothNumber,
      procedure,
      diagnosis,
      treatmentPlan,
      notes,
      cost,
      visitDate: new Date(),
    }).returning();

    res.status(201).json(createSuccessResponse(dentalRecord[0], 'Dental record created successfully'));
  } catch (error) {
    console.error('Create dental record error:', error);
    res.status(500).json(createErrorResponse('Failed to create dental record'));
  }
};

export const getDentalRecords = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, page = 1, limit = 10, procedure } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let baseQuery = db.select().from(dentalRecords);

    if (patientId) {
      baseQuery = baseQuery.where(eq(dentalRecords.patientId, patientId as string)) as any;
    }

    if (procedure) {
      baseQuery = baseQuery.where(eq(dentalRecords.procedure, procedure as string)) as any;
    }

    const records = await baseQuery
      .orderBy(desc(dentalRecords.visitDate))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse(records, 'Dental records retrieved successfully'));
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

    res.json(createSuccessResponse(record[0], 'Dental record retrieved successfully'));
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

    res.json(createSuccessResponse(updated[0], 'Dental record updated successfully'));
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
      duration,
      procedure,
      notes,
    } = req.body;

    const appointment = await db.insert(dentalAppointments).values({
      patientId,
      doctorId: req.user!.id,
      appointmentDate: new Date(appointmentDate),
      duration: duration || '30 minutes',
      procedure,
      notes,
      status: 'scheduled',
    }).returning();

    res.status(201).json(createSuccessResponse(appointment[0], 'Dental appointment created successfully'));
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

    res.json(createSuccessResponse(appointments, 'Dental appointments retrieved successfully'));
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

    res.json(createSuccessResponse(updated[0], 'Appointment status updated successfully'));
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
      dentalRecordId,
      xrayType,
      imageUrl,
      dicomId,
      findings,
    } = req.body;

    const xray = await db.insert(dentalXrays).values({
      patientId,
      dentalRecordId,
      xrayType,
      imageUrl,
      dicomId,
      findings,
      radiologistId: req.user!.id,
      takenDate: new Date(),
    }).returning();

    res.status(201).json(createSuccessResponse(xray[0], 'Dental X-ray created successfully'));
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
      query = query.where(eq(dentalXrays.xrayType, xrayType as string));
    }

    const xrays = await query
      .orderBy(desc(dentalXrays.takenDate))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse(xrays, 'Dental X-rays retrieved successfully'));
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
      query = query.where(eq(dentalInventory.category, category as string));
    }

    const inventory = await query.orderBy(asc(dentalInventory.itemName));

    let filteredInventory = inventory;
    if (lowStock === 'true') {
      filteredInventory = inventory.filter(item => {
        const currentStock = parseInt(item.currentStock);
        const minStock = parseInt(item.minStockLevel || '0');
        return currentStock <= minStock;
      });
    }

    res.json(createSuccessResponse(filteredInventory, 'Dental inventory retrieved successfully'));
  } catch (error) {
    console.error('Get dental inventory error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve dental inventory'));
  }
};

export const updateInventoryItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { currentStock, minStockLevel, costPerUnit } = req.body;

    const updated = await db
      .update(dentalInventory)
      .set({
        currentStock: currentStock?.toString(),
        minStockLevel: minStockLevel?.toString(),
        costPerUnit,
        updatedAt: new Date(),
      })
      .where(eq(dentalInventory.id, id))
      .returning();

    if (!updated[0]) {
      return res.status(404).json(createErrorResponse('Inventory item not found'));
    }

    res.json(createSuccessResponse(updated[0], 'Inventory item updated successfully'));
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json(createErrorResponse('Failed to update inventory item'));
  }
};