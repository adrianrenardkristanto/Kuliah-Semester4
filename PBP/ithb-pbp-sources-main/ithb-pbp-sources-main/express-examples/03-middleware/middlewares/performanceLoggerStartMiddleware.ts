import { Request, Response, NextFunction } from "express";
export function performanceLoggerStartMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.locals.requestStartTime = new Date();
  next();
}
