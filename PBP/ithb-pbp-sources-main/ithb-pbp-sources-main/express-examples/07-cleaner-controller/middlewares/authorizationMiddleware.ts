import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { appConfig } from "../config/app";
import { users } from "../config/data";
import { middlewareWrapper } from "../utils/middlewareWrapper";

export const authorizationMiddleware = middlewareWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      // res.sendStatus(401); // Unauthorized
      // return;

      res.locals.errorCode = 401;
      throw new Error("No token provided");
    }
    try {
      const result = await jwt.verify(token, appConfig.jwtSecret);
      const userId = (result as any).userId as string;
      if (!userId) {
        // res.sendStatus(401); // Unauthorized
        // return;

        res.locals.errorCode = 401;
        throw new Error("Invalid token");
      }
      const user = users.find((user) => user.id === userId);
      if (!user) {
        // res.sendStatus(401); // Unauthorized
        // return;

        res.locals.errorCode = 401;
        throw new Error("User not found");
      }
      res.locals.user = user;
      // next();
    } catch (err) {
      // res.sendStatus(401); // Unauthorized
      // return;

      res.locals.errorCode = 401;
      throw new Error("Something went wrong");
    }
  }
);
