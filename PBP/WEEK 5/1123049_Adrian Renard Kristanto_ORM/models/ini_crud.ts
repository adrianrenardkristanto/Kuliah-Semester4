import { Task } from "./Task";

export async function addDummyData() {
    await Task.create({ title: "Task 1", description: "Description 1", status: "pending", importance: "low" });
    await Task.create({ title: "Task 2", description: "Description 2", status: "in_progress", importance: "medium" });
    await Task.create({ title: "Task 3", description: "Description 3", status: "completed", importance: "high" });

    const { count, rows } = await Task.findAndCountAll();
    console.log(`Total tasks: ${count}`, rows);
}

