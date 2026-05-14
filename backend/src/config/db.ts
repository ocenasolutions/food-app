import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  if (!env.mongoUri) {
    console.warn("MONGODB_URI is not configured. Backend will use mock-data fallback.");
    return false;
  }

  try {
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.warn("MongoDB unavailable. Backend will use mock-data fallback.");
    console.warn(error instanceof Error ? error.message : error);
    return false;
  }
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
