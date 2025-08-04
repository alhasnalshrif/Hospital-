import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { patients } from './patients';

export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  doctorId: uuid('doctor_id').notNull(),
  appointmentDate: timestamp('appointment_date').notNull(),
  appointmentTime: varchar('appointment_time', { length: 10 }),
  duration: varchar('duration', { length: 20 }).default('30 minutes'),
  department: varchar('department', { length: 50 }).notNull(),
  appointmentType: varchar('appointment_type', { length: 50 }),
  status: varchar('status', { length: 20 }).default('scheduled'), // scheduled, confirmed, completed, cancelled, no_show
  notes: text('notes'),
  reminderSent: boolean('reminder_sent').default(false),
  cancellationReason: text('cancellation_reason'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  recipientId: uuid('recipient_id').notNull(), // user or patient id
  recipientType: varchar('recipient_type', { length: 20 }).notNull(), // user, patient
  type: varchar('type', { length: 50 }).notNull(), // appointment_reminder, test_result, billing, etc.
  title: varchar('title', { length: 200 }).notNull(),
  message: text('message').notNull(),
  channel: varchar('channel', { length: 20 }).notNull(), // email, sms, in_app
  isRead: boolean('is_read').default(false),
  isSent: boolean('is_sent').default(false),
  sentAt: timestamp('sent_at'),
  metadata: jsonb('metadata'), // additional data like appointment id, bill id, etc.
  createdAt: timestamp('created_at').defaultNow(),
});

export const communicationPreferences = pgTable('communication_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  emailNotifications: boolean('email_notifications').default(true),
  smsNotifications: boolean('sms_notifications').default(true),
  appointmentReminders: boolean('appointment_reminders').default(true),
  testResultNotifications: boolean('test_result_notifications').default(true),
  billingNotifications: boolean('billing_notifications').default(true),
  marketingCommunications: boolean('marketing_communications').default(false),
  preferredLanguage: varchar('preferred_language', { length: 10 }).default('en'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const internalMessages = pgTable('internal_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  senderId: uuid('sender_id').notNull(), // user id
  recipientId: uuid('recipient_id').notNull(), // user id
  subject: varchar('subject', { length: 200 }),
  message: text('message').notNull(),
  priority: varchar('priority', { length: 20 }).default('normal'), // low, normal, high, urgent
  isRead: boolean('is_read').default(false),
  patientId: uuid('patient_id').references(() => patients.id), // if message is about a patient
  departmentId: varchar('department_id', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const emergencyContacts = pgTable('emergency_contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  contactType: varchar('contact_type', { length: 50 }).notNull(), // security, fire, police, poison_control
  name: varchar('name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});