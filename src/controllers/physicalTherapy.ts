import { Request, Response } from 'express';
import { AuthenticatedRequest, createSuccessResponse, createErrorResponse } from '../types';
import { db, physicalTherapyAssessments, therapySessions, therapyEquipment, outcomeEvaluations } from '../db';
import { eq, and, desc, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Physical Therapy Assessments Management
export const createPtAssessment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      patientId,
      referralReason,
      medicalHistory,
      currentCondition,
      painLevel,
      functionalLimitations,
      mobilityLevel,
      balanceAssessment,
      strengthAssessment,
      rangeOfMotion,
      posturalAssessment,
      goals,
      treatmentPlan,
      expectedDuration,
      frequency,
      notes,
    } = req.body;

    const assessment = await db.insert(physicalTherapyAssessments).values({
      patientId,
      therapistId: req.user!.id,
      referralReason,
      medicalHistory,
      currentCondition,
      painLevel,
      functionalLimitations,
      mobilityLevel,
      balanceAssessment,
      strengthAssessment,
      rangeOfMotion,
      posturalAssessment,
      goals,
      treatmentPlan,
      expectedDuration,
      frequency,
      notes,
      assessmentDate: new Date(),
    }).returning();

    res.status(201).json(createSuccessResponse('PT assessment created successfully', assessment[0]));
  } catch (error) {
    console.error('Create PT assessment error:', error);
    res.status(500).json(createErrorResponse('Failed to create PT assessment'));
  }
};

export const getPtAssessments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, therapistId, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select().from(physicalTherapyAssessments);

    if (patientId) {
      query = query.where(eq(physicalTherapyAssessments.patientId, patientId as string));
    }

    if (therapistId) {
      query = query.where(eq(physicalTherapyAssessments.therapistId, therapistId as string));
    }

    const assessments = await query
      .orderBy(desc(physicalTherapyAssessments.assessmentDate))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse('PT assessments retrieved successfully', assessments));
  } catch (error) {
    console.error('Get PT assessments error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve PT assessments'));
  }
};

export const getPtAssessmentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const assessment = await db
      .select()
      .from(physicalTherapyAssessments)
      .where(eq(physicalTherapyAssessments.id, id))
      .limit(1);

    if (!assessment[0]) {
      return res.status(404).json(createErrorResponse('PT assessment not found'));
    }

    res.json(createSuccessResponse('PT assessment retrieved successfully', assessment[0]));
  } catch (error) {
    console.error('Get PT assessment error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve PT assessment'));
  }
};

export const updatePtAssessment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await db
      .update(physicalTherapyAssessments)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(physicalTherapyAssessments.id, id))
      .returning();

    if (!updated[0]) {
      return res.status(404).json(createErrorResponse('PT assessment not found'));
    }

    res.json(createSuccessResponse('PT assessment updated successfully', updated[0]));
  } catch (error) {
    console.error('Update PT assessment error:', error);
    res.status(500).json(createErrorResponse('Failed to update PT assessment'));
  }
};

// Therapy Sessions Management
export const createTherapySession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      patientId,
      assessmentId,
      sessionType,
      duration,
      interventions,
      exercises,
      equipmentUsed,
      painLevelBefore,
      painLevelAfter,
      patientResponse,
      homeExercises,
      nextSessionPlan,
      notes,
    } = req.body;

    const session = await db.insert(therapySessions).values({
      patientId,
      therapistId: req.user!.id,
      assessmentId,
      sessionType,
      sessionDate: new Date(),
      duration,
      interventions,
      exercises,
      equipmentUsed,
      painLevelBefore,
      painLevelAfter,
      patientResponse,
      homeExercises,
      nextSessionPlan,
      notes,
    }).returning();

    res.status(201).json(createSuccessResponse('Therapy session created successfully', session[0]));
  } catch (error) {
    console.error('Create therapy session error:', error);
    res.status(500).json(createErrorResponse('Failed to create therapy session'));
  }
};

