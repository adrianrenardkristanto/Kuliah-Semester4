import express, { json } from "express";
import { authRouter } from "./routes/authRouter";
import { errorHandlerMiddleware } from "./middlewares/errorHandlerMiddleware";

const app = express();
app.use(json());

// middlewares

// controllers
app.use("/auth", authRouter);

// after midldewares
app.use(errorHandlerMiddleware);

app.listen(3000, () => {
  console.log("App started at port 3000");
});
