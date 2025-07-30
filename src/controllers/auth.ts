import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, users, userSessions } from '../db';
import { eq } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, AuthenticatedRequest } from '../types';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user[0] || !user[0].isActive) {
      return res.status(401).json(createErrorResponse('Invalid credentials'));
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user[0].passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json(createErrorResponse('Invalid credentials'));
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }
    
    const payload = { userId: user[0].id, email: user[0].email, role: user[0].role };
    const options: jwt.SignOptions = { expiresIn: (process.env.JWT_EXPIRE || '24h') as jwt.SignOptions['expiresIn'] };
    const token = jwt.sign(payload, jwtSecret, options);

    // Create session record
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await db.insert(userSessions).values({
      userId: user[0].id,
      token,
      deviceInfo: { userAgent: req.get('User-Agent') },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || '',
      expiresAt,
    });

    // Update last login
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user[0].id));

    const userData = {
      id: user[0].id,
      employeeId: user[0].employeeId,
      firstName: user[0].firstName,
      lastName: user[0].lastName,
      email: user[0].email,
      role: user[0].role,
      department: user[0].department,
    };

    res.json(createSuccessResponse({ user: userData, token }, 'Login successful'));
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(createErrorResponse('Login failed'));
  }
};

export const register = async (req: Request, res: Response) => {
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
    } = req.body;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser[0]) {
      return res.status(409).json(createErrorResponse('User already exists'));
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
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
        hireDate: new Date(),
      })
      .returning({
        id: users.id,
        employeeId: users.employeeId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        department: users.department,
      });

    res.status(201).json(createSuccessResponse(newUser[0], 'User registered successfully'));
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(createErrorResponse('Registration failed'));
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      await db
        .update(userSessions)
        .set({ isActive: false })
        .where(eq(userSessions.token, token));
    }

    res.json(createSuccessResponse(null, 'Logout successful'));
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json(createErrorResponse('Logout failed'));
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    // Get current user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]) {
      return res.status(404).json(createErrorResponse('User not found'));
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user[0].passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json(createErrorResponse('Current password is incorrect'));
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db
      .update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.id, userId));

    res.json(createSuccessResponse(null, 'Password changed successfully'));
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json(createErrorResponse('Password change failed'));
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

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
        lastLogin: users.lastLogin,
        hireDate: users.hireDate,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]) {
      return res.status(404).json(createErrorResponse('User not found'));
    }

    res.json(createSuccessResponse(user[0]));
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(createErrorResponse('Failed to get profile'));
  }
};