export const getTherapySessions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, therapistId, assessmentId, sessionType, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select().from(therapySessions);

    if (patientId) {
      query = query.where(eq(therapySessions.patientId, patientId as string));
    }

    if (therapistId) {
      query = query.where(eq(therapySessions.therapistId, therapistId as string));
    }

    if (assessmentId) {
      query = query.where(eq(therapySessions.assessmentId, assessmentId as string));
    }

    if (sessionType) {
      query = query.where(eq(therapySessions.sessionType, sessionType as any));
    }

    const sessions = await query
      .orderBy(desc(therapySessions.sessionDate))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse('Therapy sessions retrieved successfully', sessions));
  } catch (error) {
    console.error('Get therapy sessions error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve therapy sessions'));
  }
};

export const getTherapySessionById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const session = await db
      .select()
      .from(therapySessions)
      .where(eq(therapySessions.id, id))
      .limit(1);

    if (!session[0]) {
      return res.status(404).json(createErrorResponse('Therapy session not found'));
    }

    res.json(createSuccessResponse('Therapy session retrieved successfully', session[0]));
  } catch (error) {
    console.error('Get therapy session error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve therapy session'));
  }
};

export const updateTherapySession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await db
      .update(therapySessions)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(therapySessions.id, id))
      .returning();

    if (!updated[0]) {
      return res.status(404).json(createErrorResponse('Therapy session not found'));
    }

    res.json(createSuccessResponse('Therapy session updated successfully', updated[0]));
  } catch (error) {
    console.error('Update therapy session error:', error);
    res.status(500).json(createErrorResponse('Failed to update therapy session'));
  }
};

// Equipment Management
export const getTherapyEquipment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, status, location } = req.query;

    let query = db.select().from(therapyEquipment);

    if (category) {
      query = query.where(eq(therapyEquipment.category, category as any));
    }

    if (status) {
      query = query.where(eq(therapyEquipment.status, status as any));
    }

    if (location) {
      query = query.where(eq(therapyEquipment.location, location as string));
    }

    const equipment = await query.orderBy(asc(therapyEquipment.equipmentName));

    res.json(createSuccessResponse('Therapy equipment retrieved successfully', equipment));
  } catch (error) {
    console.error('Get therapy equipment error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve therapy equipment'));
  }
};

export const updateEquipmentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, location, maintenanceNotes } = req.body;

    const updated = await db
      .update(therapyEquipment)
      .set({
        status,
        location,
        maintenanceNotes,
        lastMaintenance: status === 'maintenance' ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(therapyEquipment.id, id))
      .returning();

    if (!updated[0]) {
      return res.status(404).json(createErrorResponse('Equipment not found'));
    }

    res.json(createSuccessResponse('Equipment status updated successfully', updated[0]));
  } catch (error) {
    console.error('Update equipment status error:', error);
    res.status(500).json(createErrorResponse('Failed to update equipment status'));
  }
};

export const getEquipmentMaintenanceSchedule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const equipment = await db
      .select()
      .from(therapyEquipment)
      .orderBy(asc(therapyEquipment.nextMaintenance));

    // Filter equipment that needs maintenance soon (within 30 days)
    const upcomingMaintenance = equipment.filter(eq => {
      if (!eq.nextMaintenance) return false;
      const daysUntilMaintenance = Math.ceil((new Date(eq.nextMaintenance).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilMaintenance <= 30 && daysUntilMaintenance >= 0;
    });

    const overdueMaintenance = equipment.filter(eq => {
      if (!eq.nextMaintenance) return false;
      return new Date(eq.nextMaintenance) < new Date();
    });

    const maintenanceSchedule = {
      upcomingMaintenance,
      overdueMaintenance,
      totalEquipment: equipment.length,
      lastUpdated: new Date(),
    };

    res.json(createSuccessResponse('Equipment maintenance schedule retrieved successfully', maintenanceSchedule));
  } catch (error) {
    console.error('Get equipment maintenance schedule error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve equipment maintenance schedule'));
  }
};

