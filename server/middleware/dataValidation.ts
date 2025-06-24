import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Enhanced validation middleware with better error messages
export function validateRequest(schema: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: true,
          message: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
}

// Food analysis request validation
export const foodAnalysisSchema = z.object({
  foodName: z.string().min(1).max(200).optional(),
  imageData: z.string().optional()
}).refine(data => data.foodName || data.imageData, {
  message: "Either foodName or imageData must be provided"
});

// User profile validation
export const profileUpdateSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  healthGoals: z.array(z.string()).max(10).optional(),
  dietaryRestrictions: z.array(z.string()).max(10).optional(),
  allergies: z.array(z.string()).max(20).optional()
});

// Food logging validation
export const foodLogSchema = z.object({
  foodName: z.string().min(1).max(200),
  verdict: z.enum(['YES', 'NO', 'OK']),
  analysisMethod: z.enum(['ai', 'fallback', 'manual']).optional()
});