import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, createErrorResponse } from '../types';
import { db, users } from '../db';
import { eq } from 'drizzle-orm';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json(createErrorResponse('Access token is required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    
    // Verify user still exists and is active
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        department: users.department,
        employeeId: users.employeeId,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user[0] || user[0].isActive !== true) {
      return res.status(401).json(createErrorResponse('Invalid or inactive user'));
    }

    req.user = {
      id: user[0].id,
      email: user[0].email,
      role: user[0].role,
      department: user[0].department,
      employeeId: user[0].employeeId,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json(createErrorResponse('Invalid token'));
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(createErrorResponse('Insufficient permissions'));
    }

    next();
  };
};

export const requireDepartment = (allowedDepartments: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('Authentication required'));
    }

    if (!allowedDepartments.includes(req.user.department) && req.user.role !== 'admin') {
      return res.status(403).json(createErrorResponse('Department access denied'));
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      
      const user = await db
        .select({
          id: users.id,
          email: users.email,
          role: users.role,
          department: users.department,
          employeeId: users.employeeId,
          isActive: users.isActive,
        })
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (user[0] && user[0].isActive === true) {
        req.user = {
          id: user[0].id,
          email: user[0].email,
          role: user[0].role,
          department: user[0].department,
          employeeId: user[0].employeeId,
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Alias for convenience
export const requireAuth = authenticateToken;