import fs from "fs";
import path from "path";
import { initDb } from "./db";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "foodhub.json");

// Reset and write sample data (initDb recreates seed data after deleting existing JSON)
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
initDb();
console.log("Seed done. Data file:", dbPath);
