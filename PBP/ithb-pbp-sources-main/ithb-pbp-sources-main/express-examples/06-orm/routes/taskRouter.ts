import express from "express";
import { Project } from "../models/Project";
import { Op } from "sequelize";

export const taskRouter = express.Router();

taskRouter.post("/", async (req, res) => {
  const project = await Project.create(req.body);
  res.status(200).json(project);
});

taskRouter.get("/", async (req, res) => {
  const { name, description } = req.query;
  const where: any = {};
  if (name) where.name = { [Op.like]: `%${name}%` };
  if (description) where.description = { [Op.like]: `%${description}%` };
  const records = await Project.findAll({
    where,
    include: [
      {
        model: Project,
      },
    ],
  });
  res.status(200).json(records);
});

taskRouter.get("/:id", async (req, res) => {
  const record = await Project.findByPk(req.params.id, {
    include: [
      {
        model: Project,
      },
    ],
  });
  if (!record) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.status(200).json(record);
});

taskRouter.put("/:id", async (req, res) => {
  const record = await Project.findByPk(req.params.id);
  if (!record) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  await record.update(req.body);
  res.status(200).json(record);
});

taskRouter.delete("/:id", async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  await project.destroy();
  res.status(200).send();
});
