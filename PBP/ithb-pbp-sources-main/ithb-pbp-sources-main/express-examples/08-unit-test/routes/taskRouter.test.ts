import request from "supertest";
import { users } from "../config/data";
import { app } from "../app";
import jwt from "jsonwebtoken";
import { appConfig } from "../config/app";

describe("Task Router", () => {
  const token = jwt.sign({ userId: users[0].id }, appConfig.jwtSecret);

  describe("GET /task", () => {
    it("should return all tasks for the authenticated user", async () => {
      const response = await request(app)
        .get("/task")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      expect(response.body).toEqual([
        {
          id: "1",
          title: "Task 1",
          description: "",
          userId: users[0].id,
        },
        {
          id: "2",
          title: "Task 2",
          description: "",
          userId: users[0].id,
        },
        {
          id: "3",
          title: "Task Hans",
          description: "",
          userId: users[0].id,
        },
      ]);
    });

    it("should filter tasks by title", async () => {
      const response = await request(app)
        .get("/task")
        .query({ title: "Task 1" })
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { id: "1", title: "Task 1", description: "", userId: users[0].id },
      ]);
    });

    it("should filter tasks by description", async () => {
      const response = await request(app)
        .get("/task")
        .query({ description: "" })
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
    });
  });

  describe("GET /task/:id", () => {
    it("should return a task by ID", async () => {
      const response = await request(app)
        .get("/task/1")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", "1");
    });

    it("should return 500 if task is not found", async () => {
      const response = await request(app)
        .get("/task/999")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(500);
    });
  });

  describe("POST /task", () => {
    it("should create a new task", async () => {
      const newTask = { title: "New Task", description: "New Description" };
      const response = await request(app)
        .post("/task")
        .set("Authorization", `Bearer ${token}`)
        .send(newTask);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body.title).toBe(newTask.title);
    });
  });

  describe("PUT /task/:id", () => {
    it("should update an existing task", async () => {
      const updatedTask = {
        title: "Updated Task",
        description: "Updated Description",
      };
      const response = await request(app)
        .put("/task/1")
        .set("Authorization", `Bearer ${token}`)
        .send(updatedTask);
      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updatedTask.title);
    });

    it("should return 500 if task is not found", async () => {
      const response = await request(app)
        .put("/task/999")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Test" });
      expect(response.status).toBe(500);
    });
  });

  describe("DELETE /task/:id", () => {
    it("should delete a task by ID", async () => {
      const response = await request(app)
        .delete("/task/1")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Task deleted");
    });

    it("should return 500 if task is not found", async () => {
      const response = await request(app)
        .delete("/task/999")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(500);
    });
  });
});
