import { Request, Response } from 'express';
import { ValidationError, validationResult } from 'express-validator';

export interface ApiError {
  error: string;
  message: string;
  details?: ValidationErrorDetail[];
  field?: string;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

// Format validation errors consistently
export const formatValidationErrors = (
  errors: ValidationError[]
): ValidationErrorDetail[] => {
  return errors.map(error => ({
    field: (error as any).path || error.type,
    message: error.msg,
  }));
};

// Handle validation errors
export const handleValidationErrors = (
  req: Request,
  res: Response
): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    res.status(400).json({
      error: 'Validation failed',
      message: 'Please fix the validation errors',
      details: formatValidationErrors(errors.array()),
    });
    return true; // validation failed
  }
  return false; // validation passed
};

// Create consistent error responses
export const createErrorResponse = (
  status: number,
  error: string,
  message: string,
  details?: ValidationErrorDetail[],
  field?: string
): ApiError => ({
  error,
  message,
  ...(details && { details }),
  ...(field && { field }),
});

// Common error responses
export const ErrorResponses = {
  validationFailed: (details: ValidationErrorDetail[]) =>
    createErrorResponse(
      400,
      'Validation failed',
      'Oops! Please fix the validation errors',
      details
    ),

  invalidCredentials: () =>
    createErrorResponse(
      401,
      'Invalid credentials',
      'Username/email or password is incorrect 🤨'
    ),

  authenticationRequired: () =>
    createErrorResponse(
      401,
      'Authentication required',
      'Access token is required'
    ),

  invalidToken: () =>
    createErrorResponse(
      401,
      'Invalid token',
      'The provided token is invalid or expired'
    ),

  userNotFound: () =>
    createErrorResponse(
      401,
      'User not found',
      'This user no longer exists... 🫠'
    ),

  accessDenied: () =>
    createErrorResponse(
      403,
      'Access denied',
      'STOP!! You do not have permission to perform this action 🤨'
    ),

  userAlreadyExists: (field: string) =>
    createErrorResponse(
      400,
      'User already exists',
      `This ${field} is already taken 🤔`,
      undefined,
      field
    ),

  userNotFoundById: () =>
    createErrorResponse(
      404,
      'User not found',
      'The requested user was not found'
    ),

  usernameOrEmailExists: () =>
    createErrorResponse(
      400,
      'Username or email already exists',
      'Hmm... This username or email is already taken 🤔'
    ),

  internalServerError: (message?: string) =>
    createErrorResponse(
      500,
      'Internal server error',
      message || 'An unexpected error occurred. Come back later 🫠'
    ),

  notFound: (resource: string) =>
    createErrorResponse(
      404,
      'Not found',
      `Oops! ${resource} does not exist 🫥`
    ),
};
