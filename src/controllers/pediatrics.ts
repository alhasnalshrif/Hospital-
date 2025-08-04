import { Request, Response } from 'express';
import { AuthenticatedRequest, createSuccessResponse, createErrorResponse } from '../types';
import { db, pediatricRecords, vaccinations, growthCharts, developmentalMilestones } from '../db';
import { eq, and, desc, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Pediatric Records Management
export const createPediatricRecord = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      patientId,
      birthWeight,
      birthLength,
      gestation,
      birthComplications,
      feedingType,
      allergies,
      parentGuardianInfo,
      notes,
    } = req.body;

    const record = await db.insert(pediatricRecords).values({
      patientId,
      birthWeight,
      birthLength,
      gestation,
      birthComplications,
      feedingType,
      allergies,
      parentGuardianInfo,
      notes,
      createdById: req.user!.id,
    }).returning();

    res.status(201).json(createSuccessResponse(record[0], 'Pediatric record created successfully'));
  } catch (error) {
    console.error('Create pediatric record error:', error);
    res.status(500).json(createErrorResponse('Failed to create pediatric record'));
  }
};

export const getPediatricRecords = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select().from(pediatricRecords);

    if (patientId) {
      query = query.where(eq(pediatricRecords.patientId, patientId as string));
    }

    const records = await query
      .orderBy(desc(pediatricRecords.createdAt))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse(records, 'Pediatric records retrieved successfully'));
  } catch (error) {
    console.error('Get pediatric records error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve pediatric records'));
  }
};

export const getPediatricRecordById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const record = await db
      .select()
      .from(pediatricRecords)
      .where(eq(pediatricRecords.id, id))
      .limit(1);

    if (!record[0]) {
      return res.status(404).json(createErrorResponse('Pediatric record not found'));
    }

    res.json(createSuccessResponse(record[0], 'Pediatric record retrieved successfully'));
  } catch (error) {
    console.error('Get pediatric record error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve pediatric record'));
  }
};

export const updatePediatricRecord = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await db
      .update(pediatricRecords)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(pediatricRecords.id, id))
      .returning();

    if (!updated[0]) {
      return res.status(404).json(createErrorResponse('Pediatric record not found'));
    }

    res.json(createSuccessResponse(updated[0], 'Pediatric record updated successfully'));
  } catch (error) {
    console.error('Update pediatric record error:', error);
    res.status(500).json(createErrorResponse('Failed to update pediatric record'));
  }
};

// Vaccination Management
export const recordVaccination = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      patientId,
      vaccineName,
      vaccineType,
      manufacturer,
      batchNumber,
      dosage,
      administrationSite,
      nextDueDate,
      reactions,
      notes,
    } = req.body;

    const vaccination = await db.insert(vaccinations).values({
      patientId,
      vaccineName,
      vaccineType,
      manufacturer,
      batchNumber,
      dosage,
      administeredDate: new Date(),
      administeredById: req.user!.id,
      administrationSite,
      nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
      reactions,
      notes,
    }).returning();

    res.status(201).json(createSuccessResponse(vaccination[0], 'Vaccination recorded successfully'));
  } catch (error) {
    console.error('Record vaccination error:', error);
    res.status(500).json(createErrorResponse('Failed to record vaccination'));
  }
};

export const getVaccinations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, vaccineType, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select().from(vaccinations);

    if (patientId) {
      query = query.where(eq(vaccinations.patientId, patientId as string));
    }

    if (vaccineType) {
      query = query.where(eq(vaccinations.vaccineType, vaccineType as any));
    }

    const vaccinationRecords = await query
      .orderBy(desc(vaccinations.administeredDate))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse(vaccinationRecords, 'Vaccinations retrieved successfully'));
  } catch (error) {
    console.error('Get vaccinations error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve vaccinations'));
  }
};

export const getVaccinationById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const vaccination = await db
      .select()
      .from(vaccinations)
      .where(eq(vaccinations.id, id))
      .limit(1);

    if (!vaccination[0]) {
      return res.status(404).json(createErrorResponse('Vaccination record not found'));
    }

    res.json(createSuccessResponse(vaccination[0], 'Vaccination retrieved successfully'));
  } catch (error) {
    console.error('Get vaccination error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve vaccination'));
  }
};

export const getUpcomingVaccinations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, daysAhead = 30 } = req.query;
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Number(daysAhead));

    let query = db
      .select()
      .from(vaccinations)
      .where(
        and(
          patientId ? eq(vaccinations.patientId, patientId as string) : undefined
        )
      );

    const upcomingVaccinations = await query
      .orderBy(asc(vaccinations.nextDueDate));

    // Filter for upcoming dates (can't use database date functions in this simple setup)
    const upcoming = upcomingVaccinations.filter(v => 
      v.nextDueDate && 
      new Date(v.nextDueDate) >= new Date() && 
      new Date(v.nextDueDate) <= futureDate
    );

    res.json(createSuccessResponse(upcoming, 'Upcoming vaccinations retrieved successfully'));
  } catch (error) {
    console.error('Get upcoming vaccinations error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve upcoming vaccinations'));
  }
};

