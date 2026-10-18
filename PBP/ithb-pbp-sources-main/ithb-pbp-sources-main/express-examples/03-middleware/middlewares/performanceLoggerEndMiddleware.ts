import { Request, Response, NextFunction } from "express";
export function performanceLoggerEndMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestStartTime = res.locals.requestStartTime;
  const now = new Date();
  console.log(
    `Request time taken:  ${now.getTime() - requestStartTime.getTime()}ms`
  );
  next();
}
