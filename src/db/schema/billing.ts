import { pgTable, uuid, varchar, text, timestamp, jsonb, decimal, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { patients } from './patients';

export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'card', 'bank_transfer', 'insurance', 'installment']);
export const billStatusEnum = pgEnum('bill_status', ['pending', 'partial', 'paid', 'overdue', 'cancelled']);
export const serviceTypeEnum = pgEnum('service_type', ['dental', 'inpatient', 'icu', 'pediatrics', 'physical_therapy', 'consultation', 'diagnostic']);

export const bills = pgTable('bills', {
  id: uuid('id').defaultRandom().primaryKey(),
  billNumber: varchar('bill_number', { length: 20 }).unique().notNull(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  visitDate: timestamp('visit_date').notNull(),
  department: varchar('department', { length: 50 }).notNull(),
  services: jsonb('services'), // array of services with details
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).default('0'),
  discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).default('0'),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  insuranceCovered: decimal('insurance_covered', { precision: 12, scale: 2 }).default('0'),
  patientResponsibility: decimal('patient_responsibility', { precision: 12, scale: 2 }).notNull(),
  status: billStatusEnum('status').default('pending'),
  dueDate: timestamp('due_date'),
  generatedById: uuid('generated_by_id').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  billId: uuid('bill_id').references(() => bills.id).notNull(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  paymentDate: timestamp('payment_date').defaultNow(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  transactionReference: varchar('transaction_reference', { length: 100 }),
  cardLast4: varchar('card_last_4', { length: 4 }),
  bankName: varchar('bank_name', { length: 100 }),
  cashierId: uuid('cashier_id').notNull(),
  receiptNumber: varchar('receipt_number', { length: 20 }).unique(),
  notes: text('notes'),
  isRefunded: boolean('is_refunded').default(false),
  refundAmount: decimal('refund_amount', { precision: 12, scale: 2 }),
  refundDate: timestamp('refund_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const serviceCharges = pgTable('service_charges', {
  id: uuid('id').defaultRandom().primaryKey(),
  serviceCode: varchar('service_code', { length: 50 }).unique().notNull(),
  serviceName: varchar('service_name', { length: 100 }).notNull(),
  serviceType: serviceTypeEnum('service_type').notNull(),
  department: varchar('department', { length: 50 }).notNull(),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insuranceClaims = pgTable('insurance_claims', {
  id: uuid('id').defaultRandom().primaryKey(),
  billId: uuid('bill_id').references(() => bills.id).notNull(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  claimNumber: varchar('claim_number', { length: 50 }).unique(),
  insuranceProvider: varchar('insurance_provider', { length: 100 }).notNull(),
  policyNumber: varchar('policy_number', { length: 50 }),
  claimAmount: decimal('claim_amount', { precision: 12, scale: 2 }).notNull(),
  approvedAmount: decimal('approved_amount', { precision: 12, scale: 2 }),
  status: varchar('status', { length: 20 }).default('submitted'), // submitted, approved, denied, partial
  submissionDate: timestamp('submission_date').defaultNow(),
  responseDate: timestamp('response_date'),
  denialReason: text('denial_reason'),
  notes: text('notes'),
  processedById: uuid('processed_by_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const paymentInstallments = pgTable('payment_installments', {
  id: uuid('id').defaultRandom().primaryKey(),
  billId: uuid('bill_id').references(() => bills.id).notNull(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  installmentNumber: varchar('installment_number', { length: 10 }),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  dueDate: timestamp('due_date').notNull(),
  paidDate: timestamp('paid_date'),
  paidAmount: decimal('paid_amount', { precision: 12, scale: 2 }),
  status: varchar('status', { length: 20 }).default('pending'), // pending, paid, overdue
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});