import { Router } from "express";
import { v4 } from "uuid";

export const taskRouter = Router();

type Task = {
  id: string;
  title: string;
  description?: string;
};

const tasks: Task[] = [
  { id: "1", title: "Task 1", description: "" },
  { id: "2", title: "Task 2", description: "" },
  { id: "3", title: "Task Hans", description: "" },
];

taskRouter.get("/:id", (req, res, next) => {
  const task = tasks.find((record) => record.id === req.params.id);
  if (!task) {
    res.status(500).json(null);
    return;
  }
  res.status(200).json(task);
  next();
});

taskRouter.get("/", (req, res, next) => {
  const title = req.query.title;
  let filteredTasks = tasks;
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
  res.status(200).json(filteredTasks);
  res.locals.error = "Test Error";
  next();
});

taskRouter.post("/", (req, res, next) => {
  const { title, description } = req.body;
  const newTask: Task = {
    id: v4(),
    title,
    description,
  };
  tasks.push(newTask);
  res.status(200).json(newTask);
  next();
});

taskRouter.put("/:id", (req, res, next) => {
  const id = req.params.id;
  const { title, description } = req.body;
  const record = tasks.find((record) => record.id === id);
  if (!record) {
    res.status(500).json({ message: "Task not found" });
    return;
  }
  record.title = title;
  record.description = description;
  res.status(200).json(record);
  next();
});

taskRouter.delete("/:id", (req, res, next) => {
  const { id } = req.params;
  const index = tasks.findIndex((record) => record.id === id);
  if (index === -1) {
    res.status(500).json({ message: "Task not found" });
    return;
  }
  tasks.splice(index, 1);
  res.status(200).json({ message: "Task deleted" });
  next();
});
