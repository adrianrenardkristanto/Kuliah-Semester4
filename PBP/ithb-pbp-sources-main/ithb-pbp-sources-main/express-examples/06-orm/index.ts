import express, { json } from "express";
import { taskRouter } from "./routes/taskRouter";
import { projectRouter } from "./routes/projectRouter";
import { Sequelize } from "sequelize-typescript";
import { Project } from "./models/Project";
import { Task } from "./models/Task";

const config = require("./config/config.json");
const sequelize = new Sequelize({
  ...config.development,
  models: [Project, Task],
} as any);

const app = express();
app.use(json());

// middlewares

// task require auth
app.use("/task", taskRouter);
app.use("/project", projectRouter);

app.listen(3000, () => {
  console.log("App started at port 3000");
});
