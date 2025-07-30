import { Request, Response } from 'express';
import { AuthenticatedRequest, createSuccessResponse, createErrorResponse } from '../types';
import { db, users, permissions, rolePermissions } from '../db';
import { eq, and, desc, asc, ne } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { clearPermissionCache } from '../middleware/permissions';

// User Management
export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role, department, isActive, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select({
      id: users.id,
      employeeId: users.employeeId,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      phone: users.phone,
      role: users.role,
      department: users.department,
      specialization: users.specialization,
      licenseNumber: users.licenseNumber,
      isActive: users.isActive,
      lastLogin: users.lastLogin,
      hireDate: users.hireDate,
      createdAt: users.createdAt,
    }).from(users);

    if (role) {
      query = query.where(eq(users.role, role as any));
    }

    if (department) {
      query = query.where(eq(users.department, department as any));
    }

    if (isActive !== undefined) {
      query = query.where(eq(users.isActive, isActive === 'true'));
    }

    const userList = await query
      .orderBy(asc(users.lastName), asc(users.firstName))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse('Users retrieved successfully', userList));
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve users'));
  }
};

export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await db
      .select({
        id: users.id,
        employeeId: users.employeeId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        role: users.role,
        department: users.department,
        specialization: users.specialization,
        licenseNumber: users.licenseNumber,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
        profilePicture: users.profilePicture,
        address: users.address,
        emergencyContact: users.emergencyContact,
        hireDate: users.hireDate,
        twoFactorEnabled: users.twoFactorEnabled,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user[0]) {
      return res.status(404).json(createErrorResponse('User not found'));
    }

    res.json(createSuccessResponse('User retrieved successfully', user[0]));
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve user'));
  }
};

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      role,
      department,
      specialization,
      licenseNumber,
      password,
      address,
      emergencyContact,
      hireDate,
    } = req.body;

    // Check if email or employeeId already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser[0]) {
      return res.status(400).json(createErrorResponse('Email already exists'));
    }

    const existingEmployeeId = await db
      .select()
      .from(users)
      .where(eq(users.employeeId, employeeId))
      .limit(1);

    if (existingEmployeeId[0]) {
      return res.status(400).json(createErrorResponse('Employee ID already exists'));
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await db.insert(users).values({
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      role,
      department,
      specialization,
      licenseNumber,
      passwordHash,
      address,
      emergencyContact,
      hireDate: hireDate ? new Date(hireDate) : new Date(),
      isActive: true,
    }).returning({
      id: users.id,
      employeeId: users.employeeId,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      role: users.role,
      department: users.department,
      createdAt: users.createdAt,
    });

    res.status(201).json(createSuccessResponse('User created successfully', newUser[0]));
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json(createErrorResponse('Failed to create user'));
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated this way
    delete updateData.passwordHash;
    delete updateData.id;
    delete updateData.createdAt;

    const updated = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        employeeId: users.employeeId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        role: users.role,
        department: users.department,
        specialization: users.specialization,
        isActive: users.isActive,
        updatedAt: users.updatedAt,
      });

    if (!updated[0]) {
      return res.status(404).json(createErrorResponse('User not found'));
    }

    // Clear permission cache when user role changes
    if (updateData.role) {
      clearPermissionCache();
    }

    res.json(createSuccessResponse('User updated successfully', updated[0]));
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json(createErrorResponse('Failed to update user'));
  }
};

export const deactivateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent self-deactivation
    if (id === req.user!.id) {
      return res.status(400).json(createErrorResponse('Cannot deactivate your own account'));
    }

    const updated = await db
      .update(users)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        employeeId: users.employeeId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        isActive: users.isActive,
      });

    if (!updated[0]) {
      return res.status(404).json(createErrorResponse('User not found'));
    }

    res.json(createSuccessResponse('User deactivated successfully', updated[0]));
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json(createErrorResponse('Failed to deactivate user'));
  }
};

