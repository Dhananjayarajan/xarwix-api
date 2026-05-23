import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.use(helmet());
app.use(morgan("dev"));

// Health Check Endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running 🚀",
  });
});

export default app;