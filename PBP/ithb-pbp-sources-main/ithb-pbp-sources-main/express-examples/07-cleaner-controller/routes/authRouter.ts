import { Router } from "express";
import { v4 } from "uuid";
import { authorizationMiddleware } from "../middlewares/authorizationMiddleware";
import jwt from "jsonwebtoken";
import { appConfig } from "../config/app";
import { User, users } from "../config/data";
import { controllerWrapper } from "../utils/controllerWrapper";

export const authRouter = Router();

authRouter.post(
  "/register",
  controllerWrapper((req, res, next) => {
    const { username, password } = req.body;
    const existingUser = users.find((user) => user.username === username);
    if (existingUser) {
      // next(new Error("User already exists"));
      // return;
      throw new Error("User already exists");
    }
    const newUser: User = {
      id: v4(),
      username: username,
      password: password,
    };
    users.push(newUser);
    // res.status(201).json(newUser);
    // next();
    return newUser;
  })
);

authRouter.post(
  "/login",
  controllerWrapper((req, res, next) => {
    const user = users.find(
      (user) =>
        user.username === req.body.username &&
        user.password === req.body.password
    );
    if (!user) {
      // next(new Error("Invalid credentials"));
      // return;
      res.locals.errorCode = 401;
      throw new Error("Invalid credentials");
    }
    const token = jwt.sign(
      {
        userId: user.id,
      },
      appConfig.jwtSecret,
      {
        expiresIn: appConfig.jwtExpiry,
      }
    );
    // res.status(200).json({ message: "Login successful", token });
    // next();
    return { message: "Login successful", token };
  })
);

authRouter.get(
  "/me",
  authorizationMiddleware,
  controllerWrapper((req, res, next) => {
    // res.status(200).json(res.locals.user);
    // next();
    return res.locals.user;
  })
);
