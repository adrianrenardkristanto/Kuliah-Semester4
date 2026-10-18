import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { appConfig } from "../config/app";
import { users } from "../config/data";

export async function authorizationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.sendStatus(401); // Unauthorized
    return;
  }
  try {
    const result = await jwt.verify(token, appConfig.jwtSecret);
    const userId = (result as any).userId as string;
    if (!userId) {
      res.sendStatus(401); // Unauthorized
      return;
    }
    const user = users.find((user) => user.id === userId);
    if (!user) {
      res.sendStatus(401); // Unauthorized
      return;
    }
    res.locals.user = user;
    next();
  } catch (err) {
    res.sendStatus(401); // Unauthorized
    return;
  }
}
