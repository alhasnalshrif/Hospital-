import { pgTable, uuid, varchar, text, timestamp, jsonb, decimal, boolean } from 'drizzle-orm/pg-core';
import { patients } from './patients';

export const physicalTherapyAssessments = pgTable('pt_assessments', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  assessmentDate: timestamp('assessment_date').defaultNow(),
  referringDoctorId: uuid('referring_doctor_id').notNull(),
  therapistId: uuid('therapist_id').notNull(),
  chiefComplaint: text('chief_complaint'),
  historyOfPresentIllness: text('history_of_present_illness'),
  pastMedicalHistory: text('past_medical_history'),
  functionalLimitations: text('functional_limitations'),
  goals: text('goals'),
  physicalExamination: jsonb('physical_examination'),
  treatmentPlan: text('treatment_plan'),
  estimatedDuration: varchar('estimated_duration', { length: 50 }),
  frequency: varchar('frequency', { length: 50 }), // 3x week, daily, etc.
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const therapySessions = pgTable('therapy_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  assessmentId: uuid('assessment_id').references(() => physicalTherapyAssessments.id).notNull(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  sessionDate: timestamp('session_date').defaultNow(),
  sessionNumber: varchar('session_number', { length: 10 }),
  therapistId: uuid('therapist_id').notNull(),
  duration: varchar('duration', { length: 20 }), // in minutes
  treatmentProvided: text('treatment_provided'),
  exercises: jsonb('exercises'), // array of exercises with reps/sets
  patientResponse: text('patient_response'),
  painLevel: varchar('pain_level', { length: 10 }), // 1-10 scale
  functionalProgress: text('functional_progress'),
  homeExercises: text('home_exercises'),
  nextSessionPlan: text('next_session_plan'),
  status: varchar('status', { length: 20 }).default('completed'), // completed, cancelled, no_show
  cost: decimal('cost', { precision: 8, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const therapyAppointments = pgTable('therapy_appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  therapistId: uuid('therapist_id').notNull(),
  appointmentDate: timestamp('appointment_date').notNull(),
  duration: varchar('duration', { length: 20 }).default('60 minutes'),
  appointmentType: varchar('appointment_type', { length: 50 }), // initial_eval, treatment, re_eval
  status: varchar('status', { length: 20 }).default('scheduled'),
  notes: text('notes'),
  reminderSent: boolean('reminder_sent').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const therapyEquipment = pgTable('therapy_equipment', {
  id: uuid('id').defaultRandom().primaryKey(),
  equipmentName: varchar('equipment_name', { length: 100 }).notNull(),
  equipmentCode: varchar('equipment_code', { length: 50 }).unique(),
  category: varchar('category', { length: 50 }), // exercise, modality, assessment
  description: text('description'),
  status: varchar('status', { length: 20 }).default('available'), // available, in_use, maintenance
  location: varchar('location', { length: 100 }),
  acquisitionDate: timestamp('acquisition_date'),
  lastMaintenanceDate: timestamp('last_maintenance_date'),
  nextMaintenanceDate: timestamp('next_maintenance_date'),
  cost: decimal('cost', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const therapyOutcomes = pgTable('therapy_outcomes', {
  id: uuid('id').defaultRandom().primaryKey(),
  assessmentId: uuid('assessment_id').references(() => physicalTherapyAssessments.id).notNull(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  evaluationDate: timestamp('evaluation_date').defaultNow(),
  therapistId: uuid('therapist_id').notNull(),
  totalSessions: varchar('total_sessions', { length: 10 }),
  goalsAchieved: jsonb('goals_achieved'),
  functionalImprovements: text('functional_improvements'),
  painLevelImprovement: varchar('pain_level_improvement', { length: 50 }),
  overallOutcome: varchar('overall_outcome', { length: 50 }), // excellent, good, fair, poor
  dischargeReason: varchar('discharge_reason', { length: 100 }),
  recommendations: text('recommendations'),
  homeExerciseProgram: text('home_exercise_program'),
  followUpRequired: boolean('follow_up_required').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});