export const reactivateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const updated = await db
      .update(users)
      .set({
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        employeeId: users.employeeId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        isActive: users.isActive,
      });

    if (!updated[0]) {
      return res.status(404).json(createErrorResponse('User not found'));
    }

    res.json(createSuccessResponse('User reactivated successfully', updated[0]));
  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json(createErrorResponse('Failed to reactivate user'));
  }
};

export const resetUserPassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json(createErrorResponse('Password must be at least 8 characters long'));
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    const updated = await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        employeeId: users.employeeId,
        email: users.email,
      });

    if (!updated[0]) {
      return res.status(404).json(createErrorResponse('User not found'));
    }

    res.json(createSuccessResponse('Password reset successfully', { userId: updated[0].id }));
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json(createErrorResponse('Failed to reset password'));
  }
};

// Permission Management
export const getAllPermissions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { resource, action } = req.query;

    let query = db.select().from(permissions);

    if (resource) {
      query = query.where(eq(permissions.resource, resource as string));
    }

    if (action) {
      query = query.where(eq(permissions.action, action as string));
    }

    const permissionsList = await query.orderBy(asc(permissions.resource), asc(permissions.action));

    // Group permissions by resource
    const groupedPermissions = permissionsList.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    }, {} as Record<string, typeof permissionsList>);

    res.json(createSuccessResponse('Permissions retrieved successfully', {
      permissions: permissionsList,
      groupedPermissions,
      total: permissionsList.length,
    }));
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve permissions'));
  }
};

export const getRolePermissions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role } = req.params;

    const rolePerms = await db
      .select({
        permissionId: rolePermissions.permissionId,
        permissionName: permissions.name,
        description: permissions.description,
        resource: permissions.resource,
        action: permissions.action,
      })
      .from(rolePermissions)
      .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.role, role as any))
      .orderBy(asc(permissions.resource), asc(permissions.action));

    res.json(createSuccessResponse('Role permissions retrieved successfully', rolePerms));
  } catch (error) {
    console.error('Get role permissions error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve role permissions'));
  }
};

export const updateRolePermissions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role } = req.params;
    const { permissionIds } = req.body;

    if (!Array.isArray(permissionIds)) {
      return res.status(400).json(createErrorResponse('Permission IDs must be an array'));
    }

    // Remove existing permissions for this role
    await db.delete(rolePermissions).where(eq(rolePermissions.role, role as any));

    // Add new permissions
    if (permissionIds.length > 0) {
      const newRolePermissions = permissionIds.map(permissionId => ({
        role: role as any,
        permissionId,
      }));

      await db.insert(rolePermissions).values(newRolePermissions);
    }

    // Clear permission cache
    clearPermissionCache();

    res.json(createSuccessResponse('Role permissions updated successfully', {
      role,
      permissionCount: permissionIds.length,
    }));
  } catch (error) {
    console.error('Update role permissions error:', error);
    res.status(500).json(createErrorResponse('Failed to update role permissions'));
  }
};

// User Statistics
export const getUserStatistics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const allUsers = await db.select().from(users);

    const roleDistribution = allUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const departmentDistribution = allUsers.reduce((acc, user) => {
      acc[user.department] = (acc[user.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activeUsers = allUsers.filter(user => user.isActive);
    const inactiveUsers = allUsers.filter(user => !user.isActive);

    // Get recent logins (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentlyActiveUsers = allUsers.filter(user => 
      user.lastLogin && new Date(user.lastLogin) >= thirtyDaysAgo
    );

    const statistics = {
      totalUsers: allUsers.length,
      activeUsers: activeUsers.length,
      inactiveUsers: inactiveUsers.length,
      recentlyActiveUsers: recentlyActiveUsers.length,
      roleDistribution,
      departmentDistribution,
      lastUpdated: new Date(),
    };

    res.json(createSuccessResponse('User statistics retrieved successfully', statistics));
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve user statistics'));
  }
};