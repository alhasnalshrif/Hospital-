import { pgTable, uuid, varchar, text, timestamp, jsonb, decimal, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { patients } from './patients';

export const bedStatusEnum = pgEnum('bed_status', ['available', 'occupied', 'reserved', 'maintenance']);
export const bedTypeEnum = pgEnum('bed_type', ['general', 'icu', 'pediatric', 'maternity']);

export const beds = pgTable('beds', {
  id: uuid('id').defaultRandom().primaryKey(),
  bedNumber: varchar('bed_number', { length: 20 }).unique().notNull(),
  department: varchar('department', { length: 50 }).notNull(),
  bedType: bedTypeEnum('bed_type').notNull(),
  roomNumber: varchar('room_number', { length: 20 }),
  floor: varchar('floor', { length: 10 }),
  status: bedStatusEnum('status').default('available'),
  dailyRate: decimal('daily_rate', { precision: 10, scale: 2 }),
  features: jsonb('features'), // oxygen, monitor, etc.
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const inpatientAdmissions = pgTable('inpatient_admissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  bedId: uuid('bed_id').references(() => beds.id).notNull(),
  admissionDate: timestamp('admission_date').defaultNow(),
  dischargeDate: timestamp('discharge_date'),
  admittingDoctorId: uuid('admitting_doctor_id').notNull(),
  attendingDoctorId: uuid('attending_doctor_id').notNull(),
  department: varchar('department', { length: 50 }).notNull(),
  admissionReason: text('admission_reason'),
  diagnosis: text('diagnosis'),
  dischargeSummary: text('discharge_summary'),
  status: varchar('status', { length: 20 }).default('active'), // active, discharged, transferred
  totalCost: decimal('total_cost', { precision: 12, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const inpatientVitals = pgTable('inpatient_vitals', {
  id: uuid('id').defaultRandom().primaryKey(),
  admissionId: uuid('admission_id').references(() => inpatientAdmissions.id).notNull(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  recordedAt: timestamp('recorded_at').defaultNow(),
  temperature: decimal('temperature', { precision: 4, scale: 1 }),
  bloodPressureSystolic: varchar('blood_pressure_systolic', { length: 10 }),
  bloodPressureDiastolic: varchar('blood_pressure_diastolic', { length: 10 }),
  heartRate: varchar('heart_rate', { length: 10 }),
  respiratoryRate: varchar('respiratory_rate', { length: 10 }),
  oxygenSaturation: varchar('oxygen_saturation', { length: 10 }),
  glucoseLevel: varchar('glucose_level', { length: 10 }),
  notes: text('notes'),
  nurseId: uuid('nurse_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const inpatientMedications = pgTable('inpatient_medications', {
  id: uuid('id').defaultRandom().primaryKey(),
  admissionId: uuid('admission_id').references(() => inpatientAdmissions.id).notNull(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  medicationName: varchar('medication_name', { length: 100 }).notNull(),
  dosage: varchar('dosage', { length: 50 }),
  frequency: varchar('frequency', { length: 50 }),
  route: varchar('route', { length: 50 }), // oral, IV, IM, etc.
  startDate: timestamp('start_date').defaultNow(),
  endDate: timestamp('end_date'),
  prescribedById: uuid('prescribed_by_id').notNull(),
  administeredById: uuid('administered_by_id'),
  administeredAt: timestamp('administered_at'),
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});