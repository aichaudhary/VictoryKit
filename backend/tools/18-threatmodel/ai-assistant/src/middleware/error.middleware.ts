import { Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import { ZodError } from 'zod';
import { APIResponse } from '../types.js';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: any = undefined;

  // Handle different types of errors
  if (error instanceof ZodError) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Invalid request data';
    details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));
  } else if (error.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Data validation failed';
    details = error.message;
  } else if (error.name === 'CastError') {
    // Mongoose cast error (invalid ObjectId)
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = 'Invalid resource identifier';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  } else if (error.message.includes('rate limit')) {
    statusCode = 429;
    errorCode = 'RATE_LIMIT_EXCEEDED';
    message = 'Too many requests';
  } else if (error.message.includes('not found')) {
    statusCode = 404;
    errorCode = 'NOT_FOUND';
    message = error.message;
  } else if (error.message.includes('permission') || error.message.includes('access')) {
    statusCode = 403;
    errorCode = 'ACCESS_DENIED';
    message = error.message;
  }

  // Log the error
  const logger = req.app.locals.logger;
  if (logger) {
    logger.error('Request error', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userId: req.user?.id,
      statusCode,
      errorCode
    });
  } else {
    console.error('Request error:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      statusCode,
      errorCode
    });
  }

  // Send error response
  const errorResponse: APIResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      details
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown',
      processingTime: Date.now() - (req.startTime || Date.now())
    }
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware to add request start time for error logging
 */
export const requestTimer = (req: Request, res: Response, next: NextFunction): void => {
  req.startTime = Date.now();
  next();
};

/**
 * Middleware to handle 404 errors
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.name = 'NotFoundError';
  next(error);
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Development error handler that includes stack traces
 */
export const developmentErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = 500;
  const errorResponse: APIResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message,
      details: {
        stack: error.stack,
        name: error.name
      }
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown',
      processingTime: Date.now() - (req.startTime || Date.now())
    }
  };

  res.status(statusCode).json(errorResponse);
};