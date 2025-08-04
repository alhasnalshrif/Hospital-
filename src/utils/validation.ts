import Joi from 'joi';

export const patientValidation = {
  create: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    arabicName: Joi.string().max(100).optional(),
    dateOfBirth: Joi.date().required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    nationalId: Joi.string().max(20).optional(),
    phone: Joi.string().max(20).optional(),
    email: Joi.string().email().max(100).optional(),
    address: Joi.string().max(500).optional(),
    emergencyContact: Joi.string().max(20).optional(),
    emergencyContactName: Joi.string().max(100).optional(),
    bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').optional(),
    allergies: Joi.string().max(500).optional(),
    insuranceProvider: Joi.string().max(100).optional(),
    insuranceNumber: Joi.string().max(50).optional(),
  }),

  update: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    arabicName: Joi.string().max(100).optional(),
    dateOfBirth: Joi.date().optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    nationalId: Joi.string().max(20).optional(),
    phone: Joi.string().max(20).optional(),
    email: Joi.string().email().max(100).optional(),
    address: Joi.string().max(500).optional(),
    emergencyContact: Joi.string().max(20).optional(),
    emergencyContactName: Joi.string().max(100).optional(),
    bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').optional(),
    allergies: Joi.string().max(500).optional(),
    insuranceProvider: Joi.string().max(100).optional(),
    insuranceNumber: Joi.string().max(50).optional(),
  }),
};

export const appointmentValidation = {
  create: Joi.object({
    patientId: Joi.string().uuid().required(),
    doctorId: Joi.string().uuid().required(),
    appointmentDate: Joi.date().required(),
    duration: Joi.string().max(20).optional(),
    department: Joi.string().max(50).required(),
    appointmentType: Joi.string().max(50).optional(),
    notes: Joi.string().max(500).optional(),
  }),

  update: Joi.object({
    appointmentDate: Joi.date().optional(),
    duration: Joi.string().max(20).optional(),
    status: Joi.string().valid('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show').optional(),
    notes: Joi.string().max(500).optional(),
    cancellationReason: Joi.string().max(500).optional(),
  }),
};

export const authValidation = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),

  register: Joi.object({
    employeeId: Joi.string().max(20).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().max(100).required(),
    phone: Joi.string().max(20).optional(),
    role: Joi.string().valid('admin', 'doctor', 'nurse', 'therapist', 'cashier', 'receptionist', 'lab_tech', 'radiologist').required(),
    department: Joi.string().valid('dental', 'inpatient', 'icu', 'pediatrics', 'physical_therapy', 'emergency', 'administration', 'laboratory', 'radiology').required(),
    specialization: Joi.string().max(100).optional(),
    licenseNumber: Joi.string().max(50).optional(),
    password: Joi.string().min(8).required(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
  }),
};

export const billingValidation = {
  create: Joi.object({
    patientId: Joi.string().uuid().required(),
    visitDate: Joi.date().required(),
    department: Joi.string().max(50).required(),
    services: Joi.array().items(
      Joi.object({
        serviceCode: Joi.string().required(),
        serviceName: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        unitPrice: Joi.number().min(0).required(),
      })
    ).required(),
    notes: Joi.string().max(500).optional(),
  }),
};

export const paymentValidation = {
  create: Joi.object({
    billId: Joi.string().uuid().required(),
    amount: Joi.number().min(0.01).required(),
    paymentMethod: Joi.string().valid('cash', 'card', 'bank_transfer', 'insurance').required(),
    transactionReference: Joi.string().max(100).optional(),
    notes: Joi.string().max(500).optional(),
  }),
};