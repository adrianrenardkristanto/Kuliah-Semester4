import express from "express";
import { Project } from "../models/Project";
import { Op } from "sequelize";

export const projectRouter = express.Router();

projectRouter.post("/", async (req, res) => {
  const project = await Project.create(req.body);
  res.status(201).json(project);
});

projectRouter.get("/", async (req, res) => {
  const { name, description } = req.query;
  const where: any = {};
  if (name) where.name = { [Op.like]: `%${name}%` };
  if (description) where.description = { [Op.like]: `%${description}%` };
  const records = await Project.findAll({ where });
  res.status(200).json(records);
});

projectRouter.get("/:id", async (req, res) => {
  const record = await Project.findByPk(req.params.id);
  if (!record) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.status(200).json(record);
});

projectRouter.put("/:id", async (req, res) => {
  const record = await Project.findByPk(req.params.id);
  if (!record) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  await record.update(req.body);
  res.status(200).json(record);
});

projectRouter.delete("/:id", async (req, res) => {
  const record = await Project.findByPk(req.params.id);
  if (!record) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  await record.destroy();
  res.status(200).send();
});
