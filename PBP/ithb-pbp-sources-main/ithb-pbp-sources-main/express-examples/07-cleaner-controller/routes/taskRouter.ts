import { Router } from "express";
import { v4 } from "uuid";
import { users } from "../config/data";
import { controllerWrapper } from "../utils/controllerWrapper";

export const taskRouter = Router();

type Task = {
  id: string;
  userId: string;
  title: string;
  description?: string;
};

const defaultAdminUserId = users[0].id;

const tasks: Task[] = [
  { id: "1", title: "Task 1", description: "", userId: defaultAdminUserId },
  { id: "2", title: "Task 2", description: "", userId: defaultAdminUserId },
  { id: "3", title: "Task Hans", description: "", userId: defaultAdminUserId },
];

taskRouter.get(
  "/",
  controllerWrapper((req, res, next) => {
    const title = req.query.title;
    let filteredTasks = tasks.filter(
      (record) => record.userId === res.locals.user.id
    );
    if (typeof title === "string") {
      filteredTasks = filteredTasks.filter((record) =>
        record.title.includes(title)
      );
    }
    const description = req.query.description;
    if (typeof description === "string") {
      filteredTasks = filteredTasks.filter((record) =>
        record.description?.includes(description)
      );
    }
    // res.status(200).json(filteredTasks);
    // res.locals.error = "Test Error";
    // next();
    return filteredTasks;
  })
);

taskRouter.get(
  "/:id",
  controllerWrapper((req, res, next) => {
    const task = tasks.find(
      (record) =>
        record.id === req.params.id && record.userId === res.locals.user.id
    );
    if (!task) {
      // res.status(500).json(null);
      // return;
      throw new Error("Task not found");
    }
    // res.status(200).json(task);
    // next();
    return task;
  })
);

taskRouter.post(
  "/",
  controllerWrapper((req, res, next) => {
    const { title, description } = req.body;
    const newTask: Task = {
      id: v4(),
      title,
      description,
      userId: res.locals.user.id,
    };
    tasks.push(newTask);
    // res.status(200).json(newTask);
    // next();
    return newTask;
  })
);

taskRouter.put(
  "/:id",
  controllerWrapper((req, res, next) => {
    const id = req.params.id;
    const { title, description } = req.body;
    const record = tasks.find(
      (record) => record.id === id && record.userId === res.locals.user.id
    );
    if (!record) {
      // res.status(500).json({ message: "Task not found" });
      // return;
      throw new Error("Task not found");
    }
    record.title = title;
    record.description = description;
    // res.status(200).json(record);
    return record;
  })
);

taskRouter.delete(
  "/:id",
  controllerWrapper((req, res, next) => {
    const { id } = req.params;
    const index = tasks.findIndex(
      (record) => record.id === id && record.userId === res.locals.user.id
    );
    if (index === -1) {
      // res.status(500).json({ message: "Task not found" });
      // return;
      throw new Error("Task not found");
    }
    tasks.splice(index, 1);
    // res.status(200).json({ message: "Task deleted" });
    // next();
    return { message: "Task deleted" };
  })
);