// Outcome Evaluations Management
export const createOutcomeEvaluation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      patientId,
      assessmentId,
      evaluationType,
      painLevelInitial,
      painLevelCurrent,
      functionalScoreInitial,
      functionalScoreCurrent,
      mobilityLevelInitial,
      mobilityLevelCurrent,
      goalsAchieved,
      treatmentEffectiveness,
      patientSatisfaction,
      recommendations,
      dischargePlanning,
      notes,
    } = req.body;

    const evaluation = await db.insert(outcomeEvaluations).values({
      patientId,
      therapistId: req.user!.id,
      assessmentId,
      evaluationType,
      painLevelInitial,
      painLevelCurrent,
      functionalScoreInitial,
      functionalScoreCurrent,
      mobilityLevelInitial,
      mobilityLevelCurrent,
      goalsAchieved,
      treatmentEffectiveness,
      patientSatisfaction,
      recommendations,
      dischargePlanning,
      notes,
      evaluationDate: new Date(),
    }).returning();

    res.status(201).json(createSuccessResponse('Outcome evaluation created successfully', evaluation[0]));
  } catch (error) {
    console.error('Create outcome evaluation error:', error);
    res.status(500).json(createErrorResponse('Failed to create outcome evaluation'));
  }
};

export const getOutcomeEvaluations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, assessmentId, evaluationType, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select().from(outcomeEvaluations);

    if (patientId) {
      query = query.where(eq(outcomeEvaluations.patientId, patientId as string));
    }

    if (assessmentId) {
      query = query.where(eq(outcomeEvaluations.assessmentId, assessmentId as string));
    }

    if (evaluationType) {
      query = query.where(eq(outcomeEvaluations.evaluationType, evaluationType as any));
    }

    const evaluations = await query
      .orderBy(desc(outcomeEvaluations.evaluationDate))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse('Outcome evaluations retrieved successfully', evaluations));
  } catch (error) {
    console.error('Get outcome evaluations error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve outcome evaluations'));
  }
};

export const getOutcomeEvaluationById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const evaluation = await db
      .select()
      .from(outcomeEvaluations)
      .where(eq(outcomeEvaluations.id, id))
      .limit(1);

    if (!evaluation[0]) {
      return res.status(404).json(createErrorResponse('Outcome evaluation not found'));
    }

    res.json(createSuccessResponse('Outcome evaluation retrieved successfully', evaluation[0]));
  } catch (error) {
    console.error('Get outcome evaluation error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve outcome evaluation'));
  }
};

// Physical Therapy Statistics and Reports
export const getPtStatistics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get total assessments and sessions
    const totalAssessments = await db.select().from(physicalTherapyAssessments);
    const totalSessions = await db.select().from(therapySessions);
    const totalEvaluations = await db.select().from(outcomeEvaluations);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentAssessments = totalAssessments.filter(a => new Date(a.assessmentDate) >= thirtyDaysAgo);
    const recentSessions = totalSessions.filter(s => new Date(s.sessionDate) >= thirtyDaysAgo);

    // Get session type distribution
    const sessionTypeDistribution = totalSessions.reduce((acc, session) => {
      acc[session.sessionType] = (acc[session.sessionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average pain improvement
    const evaluationsWithPainData = totalEvaluations.filter(e => 
      e.painLevelInitial !== null && e.painLevelCurrent !== null
    );
    const avgPainImprovement = evaluationsWithPainData.length > 0 ?
      evaluationsWithPainData.reduce((sum, e) => sum + (e.painLevelInitial! - e.painLevelCurrent!), 0) / evaluationsWithPainData.length
      : 0;

    // Calculate treatment effectiveness
    const effectivenessCounts = totalEvaluations.reduce((acc, e) => {
      acc[e.treatmentEffectiveness] = (acc[e.treatmentEffectiveness] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statistics = {
      totalAssessments: totalAssessments.length,
      totalSessions: totalSessions.length,
      totalEvaluations: totalEvaluations.length,
      recentAssessments: recentAssessments.length,
      recentSessions: recentSessions.length,
      sessionTypeDistribution,
      averagePainImprovement: Math.round(avgPainImprovement * 10) / 10,
      treatmentEffectiveness: effectivenessCounts,
      lastUpdated: new Date(),
    };

    res.json(createSuccessResponse('PT statistics retrieved successfully', statistics));
  } catch (error) {
    console.error('Get PT statistics error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve PT statistics'));
  }
};