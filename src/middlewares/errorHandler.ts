import { Request, Response, NextFunction } from 'express';
import { error as sendError } from '../utils/response.js';
import logger from '../utils/logger.js';

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  logger.error({ err }, 'Unhandled error');
  return sendError(res, err);
};

export default errorHandler;