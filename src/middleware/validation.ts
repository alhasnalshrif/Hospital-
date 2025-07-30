import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { createErrorResponse } from '../types';

export const validateRequest = (schema: Schema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[property]);
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors,
      });
    }
    
    next();
  };
};