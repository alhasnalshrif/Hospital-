import { pgTable, uuid, varchar, text, timestamp, jsonb, decimal, boolean } from 'drizzle-orm/pg-core';
import { patients } from './patients';

export const dentalRecords = pgTable('dental_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  visitDate: timestamp('visit_date').defaultNow(),
  toothNumber: varchar('tooth_number', { length: 10 }),
  procedure: varchar('procedure', { length: 100 }).notNull(),
  diagnosis: text('diagnosis'),
  treatmentPlan: text('treatment_plan'),
  notes: text('notes'),
  cost: decimal('cost', { precision: 10, scale: 2 }),
  doctorId: uuid('doctor_id').notNull(),
  isCompleted: boolean('is_completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const dentalXrays = pgTable('dental_xrays', {
  id: uuid('id').defaultRandom().primaryKey(),
  dentalRecordId: uuid('dental_record_id').references(() => dentalRecords.id),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  xrayType: varchar('xray_type', { length: 50 }), // panoramic, bitewing, periapical
  imageUrl: text('image_url'), // PACS integration
  dicomId: varchar('dicom_id', { length: 100 }),
  findings: text('findings'),
  radiologistId: uuid('radiologist_id'),
  takenDate: timestamp('taken_date').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const dentalAppointments = pgTable('dental_appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  doctorId: uuid('doctor_id').notNull(),
  appointmentDate: timestamp('appointment_date').notNull(),
  duration: varchar('duration', { length: 20 }).default('30 minutes'),
  procedure: varchar('procedure', { length: 100 }),
  status: varchar('status', { length: 20 }).default('scheduled'), // scheduled, confirmed, completed, cancelled
  notes: text('notes'),
  reminderSent: boolean('reminder_sent').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const dentalInventory = pgTable('dental_inventory', {
  id: uuid('id').defaultRandom().primaryKey(),
  itemName: varchar('item_name', { length: 100 }).notNull(),
  itemCode: varchar('item_code', { length: 50 }).unique().notNull(),
  category: varchar('category', { length: 50 }), // filling_materials, anesthetics, instruments
  currentStock: varchar('current_stock', { length: 20 }).notNull(),
  minStockLevel: varchar('min_stock_level', { length: 20 }),
  unit: varchar('unit', { length: 20 }), // pieces, ml, grams
  costPerUnit: decimal('cost_per_unit', { precision: 10, scale: 2 }),
  supplier: varchar('supplier', { length: 100 }),
  expiryDate: timestamp('expiry_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});