// Growth Chart Management
export const recordGrowthMeasurement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      patientId,
      age,
      weight,
      height,
      headCircumference,
      bmi,
      weightPercentile,
      heightPercentile,
      bmiPercentile,
      notes,
    } = req.body;

    const measurement = await db.insert(growthCharts).values({
      patientId,
      age,
      weight,
      height,
      headCircumference,
      bmi,
      weightPercentile,
      heightPercentile,
      bmiPercentile,
      notes,
      measurementDate: new Date(),
      recordedById: req.user!.id,
    }).returning();

    res.status(201).json(createSuccessResponse(measurement[0], 'Growth measurement recorded successfully'));
  } catch (error) {
    console.error('Record growth measurement error:', error);
    res.status(500).json(createErrorResponse('Failed to record growth measurement'));
  }
};

export const getGrowthCharts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, fromDate, toDate, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select().from(growthCharts);

    if (patientId) {
      query = query.where(eq(growthCharts.patientId, patientId as string));
    }

    const charts = await query
      .orderBy(asc(growthCharts.measurementDate))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse(charts, 'Growth charts retrieved successfully'));
  } catch (error) {
    console.error('Get growth charts error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve growth charts'));
  }
};

export const getLatestGrowthMeasurement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId } = req.params;

    const latest = await db
      .select()
      .from(growthCharts)
      .where(eq(growthCharts.patientId, patientId))
      .orderBy(desc(growthCharts.measurementDate))
      .limit(1);

    if (!latest[0]) {
      return res.status(404).json(createErrorResponse('No growth measurements found'));
    }

    res.json(createSuccessResponse(latest[0], 'Latest growth measurement retrieved successfully'));
  } catch (error) {
    console.error('Get latest growth measurement error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve latest growth measurement'));
  }
};

// Developmental Milestones Management
export const recordDevelopmentalMilestone = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      patientId,
      milestoneCategory,
      milestoneDescription,
      expectedAge,
      achievedAge,
      status,
      notes,
    } = req.body;

    const milestone = await db.insert(developmentalMilestones).values({
      patientId,
      milestoneCategory,
      milestoneDescription,
      expectedAge,
      achievedAge,
      status,
      notes,
      assessmentDate: new Date(),
      recordedById: req.user!.id,
    }).returning();

    res.status(201).json(createSuccessResponse(milestone[0], 'Developmental milestone recorded successfully'));
  } catch (error) {
    console.error('Record developmental milestone error:', error);
    res.status(500).json(createErrorResponse('Failed to record developmental milestone'));
  }
};

export const getDevelopmentalMilestones = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, category, status, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select().from(developmentalMilestones);

    if (patientId) {
      query = query.where(eq(developmentalMilestones.patientId, patientId as string));
    }

    if (category) {
      query = query.where(eq(developmentalMilestones.milestoneCategory, category as any));
    }

    if (status) {
      query = query.where(eq(developmentalMilestones.status, status as any));
    }

    const milestones = await query
      .orderBy(asc(developmentalMilestones.expectedAge))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse(milestones, 'Developmental milestones retrieved successfully'));
  } catch (error) {
    console.error('Get developmental milestones error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve developmental milestones'));
  }
};

export const updateDevelopmentalMilestone = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { achievedAge, status, notes } = req.body;

    const updated = await db
      .update(developmentalMilestones)
      .set({
        achievedAge,
        status,
        notes,
        assessmentDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(developmentalMilestones.id, id))
      .returning();

    if (!updated[0]) {
      return res.status(404).json(createErrorResponse('Developmental milestone not found'));
    }

    res.json(createSuccessResponse(updated[0], 'Developmental milestone updated successfully'));
  } catch (error) {
    console.error('Update developmental milestone error:', error);
    res.status(500).json(createErrorResponse('Failed to update developmental milestone'));
  }
};

// Pediatric Statistics and Reports
export const getPediatricStatistics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get total pediatric patients (this would require a join with patients table in real implementation)
    const totalRecords = await db.select().from(pediatricRecords);
    
    // Get vaccination statistics
    const totalVaccinations = await db.select().from(vaccinations);
    const recentVaccinations = totalVaccinations.filter(v => 
      new Date(v.administeredDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    // Get milestone statistics
    const totalMilestones = await db.select().from(developmentalMilestones);
    const achievedMilestones = totalMilestones.filter(m => m.status === 'achieved');
    const delayedMilestones = totalMilestones.filter(m => m.status === 'delayed');

    const statistics = {
      totalPediatricRecords: totalRecords.length,
      totalVaccinations: totalVaccinations.length,
      recentVaccinations: recentVaccinations.length,
      totalMilestones: totalMilestones.length,
      achievedMilestones: achievedMilestones.length,
      delayedMilestones: delayedMilestones.length,
      milestoneAchievementRate: totalMilestones.length > 0 ? 
        (achievedMilestones.length / totalMilestones.length * 100).toFixed(1) : '0',
      lastUpdated: new Date(),
    };

    res.json(createSuccessResponse(statistics, 'Pediatric statistics retrieved successfully'));
  } catch (error) {
    console.error('Get pediatric statistics error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve pediatric statistics'));
  }
};