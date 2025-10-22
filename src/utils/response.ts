import { Response } from 'express';
import { HttpError } from '../errors/httpError.js';

export const success = (res: Response, data: any, message = 'Success') =>
  res.status(200).json({ success: true, message, data });

export const error = (res: Response, err: unknown) => {
  if (err instanceof HttpError) {
    const { status, message, code, details } = err;
    return res.status(status).json({ success: false, message, code, details });
  }

  const message = err instanceof Error ? err.message : String(err);
  return res.status(500).json({ success: false, message, code: 'UNKNOWN_ERROR' });
};
