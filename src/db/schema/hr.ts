import { pgTable, text, timestamp, uuid, boolean, json, decimal, integer } from 'drizzle-orm/pg-core';

// Employee Management (HR/ERP System)
export const departments = pgTable('departments', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  code: text('code').unique().notNull(),
  description: text('description'),
  headOfDepartment: uuid('head_of_department'),
  location: text('location'),
  budget: decimal('budget', { precision: 12, scale: 2 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const positions = pgTable('positions', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  code: text('code').unique().notNull(),
  departmentId: uuid('department_id').references(() => departments.id),
  jobDescription: text('job_description'),
  requirements: json('requirements'),
  minSalary: decimal('min_salary', { precision: 10, scale: 2 }),
  maxSalary: decimal('max_salary', { precision: 10, scale: 2 }),
  salaryGrade: text('salary_grade'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const employees = pgTable('employees', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: text('employee_id').unique().notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  middleName: text('middle_name'),
  email: text('email').unique().notNull(),
  phone: text('phone'),
  dateOfBirth: timestamp('date_of_birth'),
  gender: text('gender'),
  address: json('address'),
  emergencyContact: json('emergency_contact'),
  nationalId: text('national_id').unique(),
  passportNumber: text('passport_number'),
  departmentId: uuid('department_id').references(() => departments.id),
  positionId: uuid('position_id').references(() => positions.id),
  hireDate: timestamp('hire_date').notNull(),
  terminationDate: timestamp('termination_date'),
  employmentStatus: text('employment_status').default('active'), // 'active', 'inactive', 'terminated', 'suspended'
  employmentType: text('employment_type').default('full_time'), // 'full_time', 'part_time', 'contract', 'intern'
  workSchedule: json('work_schedule'),
  supervisor: uuid('supervisor'),
  baseSalary: decimal('base_salary', { precision: 10, scale: 2 }),
  allowances: json('allowances'),
  bankAccount: json('bank_account'),
  taxInformation: json('tax_information'),
  licenseNumbers: json('license_numbers'), // Professional licenses
  certifications: json('certifications'),
  skills: json('skills'),
  performanceRating: text('performance_rating'),
  lastReviewDate: timestamp('last_review_date'),
  nextReviewDate: timestamp('next_review_date'),
  profilePicture: text('profile_picture'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const employeeAttendance = pgTable('employee_attendance', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id').references(() => employees.id).notNull(),
  attendanceDate: timestamp('attendance_date').notNull(),
  checkInTime: timestamp('check_in_time'),
  checkOutTime: timestamp('check_out_time'),
  totalHours: decimal('total_hours', { precision: 4, scale: 2 }),
  regularHours: decimal('regular_hours', { precision: 4, scale: 2 }),
  overtimeHours: decimal('overtime_hours', { precision: 4, scale: 2 }),
  breakHours: decimal('break_hours', { precision: 4, scale: 2 }),
  attendanceStatus: text('attendance_status'), // 'present', 'absent', 'late', 'half_day', 'sick_leave', 'vacation'
  notes: text('notes'),
  approvedBy: uuid('approved_by'),
  isManualEntry: boolean('is_manual_entry').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const leaveTypes = pgTable('leave_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  code: text('code').unique().notNull(),
  description: text('description'),
  maxDaysPerYear: integer('max_days_per_year'),
  carryForward: boolean('carry_forward').default(false),
  isPaid: boolean('is_paid').default(true),
  requiresApproval: boolean('requires_approval').default(true),
  advanceNoticeRequired: integer('advance_notice_required').default(1), // days
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const leaveRequests = pgTable('leave_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id').references(() => employees.id).notNull(),
  leaveTypeId: uuid('leave_type_id').references(() => leaveTypes.id).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  totalDays: integer('total_days').notNull(),
  reason: text('reason'),
  emergencyContact: json('emergency_contact'),
  requestDate: timestamp('request_date').defaultNow(),
  status: text('status').default('pending'), // 'pending', 'approved', 'rejected', 'cancelled'
  approvedBy: uuid('approved_by'),
  approvalDate: timestamp('approval_date'),
  rejectionReason: text('rejection_reason'),
  comments: text('comments'),
  handoverNotes: text('handover_notes'),
  coveringEmployee: uuid('covering_employee'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const payrollPeriods = pgTable('payroll_periods', {
  id: uuid('id').defaultRandom().primaryKey(),
  periodName: text('period_name').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  payDate: timestamp('pay_date').notNull(),
  status: text('status').default('draft'), // 'draft', 'calculated', 'approved', 'paid', 'closed'
  totalEmployees: integer('total_employees'),
  totalGrossPay: decimal('total_gross_pay', { precision: 15, scale: 2 }),
  totalDeductions: decimal('total_deductions', { precision: 15, scale: 2 }),
  totalNetPay: decimal('total_net_pay', { precision: 15, scale: 2 }),
  processedBy: uuid('processed_by'),
  approvedBy: uuid('approved_by'),
  processedDate: timestamp('processed_date'),
  approvalDate: timestamp('approval_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const payrollEntries = pgTable('payroll_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  periodId: uuid('period_id').references(() => payrollPeriods.id).notNull(),
  employeeId: uuid('employee_id').references(() => employees.id).notNull(),
  baseSalary: decimal('base_salary', { precision: 10, scale: 2 }).notNull(),
  allowances: json('allowances'),
  overtime: decimal('overtime', { precision: 8, scale: 2 }),
  bonuses: decimal('bonuses', { precision: 8, scale: 2 }),
  grossPay: decimal('gross_pay', { precision: 10, scale: 2 }).notNull(),
  taxDeduction: decimal('tax_deduction', { precision: 8, scale: 2 }),
  socialSecurityDeduction: decimal('social_security_deduction', { precision: 8, scale: 2 }),
  otherDeductions: json('other_deductions'),
  totalDeductions: decimal('total_deductions', { precision: 8, scale: 2 }),
  netPay: decimal('net_pay', { precision: 10, scale: 2 }).notNull(),
  workingDays: integer('working_days'),
  absentDays: integer('absent_days'),
  overtimeHours: decimal('overtime_hours', { precision: 5, scale: 2 }),
  paymentMethod: text('payment_method').default('bank_transfer'), // 'bank_transfer', 'cash', 'check'
  paymentReference: text('payment_reference'),
  paymentDate: timestamp('payment_date'),
  comments: text('comments'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const employeeDocuments = pgTable('employee_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id').references(() => employees.id).notNull(),
  documentType: text('document_type').notNull(), // 'contract', 'id_copy', 'certificate', 'license', 'performance_review'
  documentName: text('document_name').notNull(),
  documentPath: text('document_path').notNull(),
  uploadDate: timestamp('upload_date').defaultNow(),
  expiryDate: timestamp('expiry_date'),
  isConfidential: boolean('is_confidential').default(false),
  uploadedBy: uuid('uploaded_by'),
  documentSize: integer('document_size'), // in bytes
  mimeType: text('mime_type'),
  checksum: text('checksum'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});