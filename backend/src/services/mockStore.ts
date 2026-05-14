import fs from "node:fs/promises";
import path from "node:path";

const seedPath = path.resolve(process.cwd(), "mock-data/seed.json");

export async function readMockData<T = Record<string, unknown>>() {
  const raw = await fs.readFile(seedPath, "utf-8");
  return JSON.parse(raw) as T;
}

export async function readMockCollection<T>(collection: string) {
  const data = await readMockData<Record<string, T[]>>();
  return data[collection] ?? [];
}
