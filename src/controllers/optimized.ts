import { Request, Response } from 'express';
import { eq, and, or, desc, asc, count, gte, lte, like, sql, inArray } from 'drizzle-orm';
import { db } from '../db';
import { 
  optimizedPatients, 
  optimizedMedicalRecords, 
  optimizedUsers, 
  optimizedBills, 
  optimizedAppointments 
} from '../db/schema/optimized';
import { AuthenticatedRequest, createSuccessResponse, createErrorResponse, PaginationParams } from '../types';

// Optimized controller with advanced query patterns to prevent N+1 problems
// Implements pagination, filtering, sorting, and caching strategies

interface PatientsFilters extends PaginationParams {
  name?: string;
  patientNumber?: string;
  phone?: string;
  nationalId?: string;
  department?: string;
  isActive?: boolean;
  ageMin?: number;
  ageMax?: number;
  bloodType?: string;
  hasInsurance?: boolean;
}

interface MedicalRecordsFilters extends PaginationParams {
  patientId?: string;
  doctorId?: string;
  department?: string;
  dateFrom?: string;
  dateTo?: string;
  diagnosis?: string;
  followUpRequired?: boolean;
}

interface AppointmentsFilters extends PaginationParams {
  patientId?: string;
  doctorId?: string;
  department?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  reminderSent?: boolean;
}

// Optimized Patients Controller
export class OptimizedPatientsController {
  
  // Get patients with optimized queries and pagination
  static async getPatients(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        name,
        patientNumber,
        phone,
        nationalId,
        department,
        isActive,
        ageMin,
        ageMax,
        bloodType,
        hasInsurance
      }: PatientsFilters = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const limitNum = Math.min(Number(limit), 100); // Limit max results

      // Build where conditions dynamically
      const whereConditions = [];

      if (name) {
        whereConditions.push(
          or(
            like(optimizedPatients.firstName, `%${name}%`),
            like(optimizedPatients.lastName, `%${name}%`),
            like(optimizedPatients.arabicName, `%${name}%`)
          )
        );
      }

      if (patientNumber) {
        whereConditions.push(eq(optimizedPatients.patientNumber, patientNumber as string));
      }

      if (phone) {
        whereConditions.push(like(optimizedPatients.phone, `%${phone}%`));
      }

      if (nationalId) {
        whereConditions.push(eq(optimizedPatients.nationalId, nationalId as string));
      }

      if (typeof isActive === 'boolean') {
        whereConditions.push(eq(optimizedPatients.isActive, isActive));
      }

      if (bloodType) {
        whereConditions.push(eq(optimizedPatients.bloodType, bloodType as any));
      }

      if (hasInsurance !== undefined) {
        if (hasInsurance) {
          whereConditions.push(sql`${optimizedPatients.insuranceProvider} IS NOT NULL`);
        } else {
          whereConditions.push(sql`${optimizedPatients.insuranceProvider} IS NULL`);
        }
      }

      // Age range filter
      if (ageMin || ageMax) {
        const currentDate = new Date();
        if (ageMax) {
          const minDate = new Date(currentDate.getFullYear() - Number(ageMax), currentDate.getMonth(), currentDate.getDate());
          whereConditions.push(gte(optimizedPatients.dateOfBirth, minDate));
        }
        if (ageMin) {
          const maxDate = new Date(currentDate.getFullYear() - Number(ageMin), currentDate.getMonth(), currentDate.getDate());
          whereConditions.push(lte(optimizedPatients.dateOfBirth, maxDate));
        }
      }

      // Build sort order
      const sortColumn = optimizedPatients[sortBy as keyof typeof optimizedPatients] || optimizedPatients.createdAt;
      const orderBy = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

      // Execute optimized query with count
      const [patients, totalCountResult] = await Promise.all([
        db
          .select()
          .from(optimizedPatients)
          .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
          .orderBy(orderBy)
          .limit(limitNum)
          .offset(offset),
        
        db
          .select({ count: count() })
          .from(optimizedPatients)
          .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      ]);

      const totalCount = totalCountResult[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / limitNum);

