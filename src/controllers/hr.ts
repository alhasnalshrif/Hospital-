import { Request, Response } from 'express';
import { db, employees, departments, positions, leaveRequests, employeeAttendance, payrollEntries } from '../db';
import { eq, and, sql } from 'drizzle-orm';

// Human Resources Controller (Internal HR/ERP System)

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      middleName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      nationalId,
      departmentId,
      positionId,
      hireDate,
      employmentType,
      baseSalary,
      supervisor,
      licenseNumbers,
      certifications,
    } = req.body;

    const employeeId = `EMP_${Date.now()}`;

    const newEmployee = await db.insert(employees).values({
      employeeId,
      firstName,
      lastName,
      middleName,
      email,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender,
      address,
      emergencyContact,
      nationalId,
      departmentId,
      positionId,
      hireDate: new Date(hireDate),
      employmentType: employmentType || 'full_time',
      baseSalary,
      supervisor,
      licenseNumbers,
      certifications,
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: newEmployee[0],
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create employee',
    });
  }
};

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const { departmentId, status } = req.query;

    let whereConditions = [];
    
    if (departmentId) {
      whereConditions.push(eq(employees.departmentId, departmentId as string));
    }

    if (status) {
      whereConditions.push(eq(employees.employmentStatus, status as string));
    }

    const employeeList = await (() => {
      let query = db
        .select({
          employee: employees,
          department: departments,
          position: positions,
        })
        .from(employees)
        .leftJoin(departments, eq(employees.departmentId, departments.id))
        .leftJoin(positions, eq(employees.positionId, positions.id));

      if (whereConditions.length > 0) {
        return query.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions));
      }
      return query;
    })();

    res.json({
      success: true,
      data: employeeList,
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve employees',
    });
  }
};

export const getEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    const employee = await db
      .select({
        employee: employees,
        department: departments,
        position: positions,
      })
      .from(employees)
      .leftJoin(departments, eq(employees.departmentId, departments.id))
      .leftJoin(positions, eq(employees.positionId, positions.id))
      .where(eq(employees.id, employeeId))
      .limit(1);

    if (employee.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found',
      });
    }

    res.json({
      success: true,
      data: employee[0],
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve employee',
    });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.employeeId;
    delete updateData.createdAt;

    const updatedEmployee = await db
      .update(employees)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(employees.id, employeeId))
      .returning();

    if (updatedEmployee.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found',
      });
    }

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee[0],
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update employee',
    });
  }
};

export const recordAttendance = async (req: Request, res: Response) => {
  try {
    const {
      employeeId,
      attendanceDate,
      checkInTime,
      checkOutTime,
      attendanceStatus,
      notes,
    } = req.body;

    // Calculate total hours if both check-in and check-out are provided
    let totalHours = 0;
    if (checkInTime && checkOutTime) {
      const checkIn = new Date(checkInTime);
      const checkOut = new Date(checkOutTime);
      totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60); // Convert to hours
    }

    const attendance = await db.insert(employeeAttendance).values({
      employeeId,
      attendanceDate: new Date(attendanceDate),
      checkInTime: checkInTime ? new Date(checkInTime) : null,
      checkOutTime: checkOutTime ? new Date(checkOutTime) : null,
      totalHours,
      regularHours: Math.min(totalHours, 8), // Assuming 8 hours is regular
      overtimeHours: Math.max(totalHours - 8, 0),
      attendanceStatus: attendanceStatus || 'present',
      notes,
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully',
      data: attendance[0],
    });
  } catch (error) {
    console.error('Record attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record attendance',
    });
  }
};

export const getEmployeeAttendance = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    let query = db
      .select()
      .from(employeeAttendance)
      .where(eq(employeeAttendance.employeeId, employeeId));

    if (startDate && endDate) {
      query = query.where(
        and(
          sql`${employeeAttendance.attendanceDate} >= ${new Date(startDate as string)}`,
          sql`${employeeAttendance.attendanceDate} <= ${new Date(endDate as string)}`
        )
      );
    }

    const attendance = await query.orderBy(sql`${employeeAttendance.attendanceDate} DESC`);

    res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    console.error('Get employee attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve employee attendance',
    });
  }
};

