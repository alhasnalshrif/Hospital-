import { pgTable, text, timestamp, uuid, decimal, boolean, json, integer } from 'drizzle-orm/pg-core';
import { patients } from './patients';

// Insurance Companies
export const insuranceCompanies = pgTable('insurance_companies', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  code: text('code').unique().notNull(),
  address: text('address'),
  contactPhone: text('contact_phone'),
  contactEmail: text('contact_email'),
  website: text('website'),
  contractedServices: json('contracted_services'), // List of covered services
  paymentTerms: text('payment_terms'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Patient Insurance Policies
export const patientInsurance = pgTable('patient_insurance', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  companyId: uuid('company_id').references(() => insuranceCompanies.id).notNull(),
  policyNumber: text('policy_number').notNull(),
  groupNumber: text('group_number'),
  policyHolderName: text('policy_holder_name'),
  relationshipToPatient: text('relationship_to_patient').default('self'), // 'self', 'spouse', 'child', 'parent'
  effectiveDate: timestamp('effective_date').notNull(),
  expirationDate: timestamp('expiration_date'),
  isPrimary: boolean('is_primary').default(true),
  coverageType: text('coverage_type'), // 'individual', 'family', 'group'
  deductible: decimal('deductible', { precision: 10, scale: 2 }),
  coPayment: decimal('co_payment', { precision: 8, scale: 2 }),
  outOfPocketMax: decimal('out_of_pocket_max', { precision: 10, scale: 2 }),
  isActive: boolean('is_active').default(true),
  lastVerificationDate: timestamp('last_verification_date'),
  verificationStatus: text('verification_status'), // 'verified', 'pending', 'invalid', 'expired'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Insurance Coverage Benefits
export const insuranceBenefits = pgTable('insurance_benefits', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').references(() => insuranceCompanies.id).notNull(),
  serviceCategory: text('service_category').notNull(), // 'dental', 'inpatient', 'emergency', 'pharmacy', etc.
  serviceCode: text('service_code'), // CPT or procedure code
  isCovered: boolean('is_covered').default(true),
  coveragePercentage: integer('coverage_percentage').default(100),
  copayAmount: decimal('copay_amount', { precision: 8, scale: 2 }),
  deductibleApplies: boolean('deductible_applies').default(false),
  annualLimit: decimal('annual_limit', { precision: 10, scale: 2 }),
  lifetimeLimit: decimal('lifetime_limit', { precision: 12, scale: 2 }),
  priorAuthRequired: boolean('prior_auth_required').default(false),
  waitingPeriodDays: integer('waiting_period_days').default(0),
  effectiveDate: timestamp('effective_date').notNull(),
  expirationDate: timestamp('expiration_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Insurance Claims
export const internalInsuranceClaims = pgTable('internal_insurance_claims', {
  id: uuid('id').defaultRandom().primaryKey(),
  claimNumber: text('claim_number').unique().notNull(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  insuranceId: uuid('insurance_id').references(() => patientInsurance.id).notNull(),
  serviceDate: timestamp('service_date').notNull(),
  submissionDate: timestamp('submission_date').defaultNow(),
  claimType: text('claim_type').notNull(), // 'medical', 'dental', 'pharmacy', 'emergency'
  totalCharges: decimal('total_charges', { precision: 12, scale: 2 }).notNull(),
  allowedAmount: decimal('allowed_amount', { precision: 12, scale: 2 }),
  paidAmount: decimal('paid_amount', { precision: 12, scale: 2 }),
  patientResponsibility: decimal('patient_responsibility', { precision: 10, scale: 2 }),
  deductibleAmount: decimal('deductible_amount', { precision: 10, scale: 2 }),
  copayAmount: decimal('copay_amount', { precision: 8, scale: 2 }),
  status: text('status').default('submitted'), // 'submitted', 'under_review', 'approved', 'denied', 'paid', 'appealed'
  denialReason: text('denial_reason'),
  paymentDate: timestamp('payment_date'),
  checkNumber: text('check_number'),
  eobDate: timestamp('eob_date'), // Explanation of Benefits date
  processingNotes: text('processing_notes'),
  resubmissionCount: integer('resubmission_count').default(0),
  lastStatusUpdate: timestamp('last_status_update').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Claim Line Items
export const claimLineItems = pgTable('claim_line_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  claimId: uuid('claim_id').references(() => internalInsuranceClaims.id).notNull(),
  serviceCode: text('service_code').notNull(), // CPT code
  serviceDescription: text('service_description').notNull(),
  quantity: integer('quantity').default(1),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalCharge: decimal('total_charge', { precision: 10, scale: 2 }).notNull(),
  allowedAmount: decimal('allowed_amount', { precision: 10, scale: 2 }),
  paidAmount: decimal('paid_amount', { precision: 10, scale: 2 }),
  adjustmentAmount: decimal('adjustment_amount', { precision: 10, scale: 2 }),
  reasonCode: text('reason_code'),
  remarkCode: text('remark_code'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Pre-authorization Requests
export const preauthorizations = pgTable('preauthorizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  authNumber: text('auth_number').unique().notNull(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  insuranceId: uuid('insurance_id').references(() => patientInsurance.id).notNull(),
  requestedService: text('requested_service').notNull(),
  serviceCode: text('service_code'),
  estimatedCost: decimal('estimated_cost', { precision: 10, scale: 2 }),
  requestDate: timestamp('request_date').defaultNow(),
  approvalDate: timestamp('approval_date'),
  expirationDate: timestamp('expiration_date'),
  status: text('status').default('pending'), // 'pending', 'approved', 'denied', 'expired'
  approvedUnits: integer('approved_units'),
  usedUnits: integer('used_units').default(0),
  clinicalJustification: text('clinical_justification'),
  denialReason: text('denial_reason'),
  reviewerNotes: text('reviewer_notes'),
  requestedBy: uuid('requested_by'),
  reviewedBy: uuid('reviewed_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Eligibility Verification History
export const eligibilityVerifications = pgTable('eligibility_verifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  insuranceId: uuid('insurance_id').references(() => patientInsurance.id).notNull(),
  verificationDate: timestamp('verification_date').defaultNow(),
  eligibilityStatus: text('eligibility_status').notNull(), // 'active', 'inactive', 'suspended', 'terminated'
  effectiveDate: timestamp('effective_date'),
  terminationDate: timestamp('termination_date'),
  benefitDetails: json('benefit_details'),
  copayInfo: json('copay_info'),
  deductibleInfo: json('deductible_info'),
  verificationMethod: text('verification_method'), // 'online', 'phone', 'fax'
  verifiedBy: uuid('verified_by'),
  responseCode: text('response_code'),
  errorMessage: text('error_message'),
  rawResponse: json('raw_response'),
  createdAt: timestamp('created_at').defaultNow(),
});