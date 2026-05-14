import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { router } from "./routes/index.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (env.frontendUrls.includes(origin)) return callback(null, true);
      if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
      if (/^https:\/\/[a-z0-9-]+\.netlify\.app$/i.test(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked origin: ${origin}`));
    }
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));

app.use("/api", router);
app.use(notFound);
app.use(errorHandler);
