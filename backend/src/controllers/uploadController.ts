import type { Request, Response } from "express";
import { env } from "../config/env.js";

export function uploadStatus(_req: Request, res: Response) {
  try {
    const cloudinaryConfigured =
      Boolean(env.cloudinaryCloudName) && Boolean(env.cloudinaryApiKey) && Boolean(env.cloudinaryApiSecret);

    if (!cloudinaryConfigured) {
      return res.status(200).json({
        data: {
          enabled: false,
          provider: "none",
          message: "File uploads are disabled because Cloudinary/S3 credentials are not configured."
        },
        source: "mock"
      });
    }

    return res.json({
      data: {
        enabled: true,
        provider: "cloudinary",
        cloudName: env.cloudinaryCloudName
      },
      source: "database"
    });
  } catch (error: any) {
    console.error("Upload status error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
