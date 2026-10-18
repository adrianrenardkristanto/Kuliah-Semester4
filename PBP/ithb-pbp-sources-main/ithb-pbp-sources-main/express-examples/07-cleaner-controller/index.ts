import express, { json } from "express";
import { taskRouter } from "./routes/taskRouter";
import { errorHandlerMiddleware } from "./middlewares/errorHandlerMiddleware";
import { authRouter } from "./routes/authRouter";
import { authorizationMiddleware } from "./middlewares/authorizationMiddleware";

const app = express();
app.use(json());

// middlewares

// task require auth
app.use("/auth", authRouter);

// task require auth
app.use("/task", authorizationMiddleware, taskRouter);
app.use(errorHandlerMiddleware);

app.listen(3000, () => {
  console.log("App started at port 3000");
});