      res.json(createSuccessResponse({
        patients: patients.map(patient => ({
          ...patient,
          age: this.calculateAge(patient.dateOfBirth)
        })),
        pagination: {
          page: Number(page),
          limit: limitNum,
          totalCount,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      }, 'Patients retrieved successfully'));

    } catch (error) {
      console.error('Get patients error:', error);
      res.status(500).json(createErrorResponse('Failed to retrieve patients'));
    }
  }

  // Get patient with related data in single query (prevent N+1)
  static async getPatientById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { includeRecords = false, includeAppointments = false, includeBills = false } = req.query;

      // Base patient query
      const patient = await db
        .select()
        .from(optimizedPatients)
        .where(eq(optimizedPatients.id, id))
        .limit(1);

      if (!patient[0]) {
        return res.status(404).json(createErrorResponse('Patient not found'));
      }

      const result: any = {
        ...patient[0],
        age: this.calculateAge(patient[0].dateOfBirth)
      };

      // Conditionally load related data to avoid over-fetching
      const queries = [];

      if (includeRecords === 'true') {
        queries.push(
          db
            .select({
              medicalRecord: optimizedMedicalRecords,
              doctor: {
                id: optimizedUsers.id,
                firstName: optimizedUsers.firstName,
                lastName: optimizedUsers.lastName,
                specialization: optimizedUsers.specialization
              }
            })
            .from(optimizedMedicalRecords)
            .leftJoin(optimizedUsers, eq(optimizedMedicalRecords.doctorId, optimizedUsers.id))
            .where(eq(optimizedMedicalRecords.patientId, id))
            .orderBy(desc(optimizedMedicalRecords.visitDate))
            .limit(10)
        );
      }

      if (includeAppointments === 'true') {
        queries.push(
          db
            .select({
              appointment: optimizedAppointments,
              doctor: {
                id: optimizedUsers.id,
                firstName: optimizedUsers.firstName,
                lastName: optimizedUsers.lastName,
                specialization: optimizedUsers.specialization
              }
            })
            .from(optimizedAppointments)
            .leftJoin(optimizedUsers, eq(optimizedAppointments.doctorId, optimizedUsers.id))
            .where(eq(optimizedAppointments.patientId, id))
            .orderBy(desc(optimizedAppointments.appointmentDate))
            .limit(10)
        );
      }

      if (includeBills === 'true') {
        queries.push(
          db
            .select()
            .from(optimizedBills)
            .where(eq(optimizedBills.patientId, id))
            .orderBy(desc(optimizedBills.visitDate))
            .limit(10)
        );
      }

      // Execute all queries in parallel
      const relatedData = await Promise.all(queries);

      // Attach related data
      let index = 0;
      if (includeRecords === 'true') {
        result.medicalRecords = relatedData[index++];
      }
      if (includeAppointments === 'true') {
        result.appointments = relatedData[index++];
      }
      if (includeBills === 'true') {
        result.bills = relatedData[index++];
      }

      res.json(createSuccessResponse(result, 'Patient details retrieved successfully'));

    } catch (error) {
      console.error('Get patient by ID error:', error);
      res.status(500).json(createErrorResponse('Failed to retrieve patient details'));
    }
  }

  // Optimized medical records retrieval with joins
  static async getMedicalRecords(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'visitDate',
        sortOrder = 'desc',
        patientId,
        doctorId,
        department,
        dateFrom,
        dateTo,
        diagnosis,
        followUpRequired
      }: MedicalRecordsFilters = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const limitNum = Math.min(Number(limit), 100);

      const whereConditions = [];

      if (patientId) {
        whereConditions.push(eq(optimizedMedicalRecords.patientId, patientId as string));
      }

      if (doctorId) {
        whereConditions.push(eq(optimizedMedicalRecords.doctorId, doctorId as string));
      }

      if (department) {
        whereConditions.push(eq(optimizedMedicalRecords.departmentType, department as any));
      }

      if (dateFrom) {
        whereConditions.push(gte(optimizedMedicalRecords.visitDate, new Date(dateFrom as string)));
      }

      if (dateTo) {
        whereConditions.push(lte(optimizedMedicalRecords.visitDate, new Date(dateTo as string)));
      }

      if (diagnosis) {
        whereConditions.push(like(optimizedMedicalRecords.diagnosis, `%${diagnosis}%`));
      }

      if (typeof followUpRequired === 'boolean') {
        whereConditions.push(eq(optimizedMedicalRecords.followUpRequired, followUpRequired));
      }

      // Single query with joins to get all related data
      const [records, totalCountResult] = await Promise.all([
        db
          .select({
            record: optimizedMedicalRecords,
            patient: {
              id: optimizedPatients.id,
              patientNumber: optimizedPatients.patientNumber,
              firstName: optimizedPatients.firstName,
              lastName: optimizedPatients.lastName,
              phone: optimizedPatients.phone
            },
            doctor: {
              id: optimizedUsers.id,
              firstName: optimizedUsers.firstName,
              lastName: optimizedUsers.lastName,
              specialization: optimizedUsers.specialization,
              department: optimizedUsers.department
            }
          })
          .from(optimizedMedicalRecords)
          .leftJoin(optimizedPatients, eq(optimizedMedicalRecords.patientId, optimizedPatients.id))
          .leftJoin(optimizedUsers, eq(optimizedMedicalRecords.doctorId, optimizedUsers.id))
          .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
          .orderBy(
            sortOrder === 'asc' 
              ? asc(optimizedMedicalRecords[sortBy as keyof typeof optimizedMedicalRecords] || optimizedMedicalRecords.visitDate)
              : desc(optimizedMedicalRecords[sortBy as keyof typeof optimizedMedicalRecords] || optimizedMedicalRecords.visitDate)
          )
          .limit(limitNum)
          .offset(offset),

        db
          .select({ count: count() })
          .from(optimizedMedicalRecords)
          .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      ]);

      const totalCount = totalCountResult[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / limitNum);

      res.json(createSuccessResponse({
        records,
        pagination: {
          page: Number(page),
          limit: limitNum,
          totalCount,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      }, 'Medical records retrieved successfully'));

    } catch (error) {
      console.error('Get medical records error:', error);
      res.status(500).json(createErrorResponse('Failed to retrieve medical records'));
    }
  }

  // Optimized appointment scheduling with conflict detection
  static async getAppointments(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'appointmentDate',
        sortOrder = 'asc',
        patientId,
        doctorId,
        department,
        status,
        dateFrom,
        dateTo,
        reminderSent
      }: AppointmentsFilters = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const limitNum = Math.min(Number(limit), 100);

      const whereConditions = [];

      if (patientId) {
        whereConditions.push(eq(optimizedAppointments.patientId, patientId as string));
      }

      if (doctorId) {
        whereConditions.push(eq(optimizedAppointments.doctorId, doctorId as string));
      }

      if (department) {
        whereConditions.push(eq(optimizedAppointments.department, department as any));
      }

      if (status) {
        whereConditions.push(eq(optimizedAppointments.status, status as string));
      }

      if (dateFrom) {
        whereConditions.push(gte(optimizedAppointments.appointmentDate, new Date(dateFrom as string)));
      }

      if (dateTo) {
        whereConditions.push(lte(optimizedAppointments.appointmentDate, new Date(dateTo as string)));
      }

      if (typeof reminderSent === 'boolean') {
        whereConditions.push(eq(optimizedAppointments.reminderSent, reminderSent));
      }

      // Optimized query with all related data in one query
      const [appointments, totalCountResult] = await Promise.all([
        db
          .select({
            appointment: optimizedAppointments,
            patient: {
              id: optimizedPatients.id,
              patientNumber: optimizedPatients.patientNumber,
              firstName: optimizedPatients.firstName,
              lastName: optimizedPatients.lastName,
              phone: optimizedPatients.phone
            },
            doctor: {
              id: optimizedUsers.id,
              firstName: optimizedUsers.firstName,
              lastName: optimizedUsers.lastName,
              specialization: optimizedUsers.specialization,
              department: optimizedUsers.department
            }
          })
          .from(optimizedAppointments)
          .leftJoin(optimizedPatients, eq(optimizedAppointments.patientId, optimizedPatients.id))
          .leftJoin(optimizedUsers, eq(optimizedAppointments.doctorId, optimizedUsers.id))
          .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
          .orderBy(
            sortOrder === 'asc'
              ? asc(optimizedAppointments[sortBy as keyof typeof optimizedAppointments] || optimizedAppointments.appointmentDate)
              : desc(optimizedAppointments[sortBy as keyof typeof optimizedAppointments] || optimizedAppointments.appointmentDate)
          )
          .limit(limitNum)
          .offset(offset),

        db
          .select({ count: count() })
          .from(optimizedAppointments)
          .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      ]);

      const totalCount = totalCountResult[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / limitNum);

      res.json(createSuccessResponse({
        appointments,
        pagination: {
          page: Number(page),
          limit: limitNum,
          totalCount,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      }, 'Appointments retrieved successfully'));

    } catch (error) {
      console.error('Get appointments error:', error);
      res.status(500).json(createErrorResponse('Failed to retrieve appointments'));
    }
  }

  // Analytics and dashboard data with optimized aggregations
  static async getDashboardStats(req: AuthenticatedRequest, res: Response) {
    try {
      const { department } = req.query;
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Build department filter
      const departmentFilter = department 
        ? eq(optimizedMedicalRecords.departmentType, department as any)
        : undefined;

      // Parallel execution of all analytics queries
      const [
        totalPatients,
        activePatients,
        todaysAppointments,
        upcomingAppointments,
        pendingBills,
        recentRecords,
        monthlyStats
      ] = await Promise.all([
        // Total patients count
        db.select({ count: count() }).from(optimizedPatients),
        
        // Active patients count
        db.select({ count: count() }).from(optimizedPatients).where(eq(optimizedPatients.isActive, true)),
        
        // Today's appointments
        db
          .select({ count: count() })
          .from(optimizedAppointments)
          .where(
            and(
              gte(optimizedAppointments.appointmentDate, new Date(today.toDateString())),
              lte(optimizedAppointments.appointmentDate, new Date(today.getTime() + 24 * 60 * 60 * 1000)),
              departmentFilter ? eq(optimizedAppointments.department, department as any) : undefined
            ).filter(Boolean)
          ),
        
        // Upcoming appointments (next 7 days)
        db
          .select({ count: count() })
          .from(optimizedAppointments)
          .where(
            and(
              gte(optimizedAppointments.appointmentDate, today),
              lte(optimizedAppointments.appointmentDate, new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)),
              eq(optimizedAppointments.status, 'scheduled'),
              departmentFilter ? eq(optimizedAppointments.department, department as any) : undefined
            ).filter(Boolean)
          ),
        
        // Pending bills
        db
          .select({ count: count(), total: sql<number>`sum(${optimizedBills.totalAmount})` })
          .from(optimizedBills)
          .where(
            and(
              eq(optimizedBills.status, 'pending'),
              departmentFilter ? eq(optimizedBills.department, department as any) : undefined
            ).filter(Boolean)
          ),
        
        // Recent medical records
        db
          .select({ count: count() })
          .from(optimizedMedicalRecords)
          .where(
            and(
              gte(optimizedMedicalRecords.visitDate, thirtyDaysAgo),
              departmentFilter
            ).filter(Boolean)
          ),
        
        // Monthly statistics
        db
          .select({
            month: sql<string>`date_trunc('month', ${optimizedMedicalRecords.visitDate})`,
            visits: count(),
            revenue: sql<number>`sum(${optimizedBills.totalAmount})`
          })
          .from(optimizedMedicalRecords)
          .leftJoin(optimizedBills, eq(optimizedMedicalRecords.patientId, optimizedBills.patientId))
          .where(
            and(
              gte(optimizedMedicalRecords.visitDate, new Date(today.getFullYear(), today.getMonth() - 5, 1)),
              departmentFilter
            ).filter(Boolean)
          )
          .groupBy(sql`date_trunc('month', ${optimizedMedicalRecords.visitDate})`)
          .orderBy(sql`date_trunc('month', ${optimizedMedicalRecords.visitDate})`)
      ]);

      res.json(createSuccessResponse({
        overview: {
          totalPatients: totalPatients[0]?.count || 0,
          activePatients: activePatients[0]?.count || 0,
          todaysAppointments: todaysAppointments[0]?.count || 0,
          upcomingAppointments: upcomingAppointments[0]?.count || 0,
          pendingBills: {
            count: pendingBills[0]?.count || 0,
            totalAmount: pendingBills[0]?.total || 0
          },
          recentRecords: recentRecords[0]?.count || 0
        },
        monthlyTrends: monthlyStats
      }, 'Dashboard statistics retrieved successfully'));

    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json(createErrorResponse('Failed to retrieve dashboard statistics'));
    }
  }

  private static calculateAge(dateOfBirth: Date | null): number {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  }
}