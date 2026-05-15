import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { isDatabaseConnected } from "../config/db.js";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { readMockData } from "../services/mockStore.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  password: z.string().min(8),
  role: z.enum(["customer", "restaurant_staff", "delivery_staff", "admin"]).default("customer")
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function signToken(user: { id: string; role: string; email: string }) {
  return jwt.sign(user, env.jwtSecret, { expiresIn: "7d" });
}

export async function register(req: Request, res: Response) {
  try {
    const payload = registerSchema.parse(req.body);

    if (isDatabaseConnected()) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: payload.email });
      if (existingUser) {
        return res.status(409).json({ error: "Email already registered" });
      }

      const passwordHash = await bcrypt.hash(payload.password, 12);
      const user = await User.create({ ...payload, passwordHash });
      const token = signToken({ id: user.id, role: user.role, email: user.email });
      return res.status(201).json({
        data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token },
        source: "database"
      });
    }

    const user = { id: `mock_user_${Date.now()}`, name: payload.name, email: payload.email, role: payload.role };
    return res.status(201).json({ data: { user, token: signToken(user) }, source: "mock" });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: "Validation failed", details: error.flatten() });
    }
    if (error.code === 11000) {
      return res.status(409).json({ error: "Email already registered" });
    }
    console.error("Register error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const payload = loginSchema.parse(req.body);

    if (isDatabaseConnected()) {
      const user = await User.findOne({ email: payload.email });
      if (!user || !(await bcrypt.compare(payload.password, user.passwordHash))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = signToken({ id: user.id, role: user.role, email: user.email });
      return res.json({
        data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token },
        source: "database"
      });
    }

    const data = await readMockData<any>();
    const user = data.users.find((item: any) => item.email === payload.email && (item.password ?? "password123") === payload.password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const { password, ...safeUser } = user;
    return res.json({
      data: { user: safeUser, token: signToken({ id: user.id, role: user.role, email: user.email }) },
      source: "mock"
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: "Validation failed", details: error.flatten() });
    }
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
