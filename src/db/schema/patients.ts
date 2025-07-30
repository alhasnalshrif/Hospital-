import { pgTable, uuid, varchar, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);
export const bloodTypeEnum = pgEnum('blood_type', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);

export const patients = pgTable('patients', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientNumber: varchar('patient_number', { length: 20 }).unique().notNull(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  arabicName: varchar('arabic_name', { length: 100 }),
  dateOfBirth: timestamp('date_of_birth').notNull(),
  gender: genderEnum('gender').notNull(),
  nationalId: varchar('national_id', { length: 20 }).unique(),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 100 }),
  address: text('address'),
  emergencyContact: varchar('emergency_contact', { length: 20 }),
  emergencyContactName: varchar('emergency_contact_name', { length: 100 }),
  bloodType: bloodTypeEnum('blood_type'),
  allergies: text('allergies'),
  medicalHistory: jsonb('medical_history'),
  insuranceProvider: varchar('insurance_provider', { length: 100 }),
  insuranceNumber: varchar('insurance_number', { length: 50 }),
  isActive: varchar('is_active', { length: 10 }).default('true'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const medicalRecords = pgTable('medical_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  visitDate: timestamp('visit_date').defaultNow(),
  chiefComplaint: text('chief_complaint'),
  diagnosis: text('diagnosis'),
  treatment: text('treatment'),
  medications: jsonb('medications'),
  vitalSigns: jsonb('vital_signs'), // {temperature, bp, heart_rate, respiratory_rate}
  notes: text('notes'),
  doctorId: uuid('doctor_id').notNull(), // references users table
  departmentType: varchar('department_type', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});