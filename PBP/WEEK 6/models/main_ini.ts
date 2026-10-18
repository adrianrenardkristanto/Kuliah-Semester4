import express, { NextFunction, Request, Response } from "express";
import { Sequelize } from "sequelize-typescript";
import { Task } from "./Task";
import { v4 as uuidv4 } from "uuid";
import bodyParser from "body-parser";
import { addDummyData } from "../models/ini_crud";

const config = require("../config/config.json");

const sequelize = new Sequelize({
    ...config.development,
    models: [Task]
});

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected successfully.");
        // await addDummyData();
    } catch (error) {
        console.error("❌ Database connection error:", error);
    }
}
testConnection();

const app = express();
app.use(bodyParser.json());

//middleware before
app.use((req, res, next) => {
    console.log(
        "---- logging middleware ----",
        req.method,
        req.url,
        req.params,
        req.body,
        req.ip,
        req.query
    );
    next();
});

app.use((req, res, next) => {
    res.locals.startExecution = Date.now();
    next();
});

app.post("/task", async (req, res, next) => {
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
    next();
});


app.put("/task/:id", async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const task = await Task.findByPk(req.params.id);
        if (!task) {
            next(new Error("Task not found"));
            return 
        }
        task.title = title || task.title;
        task.description = description || task.description;
        await task.save();
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: "Error updating task", error });
    }
    next();
});

app.delete("/task/:id", async (req, res, next) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) {
            next(new Error("Task not found"));
            return 
        }
        await task.destroy();
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting task", error });
    }
    next();
});

app.get("/task", async (req, res, next) => {
    try {
        const tasks = await Task.findAll();
        res.status(200).json(tasks);
        if (!tasks) {
            next(new Error("Task not found"));
            return;
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching tasks", error });
    }
    next();
});

//middleware after: mengetahui waktu eksekusi 
app.use((req, res, next) =>{
    const endExecution = Date.now();
    console.log(
        "---- execution time ----",
        endExecution - res.locals.startExecution
    );
    next();
});


//middleware error: ketrigger gara2 parameter optional
app.use((err:any, req: Request, res: Response, next: NextFunction) => {
    console.log("---- error middleware ----", err);
    res.status(500).json({ message: err.message });
});

app.use((req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
        next(new Error("Unauthorized"));
        return;
    }
    const token = authorizationHeader.split(" ")[1];
    if (token !== "123") {
        next(new Error("Unauthorized"));
        return;
    }
    next();
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
