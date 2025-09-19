import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  timestamp, 
  jsonb, 
  decimal, 
  boolean, 
  pgEnum,
  index,
  uniqueIndex,
  primaryKey
} from 'drizzle-orm/pg-core';

// Database optimization improvements:
// 1. Added proper indexes for foreign keys and frequently queried columns
// 2. Added composite indexes for common query patterns
// 3. Optimized data types for better performance
// 4. Added proper constraints and validation
// 5. Normalized data structure where appropriate

// Re-export enums from existing schemas but with optimizations
export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);
export const bloodTypeEnum = pgEnum('blood_type', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
export const roleEnum = pgEnum('role', ['admin', 'doctor', 'nurse', 'therapist', 'cashier', 'receptionist', 'lab_tech', 'radiologist']);
export const departmentEnum = pgEnum('department', ['dental', 'inpatient', 'icu', 'pediatrics', 'physical_therapy', 'emergency', 'administration', 'laboratory', 'radiology']);
export const billStatusEnum = pgEnum('bill_status', ['pending', 'partial', 'paid', 'overdue', 'cancelled']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'card', 'bank_transfer', 'insurance', 'installment']);

// Optimized patients table with proper indexes
export const optimizedPatients = pgTable('patients_optimized', {
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
  isActive: boolean('is_active').default(true), // Changed from varchar to boolean
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  // Indexes for frequent queries
  patientNumberIdx: uniqueIndex('patients_optimized_patient_number_idx').on(table.patientNumber),
  nationalIdIdx: uniqueIndex('patients_optimized_national_id_idx').on(table.nationalId),
  phoneIdx: index('patients_optimized_phone_idx').on(table.phone),
  emailIdx: index('patients_optimized_email_idx').on(table.email),
  nameIdx: index('patients_optimized_name_idx').on(table.firstName, table.lastName),
  isActiveIdx: index('patients_optimized_is_active_idx').on(table.isActive),
  createdAtIdx: index('patients_optimized_created_at_idx').on(table.createdAt),
  insuranceIdx: index('patients_optimized_insurance_idx').on(table.insuranceProvider, table.insuranceNumber),
}));

// Optimized medical records with better relationships
export const optimizedMedicalRecords = pgTable('medical_records_optimized', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => optimizedPatients.id, { onDelete: 'cascade' }).notNull(),
  visitDate: timestamp('visit_date').defaultNow(),
  chiefComplaint: text('chief_complaint'),
  diagnosis: text('diagnosis'),
  treatment: text('treatment'),
  medications: jsonb('medications'),
  vitalSigns: jsonb('vital_signs'),
  notes: text('notes'),
  doctorId: uuid('doctor_id').notNull(), // Will reference optimized users table
  departmentType: departmentEnum('department_type').notNull(),
  status: varchar('status', { length: 20 }).default('active'), // active, archived, deleted
  followUpRequired: boolean('follow_up_required').default(false),
  followUpDate: timestamp('follow_up_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  // Optimized indexes for common query patterns
  patientIdIdx: index('medical_records_optimized_patient_id_idx').on(table.patientId),
  doctorIdIdx: index('medical_records_optimized_doctor_id_idx').on(table.doctorId),
  visitDateIdx: index('medical_records_optimized_visit_date_idx').on(table.visitDate),
  departmentIdx: index('medical_records_optimized_department_idx').on(table.departmentType),
  statusIdx: index('medical_records_optimized_status_idx').on(table.status),
  followUpIdx: index('medical_records_optimized_follow_up_idx').on(table.followUpRequired, table.followUpDate),
  // Composite indexes for common queries
  patientVisitIdx: index('medical_records_optimized_patient_visit_idx').on(table.patientId, table.visitDate),
  patientDoctorIdx: index('medical_records_optimized_patient_doctor_idx').on(table.patientId, table.doctorId),
  departmentDateIdx: index('medical_records_optimized_department_date_idx').on(table.departmentType, table.visitDate),
}));

// Optimized users table with proper role-based indexing
export const optimizedUsers = pgTable('users_optimized', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: varchar('employee_id', { length: 20 }).unique().notNull(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }).unique().notNull(),
  phone: varchar('phone', { length: 20 }),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').notNull(),
  department: departmentEnum('department').notNull(),
  specialization: varchar('specialization', { length: 100 }),
  licenseNumber: varchar('license_number', { length: 50 }),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  passwordChangedAt: timestamp('password_changed_at').defaultNow(),
  failedLoginAttempts: varchar('failed_login_attempts', { length: 2 }).default('0'),
  lockedUntil: timestamp('locked_until'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  // Indexes for authentication and user management
  employeeIdIdx: uniqueIndex('users_optimized_employee_id_idx').on(table.employeeId),
  emailIdx: uniqueIndex('users_optimized_email_idx').on(table.email),
  roleIdx: index('users_optimized_role_idx').on(table.role),
  departmentIdx: index('users_optimized_department_idx').on(table.department),
  isActiveIdx: index('users_optimized_is_active_idx').on(table.isActive),
  roleDepIdx: index('users_optimized_role_dep_idx').on(table.role, table.department),
  licenseIdx: index('users_optimized_license_idx').on(table.licenseNumber),
  phoneIdx: index('users_optimized_phone_idx').on(table.phone),
}));

