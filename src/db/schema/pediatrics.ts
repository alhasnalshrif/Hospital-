import { pgTable, uuid, varchar, text, timestamp, jsonb, decimal, boolean } from 'drizzle-orm/pg-core';
import { patients } from './patients';

export const pediatricRecords = pgTable('pediatric_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  birthWeight: decimal('birth_weight', { precision: 5, scale: 2 }), // in kg
  birthLength: decimal('birth_length', { precision: 5, scale: 2 }), // in cm
  gestationalAge: varchar('gestational_age', { length: 20 }),
  deliveryType: varchar('delivery_type', { length: 50 }), // normal, c-section
  motherCondition: text('mother_condition'),
  fatherInfo: jsonb('father_info'),
  motherInfo: jsonb('mother_info'),
  pediatricianId: uuid('pediatrician_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const vaccinations = pgTable('vaccinations', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  vaccineName: varchar('vaccine_name', { length: 100 }).notNull(),
  vaccineCode: varchar('vaccine_code', { length: 20 }),
  scheduledDate: timestamp('scheduled_date'),
  administeredDate: timestamp('administered_date'),
  doseNumber: varchar('dose_number', { length: 10 }), // 1st, 2nd, 3rd, booster
  batchNumber: varchar('batch_number', { length: 50 }),
  manufacturer: varchar('manufacturer', { length: 100 }),
  administeredById: uuid('administered_by_id'),
  site: varchar('site', { length: 50 }), // left arm, right arm, thigh
  reaction: text('reaction'),
  nextDueDate: timestamp('next_due_date'),
  reminderSent: boolean('reminder_sent').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const growthCharts = pgTable('growth_charts', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  recordDate: timestamp('record_date').defaultNow(),
  age: varchar('age', { length: 20 }), // in months
  weight: decimal('weight', { precision: 5, scale: 2 }), // in kg
  height: decimal('height', { precision: 5, scale: 2 }), // in cm
  headCircumference: decimal('head_circumference', { precision: 5, scale: 2 }),
  weightPercentile: varchar('weight_percentile', { length: 10 }),
  heightPercentile: varchar('height_percentile', { length: 10 }),
  bmi: decimal('bmi', { precision: 5, scale: 2 }),
  bmiPercentile: varchar('bmi_percentile', { length: 10 }),
  notes: text('notes'),
  recordedById: uuid('recorded_by_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const pediatricAppointments = pgTable('pediatric_appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  doctorId: uuid('doctor_id').notNull(),
  appointmentDate: timestamp('appointment_date').notNull(),
  appointmentType: varchar('appointment_type', { length: 50 }), // checkup, vaccination, sick_visit
  purpose: varchar('purpose', { length: 100 }),
  status: varchar('status', { length: 20 }).default('scheduled'),
  notes: text('notes'),
  reminderSent: boolean('reminder_sent').default(false),
  parentGuardian: varchar('parent_guardian', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const developmentalMilestones = pgTable('developmental_milestones', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  assessmentDate: timestamp('assessment_date').defaultNow(),
  ageAtAssessment: varchar('age_at_assessment', { length: 20 }),
  motorSkills: jsonb('motor_skills'),
  languageSkills: jsonb('language_skills'),
  socialSkills: jsonb('social_skills'),
  cognitiveSkills: jsonb('cognitive_skills'),
  concerns: text('concerns'),
  recommendations: text('recommendations'),
  assessorId: uuid('assessor_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});