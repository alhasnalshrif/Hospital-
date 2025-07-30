import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    department: string;
    employeeId: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: any[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PatientSearchParams extends PaginationParams {
  name?: string;
  patientNumber?: string;
  phone?: string;
  nationalId?: string;
  department?: string;
}

export interface AppointmentFilters extends PaginationParams {
  doctorId?: string;
  patientId?: string;
  department?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface BillingFilters extends PaginationParams {
  patientId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  department?: string;
}

export interface VitalSigns {
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  glucoseLevel?: number;
}

export interface MedicationRecord {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
}

export interface ServiceItem {
  serviceCode: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  department: string;
}

export interface ExternalSystemResponse {
  success: boolean;
  data?: any;
  error?: string;
  statusCode?: number;
}

// Helper functions
export const createResponse = <T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string
): ApiResponse<T> => {
  return {
    success,
    data,
    message,
    error,
  };
};

export const createSuccessResponse = <T>(data: T, message?: string): ApiResponse<T> => {
  return createResponse(true, data, message);
};

export const createErrorResponse = (error: string, statusCode?: number): ApiResponse => {
  return createResponse(false, undefined, undefined, error);
};