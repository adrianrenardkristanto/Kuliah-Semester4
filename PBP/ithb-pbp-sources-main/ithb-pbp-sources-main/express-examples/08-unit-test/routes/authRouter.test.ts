import request from "supertest";
import { users } from "../config/data";
import jwt from "jsonwebtoken";
import { appConfig } from "../config/app";
import { app } from "../app";

describe("Auth Router", () => {
  beforeEach(() => {
    users.length = 0; // Clear users array before each test
  });

  describe("POST /auth/register", () => {
    it("should register a new user", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({ username: "testuser", password: "password123" });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.username).toBe("testuser");
    });

    it("should return an error if the user already exists", async () => {
      users.push({ id: "1", username: "testuser", password: "password123" });

      const response = await request(app)
        .post("/auth/register")
        .send({ username: "testuser", password: "password123" });

      expect(response.status).toBe(500); // Assuming error handling returns 500
      expect(response.text).toContain("User already exists");
    });
  });

  describe("POST /auth/login", () => {
    it("should log in an existing user and return a token", async () => {
      users.push({ id: "1", username: "testuser", password: "password123" });

      const response = await request(app)
        .post("/auth/login")
        .send({ username: "testuser", password: "password123" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body.message).toBe("Login successful");
    });

    it("should return an error for invalid credentials", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({ username: "wronguser", password: "wrongpassword" });

      expect(response.status).toBe(500); // Assuming error handling returns 500
      expect(response.text).toContain("Invalid credentials");
    });
  });

  describe("GET /auth/me", () => {
    it("should return the authenticated user's data", async () => {
      const user = { id: "1", username: "testuser", password: "password123" };
      users.push(user);

      const token = jwt.sign({ userId: user.id }, appConfig.jwtSecret, {
        expiresIn: appConfig.jwtExpiry,
      });

      const response = await request(app)
        .get("/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(user);
    });

    it("should return an error if no token is provided", async () => {
      const response = await request(app).get("/auth/me");

      expect(response.status).toBe(401); // Assuming middleware returns 401 for missing token
    });
  });
});
