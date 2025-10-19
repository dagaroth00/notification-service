import { Response } from "express";

export const success = (res: Response, data: any, message = "Success") =>
  res.status(200).json({ success: true, message, data });

export const error = (res: Response, err: any, status = 500) =>
  res.status(status).json({ success: false, message: err.message || err });
