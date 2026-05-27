import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import contactRoute from './routes/contact.route'
import authRoute from './routes/auth.route';
import exerciseSetRoutes from './routes/exerciseSet.route';

dotenv.config();


const app = express();

app.use(express.json());

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        "https://www.xarwix.com",
        "https://xarwix.com",
      ]
    : ["http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));

app.use("/api/v1/contact", contactRoute);
app.use("/api/v1/auth", authRoute);



app.use(
  '/api/v1/workout',
  exerciseSetRoutes
);

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running 🚀",
    environment: process.env.NODE_ENV,
  });
});

export default app;