export const submitLeaveRequest = async (req: Request, res: Response) => {
  try {
    const {
      employeeId,
      leaveTypeId,
      startDate,
      endDate,
      reason,
      emergencyContact,
      handoverNotes,
      coveringEmployee,
    } = req.body;

    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const leaveRequest = await db.insert(leaveRequests).values({
      employeeId,
      leaveTypeId,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
      emergencyContact,
      handoverNotes,
      coveringEmployee,
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leaveRequest[0],
    });
  } catch (error) {
    console.error('Submit leave request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit leave request',
    });
  }
};

export const getLeaveRequests = async (req: Request, res: Response) => {
  try {
    const { employeeId, status } = req.query;

    let query = db
      .select({
        leaveRequest: leaveRequests,
        employee: employees,
      })
      .from(leaveRequests)
      .leftJoin(employees, eq(leaveRequests.employeeId, employees.id));

    if (employeeId) {
      query = query.where(eq(leaveRequests.employeeId, employeeId as string));
    }

    if (status) {
      query = query.where(eq(leaveRequests.status, status as string));
    }

    const requests = await query.orderBy(sql`${leaveRequests.requestDate} DESC`);

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve leave requests',
    });
  }
};

export const updateLeaveRequestStatus = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { status, approvedBy, rejectionReason, comments } = req.body;

    const updatedRequest = await db
      .update(leaveRequests)
      .set({
        status,
        approvedBy,
        approvalDate: status === 'approved' ? new Date() : null,
        rejectionReason,
        comments,
        updatedAt: new Date(),
      })
      .where(eq(leaveRequests.id, requestId))
      .returning();

    if (updatedRequest.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Leave request not found',
      });
    }

    res.json({
      success: true,
      message: 'Leave request status updated successfully',
      data: updatedRequest[0],
    });
  } catch (error) {
    console.error('Update leave request status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update leave request status',
    });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name, code, description, headOfDepartment, location, budget } = req.body;

    const newDepartment = await db.insert(departments).values({
      name,
      code,
      description,
      headOfDepartment,
      location,
      budget,
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: newDepartment[0],
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create department',
    });
  }
};

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments_list = await db
      .select()
      .from(departments)
      .where(eq(departments.isActive, true))
      .orderBy(departments.name);

    res.json({
      success: true,
      data: departments_list,
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve departments',
    });
  }
};

export const createPosition = async (req: Request, res: Response) => {
  try {
    const {
      title,
      code,
      departmentId,
      jobDescription,
      requirements,
      minSalary,
      maxSalary,
      salaryGrade,
    } = req.body;

    const newPosition = await db.insert(positions).values({
      title,
      code,
      departmentId,
      jobDescription,
      requirements,
      minSalary,
      maxSalary,
      salaryGrade,
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Position created successfully',
      data: newPosition[0],
    });
  } catch (error) {
    console.error('Create position error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create position',
    });
  }
};

export const getPositions = async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.query;

    let query = db
      .select({
        position: positions,
        department: departments,
      })
      .from(positions)
      .leftJoin(departments, eq(positions.departmentId, departments.id))
      .where(eq(positions.isActive, true));

    if (departmentId) {
      query = query.where(eq(positions.departmentId, departmentId as string));
    }

    const positionsList = await query.orderBy(positions.title);

    res.json({
      success: true,
      data: positionsList,
    });
  } catch (error) {
    console.error('Get positions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve positions',
    });
  }
};

export const getEmployeePayroll = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    let query = db
      .select()
      .from(payrollEntries)
      .where(eq(payrollEntries.employeeId, employeeId));

    if (startDate && endDate) {
      query = query.where(
        and(
          sql`${payrollEntries.createdAt} >= ${new Date(startDate as string)}`,
          sql`${payrollEntries.createdAt} <= ${new Date(endDate as string)}`
        )
      );
    }

    const payrollHistory = await query.orderBy(sql`${payrollEntries.createdAt} DESC`);

    res.json({
      success: true,
      data: payrollHistory,
    });
  } catch (error) {
    console.error('Get employee payroll error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve employee payroll',
    });
  }
};