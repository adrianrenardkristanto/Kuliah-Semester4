import { Sequelize } from "sequelize-typescript";
import { Task } from "./models/Task";
const config = require("./config/config.json");

const sequelize = new Sequelize({
    ...config.development,
    models: [Task]
});

async function testConnection() {
    try {
      await sequelize.authenticate();
      console.log("Database connected successfully.");
    } catch (error) {
      console.error("Database connection error:", error);
    }
}
testConnection();

async function start(){
    await sequelize.sync({ force: true });

    await Task.create({
        title: "Task 1",
        description: "Description 1",
        status: "pending"
    });
    const { count, rows } = await Task.findAndCountAll();
    console.log(count, rows);
}

start();