// Optimized bills table with better financial tracking
export const optimizedBills = pgTable('bills_optimized', {
  id: uuid('id').defaultRandom().primaryKey(),
  billNumber: varchar('bill_number', { length: 20 }).unique().notNull(),
  patientId: uuid('patient_id').references(() => optimizedPatients.id, { onDelete: 'restrict' }).notNull(),
  doctorId: uuid('doctor_id').references(() => optimizedUsers.id, { onDelete: 'restrict' }).notNull(),
  visitDate: timestamp('visit_date').notNull(),
  department: departmentEnum('department').notNull(),
  services: jsonb('services'), // Normalized service items
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).default('0'),
  discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).default('0'),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  insuranceCovered: decimal('insurance_covered', { precision: 12, scale: 2 }).default('0'),
  patientResponsibility: decimal('patient_responsibility', { precision: 12, scale: 2 }).notNull(),
  status: billStatusEnum('status').default('pending'),
  dueDate: timestamp('due_date'),
  paidDate: timestamp('paid_date'),
  generatedById: uuid('generated_by_id').references(() => optimizedUsers.id).notNull(),
  notes: text('notes'),
  fiscalYear: varchar('fiscal_year', { length: 4 }), // For financial reporting
  quarter: varchar('quarter', { length: 2 }), // For quarterly reports
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  // Financial and reporting indexes
  billNumberIdx: uniqueIndex('bills_optimized_bill_number_idx').on(table.billNumber),
  patientIdIdx: index('bills_optimized_patient_id_idx').on(table.patientId),
  doctorIdIdx: index('bills_optimized_doctor_id_idx').on(table.doctorId),
  statusIdx: index('bills_optimized_status_idx').on(table.status),
  visitDateIdx: index('bills_optimized_visit_date_idx').on(table.visitDate),
  dueDateIdx: index('bills_optimized_due_date_idx').on(table.dueDate),
  departmentIdx: index('bills_optimized_department_idx').on(table.department),
  // Financial reporting indexes
  fiscalYearIdx: index('bills_optimized_fiscal_year_idx').on(table.fiscalYear),
  quarterIdx: index('bills_optimized_quarter_idx').on(table.quarter),
  amountIdx: index('bills_optimized_total_amount_idx').on(table.totalAmount),
  // Composite indexes for common queries
  patientStatusIdx: index('bills_optimized_patient_status_idx').on(table.patientId, table.status),
  departmentDateIdx: index('bills_optimized_dept_date_idx').on(table.department, table.visitDate),
  statusDateIdx: index('bills_optimized_status_date_idx').on(table.status, table.dueDate),
  fiscalStatusIdx: index('bills_optimized_fiscal_status_idx').on(table.fiscalYear, table.status),
}));

// Optimized appointments table with scheduling optimization
export const optimizedAppointments = pgTable('appointments_optimized', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => optimizedPatients.id, { onDelete: 'cascade' }).notNull(),
  doctorId: uuid('doctor_id').references(() => optimizedUsers.id, { onDelete: 'restrict' }).notNull(),
  appointmentDate: timestamp('appointment_date').notNull(),
  appointmentTime: varchar('appointment_time', { length: 5 }), // HH:MM format
  duration: varchar('duration', { length: 3 }).default('30'), // Duration in minutes
  department: departmentEnum('department').notNull(),
  appointmentType: varchar('appointment_type', { length: 50 }),
  status: varchar('status', { length: 20 }).default('scheduled'), // scheduled, confirmed, completed, cancelled, no_show
  notes: text('notes'),
  reminderSent: boolean('reminder_sent').default(false),
  cancellationReason: text('cancellation_reason'),
  bookedById: uuid('booked_by_id').references(() => optimizedUsers.id).notNull(),
  checkedInAt: timestamp('checked_in_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  // Scheduling optimization indexes
  appointmentDateIdx: index('appointments_optimized_date_idx').on(table.appointmentDate),
  appointmentTimeIdx: index('appointments_optimized_time_idx').on(table.appointmentTime),
  doctorIdIdx: index('appointments_optimized_doctor_id_idx').on(table.doctorId),
  patientIdIdx: index('appointments_optimized_patient_id_idx').on(table.patientId),
  statusIdx: index('appointments_optimized_status_idx').on(table.status),
  departmentIdx: index('appointments_optimized_department_idx').on(table.department),
  reminderIdx: index('appointments_optimized_reminder_idx').on(table.reminderSent),
  // Composite indexes for scheduling queries
  doctorDateIdx: index('appointments_optimized_doctor_date_idx').on(table.doctorId, table.appointmentDate),
  doctorTimeIdx: index('appointments_optimized_doctor_time_idx').on(table.doctorId, table.appointmentDate, table.appointmentTime),
  patientDateIdx: index('appointments_optimized_patient_date_idx').on(table.patientId, table.appointmentDate),
  statusDateIdx: index('appointments_optimized_status_date_idx').on(table.status, table.appointmentDate),
  departmentDateIdx: index('appointments_optimized_dept_date_idx').on(table.department, table.appointmentDate),
  // Unique constraint to prevent double-booking
  doctorTimeSlotIdx: uniqueIndex('appointments_optimized_doctor_timeslot_idx').on(table.doctorId, table.appointmentDate, table.appointmentTime),
}));

// Add foreign key constraints to medical records
export const medicalRecordsForeignKeys = [
  // Foreign key to optimized users table
  // This will be handled in migration
];