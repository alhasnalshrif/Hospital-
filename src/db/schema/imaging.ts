import { pgTable, text, timestamp, uuid, integer, boolean, json } from 'drizzle-orm/pg-core';
import { patients } from './patients';

// Medical Imaging System (Internal PACS)
export const medicalImages = pgTable('medical_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  dicomId: text('dicom_id').unique().notNull(),
  imageType: text('image_type').notNull(), // 'X-RAY', 'CT', 'MRI', 'ULTRASOUND', etc.
  studyDate: timestamp('study_date').notNull(),
  bodyPart: text('body_part'),
  description: text('description'),
  imageUrl: text('image_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  fileSize: integer('file_size'), // in bytes
  isProcessed: boolean('is_processed').default(false),
  radiologistId: uuid('radiologist_id'),
  findings: text('findings'),
  reportStatus: text('report_status').default('pending'), // 'pending', 'in_progress', 'completed'
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const imagingStudies = pgTable('imaging_studies', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  studyInstanceUID: text('study_instance_uid').unique().notNull(),
  accessionNumber: text('accession_number').unique(),
  studyDescription: text('study_description'),
  modality: text('modality').notNull(), // DICOM modality
  bodyPartExamined: text('body_part_examined'),
  orderingPhysician: text('ordering_physician'),
  performingPhysician: text('performing_physician'),
  institutionName: text('institution_name').default('Hospital'),
  studyDate: timestamp('study_date').notNull(),
  studyTime: text('study_time'),
  numberOfImages: integer('number_of_images').default(0),
  studyStatus: text('study_status').default('scheduled'), // 'scheduled', 'in_progress', 'completed', 'cancelled'
  priority: text('priority').default('routine'), // 'stat', 'urgent', 'routine'
  clinicalHistory: text('clinical_history'),
  studyComments: text('study_comments'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});