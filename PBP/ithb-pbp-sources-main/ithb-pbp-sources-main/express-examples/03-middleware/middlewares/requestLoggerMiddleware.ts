import { Request, Response, NextFunction } from "express";
export function requestLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("Request URL:", req.url);
  console.log("Request Method:", req.method);
  console.log("Request Body:", req.body);
  next();
}
