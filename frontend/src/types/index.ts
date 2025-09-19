// Type definitions for the Hospital Management System frontend
// Optimized for type safety and developer experience

// API Response Types
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

export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// User and Authentication Types
export interface User {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  department: Department;
  specialization?: string;
  licenseNumber?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 
  | 'admin' 
  | 'doctor' 
  | 'nurse' 
  | 'therapist' 
  | 'cashier' 
  | 'receptionist' 
  | 'lab_tech' 
  | 'radiologist';

export type Department = 
  | 'dental' 
  | 'inpatient' 
  | 'icu' 
  | 'pediatrics' 
  | 'physical_therapy' 
  | 'emergency' 
  | 'administration' 
  | 'laboratory' 
  | 'radiology';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Patient Types
export interface Patient {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  arabicName?: string;
  dateOfBirth: Date;
  age?: number;
  gender: 'male' | 'female' | 'other';
  nationalId?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  bloodType?: BloodType;
  allergies?: string;
  medicalHistory?: any;
  insuranceProvider?: string;
  insuranceNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface PatientFilters extends PaginationParams {
  name?: string;
  patientNumber?: string;
  phone?: string;
  nationalId?: string;
  department?: string;
  isActive?: boolean;
  ageMin?: number;
  ageMax?: number;
  bloodType?: BloodType;
  hasInsurance?: boolean;
}

export interface CreatePatientData {
  firstName: string;
  lastName: string;
  arabicName?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  nationalId?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  bloodType?: BloodType;
  allergies?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
}

// Medical Records Types
export interface MedicalRecord {
  id: string;
  patientId: string;
  visitDate: Date;
  chiefComplaint?: string;
  diagnosis?: string;
  treatment?: string;
  medications?: Medication[];
  vitalSigns?: VitalSigns;
  notes?: string;
  doctorId: string;
  departmentType: Department;
  status: 'active' | 'archived' | 'deleted';
  followUpRequired: boolean;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Related data
  patient?: Pick<Patient, 'id' | 'patientNumber' | 'firstName' | 'lastName' | 'phone'>;
  doctor?: Pick<User, 'id' | 'firstName' | 'lastName' | 'specialization' | 'department'>;
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

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
}

export interface MedicalRecordFilters extends PaginationParams {
  patientId?: string;
  doctorId?: string;
  department?: Department;
  dateFrom?: string;
  dateTo?: string;
  diagnosis?: string;
  followUpRequired?: boolean;
}

// Appointment Types
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  appointmentTime: string;
  duration: string;
  department: Department;
  appointmentType?: string;
  status: AppointmentStatus;
  notes?: string;
  reminderSent: boolean;
  cancellationReason?: string;
  bookedById: string;
  checkedInAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Related data
  patient?: Pick<Patient, 'id' | 'patientNumber' | 'firstName' | 'lastName' | 'phone'>;
  doctor?: Pick<User, 'id' | 'firstName' | 'lastName' | 'specialization' | 'department'>;
}

export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export interface AppointmentFilters extends PaginationParams {
  patientId?: string;
  doctorId?: string;
  department?: Department;
  status?: AppointmentStatus;
  dateFrom?: string;
  dateTo?: string;
  reminderSent?: boolean;
}

export interface CreateAppointmentData {
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  appointmentTime: string;
  duration?: string;
  department: Department;
  appointmentType?: string;
  notes?: string;
}

// Bill Types
export interface Bill {
  id: string;
  billNumber: string;
  patientId: string;
  doctorId: string;
  visitDate: Date;
  department: Department;
  services: ServiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  insuranceCovered: number;
  patientResponsibility: number;
  status: BillStatus;
  dueDate?: Date;
  paidDate?: Date;
  generatedById: string;
  notes?: string;
  fiscalYear?: string;
  quarter?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BillStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';

export interface ServiceItem {
  serviceCode: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  department: string;
}

export interface BillFilters extends PaginationParams {
  patientId?: string;
  doctorId?: string;
  department?: Department;
  status?: BillStatus;
  dateFrom?: string;
  dateTo?: string;
  fiscalYear?: string;
}

// Dashboard Types
export interface DashboardStats {
  overview: {
    totalPatients: number;
    activePatients: number;
    todaysAppointments: number;
    upcomingAppointments: number;
    pendingBills: {
      count: number;
      totalAmount: number;
    };
    recentRecords: number;
  };
  monthlyTrends: MonthlyTrend[];
}

export interface MonthlyTrend {
  month: string;
  visits: number;
  revenue: number;
}

// Form Types
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'skeleton';
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

// Error Types
export interface AppError {
  message: string;
  code?: string;
  details?: any;
}

// Route Types
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  protected?: boolean;
  roles?: UserRole[];
  title?: string;
}

// Theme Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    neutral: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
  };
}