import { pgTable, uuid, varchar, text, timestamp, jsonb, decimal, boolean } from 'drizzle-orm/pg-core';
import { patients } from './patients';
import { inpatientAdmissions } from './inpatient';

export const icuAdmissions = pgTable('icu_admissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  admissionId: uuid('admission_id').references(() => inpatientAdmissions.id),
  icuAdmissionDate: timestamp('icu_admission_date').defaultNow(),
  icuDischargeDate: timestamp('icu_discharge_date'),
  severity: varchar('severity', { length: 20 }), // critical, severe, moderate
  ventilatorSupport: boolean('ventilator_support').default(false),
  dialysisRequired: boolean('dialysis_required').default(false),
  attendingDoctorId: uuid('attending_doctor_id').notNull(),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const icuVitals = pgTable('icu_vitals', {
  id: uuid('id').defaultRandom().primaryKey(),
  icuAdmissionId: uuid('icu_admission_id').references(() => icuAdmissions.id).notNull(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  recordedAt: timestamp('recorded_at').defaultNow(),
  temperature: decimal('temperature', { precision: 4, scale: 1 }),
  bloodPressureSystolic: varchar('blood_pressure_systolic', { length: 10 }),
  bloodPressureDiastolic: varchar('blood_pressure_diastolic', { length: 10 }),
  heartRate: varchar('heart_rate', { length: 10 }),
  respiratoryRate: varchar('respiratory_rate', { length: 10 }),
  oxygenSaturation: varchar('oxygen_saturation', { length: 10 }),
  glucoseLevel: varchar('glucose_level', { length: 10 }),
  intracranialPressure: varchar('intracranial_pressure', { length: 10 }),
  centralVenousPressure: varchar('central_venous_pressure', { length: 10 }),
  urineOutput: varchar('urine_output', { length: 10 }),
  ventilatorSettings: jsonb('ventilator_settings'),
  nurseId: uuid('nurse_id').notNull(),
  deviceData: jsonb('device_data'), // integrated from monitoring devices
  createdAt: timestamp('created_at').defaultNow(),
});

export const icuProcedures = pgTable('icu_procedures', {
  id: uuid('id').defaultRandom().primaryKey(),
  icuAdmissionId: uuid('icu_admission_id').references(() => icuAdmissions.id).notNull(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  procedureDate: timestamp('procedure_date').defaultNow(),
  procedureName: varchar('procedure_name', { length: 100 }).notNull(),
  description: text('description'),
  performedById: uuid('performed_by_id').notNull(),
  assistantIds: jsonb('assistant_ids'), // array of user IDs
  complications: text('complications'),
  outcome: text('outcome'),
  cost: decimal('cost', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const icuDailyReports = pgTable('icu_daily_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  icuAdmissionId: uuid('icu_admission_id').references(() => icuAdmissions.id).notNull(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  reportDate: timestamp('report_date').defaultNow(),
  overallCondition: varchar('overall_condition', { length: 50 }),
  consciousness: varchar('consciousness', { length: 50 }),
  clinicalNotes: text('clinical_notes'),
  treatmentPlan: text('treatment_plan'),
  medications: jsonb('medications'),
  procedures: jsonb('procedures'),
  doctorId: uuid('doctor_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});