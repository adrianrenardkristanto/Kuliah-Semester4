import express, { json } from "express";
import { taskRouter } from "./routes/taskRouter";
import { errorHandlerMiddleware } from "./middlewares/errorHandlerMiddleware";
import { performanceLoggerEndMiddleware } from "./middlewares/performanceLoggerEndMiddleware";
import { performanceLoggerStartMiddleware } from "./middlewares/performanceLoggerStartMiddleware";
import { requestLoggerMiddleware } from "./middlewares/requestLoggerMiddleware";

const app = express();
app.use(json());
// before controller middlewares
app.use(requestLoggerMiddleware);
app.use(performanceLoggerStartMiddleware);

// controllers
app.use("/task", taskRouter);

// after controller middlewares
app.use(performanceLoggerEndMiddleware);
app.use(errorHandlerMiddleware);

app.listen(3000, () => {
  console.log("App started at port 3000");
});
