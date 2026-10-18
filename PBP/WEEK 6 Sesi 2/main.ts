import express, { Request, Response, NextFunction } from "express";
import { Sequelize } from "sequelize-typescript";
import { User } from "./models/User";
import { Session } from "./models/Session";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

const config = require("./config/config.json");

const sequelize = new Sequelize({
    ...config.development,
    models: [User, Session],
});

sequelize.sync({ alter: true });  

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return res.status(401).json({ error: "Authorization header is missing" });
        }
        
        const accessToken = authorizationHeader.split(" ")[1];
        const session = await Session.findOne({ where: { accessToken } });
        if (!session) {
            return res.status(401).json({ error: "Invalid session token" });
        }

        try {
            const decoded = jwt.verify(accessToken, "secret_key") as { username: string };
            req.body.username = decoded.username;
            return next();
        } catch (error) {
            return res.status(401).json({ error: "Access token expired. Use refresh token to get a new one." });
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

app.post("/login", async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        if (username !== "adrian" || password !== "12345") {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const accessToken = jwt.sign({ username }, "secret_key", { expiresIn: "1m" });
        const refreshToken = jwt.sign({ username }, "secret_key", { expiresIn: "7d" });
        await Session.create({ userId: 1, accessToken, refreshToken });
        
        return res.json({ accessToken, refreshToken });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/refresh", async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ error: "Refresh token is required" });
        }

        const session = await Session.findOne({ where: { refreshToken } });
        if (!session) {
            return res.status(401).json({ error: "Invalid refresh token" });
        }

        const decoded = jwt.verify(refreshToken, "secret_key") as { userId: number };
        const newAccessToken = jwt.sign({ userId: decoded.userId }, "secret_key", { expiresIn: "15m" });
        await session.update({ accessToken: newAccessToken });

        return res.json({ accessToken: newAccessToken });
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired refresh token" });
    }
});

app.get("/", authMiddleware, (req: Request, res: Response) => {
    res.json({ message: "Welcome, authorized user!" });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
