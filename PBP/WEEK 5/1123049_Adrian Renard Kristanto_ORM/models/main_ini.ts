import express from "express";
import { Sequelize } from "sequelize-typescript";
import { Task } from "./Task";
import { v4 as uuidv4 } from "uuid";
import bodyParser from "body-parser";
import { addDummyData } from "./ini_crud";

const config = require("../config/config.json");

const sequelize = new Sequelize({
    ...config.development,
    models: [Task]
});


async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected successfully.");
        await addDummyData();
    } catch (error) {
        console.error("❌ Database connection error:", error);
    }
}
testConnection();

const app = express();
app.use(bodyParser.json());
app.get("/task", async (req, res) => {
    try {
        const tasks = await Task.findAll();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tasks", error });
    }
});

app.post("/task", async (req, res) => {
    try {
        const { title, description, status, importance } = req.body;
        const newTask = await Task.create({
            id: uuidv4(),
            title,
            description,
            status: status || "pending",
            importance: importance || "medium",
        });
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ message: "Error creating task", error });
    }
});

app.put("/task/:id", async (req, res) => {
    try {
        const { title, description } = req.body;
        const task = await Task.findByPk(req.params.id);
        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return 
        }
        task.title = title || task.title;
        task.description = description || task.description;
        await task.save();
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: "Error updating task", error });
    }
});

app.delete("/task/:id", async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return 
        }
        await task.destroy();
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting task", error });
    }
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
