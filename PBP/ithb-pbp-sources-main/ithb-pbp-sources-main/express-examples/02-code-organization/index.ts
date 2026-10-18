import express, { json } from "express";
import { taskRouter } from "./routes/taskRouter";

const app = express();
app.use(json());
app.use("/task", taskRouter);
app.listen(3000, () => {
  console.log("App started at port 3000");
});
