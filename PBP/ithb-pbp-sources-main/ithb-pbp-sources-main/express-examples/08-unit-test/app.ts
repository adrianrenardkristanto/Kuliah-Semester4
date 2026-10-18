import express, { json } from "express";
import { authRouter } from "./routes/authRouter";
import { errorHandlerMiddleware } from "./middlewares/errorHandlerMiddleware";
import { taskRouter } from "./routes/taskRouter";
import { authorizationMiddleware } from "./middlewares/authorizationMiddleware";

export const app = express();
app.use(json());

// middlewares

// controllers
app.use("/auth", authRouter);

// task require auth
app.use("/task", authorizationMiddleware, taskRouter);

// after midldewares
app.use(errorHandlerMiddleware);
