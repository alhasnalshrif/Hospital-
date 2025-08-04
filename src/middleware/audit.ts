import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, createErrorResponse } from '../types';
import { db, auditLogs } from '../db';

export const auditLogger = (action: string, resource: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    let responseData: any;

    // Capture response data
    res.send = function(data: any) {
      responseData = data;
      return originalSend.call(this, data);
    };

    // Store original request data for audit
    const requestData = {
      body: req.body,
      params: req.params,
      query: req.query,
    };

    res.on('finish', async () => {
      try {
        if (req.user && res.statusCode < 400) {
          const resourceId = req.params.id || req.body.id || null;
          
          await db.insert(auditLogs).values({
            userId: req.user.id,
            action,
            resource,
            resourceId,
            newValues: requestData,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent') || '',
          });
        }
      } catch (error) {
        console.error('Audit logging error:', error);
      }
    });

    next();
  };
};

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error.code === '23505') { // PostgreSQL unique violation
    return res.status(409).json(createErrorResponse('Duplicate entry found'));
  }

  if (error.code === '23503') { // PostgreSQL foreign key violation
    return res.status(400).json(createErrorResponse('Referenced record not found'));
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json(createErrorResponse('Validation failed'));
  }

  return res.status(500).json(createErrorResponse('Internal server error'));
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(createErrorResponse('Resource not found'));
};